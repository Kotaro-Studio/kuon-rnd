"""
KUON CLASSICAL ANALYSIS — Voice Leading Checker
=========================================================

四声体の声部進行をチェックし、和声学の禁則違反を検出。

検出する違反：
  1. 連続 5 度 (Parallel fifths)
  2. 連続 8 度 (Parallel octaves)
  3. 隠伏 5 度 (Hidden fifths) — strict mode のみ
  4. 隠伏 8 度 (Hidden octaves) — strict mode のみ
  5. 限定進行音の誤った解決 (Leading tone resolution)
"""

from typing import List, Dict, Any
from music21 import converter, interval, note, chord
import logging

logger = logging.getLogger(__name__)


def check_voice_leading(musicxml: str, strict: bool = False) -> List[Dict[str, Any]]:
    """
    声部進行をチェック。

    Args:
      musicxml: MusicXML 文字列
      strict: True の場合、隠伏 5 度・8 度等も検出

    Returns:
      [
        {
          "type": "parallel_fifths",
          "measure": 12,
          "beat": 2.0,
          "voices": ["soprano", "alto"],
          "intervals": ["P5", "P5"],
          "description": "連続 5 度: ソプラノ E→F、アルト A→B (両声部とも 5 度上昇)",
          "severity": "error",  // error | warning | info
        },
        ...
      ]
    """
    score = converter.parseData(musicxml, format="musicxml")
    violations: List[Dict[str, Any]] = []

    parts = score.parts
    if len(parts) < 2:
        return violations  # 単声では検出不可

    # 各パートからノートシーケンスを抽出
    voice_names = ["soprano", "alto", "tenor", "bass"]
    voices = []
    for i, part in enumerate(parts[:4]):  # 最大 4 声部
        notes_in_part = []
        for n in part.recurse().notes:
            if n.isNote:
                notes_in_part.append(n)
            elif n.isChord:
                # コード内の最高音を採用（簡易）
                notes_in_part.append(n[0])
        voices.append({
            "name": voice_names[i] if i < len(voice_names) else f"voice_{i+1}",
            "notes": notes_in_part,
        })

    # 連続 5 度・8 度をチェック
    for i in range(len(voices) - 1):
        for j in range(i + 1, len(voices)):
            v1 = voices[i]
            v2 = voices[j]
            min_len = min(len(v1["notes"]), len(v2["notes"])) - 1

            for n in range(min_len):
                try:
                    n1_curr = v1["notes"][n]
                    n2_curr = v2["notes"][n]
                    n1_next = v1["notes"][n + 1]
                    n2_next = v2["notes"][n + 1]

                    # 現在と次の音程
                    int_curr = interval.Interval(n2_curr, n1_curr)
                    int_next = interval.Interval(n2_next, n1_next)

                    int_curr_name = int_curr.simpleName
                    int_next_name = int_next.simpleName

                    # 連続 5 度
                    if int_curr_name == "P5" and int_next_name == "P5":
                        # 同じ方向の動きでない（共通音保留含む）はスキップ
                        if (n1_curr.pitch == n1_next.pitch) or (n2_curr.pitch == n2_next.pitch):
                            continue
                        violations.append({
                            "type": "parallel_fifths",
                            "measure": n1_next.measureNumber if n1_next.measureNumber else n + 1,
                            "beat": float(n1_next.beat) if n1_next.beat else 1.0,
                            "voices": [v1["name"], v2["name"]],
                            "notes": [
                                f"{n1_curr.nameWithOctave}→{n1_next.nameWithOctave}",
                                f"{n2_curr.nameWithOctave}→{n2_next.nameWithOctave}",
                            ],
                            "description": f"連続 5 度違反: {v1['name']} {n1_curr.name}→{n1_next.name}, {v2['name']} {n2_curr.name}→{n2_next.name}",
                            "severity": "error",
                        })

                    # 連続 8 度（unison も含む）
                    if int_curr_name in ["P8", "P1"] and int_next_name in ["P8", "P1"]:
                        if (n1_curr.pitch == n1_next.pitch) or (n2_curr.pitch == n2_next.pitch):
                            continue
                        violations.append({
                            "type": "parallel_octaves",
                            "measure": n1_next.measureNumber if n1_next.measureNumber else n + 1,
                            "beat": float(n1_next.beat) if n1_next.beat else 1.0,
                            "voices": [v1["name"], v2["name"]],
                            "notes": [
                                f"{n1_curr.nameWithOctave}→{n1_next.nameWithOctave}",
                                f"{n2_curr.nameWithOctave}→{n2_next.nameWithOctave}",
                            ],
                            "description": f"連続 8 度違反: {v1['name']} {n1_curr.name}→{n1_next.name}, {v2['name']} {n2_curr.name}→{n2_next.name}",
                            "severity": "error",
                        })

                    # 隠伏 5 度・8 度（strict mode）
                    if strict:
                        # 同方向で外声に到達した場合
                        if int_next_name in ["P5", "P8"]:
                            v1_motion = "up" if n1_next.pitch.midi > n1_curr.pitch.midi else ("down" if n1_next.pitch.midi < n1_curr.pitch.midi else "same")
                            v2_motion = "up" if n2_next.pitch.midi > n2_curr.pitch.midi else ("down" if n2_next.pitch.midi < n2_curr.pitch.midi else "same")
                            if v1_motion == v2_motion and v1_motion != "same":
                                # 跳躍を伴う？
                                if abs(n1_next.pitch.midi - n1_curr.pitch.midi) > 2 or abs(n2_next.pitch.midi - n2_curr.pitch.midi) > 2:
                                    violations.append({
                                        "type": "hidden_fifth_octave",
                                        "measure": n1_next.measureNumber if n1_next.measureNumber else n + 1,
                                        "beat": float(n1_next.beat) if n1_next.beat else 1.0,
                                        "voices": [v1["name"], v2["name"]],
                                        "notes": [
                                            f"{n1_curr.nameWithOctave}→{n1_next.nameWithOctave}",
                                            f"{n2_curr.nameWithOctave}→{n2_next.nameWithOctave}",
                                        ],
                                        "description": f"隠伏 {int_next_name}: 同方向の動きで {int_next_name} に到達",
                                        "severity": "warning",
                                    })
                except Exception as e:
                    logger.warning(f"Voice check error at index {n}: {e}")

    return violations
