# Project B — Technical Decisions (with rationale and rejected alternatives)

These decisions are fixed so every session builds consistently. Each one is
written as "decision → why → alternative rejected" because the planning docs
must show tradeoff thinking; copy/adapt the rationale into `docs/plan.md`
in the user's own voice rather than pasting verbatim.

## Short code generation

**Decision:** Random 7-character base62 code (`[A-Za-z0-9]`), generated with
`secrets.choice`, retried on the (astronomically rare) unique-constraint
collision.
**Why:** Codes are non-enumerable (base62-of-row-id lets anyone walk
`/1`, `/2`, `/3`… and scrape every stored URL — a real privacy issue), no
counter coordination needed, 62^7 ≈ 3.5 trillion combinations.
**Rejected:** base62 of the auto-increment ID (enumerable, leaks volume);
hash of the URL (couples code to URL, awkward with expiry and collisions).

## Duplicate URL handling

**Decision:** Normalize the URL (strip trailing slash on path-less URLs,
lowercase scheme/host), then on create, return the **existing** short code
with `200` instead of minting a new row (`201` for genuinely new).
**Why:** Matches the spec's "handle duplicate URLs" edge case with idempotent
behavior; the status-code distinction documents itself in the API.
**Rejected:** Always creating new codes (spec calls duplicates an edge case
to handle, and it bloats the table); rejecting duplicates with 409 (hostile
UX for a shortener).

## Redirect semantics

**Decision:** `307 Temporary Redirect`.
**Why:** `301`/`308` are cached aggressively by browsers, so repeat visits
would never hit the server and click counts would silently undercount —
directly defeating the click-tracking requirement. `307` also preserves
method. This is exactly the kind of subtle correctness point reviewers look
for; call it out explicitly in `docs/plan.md`.
**Rejected:** `301` (cache breaks analytics), `302` (acceptable but `307` is
the modern precise choice).

## Click counting

**Decision:** Single SQL statement
`UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?` executed on
redirect (atomic in SQLite), then read the row for the redirect target in
the same transaction.
**Why:** Read-then-write in Python loses updates under concurrency.
**Rejected:** SELECT then UPDATE with the value computed in Python (race
condition); separate clicks-events table (overkill for "a few counts", though
note it in tradeoffs as the scaling path).

## Data model (SQLite)

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

`expires_at` nullable: creation endpoint accepts optional `expires_in_days`;
expired codes return `410 Gone` (distinct from `404 Not Found` for missing —
another documented edge-case distinction the spec asks for).

## Auth

**Decision:** `X-API-Key` header checked by a FastAPI dependency on
`POST /api/shorten` and `GET /api/stats/{code}`; key loaded from the
`API_KEY` environment variable (`.env.example` committed, `.env` gitignored).
Compare with `secrets.compare_digest`.
**Why:** Spec says "simple authentication via API key (passed in a header)";
redirects stay public per spec. Constant-time compare is a one-line habit
worth showing.
**Rejected:** Auth on the redirect (spec forbids); key in query string
(leaks into logs/history).

## URL validation

**Decision:** Pydantic `HttpUrl` for scheme/structure, plus reject URLs
pointing at the service's own host (self-referential redirect loops) and
enforce a max length (2048).
**Why:** "Invalid URLs" is a named edge case; loop prevention shows
adversarial thinking.
**Rejected:** Regex-only validation (fragile), full DNS/reachability checks
(slow, out of scope — note as a considered-and-rejected tradeoff).

## Error response shape

**Decision:** FastAPI default `{"detail": "..."}` everywhere, with correct
codes: `400` invalid URL, `401` missing/wrong key, `404` unknown code,
`410` expired, `422` malformed body (FastAPI default), `409` unused.
**Why:** Consistency beats novelty; the frontend can render `detail` directly.

## Backend stack details

FastAPI + `sqlite3` stdlib (or SQLModel if the user prefers — decide once,
note in plan). `uvicorn` dev server. Layout:
`backend/app/main.py`, `app/db.py`, `app/auth.py`, `app/routes/`,
`app/schemas.py`. Tests live in the repo-level `/tests/` folder per the
required structure (not `backend/tests/`) — use `pytest` with
`httpx.AsyncClient`/`TestClient` and a tmp-path SQLite fixture.

## Frontend stack details

Next.js App Router, TypeScript, plain fetch wrappers in `lib/api.ts`, the
API key supplied via `NEXT_PUBLIC_`-less server route proxy **or** an env
var — simplest defensible choice: a Next.js route handler proxies
`POST /api/shorten` server-side so the API key never ships to the browser.
Note this in the plan; it's a small decision that reads as security
awareness. Tailwind optional; keep dependencies minimal. Required states:
loading (disabled submit + spinner), error (render API `detail`), empty
dashboard state, copy-to-clipboard confirmation.

## Model-choice rationale (for docs/ai-usage-log.md)

The mandatory "which model(s) and why" statement should name the actual
models used (e.g. Claude Fable 5 in Claude Code) and give a working-style
reason: strong multi-step agentic coding, repo-wide context, transcript
export for the `/prompts/` requirement. Keep it factual, not promotional.
