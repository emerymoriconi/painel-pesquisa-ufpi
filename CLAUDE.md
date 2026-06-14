# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Painel de Pesquisa e Inovação** — a research and innovation dashboard for a Brazilian university (UFPI). The backend exposes a REST API over a PostgreSQL database populated from Excel spreadsheets. The frontend (`frontend/`) contains scaffolded directory structure but no source files yet.

## Backend

### Stack
- **FastAPI** + **Uvicorn** (API server)
- **SQLAlchemy 2.x** (ORM, sync sessions)
- **Alembic** (migrations)
- **PostgreSQL** via `psycopg2-binary`
- **Pydantic v2** (schemas with `model_config = {"from_attributes": True}`)
- **pandas + openpyxl** (Excel import scripts)

### Running the API

All commands run from `backend/`:

```bash
# Activate virtualenv
.venv\Scripts\Activate.ps1          # PowerShell
# or
source .venv/Scripts/activate        # Bash

# Start dev server
uvicorn app.main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`.

### Running Tests

```bash
cd backend
pytest                              # all tests
pytest tests/test_something.py      # single file
pytest --cov=app tests/             # with coverage
```

### Database Setup

PostgreSQL must be running locally. Default connection (from `backend/.env`):
```
DATABASE_URL=postgresql://painel:painel123@localhost:5432/pesquisa
```

Run migrations:
```bash
cd backend
alembic upgrade head
```

Generate a new migration after model changes:
```bash
alembic revision --autogenerate -m "description"
```

### Importing Data from Excel

The `scripts/` directory contains importers that read `.xlsx` files and populate the database. Run from `backend/`:

```bash
python scripts/import_xlsx.py <path-to-file.xlsx>
```

Individual importers live in `scripts/importers/` (one per data domain). Each reads a specific sheet name and uses `normalizar_colunas()` to normalize column headers before mapping to ORM models.

## Architecture

### Backend Layer Structure

```
app/
  main.py          # FastAPI app, CORS, router registration
  database.py      # engine + SessionLocal + Base
  models.py        # SQLAlchemy ORM models (all tables)
  schemas.py       # Pydantic output schemas (one per model)
  dependencies.py  # get_db() dependency injection
  routers/
    projetos.py    # /projetos/pdi, /projetos/finep
    dashboard.py   # /dashboard/kpis
```

### Data Flow

1. Excel files → `scripts/importers/*.py` → PostgreSQL tables
2. FastAPI endpoints query tables via SQLAlchemy sessions → Pydantic schemas → JSON responses

### Key Design Decisions

- **Models vs schemas naming divergence**: some SQLAlchemy model class names differ from table names (e.g., `ProducaoAnual` maps to `metricas_producao_anual`; `VitrineProducao` maps to `propriedades_intelectuais_detalhado`). Always check `__tablename__` in `models.py`.
- **ProjetoPDI table is not yet populated** — noted in both `models.py` and `schemas.py` with a comment; the importer stub is commented out in `scripts/importers/projetos.py`.
- **`ULTIMA_ATUALIZACAO` env var** controls the date shown in the dashboard KPI response (defaults to `"08/02/2026"`).
- **Importer column normalization**: `normalizar_colunas()` strips whitespace, lowercases, replaces spaces with `_`, and removes non-word characters from Excel column headers. When mapping a new sheet, print normalized column names first to see what keys to use.
- **CORS** is configured to allow only `http://localhost:3000` (the expected Next.js frontend port).

### Frontend

The `frontend/src/` directory has scaffolded subdirectories (`api/`, `components/`, `pages/`, `__tests__/`) but contains no source files yet.
