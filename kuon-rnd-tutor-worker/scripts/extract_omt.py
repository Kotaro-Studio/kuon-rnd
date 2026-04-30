#!/usr/bin/env python3
"""
OMT v2 PDF Extraction + Chunking Script
========================================

OMT v2 PDF (1,297 ページ) を抽出して、
~500 token のチャンクに分割する。

出力: data/omt_chunks.jsonl
  各行に {id, text, page, chapter, source: 'omt'} の JSON

実行 (Mac でローカル):
    cd ~/kuon-rnd/kuon-rnd-tutor-worker
    pip install --break-system-packages pdfplumber tiktoken
    python scripts/extract_omt.py

入力: ~/kuon-rnd/空音開発/OPEN-MUSIC-THEORY-v2.pdf
出力: scripts/data/omt_chunks.jsonl

CC BY-SA 4.0: Open Music Theory v2 by Mark Gotham, Megan Lavengood,
              Brian Jarvis, Chelsey Hamm, Bryn Hughes, Kyle Gullings,
              John Peterson — used under CC BY-SA 4.0.
"""

import json
import os
import re
import sys
from pathlib import Path

try:
    import pdfplumber
except ImportError:
    print("ERROR: pdfplumber not installed.")
    print("Run: pip install --break-system-packages pdfplumber")
    sys.exit(1)

# ─────────────────────────────────────────────────────────────────────────
# Settings
# ─────────────────────────────────────────────────────────────────────────
PDF_PATH = Path.home() / "kuon-rnd" / "空音開発" / "OPEN-MUSIC-THEORY-v2.pdf"
OUTPUT_DIR = Path(__file__).parent / "data"
OUTPUT_FILE = OUTPUT_DIR / "omt_chunks.jsonl"

CHUNK_SIZE = 500          # 1 chunk あたりの目標 token 数
CHUNK_OVERLAP = 100       # チャンク間の重複 token 数
MIN_CHUNK_TEXT = 50       # この長さ未満のチャンクは破棄

# ─────────────────────────────────────────────────────────────────────────
# Utilities
# ─────────────────────────────────────────────────────────────────────────
def estimate_tokens(text: str) -> int:
    """雑な token 見積り (英文 1 語 ≒ 1.3 token)。日本語混在も許容。"""
    words = text.split()
    return int(len(words) * 1.3 + len(text) * 0.05)


def detect_chapter(text: str, current: str) -> str:
    """
    ページから章タイトルを推定。
    OMT v2 の typical heading pattern:
      "1. Fundamentals", "1.1 Introduction to Western Notation", etc.
    """
    # Part / Chapter / Section の見出しらしき行
    for line in text.split("\n")[:5]:
        s = line.strip()
        if not s or len(s) > 100:
            continue
        # 数字 + ピリオド + 見出し
        if re.match(r"^(Part|Chapter|Section)\s+", s) or re.match(r"^\d+(\.\d+)*\s+[A-Z]", s):
            return s[:80]
    return current


# ─────────────────────────────────────────────────────────────────────────
# Main extraction
# ─────────────────────────────────────────────────────────────────────────
def main():
    if not PDF_PATH.exists():
        print(f"ERROR: PDF not found at {PDF_PATH}")
        sys.exit(1)

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    print(f"Opening {PDF_PATH}...")
    print(f"Output will be written to {OUTPUT_FILE}")

    chunks = []
    chunk_id = 0
    current_chapter = ""
    pending_text = ""
    pending_pages = []
    pending_first_page = 1

    with pdfplumber.open(str(PDF_PATH)) as pdf:
        total_pages = len(pdf.pages)
        print(f"Total pages: {total_pages}")

        for page_idx, page in enumerate(pdf.pages):
            page_num = page_idx + 1
            text = page.extract_text()
            if not text:
                continue

            current_chapter = detect_chapter(text, current_chapter)

            # ノイズ除去: 短すぎる行 (ページ番号・見出しのみ)・繰り返し改行
            text = re.sub(r"\n{3,}", "\n\n", text)
            text = text.strip()
            if len(text) < MIN_CHUNK_TEXT:
                continue

            pending_text += "\n\n" + text
            pending_pages.append(page_num)

            # 目標 token 数に達したらチャンクを切る
            tokens = estimate_tokens(pending_text)
            if tokens >= CHUNK_SIZE:
                chunk = {
                    "id": f"omt-{chunk_id:05d}",
                    "text": pending_text.strip(),
                    "page": pending_first_page,
                    "page_end": pending_pages[-1],
                    "chapter": current_chapter,
                    "source": "omt",
                    "language": "en",
                    "title": f"Open Music Theory v2 — {current_chapter or 'p.' + str(pending_first_page)}",
                }
                chunks.append(chunk)
                chunk_id += 1

                # オーバーラップを残して継続
                overlap_chars = int(len(pending_text) * (CHUNK_OVERLAP / CHUNK_SIZE))
                pending_text = pending_text[-overlap_chars:] if overlap_chars > 0 else ""
                pending_first_page = page_num

            if (page_idx + 1) % 50 == 0:
                print(f"  processed {page_idx + 1}/{total_pages} pages, {chunk_id} chunks so far")

        # 残りの pending text もチャンク化
        if pending_text.strip() and len(pending_text.strip()) >= MIN_CHUNK_TEXT:
            chunks.append({
                "id": f"omt-{chunk_id:05d}",
                "text": pending_text.strip(),
                "page": pending_first_page,
                "page_end": pending_pages[-1] if pending_pages else pending_first_page,
                "chapter": current_chapter,
                "source": "omt",
                "language": "en",
                "title": f"Open Music Theory v2 — {current_chapter or 'p.' + str(pending_first_page)}",
            })
            chunk_id += 1

    # ─────────────────────────────────────────────────────────────────
    # Save
    # ─────────────────────────────────────────────────────────────────
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for chunk in chunks:
            f.write(json.dumps(chunk, ensure_ascii=False) + "\n")

    print(f"\n✅ Done!")
    print(f"  Total chunks: {len(chunks)}")
    print(f"  Output: {OUTPUT_FILE}")
    print(f"  Total characters: {sum(len(c['text']) for c in chunks):,}")
    print(f"  Estimated tokens: {sum(estimate_tokens(c['text']) for c in chunks):,}")

    # 最初と最後のチャンクをサンプル表示
    if chunks:
        print(f"\n--- Sample chunk #1 ---")
        print(f"  id: {chunks[0]['id']}")
        print(f"  page: {chunks[0]['page']}-{chunks[0]['page_end']}")
        print(f"  chapter: {chunks[0]['chapter']}")
        print(f"  text preview: {chunks[0]['text'][:200]}...")


if __name__ == "__main__":
    main()
