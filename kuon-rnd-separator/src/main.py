"""FastAPI エントリポイント — Cloud Run で実行される。

エンドポイント:
    GET  /              - ヘルスチェック
    GET  /health        - ヘルスチェック（詳細）
    POST /separate      - 音源分離（認証必須）

認証:
    Authorization: Bearer <SEPARATOR_SECRET>
    これは Next.js プロキシのみが保持するシークレット。
    JWT 検証は Next.js 側で済ませ、このサービスは共有シークレットのみ検証。
"""
import json
import logging
import secrets as std_secrets
import tempfile
import time
from pathlib import Path

import soundfile as sf
from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
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
    version="1.0.0",
)


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
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.detail},
    )
