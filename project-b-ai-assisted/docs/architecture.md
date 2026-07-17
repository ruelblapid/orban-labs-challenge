# Project B — Architecture

## System overview

A single FastAPI backend backed by one SQLite table, and a Next.js frontend
that talks to it over HTTP. No queues, caches, or external services — the
scope doesn't warrant them.

```
 ┌─────────────┐        fetch (proxied)       ┌──────────────────┐        ┌────────────┐
 │  Next.js UI  │ ───────────────────────────▶ │  FastAPI backend  │ ─────▶ │  SQLite    │
 │ (form, table)│ ◀─────────────────────────── │  (routes/, auth)  │ ◀───── │  urls table│
 └─────────────┘        JSON responses         └──────────────────┘        └────────────┘
        ▲                                               ▲
        │                                               │
   browser click on                              anyone can hit
   a short link ───────────────────────────────▶ GET /{short_code}
                                                  (no auth required)
```

## Endpoints

| Method | Path                        | Auth (`X-API-Key`) | Purpose                                   | Success            | Failure cases |
|--------|-----------------------------|---------------------|--------------------------------------------|---------------------|---------------|
| POST   | `/api/shorten`              | Required            | Create a short code for a long URL         | `201` new / `200` existing (dedup) | `400` invalid URL, `401` missing/bad key, `422` malformed body |
| GET    | `/{short_code}`              | Public               | Resolve a short code and redirect          | `307` redirect      | `404` unknown code, `410` expired code |
| GET    | `/api/stats/{short_code}`   | Required            | Return click count + metadata for a code   | `200` with JSON     | `401` missing/bad key, `404` unknown code |

All error responses use FastAPI's default shape: `{"detail": "<message>"}`.

### `POST /api/shorten`

Request body:

```json
{ "long_url": "https://example.com/some/page", "expires_in_days": 30 }
```

`expires_in_days` is optional; omit for a link that never expires.

Response (`201` or `200`):

```json
{
  "short_code": "aZ3kT9x",
  "short_url": "http://localhost:8000/aZ3kT9x",
  "long_url": "https://example.com/some/page",
  "created_at": "2026-07-17T10:00:00",
  "expires_at": null
}
```

### `GET /{short_code}`

No body. On success, responds with a `307` redirect (`Location` header set
to `long_url`) and atomically increments `clicks` for that row before
responding. On failure, JSON body per the table above — `404` if the code
was never created, `410` if it exists but `expires_at` has passed.

### `GET /api/stats/{short_code}`

Response (`200`):

```json
{
  "short_code": "aZ3kT9x",
  "long_url": "https://example.com/some/page",
  "clicks": 12,
  "created_at": "2026-07-17T10:00:00",
  "expires_at": null
}
```

## Data model

Single table, no joins needed anywhere in the app:

```sql
CREATE TABLE urls (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  short_code  TEXT NOT NULL UNIQUE,
  long_url    TEXT NOT NULL,
  clicks      INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at  TEXT NULL
);
CREATE UNIQUE INDEX idx_urls_long ON urls(long_url);
CREATE INDEX idx_urls_code ON urls(short_code);
```

- `idx_urls_long` is what makes duplicate detection an indexed lookup rather
  than a table scan — the create endpoint queries this before minting a new
  code.
- `idx_urls_code` is what every redirect and stats lookup hits.
- `long_url` is stored normalized (trailing slash stripped on path-less
  URLs, scheme/host lowercased) so that trivially-different variants of the
  same URL dedupe correctly.

## Request flows

### Create (`POST /api/shorten`)

1. FastAPI dependency checks `X-API-Key` header against `API_KEY` env var
   via `secrets.compare_digest`. Missing/mismatched → `401`, request stops
   here.
2. Pydantic validates the body — `long_url` must parse as `HttpUrl`, must
   not point at the shortener's own host, must be ≤2048 chars. Invalid →
   `400`, request stops here. Structurally malformed JSON/missing field →
   `422` (FastAPI's automatic behavior).
3. Normalize `long_url`. Query `urls` by normalized value.
   - **Match found:** return that row's `short_code`, HTTP `200`.
   - **No match:** generate a random 7-char base62 code via
     `secrets.choice`; on the rare unique-constraint collision, retry.
     Insert the row (with `expires_at` computed from `expires_in_days` if
     given). Return `201`.

### Redirect (`GET /{short_code}`)

1. No auth check — public by design.
2. Look up the row by `short_code`.
   - **No row:** `404`.
   - **Row found, `expires_at` in the past:** `410`.
   - **Row found, not expired:** execute
     `UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?` (atomic
     single statement — no read-modify-write race), then respond `307`
     with `Location: <long_url>`.

### Stats (`GET /api/stats/{short_code}`)

1. Same `X-API-Key` check as create. Missing/mismatched → `401`.
2. Look up the row by `short_code`. No row → `404`. Found → return
   `short_code`, `long_url`, `clicks`, `created_at`, `expires_at` as JSON.
   (Expired codes still return stats — the click history doesn't disappear
   just because the link stopped redirecting; only the redirect endpoint
   treats expiry as blocking.)

## Frontend structure

- **Shorten form** (`/`): controlled input for the long URL, optional expiry
  field, submit calls a Next.js route handler (`/api/shorten` on the
  frontend, distinct from the backend's `/api/shorten`) that attaches the
  API key server-side and forwards to the backend. This keeps the key out of
  browser-visible network requests. Renders a loading spinner while the
  request is in flight and the API's `detail` message inline on failure.
- **Dashboard** (`/dashboard`): fetches the list of created URLs (via the
  same server-side-proxied pattern) and renders a table of short code, long
  URL, click count, and created date, with a manual refresh action. Handles
  three explicit states: loading (skeleton rows), empty (no URLs created
  yet), and error (fetch failed).

## Deployment / runtime notes

- Backend runs via `uvicorn app.main:app`, config entirely from environment
  variables (`API_KEY`, optionally `DATABASE_PATH`), `.env.example`
  committed and `.env` gitignored.
- SQLite file lives under `backend/` (path configurable), so no external
  database service is needed to run the project locally.
- Frontend runs via the standard Next.js dev/build commands, with the
  backend's base URL and the API key supplied as server-only environment
  variables (never `NEXT_PUBLIC_*`) so they never reach client-side bundles.
