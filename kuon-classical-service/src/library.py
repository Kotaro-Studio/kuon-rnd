"""
KUON CLASSICAL ANALYSIS Library — music21 内蔵コーパス + 拡張
=========================================================

設計（2026-04-28 修正版）:
  起動時にコーパス全体をパースするのは不可能（600+ 曲 × 100-500ms = 1-5 分かかり、
  Cloud Run の startup probe を超過する）。

  代わりに以下の lazy 戦略を採用：
    1. __init__ は完全に no-op（瞬時に return）
    2. 検索/取得時にだけ music21 corpus を呼び出す
    3. music21 の metadata bundle はディスクキャッシュ済みなので fast
    4. 結果はメモリにキャッシュして次回以降は瞬時

これで起動は即座に完了し、最初の /api/library 呼び出しでも 3-5 秒以内に応答可能。
"""

from typing import Optional, List, Dict, Any
import logging

logger = logging.getLogger(__name__)


# 作曲家ごとの時代区分（簡易判定）
ERA_BY_COMPOSER = {
    "bach": "baroque",
    "monteverdi": "baroque",
    "palestrina": "renaissance",
    "trecento": "medieval",
    "haydn": "classical",
    "mozart": "classical",
    "beethoven": "classical",
    "schubert": "romantic",
    "schumann": "romantic",
    "chopin": "romantic",
    "brahms": "romantic",
    "joplin": "early-jazz",
}


def _detect_era(composer_str: str) -> str:
    composer_lower = composer_str.lower()
    for key, era in ERA_BY_COMPOSER.items():
        if key in composer_lower:
            return era
    return "unknown"


def _humanize_composer(raw: str) -> str:
    mapping = {
        "bach": "J.S. Bach",
        "mozart": "W.A. Mozart",
        "beethoven": "L.v. Beethoven",
        "haydn": "F.J. Haydn",
        "schubert": "F. Schubert",
        "schumann": "R. Schumann",
        "chopin": "F. Chopin",
        "brahms": "J. Brahms",
        "palestrina": "G.P. da Palestrina",
        "monteverdi": "C. Monteverdi",
        "joplin": "S. Joplin",
        "trecento": "Trecento (14C Italy)",
    }
    for key, name in mapping.items():
        if key in raw.lower():
            return name
    return raw.replace("_", " ").title()


class LibraryIndex:
    """music21 corpus への lazy アクセスインデックス"""

    # 対応作曲家（music21 内蔵 corpus 名）
    COMPOSERS = ["bach", "mozart", "haydn", "beethoven", "palestrina"]

    def __init__(self):
        # 起動時には何もしない。最初の検索時にビルドする。
        self._pieces_cache: Optional[List[Dict[str, Any]]] = None
        logger.info("LibraryIndex initialized (lazy mode - corpus will be loaded on first request)")

    def _ensure_built(self) -> List[Dict[str, Any]]:
        """初回検索時にだけ corpus メタデータを enumerate（fast: パースしない）"""
        if self._pieces_cache is not None:
            return self._pieces_cache

        # music21 をここで初めて import （起動時の import コストを回避）
        from music21 import corpus

        pieces: List[Dict[str, Any]] = []
        for composer in self.COMPOSERS:
            try:
                # corpus.getComposer は metadata bundle を使うので fast
                # 各曲の metadata は既にキャッシュ済みのため、score パース不要
                works = corpus.getComposer(composer)
                for work_path in works:
                    try:
                        path_str = str(work_path)
                        piece_id = self._path_to_id(path_str, composer)

                        pieces.append({
                            "id": piece_id,
                            "composer": _humanize_composer(composer),
                            "composer_key": composer,
                            "title": self._id_to_title(piece_id),
                            "key": "—",  # 表示時に必要なら on-demand で取得
                            "measures": 0,  # 同上
                            "era": _detect_era(composer),
                            "source": "music21-corpus",
                        })
                    except Exception as e:
                        logger.warning(f"Skipped {work_path}: {e}")
            except Exception as e:
                logger.warning(f"Composer not available: {composer}: {e}")

        self._pieces_cache = pieces
        logger.info(f"Library index built: {len(pieces)} pieces (cached for next requests)")
        return pieces

    @staticmethod
    def _path_to_id(path_str: str, composer: str) -> str:
        for ext in [".xml", ".mxl", ".krn", ".abc", ".midi", ".mid", ".musicxml"]:
            if path_str.endswith(ext):
                path_str = path_str[: -len(ext)]
                break
        idx = path_str.rfind(f"/{composer}/")
        if idx >= 0:
            return path_str[idx + 1 :]
        return path_str.split("/")[-1]

    @staticmethod
    def _id_to_title(piece_id: str) -> str:
        last = piece_id.split("/")[-1]
        if last.startswith("bwv"):
            return f"BWV {last[3:]}"
        if last.startswith("k"):
            return f"K. {last[1:]}"
        if last.startswith("op"):
            return f"Op. {last[2:]}"
        return last.replace("_", " ").title()

    def count(self) -> int:
        """事前ビルドが済んでいなければ -1 を返す（health check 軽量化のため）"""
        return len(self._pieces_cache) if self._pieces_cache is not None else -1

    def search(
        self,
        composer: Optional[str] = None,
        era: Optional[str] = None,
        search: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> List[Dict[str, Any]]:
        results = self._ensure_built()

        if composer:
            results = [p for p in results if composer.lower() in p["composer_key"].lower()]
        if era:
            results = [p for p in results if p["era"] == era]
        if search:
            s = search.lower()
            results = [
                p for p in results
                if s in p["title"].lower()
                or s in p["composer"].lower()
                or s in p["id"].lower()
            ]

        return results[offset : offset + limit]

    def get_musicxml(self, piece_id: str) -> Optional[str]:
        """ID から MusicXML を取得（個別の score パースが必要なのでこれは遅い）"""
        try:
            from music21 import corpus
            score = corpus.parse(piece_id)
            musicxml_path = score.write("musicxml")
            with open(musicxml_path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            logger.error(f"Failed to load piece {piece_id}: {e}")
            return None
