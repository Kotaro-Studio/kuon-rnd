"""R2 (Cloudflare) ストレージクライアント — S3 互換 API を使用。"""
import logging
from pathlib import Path
from typing import Optional

import boto3
from botocore.client import Config as BotoConfig

from src.config import Config

logger = logging.getLogger(__name__)


class R2Storage:
    """R2 (Cloudflare) にステム出力をアップロードし、24 時間有効な署名付き URL を生成する。"""

    def __init__(self, config: Config):
        self.config = config
        self.client = boto3.client(
            "s3",
            endpoint_url=config.r2_endpoint,
            aws_access_key_id=config.r2_access_key_id,
            aws_secret_access_key=config.r2_secret_access_key,
            config=BotoConfig(
                signature_version="s3v4",
                region_name="auto",  # R2 は region 概念なし
                retries={"max_attempts": 3, "mode": "adaptive"},
            ),
        )

    def upload(self, local_path: Path, object_key: str) -> None:
        """ローカルファイルを R2 にアップロード。"""
        logger.info(
            "r2_upload_start",
            extra={"object_key": object_key, "size_bytes": local_path.stat().st_size},
        )
        self.client.upload_file(
            str(local_path),
            self.config.r2_bucket,
            object_key,
            ExtraArgs={
                "ContentType": "audio/wav",
                # 24h Cache-Control aligned with lifecycle rule
                "CacheControl": "public, max-age=86400",
            },
        )
        logger.info("r2_upload_complete", extra={"object_key": object_key})

    def presigned_url(self, object_key: str, expiry_seconds: Optional[int] = None) -> str:
        """オブジェクトへの署名付き URL を生成（GET リクエスト用）。"""
        return self.client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.config.r2_bucket, "Key": object_key},
            ExpiresIn=expiry_seconds or self.config.presigned_url_expiry_seconds,
        )
