"""Demucs v4 ラッパー — 音源分離のコアロジック。

分離処理は CPU バウンドで 4-6 分かかる。Cloud Run のタイムアウトは
最大 60 分まで設定可能（--timeout=3600）。

2026-04-27 IQ190 確定構成:
  - subprocess.run で素直に Demucs CLI を呼ぶ (Popen+threading は撤去)
  - **Demucs 実行前に ffmpeg で canonical WAV (s16le/44.1k/stereo) に再エンコード**
    → 非標準 WAV チャンク・微妙なヘッダー異常・想定外のメタデータを全消去
    → これがプロのオーディオパイプラインの定石
  - Demucs に渡るファイルは常に「Demucs が確実に処理できる素朴な PCM」になる
"""
import logging
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Dict

logger = logging.getLogger(__name__)


@dataclass
class SeparationResult:
    """分離結果の 4 ステムへのローカルファイルパス。"""

    stems: Dict[str, Path]
    """{'drums': Path, 'bass': Path, 'vocals': Path, 'other': Path}"""

    duration_seconds: float
    model_used: str


class DemucsSeparator:
    """Demucs v4 で音源を 4 ステムに分離する。

    実装ノート:
    - Demucs の Python API ではなく CLI を使う（メモリ解放が確実）
    - 子プロセス方式により OOM 時も親プロセスが生き残る
    - 出力は WAV 形式（16bit 44.1kHz ステレオ、非圧縮）
    - 入力は ffmpeg で正規化してから Demucs に渡す（互換性問題の根絶）
    """

    def __init__(self, model_name: str = "mdx_extra"):
        self.model_name = model_name

    def _normalize_with_ffmpeg(self, input_audio: Path) -> Path:
        """任意の入力音源を ffmpeg で canonical PCM (s16le/44.1k/stereo) に正規化。

        これにより:
          - 24bit/96kHz/192kHz の高音質ファイル → 16bit/44.1k に揃う (省メモリ)
          - 非標準 WAV チャンク (BWF, iXML, RIFF 拡張) → 完全に消去
          - ID3 タグ・任意のメタデータ → 削除
          - チャンネル数異常 → 強制ステレオ化
          - サンプルレート異常 → 44.1k にリサンプリング

        Demucs が確実に処理できる素朴な WAV にしてから渡す。
        """
        normalized = input_audio.parent / f"{input_audio.stem}_normalized.wav"

        cmd = [
            "ffmpeg",
            "-y",  # overwrite without asking
            "-hide_banner",
            "-loglevel", "warning",
            "-i", str(input_audio),
            "-ac", "2",            # stereo (force 2 channels)
            "-ar", "44100",        # 44.1 kHz (Demucs ネイティブ)
            "-acodec", "pcm_s16le",  # 16bit signed little-endian PCM
            "-map_metadata", "-1", # メタデータ完全除去
            "-fflags", "+bitexact",
            str(normalized),
        ]

        logger.info("ffmpeg_normalize_start", extra={"input": str(input_audio)})

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=300,  # 5 分（長尺曲でも余裕）
            )
        except subprocess.TimeoutExpired:
            logger.error("ffmpeg_timeout", extra={"input": str(input_audio)})
            raise RuntimeError("ffmpeg normalization timed out (300s)")

        if result.returncode != 0:
            logger.error(
                "ffmpeg_failed",
                extra={"returncode": result.returncode, "stderr": result.stderr[-1000:]},
            )
            raise RuntimeError(
                f"ffmpeg normalization failed (exit {result.returncode}): "
                f"{result.stderr[-300:]}"
            )

        if not normalized.exists() or normalized.stat().st_size == 0:
            raise RuntimeError("ffmpeg produced empty output file")

        logger.info(
            "ffmpeg_normalize_complete",
            extra={
                "input_size": input_audio.stat().st_size,
                "output_size": normalized.stat().st_size,
                "stderr_tail": result.stderr[-500:] if result.stderr else "",
            },
        )

        return normalized

    def separate(self, input_audio: Path) -> SeparationResult:
        """入力音源を 4 ステムに分離して、ローカルの一時ディレクトリに書き出す。

        手順:
          1. ffmpeg で canonical WAV に正規化（互換性問題を根絶）
          2. 正規化済み WAV を Demucs CLI に渡す
          3. 出力を回収

        Raises:
            RuntimeError: ffmpeg または Demucs プロセスが失敗した場合
        """
        # ── Step 1: ffmpeg 正規化 ──
        try:
            normalized_audio = self._normalize_with_ffmpeg(input_audio)
        except Exception as e:
            logger.error("normalize_failed", extra={"error": str(e)})
            raise RuntimeError(
                f"音源の前処理に失敗しました（ファイル形式が異常な可能性があります）: {e}"
            )

        # ── Step 2: Demucs 実行 ──
        # demucs CLI は出力を <output_dir>/<model>/<track_name>/ に書く
        output_dir = Path(tempfile.mkdtemp(prefix="demucs_out_"))
        track_name = normalized_audio.stem

        logger.info(
            "demucs_start",
            extra={
                "model": self.model_name,
                "input": str(normalized_audio),
                "output_dir": str(output_dir),
            },
        )

        # シンプル・実績のあるコマンドラインに固定
        # 余計なオプションは付けない（--segment, -d cpu 等は不要）
        cmd = [
            "python", "-m", "demucs.separate",
            "--name", self.model_name,
            "--out", str(output_dir),
            "--filename", "{track}/{stem}.{ext}",  # <output>/<model>/<track>/<stem>.wav
            str(normalized_audio),
        ]

        logger.info("demucs_command", extra={"cmd": " ".join(cmd)})

        try:
            proc = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=1800,  # 30 分
            )
        except subprocess.TimeoutExpired as e:
            logger.error(
                "demucs_timeout",
                extra={"stderr_tail": (e.stderr[-1500:] if e.stderr else "")},
            )
            raise RuntimeError("Demucs timed out after 1800s")

        # 成功・失敗に関わらず stdout/stderr の最後を必ずログ出力 (デバッグ容易化)
        logger.info("demucs_stdout_tail", extra={"stdout": proc.stdout[-1500:]})
        logger.info("demucs_stderr_tail", extra={"stderr": proc.stderr[-1500:]})

        if proc.returncode != 0:
            logger.error(
                "demucs_failed",
                extra={
                    "returncode": proc.returncode,
                    "stderr": proc.stderr[-2000:],
                    "stdout": proc.stdout[-2000:],
                },
            )
            raise RuntimeError(
                f"Demucs failed (exit {proc.returncode}): {proc.stderr[-500:]}"
            )

        # ── Step 3: 出力ディレクトリから 4 ステムを回収 ──
        stem_dir = output_dir / self.model_name / track_name
        stems = {}
        for stem_name in ("drums", "bass", "vocals", "other"):
            stem_path = stem_dir / f"{stem_name}.wav"
            if not stem_path.exists():
                raise RuntimeError(f"Expected stem not found: {stem_path}")
            stems[stem_name] = stem_path

        logger.info("demucs_complete", extra={"stems": list(stems.keys())})

        # 正規化用の中間 WAV は削除（容量節約・必須ではない）
        try:
            if normalized_audio.exists():
                normalized_audio.unlink()
        except Exception:
            pass

        return SeparationResult(
            stems=stems,
            duration_seconds=0.0,  # main.py 側で計測
            model_used=self.model_name,
        )
