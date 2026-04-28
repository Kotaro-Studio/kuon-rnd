"""
KUON CLASSICAL ANALYSIS — ローマ数字分析・カデンツ・転調検出
=========================================================

music21 の roman.romanNumeralFromChord と key 解析を組み合わせた
和声分析エンジン。

戻り値は JSON-serializable な dict / list のみ。
"""

from typing import List, Dict, Any, Optional
from music21 import converter, roman, chord, stream, key, analysis, meter
import logging

logger = logging.getLogger(__name__)


def _parse_score(musicxml: str):
    """MusicXML 文字列を music21 score に変換"""
    return converter.parseData(musicxml, format="musicxml")


def analyze_score(musicxml: str, key_hint: Optional[str] = None) -> Dict[str, Any]:
    """
    ローマ数字分析の中核。

    Returns:
      {
        "key": "C major",
        "key_confidence": 0.95,
        "chords": [
          {"measure": 1, "beat": 1.0, "chord": "C", "roman": "I", "function": "tonic"},
          ...
        ],
        "cadences": [
          {"measure": 8, "type": "authentic", "roman_progression": ["V7", "I"]}
        ],
        "modulations": [
          {"from_measure": 1, "to_measure": 16, "key": "C major"},
          {"from_measure": 17, "to_measure": 32, "key": "G major"}
        ]
      }
    """
    score = _parse_score(musicxml)

    # 調性判定（key_hint があれば優先）
    if key_hint:
        try:
            main_key = key.Key(key_hint)
            confidence = 1.0  # ユーザー指定なので確信度 max
        except Exception:
            main_key = score.analyze("key")
            confidence = main_key.tonalCertainty() if hasattr(main_key, "tonalCertainty") else 0.85
    else:
        main_key = score.analyze("key")
        confidence = main_key.tonalCertainty() if hasattr(main_key, "tonalCertainty") else 0.85

    # 全コードを抽出してローマ数字化
    chords_data = []
    chordified = score.chordify()
    for c in chordified.recurse().getElementsByClass("Chord"):
        try:
            measure_num = c.measureNumber if c.measureNumber else 0
            beat = float(c.beat) if c.beat else 1.0

            # ローマ数字化
            try:
                rn = roman.romanNumeralFromChord(c, main_key)
                roman_str = rn.romanNumeralAlone if hasattr(rn, "romanNumeralAlone") else rn.figure
                # Function (tonic / predominant / dominant)
                func = _roman_to_function(roman_str)
            except Exception:
                roman_str = "?"
                func = "unknown"

            chords_data.append({
                "measure": measure_num,
                "beat": round(beat, 2),
                "chord": c.pitchedCommonName,
                "roman": roman_str,
                "function": func,
            })
        except Exception as e:
            logger.warning(f"Skipped chord: {e}")

    # カデンツ検出
    cadences = detect_cadences_from_chords(chords_data, main_key)

    # 転調検出（簡易版）
    modulations_list = []
    try:
        modulations_list = detect_modulations_internal(score)
    except Exception as e:
        logger.warning(f"Modulation detection failed: {e}")

    return {
        "key": str(main_key),
        "key_confidence": round(float(confidence), 3),
        "chords": chords_data,
        "cadences": cadences,
        "modulations": modulations_list,
        "chord_count": len(chords_data),
    }


def _roman_to_function(roman_str: str) -> str:
    """ローマ数字 → 機能 (tonic/predominant/dominant)"""
    rs = roman_str.upper().replace("7", "").replace("6", "").replace("4", "").replace("2", "")
    if rs.startswith("I") and not rs.startswith("II") and not rs.startswith("III") and not rs.startswith("IV"):
        return "tonic"
    if rs.startswith("V") or rs.startswith("VII"):
        return "dominant"
    if rs.startswith("II") or rs.startswith("IV") or rs.startswith("VI"):
        return "predominant"
    return "other"


def detect_cadences_from_chords(chords_data: List[Dict[str, Any]], main_key) -> List[Dict[str, Any]]:
    """ローマ数字シーケンスからカデンツを検出"""
    cadences = []
    for i in range(len(chords_data) - 1):
        cur = chords_data[i]["roman"].upper()
        nxt = chords_data[i + 1]["roman"].upper()

        cad_type = None
        if cur.startswith("V") and nxt.startswith("I") and not nxt.startswith("II") and not nxt.startswith("III") and not nxt.startswith("IV"):
            cad_type = "authentic"  # 完全終止
        elif cur.startswith("IV") and nxt.startswith("I") and not nxt.startswith("II"):
            cad_type = "plagal"  # 変格終止
        elif cur.startswith("V") and nxt.startswith("VI"):
            cad_type = "deceptive"  # 偽終止
        elif nxt.startswith("V") and not cur.startswith("V"):
            cad_type = "half"  # 半終止（次が V で終わる）

        if cad_type:
            cadences.append({
                "measure": chords_data[i + 1]["measure"],
                "beat": chords_data[i + 1]["beat"],
                "type": cad_type,
                "progression": [chords_data[i]["roman"], chords_data[i + 1]["roman"]],
            })
    return cadences


def detect_cadences(musicxml: str) -> List[Dict[str, Any]]:
    """カデンツのみ検出（軽量モード）"""
    result = analyze_score(musicxml)
    return result["cadences"]


def detect_modulations_internal(score) -> List[Dict[str, Any]]:
    """転調検出（小節ごとの局所キー解析）"""
    results = []
    try:
        windowed = analysis.windowed.WindowedAnalysis(score, analysis.discrete.KrumhanslSchmuckler())
        keys, coeffs = windowed.process(8)  # 8 小節ウィンドウ
        prev_key = None
        start_measure = 1
        for i, k in enumerate(keys):
            key_str = str(k)
            measure = i + 1
            if prev_key is None:
                prev_key = key_str
                start_measure = measure
            elif prev_key != key_str:
                results.append({
                    "from_measure": start_measure,
                    "to_measure": measure - 1,
                    "key": prev_key,
                })
                prev_key = key_str
                start_measure = measure
        # 最後の区間
        if prev_key is not None:
            results.append({
                "from_measure": start_measure,
                "to_measure": len(keys),
                "key": prev_key,
            })
    except Exception as e:
        logger.warning(f"Modulation detection error: {e}")
    return results


def detect_modulations(musicxml: str) -> List[Dict[str, Any]]:
    """転調検出（公開関数）"""
    score = _parse_score(musicxml)
    return detect_modulations_internal(score)
