# ADRD Knowledge Graph

A Django-powered API and React/Vite frontend for exploring Alzheimer's Disease and Related Dementia (ADRD) datasets, publications, analytics, and community-contributed data.

## Overview
The app exposes a lightweight Django API (built for Vercel/serverless or Gunicorn) with CSV/XLSX ingestion, plus a React UI built with MUI. Users can browse datasets and publications, download CSV exports, submit new datasets for review, and administrators can approve/reject uploads.

## Features
- Dataset discovery with filtering by disease type, modality, and free-text search
- Publication browsing with year/dataset filters and export to CSV
- Analytics overview (counts, disease distribution, publication years, access/wgs availability)
- Contribution workflow: upload CSV/XLSX metadata for admin review
- Admin management: pending uploads queue, approve/reject with notes, simple auth

## Technology Stack
- **Backend:** Django 4.2, minimal settings for serverless/Gunicorn; SQLite by default or PostgreSQL via `DATABASE_URL`; pandas/openpyxl for file parsing; CORS enabled
- **Frontend:** React 19 + Vite + TypeScript, MUI, React Router 7, Recharts, Axios
- **Deployment:** Vercel (static frontend + Python serverless API at `api/index.py`), or Docker Compose (PostgreSQL, backend, frontend, Redis optional)

## Project Structure
```
ADRD-KG/
├── api/                 # Django API entrypoint
│   ├── index.py         # WSGI app for Vercel/Gunicorn (initializes DB & sample data)
│   ├── models.py        # Dataset, Publication, AdminUser, PendingUpload
│   ├── views.py         # API endpoints
│   ├── urls.py          # URL patterns (used by settings.py)
│   ├── urls_root.py     # Root patterns for Vercel routing
│   ├── settings.py      # Minimal settings for Vercel
│   └── requirements.txt # API-only deps
├── frontend/            # React/Vite UI (MUI)
│   ├── src/
│   ├── package.json
│   └── env.example
├── Dockerfile.backend   # Django container (Gunicorn)
├── Dockerfile.frontend  # Frontend build + serve
├── docker-compose.yml   # Full stack: Postgres, backend, frontend, Redis
├── requirements.txt     # Full Python deps
├── env.example          # Backend/production env template
├── vercel.json          # Vercel routing (frontend + /api)
├── init.sql             # Postgres init script
└── data samples         # ADRD_Metadata_Sample*.xlsx, pubmed_refs_fetched.csv, penguins.csv
```

## Getting Started (Local Development)
### Prerequisites
- Python 3.11+
- Node.js 18+ (includes npm)

### 1) Backend (Django API)
```bash
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt

# Optional: point to Postgres instead of local SQLite-in-/tmp
# export DATABASE_URL=postgresql://user:pass@localhost:5432/adrd_kg
# export ALLOWED_HOSTS=localhost,127.0.0.1

# Run the API
gunicorn --bind 0.0.0.0:8000 api.index:app
```
- Health check: `curl http://localhost:8000/api/health`
- On first run, tables are created automatically and sample datasets/publications are inserted.

### 2) Frontend (React/Vite)
```bash
cd frontend
npm install
# Point the UI at your local API
cp env.example .env
# set VITE_API_BASE_URL=http://localhost:8000/api in .env
npm run dev
```
App runs at `http://localhost:5173` and proxies requests to the API URL you configured.

## Configuration
Key backend variables (see `env.example`):
- `DEBUG`, `SECRET_KEY`
- `DATABASE_URL` (defaults to SQLite at /tmp/adrd_kg.db when unset)
- `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`
- Optional: Redis, email, HTTPS flags (for production hardening)

Frontend variables (`frontend/env.example`):
- `VITE_API_BASE_URL` (e.g., `http://localhost:8000/api` or your deployed API URL)

## API Endpoints (summary)
Base path is `/api/` (Vercel and Docker Compose route this automatically):
- `GET /health` — health check
- `GET /datasets` — list datasets; query params: `disease_type`, `modality`, `search`, `page`, `per_page`
- `GET /datasets/<id>` — dataset detail
- `GET /datasets/search` — advanced search (supports `q`, `disease_type`, `modality`, `min_sample_size`, `max_sample_size`, `data_accessibility`, `wgs_available`)
- `GET /datasets/recent` — recent datasets (`limit`)
- `GET /datasets/<id>/publications` — publications for a dataset
- `GET /datasets/export` — CSV export
- `GET /publications` — list publications; query params: `dataset_name`, `title_search`, `year`, `page`, `per_page`
- `GET /publications/search` — advanced publication search (`q`, `dataset_name`, `journal`, `min_year`, `max_year`, `author`)
- `GET /publications/recent` — recent publications (`limit`)
- `GET /publications/export` — CSV export
- `GET /stats` — counts of datasets/publications + disease distribution
- `GET /filters` — available disease types and modalities
- `GET /analytics/overview` — summary stats and distributions
- Upload + management
  - `POST /upload` — submit CSV/XLSX content for review (fields: `file_name`, `file_content` base64 data URL or raw text, `file_type`, optional `uploaded_by`)
  - `GET /management/pending?status=pending|approved|rejected` — list uploads
  - `GET /management/pending/<id>` — upload detail (parsed content)
  - `POST /management/pending/<id>/approve` — approve and ingest
  - `POST /management/pending/<id>/reject` — reject with notes
- Auth (lightweight, local-storage based in UI)
  - `POST /auth/login` — returns `{success, message, username}`
  - `POST /auth/logout`
  - `GET /auth/check` — stubbed check

> Default admin users are seeded for development (`Yuyang`/`Big-s2`, `Sara`/`Big-s2`). Replace these before any real deployment.

## Data Upload & Review Flow
1) User uploads CSV/XLSX via the Contribute page (`/contribute`), which calls `POST /api/upload`.
2) Admin visits Management (`/management`), views pending uploads, inspects parsed content, and approves/rejects with notes.
3) On approval, datasets/publications are inserted into the database; on rejection, status and notes are stored.

## Deployment
### Vercel
- `vercel.json` routes `/api/*` to `api/index.py` (Python serverless) and all other paths to the built frontend.
- Build command for frontend: `npm run build` (dist served as static assets).
- Set `DATABASE_URL` to a persistent Postgres service for production; SQLite in `/tmp` is ephemeral.

### Docker Compose
```bash
docker-compose up -d --build
```
Services: Postgres (with `init.sql`), Gunicorn-backed Django API on `8000`, frontend on `80`, Redis on `6379` (optional caching). Health checks are preconfigured.

### Single Containers
- Backend: `docker build -f Dockerfile.backend -t adrd-backend . && docker run -p 8000:8000 adrd-backend`
- Frontend: `docker build -f Dockerfile.frontend -t adrd-frontend . && docker run -p 80:80 adrd-frontend`

## Troubleshooting
- Python 3.13 may raise `pkgutil.ImpImporter` errors for some packages. Prefer Python 3.11/3.12 or install with `pip install --no-build-isolation -r requirements.txt`.
- If frontend cannot reach the API, confirm `VITE_API_BASE_URL` and that the backend is reachable at that host/port (CORS/ALLOWED_HOSTS).
- Port conflicts: backend defaults to `8000`, frontend `5173` (Vite) or `80` (Docker).
- For npm install issues, remove `node_modules` + `package-lock.json` and reinstall, or try a different port: `npm run dev -- --port 3000`.

## License
MIT License. See `LICENSE` for details.

## Contact
For questions or collaboration: research@adrd-kg.org
