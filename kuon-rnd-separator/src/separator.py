"""Demucs v4 ラッパー — 音源分離のコアロジック。

分離処理は CPU バウンドで 4-6 分かかる。Cloud Run のタイムアウトは
最大 60 分まで設定可能（--timeout=3600）。
"""
import logging
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path
from typing import Dict

logger = logging.getLogger(__name__)


@dataclass
class SeparationResult:
    """分離結果の 4 ステムへのローカルファイルパス。"""

    stems: Dict[str, Path]
    """{'drums': Path, 'bass': Path, 'vocals': Path, 'other': Path}"""

    duration_seconds: float
    model_used: str


class DemucsSeparator:
    """Demucs v4 htdemucs モデルでステレオ音源を 4 ステムに分離する。

    実装ノート:
    - Demucs の Python API ではなく CLI を使う（メモリ解放が確実）
    - 子プロセス方式により OOM 時も親プロセスが生き残る
    - 出力は WAV 形式（16bit 44.1kHz ステレオ、非圧縮）
    """

    def __init__(self, model_name: str = "htdemucs"):
        self.model_name = model_name

    def separate(self, input_audio: Path) -> SeparationResult:
        """入力音源を 4 ステムに分離して、ローカルの一時ディレクトリに書き出す。

        Raises:
            RuntimeError: Demucs プロセスが非ゼロで終了した場合
        """
        # demucs CLI は出力を <output_dir>/<model>/<track_name>/ に書く
        output_dir = Path(tempfile.mkdtemp(prefix="demucs_out_"))
        track_name = input_audio.stem

        logger.info(
            "demucs_start",
            extra={
                "model": self.model_name,
                "input": str(input_audio),
                "output_dir": str(output_dir),
            },
        )

        # --two-stems=vocals だと 2 ステムのみ。デフォルトは 4 ステム
        # 2026-04-26 修正: --filename パターンに {track}/ を追加。
        # 旧 "{stem}.{ext}" だと出力が <output>/<model>/<stem>.wav になり
        # 後段の lookup (<output>/<model>/<track>/<stem>.wav) と不一致だった。
        cmd = [
            "python", "-m", "demucs.separate",
            "--name", self.model_name,
            "--out", str(output_dir),
            "--filename", "{track}/{stem}.{ext}",  # <output>/<model>/<track>/<stem>.wav
            str(input_audio),
        ]

        proc = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=1800,  # 30 分
        )

        if proc.returncode != 0:
            logger.error(
                "demucs_failed",
                extra={
                    "returncode": proc.returncode,
                    "stderr": proc.stderr[-2000:],  # 最後の 2KB のみ
                },
            )
            raise RuntimeError(f"Demucs failed (exit {proc.returncode}): {proc.stderr[-500:]}")

        # 出力ディレクトリから 4 ステムを回収
        stem_dir = output_dir / self.model_name / track_name
        stems = {}
        for stem_name in ("drums", "bass", "vocals", "other"):
            stem_path = stem_dir / f"{stem_name}.wav"
            if not stem_path.exists():
                raise RuntimeError(f"Expected stem not found: {stem_path}")
            stems[stem_name] = stem_path

        logger.info("demucs_complete", extra={"stems": list(stems.keys())})

        return SeparationResult(
            stems=stems,
            duration_seconds=0.0,  # main.py 側で計測
            model_used=self.model_name,
        )
