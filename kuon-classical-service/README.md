# KUON CLASSICAL ANALYSIS Service

music21-based harmonic analysis service for Cloud Run.

## Architecture (CLAUDE.md §44.11 🟢 safe zone)

- Python 3.11 + FastAPI + music21
- music21 ships with **600+ pieces built-in** (Bach, Mozart, Haydn, Beethoven, Palestrina, etc.)
- CPU-only, no GPU needed
- Average response time: 100-500ms
- Memory: ~500MB

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check + library count |
| GET | /api/library | List pieces (filter: composer/era/search) |
| GET | /api/library/{piece_id} | Get MusicXML by ID |
| POST | /api/analyze | Roman numeral analysis from MusicXML |
| POST | /api/analyze-from-library | Analyze a library piece |
| POST | /api/check-voicing | Voice leading violations |
| POST | /api/detect-modulations | Modulation map |

## Auth

All endpoints (except /health) require Bearer token via `CLASSICAL_SECRET` env var.
Set the same secret in Cloudflare Pages env so the Next.js proxy can forward it.

## Local development

```bash
cd kuon-classical-service
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8080
```

## Deployment to Cloud Run

```bash
# One-time: Enable required APIs
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# Build and deploy via Cloud Build
cd kuon-classical-service
gcloud builds submit --config=cloudbuild.yaml \
  --substitutions=_CLASSICAL_SECRET="$(openssl rand -hex 32)"
```

After deployment:
1. Note the service URL: `https://kuon-classical-XXX-an.a.run.app`
2. Add to Cloudflare Pages env: `CLASSICAL_URL` and `CLASSICAL_SECRET`
3. Frontend `/api/classical/*` proxies to this service

## Cost estimates (CLAUDE.md §44.10)

- Per analysis: ~¥0.01 (Cloud Run CPU 4 vCPU × 200ms)
- 10,000 students × 30 analyses/month = ¥3,000/month
- Negligible vs MRR

## Naming consistency note

This service is named "kuon-classical" everywhere:
- Service name on Cloud Run: `kuon-classical`
- Container image: `gcr.io/$PROJECT_ID/kuon-classical`
- Env var prefix: `CLASSICAL_*` (CLASSICAL_SECRET, CLASSICAL_URL)
- Folder name: `kuon-classical-service/`
- Frontend route: `/classical` (LP at `/classical-lp`)
- Frontend API proxy: `/api/classical/*`
