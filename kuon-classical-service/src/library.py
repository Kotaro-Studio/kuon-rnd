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


# 作曲家ごとのメタデータ（時代 + 表示名）。music21 corpus の主要作曲家を網羅。
# 公衆ドメインかつ music21 内蔵 corpus に存在する作曲家のみ。
# 該当する作曲家が music21 内蔵に無い場合、_ensure_built() の try/except でスキップされる。
COMPOSER_META: Dict[str, Dict[str, str]] = {
    # Medieval / Renaissance
    "trecento": {"display": "Trecento (14th c. Italy)", "era": "medieval"},
    "ciconia": {"display": "Johannes Ciconia", "era": "medieval"},
    "josquin": {"display": "Josquin des Prez", "era": "renaissance"},
    "palestrina": {"display": "G.P. da Palestrina", "era": "renaissance"},
    "luca": {"display": "Luca Marenzio", "era": "renaissance"},
    # Baroque
    "monteverdi": {"display": "C. Monteverdi", "era": "baroque"},
    "corelli": {"display": "A. Corelli", "era": "baroque"},
    "handel": {"display": "G.F. Handel", "era": "baroque"},
    "bach": {"display": "J.S. Bach", "era": "baroque"},
    "cpebach": {"display": "C.P.E. Bach", "era": "baroque"},
    # Classical
    "haydn": {"display": "F.J. Haydn", "era": "classical"},
    "mozart": {"display": "W.A. Mozart", "era": "classical"},
    "beethoven": {"display": "L.v. Beethoven", "era": "classical"},
    # Romantic
    "schubert": {"display": "F. Schubert", "era": "romantic"},
    "schumann": {"display": "R. Schumann", "era": "romantic"},
    "chopin": {"display": "F. Chopin", "era": "romantic"},
    "brahms": {"display": "J. Brahms", "era": "romantic"},
    "weber": {"display": "C.M. von Weber", "era": "romantic"},
    "verdi": {"display": "G. Verdi", "era": "romantic"},
    "beach": {"display": "Amy Beach", "era": "romantic"},
    # Modern / Early Jazz
    "schoenberg": {"display": "A. Schoenberg", "era": "modern"},
    "joplin": {"display": "S. Joplin", "era": "early-jazz"},
    # Folk Collections (大量・コーパス内蔵)
    "essenFolksong": {"display": "Essen Folksong (German)", "era": "folk"},
    "oneills1850": {"display": "O'Neill's 1850 (Irish)", "era": "folk"},
    "ryansMammoth": {"display": "Ryan's Mammoth (Folk Dance)", "era": "folk"},
    "airdsAirs": {"display": "Aird's Airs (Scottish)", "era": "folk"},
    "nottingham": {"display": "Nottingham (English Folk)", "era": "folk"},
    "miscFolk": {"display": "Miscellaneous Folk", "era": "folk"},
}


def _detect_era(composer_str: str) -> str:
    meta = COMPOSER_META.get(composer_str.lower())
    return meta["era"] if meta else "unknown"


def _humanize_composer(raw: str) -> str:
    meta = COMPOSER_META.get(raw.lower())
    return meta["display"] if meta else raw.replace("_", " ").title()


class LibraryIndex:
    """music21 corpus への lazy アクセスインデックス"""

    # 対応作曲家（COMPOSER_META からキーを取得：拡張時は META を更新するだけ）
    COMPOSERS = list(COMPOSER_META.keys())

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

    def list_composers(self) -> List[Dict[str, Any]]:
        """利用可能な作曲家一覧を返す（曲数・時代区分付き）。
        フロントのドロップダウン用。music21 corpus に該当作曲家が居ない場合は count=0 で除外する。
        """
        pieces = self._ensure_built()
        counts: Dict[str, int] = {}
        for p in pieces:
            key = p["composer_key"]
            counts[key] = counts.get(key, 0) + 1

        result: List[Dict[str, Any]] = []
        for key, meta in COMPOSER_META.items():
            count = counts.get(key, 0)
            if count == 0:
                # music21 corpus に存在しない作曲家はスキップ（今は実在 11 名前後）
                continue
            result.append({
                "key": key,
                "display": meta["display"],
                "era": meta["era"],
                "count": count,
            })
        # 時代順 → 同時代内は曲数の多い順
        era_order = ["medieval", "renaissance", "baroque", "classical", "romantic", "modern", "early-jazz", "folk", "unknown"]
        result.sort(key=lambda c: (era_order.index(c["era"]) if c["era"] in era_order else 99, -c["count"]))
        return result

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
