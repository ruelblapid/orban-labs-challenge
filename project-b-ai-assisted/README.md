# Project B — AI-Assisted URL Shortener

A URL shortener: paste a long URL, get a short code back, click it to get
redirected, and see click counts on a dashboard. Backend is FastAPI +
SQLite; frontend is Next.js. Built AI-assisted (see `docs/ai-usage-log.md`
and `prompts/`) with a plan-first workflow (see `docs/plan.md` and
`docs/architecture.md`).

## Layout

```
docs/       plan.md, architecture.md, ai-usage-log.md
prompts/    exported AI session transcripts
backend/    FastAPI app (README.md has API details)
frontend/   Next.js app (README.md has frontend details)
tests/      pytest suite for the backend
```

## Run it from a fresh clone

Two terminals — backend first, frontend second. Requires Python 3.11+ and
Node 18+.

### 1. Backend

```bash
cd project-b-ai-assisted/backend
python -m venv .venv
.venv\Scripts\activate          # Windows; `source .venv/bin/activate` on macOS/Linux
pip install -r requirements.txt
cp .env.example .env
```

Open `.env` and set `API_KEY` to a real value, e.g.:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Then start the server:

```bash
uvicorn app.main:app --reload
```

Backend is now on `http://localhost:8000`. Interactive API docs at
`http://localhost:8000/docs`.

### 2. Frontend

In a second terminal:

```bash
cd project-b-ai-assisted/frontend
npm install
cp .env.example .env.local
```

Open `.env.local` and set `BACKEND_API_KEY` to the **same** value used for
the backend's `API_KEY`. Leave `BACKEND_URL` as-is if the backend is running
on the default port.

```bash
npm run dev
```

Frontend is now on `http://localhost:3000` — `/` is the shorten form,
`/dashboard` lists created URLs with click counts.

### 3. Run the backend tests

```bash
cd project-b-ai-assisted
backend\.venv\Scripts\python -m pytest tests -q     # Windows
# backend/.venv/bin/python -m pytest tests -q       # macOS/Linux
```

23 tests, run against a temporary SQLite file — safe to run repeatedly, no
cleanup needed.

## Further reading

- [`docs/plan.md`](docs/plan.md) — requirements understanding, chosen
  approach vs. alternatives considered, test strategy.
- [`docs/architecture.md`](docs/architecture.md) — endpoint table, data
  model, request-flow walkthroughs.
- [`docs/ai-usage-log.md`](docs/ai-usage-log.md) — session-by-session log of
  AI usage and model-choice rationale.
- [`backend/README.md`](backend/README.md) — API auth and endpoint summary.
- [`frontend/README.md`](frontend/README.md) — frontend screens and setup.
