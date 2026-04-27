"""FastAPI エントリポイント — Cloud Run で実行される。

エンドポイント:
    GET  /                    - ヘルスチェック
    GET  /health              - ヘルスチェック（詳細）
    POST /separate            - 音源分離 同期版（後方互換）
    POST /jobs                - 音源分離 非同期版 (job_id 即返却・絶対安定)
    GET  /jobs/{job_id}       - ジョブ進捗・結果取得

認証:
    Authorization: Bearer <SEPARATOR_SECRET>
    これは Next.js プロキシのみが保持するシークレット。
"""
import json
import logging
import secrets as std_secrets
import tempfile
import threading
import time
import traceback
from pathlib import Path
from typing import Any, Dict

import soundfile as sf
from fastapi import BackgroundTasks, FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import JSONResponse
from pythonjsonlogger import jsonlogger

from src.config import Config
from src.separator import DemucsSeparator
from src.storage import R2Storage

# ── 構造化ログ設定 ──
log_handler = logging.StreamHandler()
log_handler.setFormatter(
    jsonlogger.JsonFormatter(
        "%(asctime)s %(name)s %(levelname)s %(message)s",
        rename_fields={"levelname": "severity"},  # Cloud Logging 標準形式
    )
)
logging.basicConfig(level=logging.INFO, handlers=[log_handler])
logger = logging.getLogger("kuon-separator")

# ── 設定とサービス初期化 ──
config = Config.from_env()
storage = R2Storage(config)
separator = DemucsSeparator(model_name=config.demucs_model)

app = FastAPI(
    title="KUON SEPARATOR",
    description="Audio stem separation powered by Demucs v4",
    version="2.0.0",
)


# ─────────────────────────────────────────────
# In-memory job registry
# (Cloud Run instance 内で完結・1 ジョブ = 1 instance)
# 永続化は R2 で行う
# ─────────────────────────────────────────────
_jobs: Dict[str, Dict[str, Any]] = {}
_jobs_lock = threading.Lock()


def _set_job(job_id: str, **kwargs):
    """ジョブステータスを in-memory + R2 に書き込み。"""
    with _jobs_lock:
        if job_id not in _jobs:
            _jobs[job_id] = {"created_at": time.time()}
        _jobs[job_id].update(kwargs)
        _jobs[job_id]["updated_at"] = time.time()
        snapshot = dict(_jobs[job_id])

    # R2 にも書く (instance 切替えでも復元可能・観測性)
    try:
        status_key = f"jobs/{job_id}/status.json"
        # storage.upload_bytes 経由で書く
        storage.upload_json(status_key, snapshot)
    except Exception as e:
        logger.warning("status_persist_failed", extra={"job_id": job_id, "error": str(e)})


def _get_job(job_id: str) -> Dict[str, Any]:
    """まず in-memory、なければ R2 から復元。"""
    with _jobs_lock:
        if job_id in _jobs:
            return dict(_jobs[job_id])

    # R2 から復元 (別 instance で開始されたジョブの可能性)
    try:
        status_key = f"jobs/{job_id}/status.json"
        snapshot = storage.fetch_json(status_key)
        if snapshot:
            with _jobs_lock:
                _jobs[job_id] = snapshot
            return dict(snapshot)
    except Exception:
        pass
    return {}


@app.get("/")
@app.get("/health")
async def health():
    """Cloud Run のヘルスチェック用。Secret 検証不要。"""
    return {
        "status": "ok",
        "service": "kuon-separator",
        "model": config.demucs_model,
        "environment": config.environment,
    }


def _verify_secret(request: Request) -> None:
    """共有シークレットによる認証。

    Next.js プロキシのみがこの値を知っている。
    定数時間比較で timing attack を防ぐ。
    """
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing Bearer token")

    provided = auth_header.removeprefix("Bearer ").strip()
    if not std_secrets.compare_digest(provided, config.separator_secret):
        logger.warning("auth_failed", extra={"event": "invalid_secret"})
        raise HTTPException(status_code=401, detail="Invalid secret")


@app.post("/separate")
async def separate(
    request: Request,
    audio: UploadFile = File(...),
    user_id: str = Form(..., description="ユーザー識別子（メールアドレスのハッシュ等、ログ分析用）"),
    job_id: str = Form(..., description="ジョブ追跡用の一意 ID（Next.js 側で生成）"),
):
    """音源分離を実行し、4 ステムを R2 にアップロードして署名付き URL を返す。

    処理時間: 4 分楽曲で約 4-6 分（CPU 4 vCPU）
    """
    _verify_secret(request)
    start_time = time.time()

    # ── 入力検証 ──
    if not audio.filename:
        raise HTTPException(status_code=400, detail="No filename")

    file_ext = audio.filename.rsplit(".", 1)[-1].lower() if "." in audio.filename else ""
    if file_ext not in config.supported_formats:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported format '{file_ext}'. Supported: {config.supported_formats}",
        )

    # ── 一時ファイルに保存 ──
    tmpdir = Path(tempfile.mkdtemp(prefix="separator_in_"))
    input_path = tmpdir / f"input.{file_ext}"

    contents = await audio.read()
    file_size_mb = len(contents) / (1024 * 1024)
    if file_size_mb > config.max_file_size_mb:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({file_size_mb:.1f}MB > {config.max_file_size_mb}MB)",
        )

    input_path.write_bytes(contents)

    # ── 長さチェック ──
    try:
        with sf.SoundFile(str(input_path)) as f:
            duration = len(f) / f.samplerate
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Cannot read audio: {e}")

    if duration > config.max_duration_seconds:
        raise HTTPException(
            status_code=413,
            detail=f"Duration too long ({duration:.1f}s > {config.max_duration_seconds}s)",
        )

    logger.info(
        "separation_start",
        extra={
            "job_id": job_id,
            "user_id": user_id,
            "duration_sec": duration,
            "size_mb": file_size_mb,
            "format": file_ext,
        },
    )

    # ── Demucs 実行 ──
    try:
        result = separator.separate(input_path)
    except Exception as e:
        logger.error("separation_failed", extra={"job_id": job_id, "error": str(e)})
        raise HTTPException(status_code=500, detail=f"Separation failed: {e}")

    # ── R2 アップロード + 署名付き URL 生成 ──
    urls = {}
    for stem_name, stem_path in result.stems.items():
        object_key = f"{job_id}/{stem_name}.wav"
        try:
            storage.upload(stem_path, object_key)
            urls[stem_name] = storage.presigned_url(object_key)
        except Exception as e:
            logger.error(
                "upload_failed",
                extra={"job_id": job_id, "stem": stem_name, "error": str(e)},
            )
            raise HTTPException(status_code=500, detail=f"Upload failed for {stem_name}")

    elapsed = time.time() - start_time
    logger.info(
        "separation_complete",
        extra={
            "job_id": job_id,
            "user_id": user_id,
            "duration_ms": int(elapsed * 1000),
            "input_duration_sec": duration,
            "model": config.demucs_model,
        },
    )

    return {
        "jobId": job_id,
        "model": config.demucs_model,
        "inputDurationSec": round(duration, 2),
        "processingTimeSec": round(elapsed, 2),
        "urls": urls,
        "expiresInSec": config.presigned_url_expiry_seconds,
    }


# ─────────────────────────────────────────────
# 非同期エンドポイント (POST /jobs + GET /jobs/{id})
# Cloudflare/ブラウザのタイムアウトを完全回避
# ─────────────────────────────────────────────

def _validate_audio_pre_flight(file_ext: str, contents: bytes, input_path: Path) -> dict:
    """音源を実処理前に検証。失敗するとわかっているファイルを早期に弾く。

    Returns:
        {"duration": float, "size_mb": float, "samplerate": int, "channels": int}
    Raises:
        HTTPException: 検証失敗時 (詳細メッセージ付き)
    """
    # フォーマットチェック
    if file_ext not in config.supported_formats:
        raise HTTPException(
            status_code=400,
            detail=f"unsupported_format:対応していない形式 '{file_ext}' です。MP3/WAV/FLAC/M4A をお試しください",
        )

    # サイズチェック
    file_size_mb = len(contents) / (1024 * 1024)
    if file_size_mb > config.max_file_size_mb:
        raise HTTPException(
            status_code=413,
            detail=f"file_too_large:ファイルサイズが大きすぎます ({file_size_mb:.1f}MB > {config.max_file_size_mb}MB)。圧縮するか、より短い曲をお試しください",
        )

    # 音源プロパティ取得
    try:
        with sf.SoundFile(str(input_path)) as f:
            duration = len(f) / f.samplerate
            samplerate = f.samplerate
            channels = f.channels
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"unreadable_audio:音源ファイルを読み込めませんでした。ファイルが破損していないかご確認ください ({e})",
        )

    # 長さチェック
    if duration > config.max_duration_seconds:
        raise HTTPException(
            status_code=413,
            detail=f"duration_too_long:曲が長すぎます ({duration:.0f}秒 > {config.max_duration_seconds}秒)。{config.max_duration_seconds // 60}分以内の曲をお試しください",
        )

    # 高サンプルレート警告 (96kHz/192kHz は OOM のリスク)
    if samplerate > 48000:
        logger.warning(
            "high_samplerate",
            extra={"samplerate": samplerate, "duration": duration},
        )

    return {
        "duration": duration,
        "size_mb": file_size_mb,
        "samplerate": samplerate,
        "channels": channels,
    }


def _process_job_in_background(job_id: str, input_path: Path, file_meta: dict, user_id: str):
    """バックグラウンドで分離 → R2 アップロード → status 更新。"""
    start_time = time.time()
    try:
        _set_job(job_id, status="processing", stage="separating", progress=10,
                 input_duration_sec=file_meta["duration"])

        # ── Demucs 実行 ──
        try:
            result = separator.separate(input_path)
        except Exception as e:
            tb = traceback.format_exc()
            logger.error("separation_failed", extra={"job_id": job_id, "error": str(e), "traceback": tb[-1500:]})
            _set_job(job_id, status="failed",
                     error="separation_failed",
                     detail=f"音源分離に失敗しました: {str(e)[:200]}")
            return

        _set_job(job_id, status="processing", stage="uploading", progress=70)

        # ── R2 アップロード ──
        urls = {}
        for stem_name, stem_path in result.stems.items():
            object_key = f"{job_id}/{stem_name}.wav"
            try:
                storage.upload(stem_path, object_key)
                urls[stem_name] = storage.presigned_url(object_key)
            except Exception as e:
                logger.error("upload_failed",
                             extra={"job_id": job_id, "stem": stem_name, "error": str(e)})
                _set_job(job_id, status="failed",
                         error="upload_failed",
                         detail=f"ステム {stem_name} のアップロードに失敗しました: {str(e)[:200]}")
                return

        elapsed = time.time() - start_time
        _set_job(job_id, status="completed", progress=100,
                 model=config.demucs_model,
                 input_duration_sec=round(file_meta["duration"], 2),
                 processing_time_sec=round(elapsed, 2),
                 urls=urls,
                 expires_in_sec=config.presigned_url_expiry_seconds)

        logger.info("job_complete", extra={
            "job_id": job_id, "user_id": user_id,
            "duration_ms": int(elapsed * 1000),
            "input_duration_sec": file_meta["duration"],
        })
    except Exception as e:
        tb = traceback.format_exc()
        logger.error("job_unhandled_error", extra={"job_id": job_id, "error": str(e), "traceback": tb[-1500:]})
        _set_job(job_id, status="failed",
                 error="internal_error",
                 detail=f"予期しないエラーが発生しました: {str(e)[:200]}")


@app.post("/jobs")
async def submit_job(
    background_tasks: BackgroundTasks,
    request: Request,
    audio: UploadFile = File(...),
    user_id: str = Form(...),
    job_id: str = Form(...),
):
    """音源分離ジョブを投入し、即座に job_id を返す (非同期)。

    実際の処理は BackgroundTasks で実行 → R2 に結果を書き込む。
    クライアントは GET /jobs/{job_id} でステータス確認。
    """
    _verify_secret(request)

    if not audio.filename:
        raise HTTPException(status_code=400, detail="missing_filename:ファイル名がありません")

    file_ext = audio.filename.rsplit(".", 1)[-1].lower() if "." in audio.filename else ""

    # 一時ファイル保存
    tmpdir = Path(tempfile.mkdtemp(prefix="separator_in_"))
    input_path = tmpdir / f"input.{file_ext}"
    contents = await audio.read()
    input_path.write_bytes(contents)

    # Pre-flight 検証 (失敗時は即エラー)
    file_meta = _validate_audio_pre_flight(file_ext, contents, input_path)

    # ジョブ登録 (queued 状態)
    _set_job(job_id, status="queued", progress=0,
             input_filename=audio.filename,
             input_duration_sec=round(file_meta["duration"], 2),
             input_size_mb=round(file_meta["size_mb"], 2))

    # バックグラウンドで処理開始
    background_tasks.add_task(
        _process_job_in_background, job_id, input_path, file_meta, user_id,
    )

    logger.info("job_submitted", extra={
        "job_id": job_id, "user_id": user_id,
        "duration": file_meta["duration"], "size_mb": file_meta["size_mb"],
    })

    return {
        "jobId": job_id,
        "status": "queued",
        "inputDurationSec": round(file_meta["duration"], 2),
        "estimatedProcessingSec": int(file_meta["duration"] * 0.6 + 30),  # 概算
    }


@app.get("/jobs/{job_id}")
async def get_job_status(job_id: str, request: Request):
    """ジョブの進捗・結果を取得。"""
    _verify_secret(request)

    job = _get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail=f"job_not_found:ジョブ {job_id} が見つかりません")

    return job


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """HTTPException を構造化ログに記録。"""
    logger.warning(
        "http_exception",
        extra={
            "status": exc.status_code,
            "detail": exc.detail,
            "path": request.url.path,
        },
    )
    # detail は "code:メッセージ" 形式 → クライアントで code を判定可能に
    detail_str = str(exc.detail)
    if ":" in detail_str:
        code, msg = detail_str.split(":", 1)
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": code, "detail": msg},
        )
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": detail_str},
    )
