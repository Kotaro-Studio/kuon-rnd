#!/usr/bin/env python3
"""
Kuon Theory Suite Lessons Extraction Script
============================================

公開済み Kuon Theory レッスン (.tsx) からテキストを抽出して、
チャンク JSONL を生成する。

出力: data/kuon_lessons_chunks.jsonl

使い方:
    cd ~/kuon-rnd/kuon-rnd-tutor-worker
    python scripts/extract_kuon_lessons.py

公開済みレッスン (CLAUDE.md §50.1):
  - /theory/m0/l01 音とは何か
  - /theory/m1/l01 西洋音楽記譜法の導入
  - /theory/m1/l02 音符の記譜と五線
  - /theory/m1/l40 三和音の基本形と転回形
  - /theory/m4/l01 カデンツの種類
"""

import json
import re
import sys
from pathlib import Path

KUON_RND_ROOT = Path.home() / "kuon-rnd"
THEORY_DIR = KUON_RND_ROOT / "app" / "theory"
OUTPUT_DIR = Path(__file__).parent / "data"
OUTPUT_FILE = OUTPUT_DIR / "kuon_lessons_chunks.jsonl"

# 公開済みレッスン (順次追加されるたびにここにエントリを足す)
PUBLISHED_LESSONS = [
    {"path": "m0/l01/page.tsx", "module": "M0", "lesson": "L01", "title": "音とは何か"},
    {"path": "m1/l01/page.tsx", "module": "M1", "lesson": "L01", "title": "西洋音楽記譜法の導入"},
    {"path": "m1/l02/page.tsx", "module": "M1", "lesson": "L02", "title": "音符の記譜と五線"},
    {"path": "m1/l40/page.tsx", "module": "M1", "lesson": "L40", "title": "三和音の基本形と転回形"},
    {"path": "m4/l01/page.tsx", "module": "M4", "lesson": "L01", "title": "カデンツの種類"},
]


def extract_japanese_text(tsx_content: str) -> str:
    """
    .tsx ファイルから日本語の文字列リテラル + JSX テキストを抽出。
    粗い実装だが、レッスン本文は { ja: '...' } または >...< の形が多い。
    """
    # 日本語を含む文字列を抜き出す (JSON や JSX text の両方)
    # ja: '...' または ja: "..." パターン
    ja_quoted = re.findall(r"ja:\s*['\"](.*?)['\"]", tsx_content, re.DOTALL)

    # JSX 内のテキスト (>...< で囲まれた、日本語を含むもの)
    jsx_text = re.findall(r">([^<>{}\n]*?[ぁ-んァ-ン一-龥][^<>{}]*?)<", tsx_content)

    pieces = ja_quoted + jsx_text
    pieces = [p.strip() for p in pieces if len(p.strip()) > 5]

    # 重複除去 + 連結
    seen = set()
    unique = []
    for p in pieces:
        if p not in seen:
            seen.add(p)
            unique.append(p)

    return "\n".join(unique)


def chunk_text(text: str, chunk_size: int = 500, overlap: int = 100) -> list[str]:
    """テキストを段落ベースで chunk_size 文字程度に分割。"""
    paras = [p.strip() for p in text.split("\n") if p.strip()]
    chunks = []
    current = ""
    for p in paras:
        if len(current) + len(p) > chunk_size:
            if current:
                chunks.append(current.strip())
            current = p
        else:
            current = (current + "\n" + p).strip() if current else p
    if current.strip():
        chunks.append(current.strip())
    return chunks if chunks else [text]


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    chunks = []
    chunk_id = 0

    for entry in PUBLISHED_LESSONS:
        path = THEORY_DIR / entry["path"]
        if not path.exists():
            print(f"  ⚠️  Skipping (not found): {path}")
            continue

        content = path.read_text(encoding="utf-8")
        text = extract_japanese_text(content)
        if not text:
            print(f"  ⚠️  No Japanese text extracted: {entry['path']}")
            continue

        # チャンク化
        for piece in chunk_text(text, chunk_size=500, overlap=100):
            module_lower = entry["module"].lower()
            lesson_lower = entry["lesson"].lower()
            chunks.append({
                "id": f"kuon-{module_lower}-{lesson_lower}-{chunk_id:03d}",
                "text": piece,
                "module": entry["module"],
                "lesson": entry["lesson"],
                "title": f"{entry['module']}-{entry['lesson']} {entry['title']}",
                "lessonId": f"{module_lower}-{lesson_lower}",
                "url": f"/theory/{module_lower}/{lesson_lower}",
                "source": "kuon",
                "language": "ja",
            })
            chunk_id += 1

        print(f"  ✅ {entry['path']}: extracted")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        for chunk in chunks:
            f.write(json.dumps(chunk, ensure_ascii=False) + "\n")

    print(f"\n✅ Done!")
    print(f"  Total chunks: {len(chunks)}")
    print(f"  Output: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()
