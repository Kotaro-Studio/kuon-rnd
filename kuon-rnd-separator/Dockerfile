# ============================================================
# KUON SEPARATOR — Multi-stage Docker build for GCP Cloud Run
# ============================================================
# Stage 1: Build dependencies (大きいが使い捨て)
# Stage 2: Runtime image (最小限のみコピー)
# これにより最終イメージサイズを 40-50% 削減

# ──────────────────────────────────────────────
# Stage 1: Dependencies
# ──────────────────────────────────────────────
FROM python:3.11-slim AS builder

# Demucs の依存（torchaudio が libsndfile, ffmpeg を要求）
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libsndfile1-dev \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build
COPY requirements.txt .

# CPU 版の PyTorch を明示指定（GPU ドライバを含まない軽量版）
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir torch==2.1.0+cpu torchaudio==2.1.0+cpu \
      --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Demucs モデルを事前ダウンロード（cold start 時のモデル取得を回避）
# htdemucs は約 80MB、初回推論時ではなくビルド時にキャッシュ
RUN python -c "from demucs.pretrained import get_model; get_model('htdemucs')"

# ──────────────────────────────────────────────
# Stage 2: Runtime
# ──────────────────────────────────────────────
FROM python:3.11-slim

# 実行時に必要なシステムライブラリのみ
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsndfile1 \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Python パッケージを builder からコピー
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Demucs モデルキャッシュをコピー
COPY --from=builder /root/.cache/torch /root/.cache/torch

WORKDIR /app
COPY src/ ./src/

# Cloud Run は PORT 環境変数を自動設定する（デフォルト 8080）
ENV PORT=8080
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

EXPOSE 8080

# 同時実行数 1 で安定性優先（Cloud Run 側で max-instances 制御）
CMD exec uvicorn src.main:app \
    --host 0.0.0.0 \
    --port ${PORT} \
    --workers 1 \
    --timeout-keep-alive 600 \
    --log-level info
