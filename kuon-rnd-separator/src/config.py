"""Configuration — loaded from environment variables.

All secrets are injected via GCP Secret Manager at Cloud Run startup.
Local development uses .env (not committed).
"""
import os
from dataclasses import dataclass


@dataclass(frozen=True)
class Config:
    """Runtime configuration (immutable)."""

    # ── Authentication ──
    separator_secret: str
    """Shared secret between Next.js proxy and Cloud Run. Bearer token."""

    # ── R2 Storage ──
    r2_access_key_id: str
    r2_secret_access_key: str
    r2_endpoint: str
    """e.g., https://<account-id>.r2.cloudflarestorage.com"""
    r2_bucket: str = "kuon-rnd-separator"

    # ── Processing Limits ──
    # 2026-04-27 拡張: ジャズの長尺曲 (10 分超のモーダルジャズ・ライブ録音) に対応
    # WAV 24bit/96kHz の高音質ファイルも受け入れられるようにサイズ制限も拡張
    max_file_size_mb: int = 100              # 50 → 100MB (高音質 WAV 対応)
    max_duration_seconds: int = 720          # 600 → 720s (10 分 → 12 分・ジャズ対応)
    supported_formats: tuple = ("mp3", "wav", "flac", "m4a", "ogg")

    # ── Demucs Model ──
    # 2026-04-27 最終確定: mdx_extra (チェットベイカーで成功実績あり)
    # 加えて、Demucs に渡す前に ffmpeg で canonical WAV (16bit/44.1k/stereo) に
    # 正規化することで、Honesty.wav のような「非標準 WAV チャンク」を持つファイル
    # 起因の失敗を根絶する。これがプロのオーディオパイプラインの定石。
    demucs_model: str = "mdx_extra"
    """
    Options:
      - htdemucs        : 4 stems・最高精度・但しメモリ大量消費
      - htdemucs_ft     : fine-tuned variant
      - htdemucs_6s     : 6 stems
      - mdx_extra       : ★現行採用★ チェットベイカー成功実績あり
    """

    # ── URL signing ──
    presigned_url_expiry_seconds: int = 24 * 3600  # 24 時間

    # ── Runtime ──
    environment: str = "production"

    @classmethod
    def from_env(cls) -> "Config":
        """Load config from environment variables. Raises on missing required values."""
        required = ["SEPARATOR_SECRET", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_ENDPOINT"]
        missing = [k for k in required if not os.getenv(k)]
        if missing:
            raise RuntimeError(f"Missing required env vars: {', '.join(missing)}")

        return cls(
            separator_secret=os.environ["SEPARATOR_SECRET"],
            r2_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
            r2_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
            r2_endpoint=os.environ["R2_ENDPOINT"],
            r2_bucket=os.getenv("R2_BUCKET", "kuon-rnd-separator"),
            environment=os.getenv("ENVIRONMENT", "production"),
        )
