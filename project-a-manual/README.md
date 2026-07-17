# Project A — Notes API (Manual Build)

An authenticated notes app: register/login, then create, list, search,
update, and delete personal notes. Backend is FastAPI + SQLAlchemy (SQLite by
default), built with Clean Architecture, DDD-flavored boundaries, and
CQRS-lite (see `backend/README.md` for the rationale); frontend is Next.js
using an MVVM structure (see `frontend/README.md`). Built manually, without
AI coding tools, per the challenge requirements for this project.

## Layout

```text
docs/       MkDocs API documentation site (endpoints, entities, errors, config)
backend/    FastAPI app (README.md has architecture + API details)
frontend/   Next.js app (README.md has MVVM structure + setup)
tests/      pytest suite (unit tests + pytest-bdd acceptance tests) for the backend
```

## Run it from a fresh clone

Two terminals — backend first, frontend second. Requires Python 3.13+ and
Node 18+, plus [Poetry](https://python-poetry.org/).

### 1. Backend

```bash
cd project-a-manual/backend
poetry install
```

All settings have safe local defaults; create a `.env` in `backend/` to
override `DATABASE_URL`, `JWT_SECRET_KEY`, etc. — see
[`backend/README.md`](backend/README.md#getting-started).

```bash
poetry run python run.py
```

Backend is now on `http://localhost:8000`. Interactive API docs at
`http://localhost:8000/docs` (Swagger) or `http://localhost:8000/documentations`
(Scalar).

### 2. Frontend

In a second terminal:

```bash
cd project-a-manual/frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Frontend is now on `http://localhost:3000` — `/` redirects to `/login` or
`/notes` depending on session state.

### 3. Run the backend tests

```bash
cd project-a-manual/backend
poetry run pytest ../tests -v
```

Covers unit tests (shared `Either`/error/command/query primitives) and
pytest-bdd acceptance tests (auth register/login, notes CRUD/search/
authorization) driven end-to-end through FastAPI's `TestClient` against a
scratch SQLite file — safe to run repeatedly.

## Further reading

- [`backend/README.md`](backend/README.md) — Clean Architecture / CQRS-lite
  rationale, layer breakdown, configuration, testing, known limitations.
- [`frontend/README.md`](frontend/README.md) — MVVM rationale, View/ViewModel/
  Model breakdown, session handling, known limitations.
- [`docs/`](docs/docs/index.md) — MkDocs site with endpoint examples, entity
  reference, error envelope, and configuration reference. Serve locally with
  `poetry run mkdocs serve -f docs/mkdocs.yml` (from `backend/`).
