"""
KUON CLASSICAL ANALYSIS — music21-based harmonic analysis service
=========================================================

Cloud Run Python FastAPI service that exposes music21's harmonic analysis
capabilities through a clean REST API.

Endpoints:
  GET  /health                          — Health check
  GET  /api/library                     — Browse curated piece library
  GET  /api/library/{piece_id}          — Load specific piece (returns MusicXML)
  POST /api/analyze                     — Roman numeral analysis from MusicXML
  POST /api/analyze-from-library        — Analyze a library piece by ID
  POST /api/check-voicing               — Voice-leading violations checker
  POST /api/detect-modulations          — Find key changes in a piece

Auth:
  Bearer token via CLASSICAL_SECRET (env var)

Library:
  music21 ships with built-in corpus of 600+ pieces including:
    - All 371 Bach chorales (BWV catalog)
    - Mozart string quartets, piano sonatas
    - Haydn string quartets
    - Beethoven string quartets, piano sonatas
    - Palestrina masses, motets
    - Trecento Italian compositions
    - Joplin rags, folk music
"""

import os
from typing import Optional, Literal

from fastapi import FastAPI, HTTPException, Header, Body
from fastapi.responses import Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .library import LibraryIndex
from .analysis import analyze_score, detect_cadences, detect_modulations
from .voicing import check_voice_leading

app = FastAPI(
    title="KUON CLASSICAL ANALYSIS",
    version="1.0.0",
    description="Roman numeral analysis + voice leading + curated library — music21 powered",
)

# CORS: Cloudflare Pages から呼び出せるように
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://kuon-rnd.com", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Bearer token authentication (CLASSICAL_SECRET 環境変数)
CLASSICAL_SECRET = os.environ.get("CLASSICAL_SECRET", "")


def verify_auth(authorization: Optional[str]) -> None:
    """Bearer token 認証 (CLASSICAL_SECRET と一致するか)"""
    if not CLASSICAL_SECRET:
        # 開発環境（環境変数未設定）はスルー
        return
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization[7:]
    if token != CLASSICAL_SECRET:
        raise HTTPException(status_code=403, detail="Invalid token")


# ────────────────────────────────────────────────────────────────────
# Library インスタンス（起動時に 1 度だけインデックス生成）
# ────────────────────────────────────────────────────────────────────
library = LibraryIndex()


# ────────────────────────────────────────────────────────────────────
# Pydantic Models
# ────────────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    musicxml: str = Field(..., description="MusicXML content as string")
    key_hint: Optional[str] = Field(None, description="Optional key hint (e.g., 'C major')")


class LibraryAnalyzeRequest(BaseModel):
    piece_id: str = Field(..., description="Library piece ID (e.g., 'bach/bwv1.6')")


class VoicingRequest(BaseModel):
    musicxml: str
    strict: bool = Field(False, description="Strict mode (also flags partial parallel motion)")


class ModulationRequest(BaseModel):
    musicxml: str


# ────────────────────────────────────────────────────────────────────
# Health Check
# ────────────────────────────────────────────────────────────────────

@app.get("/health")
def health() -> dict:
    return {
        "status": "ok",
        "service": "kuon-classical",
        "version": "1.0.0",
        "library_pieces": library.count(),
    }


# ────────────────────────────────────────────────────────────────────
# Library endpoints
# ────────────────────────────────────────────────────────────────────

@app.get("/api/library")
def list_library(
    composer: Optional[str] = None,
    era: Optional[Literal["baroque", "classical", "romantic"]] = None,
    search: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
    authorization: Optional[str] = Header(None),
):
    """音楽ライブラリの一覧取得（フィルタ・検索可）"""
    verify_auth(authorization)
    results = library.search(
        composer=composer,
        era=era,
        search=search,
        limit=limit,
        offset=offset,
    )
    return {
        "total": library.count(),
        "filtered": len(results),
        "pieces": results,
    }


@app.get("/api/library/{piece_id:path}")
def get_piece(piece_id: str, authorization: Optional[str] = Header(None)):
    """特定の楽曲の MusicXML を取得"""
    verify_auth(authorization)
    musicxml = library.get_musicxml(piece_id)
    if musicxml is None:
        raise HTTPException(status_code=404, detail=f"Piece not found: {piece_id}")
    return {"piece_id": piece_id, "musicxml": musicxml}


@app.get("/api/composers")
def list_composers(authorization: Optional[str] = Header(None)):
    """利用可能な作曲家一覧（フロントのドロップダウン用）。
    時代順 + 曲数の多い順でソート済み。"""
    verify_auth(authorization)
    return {"composers": library.list_composers()}


# ────────────────────────────────────────────────────────────────────
# MIDI 生成エンドポイント（フロントの Tone.js 再生用）
# ────────────────────────────────────────────────────────────────────

@app.get("/api/midi/{piece_id:path}")
def get_midi(piece_id: str, authorization: Optional[str] = Header(None)):
    """指定楽曲の MIDI バイナリを返す。music21 が score → MIDI 変換。
    フロントが @tonejs/midi でパース → Tone.js で再生する。"""
    verify_auth(authorization)
    musicxml = library.get_musicxml(piece_id)
    if musicxml is None:
        raise HTTPException(status_code=404, detail=f"Piece not found: {piece_id}")
    try:
        from music21 import converter
        score = converter.parseData(musicxml, format="musicxml")
        midi_path = score.write("midi")
        with open(midi_path, "rb") as f:
            midi_bytes = f.read()
        return Response(
            content=midi_bytes,
            media_type="audio/midi",
            headers={
                "Content-Disposition": f'attachment; filename="{piece_id.replace("/", "_")}.mid"',
                "Cache-Control": "public, max-age=3600",
            },
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MIDI generation failed: {str(e)}")


# ────────────────────────────────────────────────────────────────────
# Analysis endpoints
# ────────────────────────────────────────────────────────────────────

@app.post("/api/analyze")
def analyze(req: AnalyzeRequest, authorization: Optional[str] = Header(None)):
    """MusicXML をローマ数字で和声分析。レスポンスに入力 MusicXML を含めることで、
    フロントが描画と分析の両方を 1 リクエストで取得できる。"""
    verify_auth(authorization)
    try:
        result = analyze_score(req.musicxml, key_hint=req.key_hint)
        result["musicxml"] = req.musicxml  # 描画用に echo back
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Analysis failed: {str(e)}")


@app.post("/api/analyze-from-library")
def analyze_from_library(req: LibraryAnalyzeRequest, authorization: Optional[str] = Header(None)):
    """ライブラリ内の楽曲を ID で指定して分析。
    レスポンスには MusicXML 文字列も含めるので、フロントは OSMD で楽譜描画できる。"""
    verify_auth(authorization)
    musicxml = library.get_musicxml(req.piece_id)
    if musicxml is None:
        raise HTTPException(status_code=404, detail=f"Piece not found: {req.piece_id}")
    try:
        result = analyze_score(musicxml)
        result["piece_id"] = req.piece_id
        result["musicxml"] = musicxml  # フロントで OSMD 描画するために含める
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Analysis failed: {str(e)}")


@app.post("/api/check-voicing")
def check_voicing(req: VoicingRequest, authorization: Optional[str] = Header(None)):
    """声部進行違反（連続 5 度・8 度等）の検出"""
    verify_auth(authorization)
    try:
        violations = check_voice_leading(req.musicxml, strict=req.strict)
        return {"violations": violations, "count": len(violations)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Voicing check failed: {str(e)}")


@app.post("/api/detect-modulations")
def detect_modulation(req: ModulationRequest, authorization: Optional[str] = Header(None)):
    """転調マップの抽出"""
    verify_auth(authorization)
    try:
        modulations = detect_modulations(req.musicxml)
        return {"modulations": modulations}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Modulation detection failed: {str(e)}")
