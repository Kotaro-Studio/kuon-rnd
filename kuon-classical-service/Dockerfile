# KUON CLASSICAL ANALYSIS — music21-based harmonic analysis service
# Phase 1: Cloud Run CPU deployment (CLAUDE.md §44.11 🟢 safe zone)
#
# music21 ships with a built-in corpus of 600+ pieces (Bach, Mozart, Haydn,
# Beethoven, Palestrina, etc.). We leverage this for instant library access
# without external file storage.

FROM python:3.11-slim

WORKDIR /app

# System deps for music21 (lily, MuseScore optional but lightweight base)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python deps first (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY src/ ./src/

# Pre-cache music21 corpus index (speeds up cold start)
RUN python -c "from music21 import corpus; corpus.search('bach')" || true

ENV PORT=8080
EXPOSE 8080

# Use uvicorn directly (FastAPI standard)
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "2"]
