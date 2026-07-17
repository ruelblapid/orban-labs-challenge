# Project B — Plan (URL Shortener)

## 1. Requirements understanding

The task is a small full-stack app: take a long URL, generate a short code
for it, redirect visitors from the short code to the original URL, and count
how many times each short link gets clicked.

Restating the required pieces in my own words:

- **Backend (FastAPI)**
  - An endpoint to shorten a URL.
  - A public redirect endpoint that resolves `short_code -> long_url`.
  - A stats endpoint that reports the click count for a given code.
  - Creating a short URL requires an API key; *following* a short link does
    not — anyone can click a shortened link without credentials, but only a
    holder of the key can mint new ones. That asymmetry is deliberate: a URL
    shortener is a public redirect service by nature, but I don't want
    anonymous callers filling the database with junk rows.
  - Data has to survive a restart, so it's persisted to SQLite rather than
    kept in memory.

- **Frontend (Next.js)**
  - A form: paste a long URL, get a short one back, with a copy button.
  - A dashboard listing created URLs with their click counts.
  - Loading and error states have to be real, not decorative — the grading
    rubric explicitly calls this out, not visual polish.

- **Tests**
  - A handful of *meaningful* backend tests — not just "does it return 200,"
    but tests that actually exercise the edge cases the spec names.

- **Docs**
  - API docs (FastAPI's auto-generated OpenAPI/Swagger at `/docs` satisfies
    this) and a setup guide someone unfamiliar with the repo could follow
    from a clean clone.

- **AI usage**
  - I'm required to use AI coding tools, keep the full session transcript in
    `/prompts/`, and state which model(s) I used and why. This isn't a
    formality — it's graded, so the log has to be honest about what the AI
    got right, what I had to correct, and why.

### Edge cases named in the spec, and how I'm reading them

- **Duplicate URLs.** If someone shortens a URL that's already in the table,
  they should get back the *same* short code, not a second one. Otherwise
  the table fills with redundant rows and the same destination ends up with
  its click count split across multiple codes, which quietly breaks the
  stats feature.
- **Invalid URLs.** Malformed input (no scheme, garbage string, wrong type)
  needs to be rejected before it ever reaches storage, with a clear 400 and
  a message the frontend can show directly.
- **Missing short codes.** A code that was never created (typo, made up,
  never existed) is a 404 — nothing to redirect to.
- **Expired short codes.** A code that *did* exist but has passed its
  expiry is a different situation from "never existed" — I'm treating it as
  410 Gone, not 404, so the frontend/caller can tell "this used to work" from
  "this never worked."

## 2. Approach chosen, alternatives considered

### Short code generation
**Chosen:** random 7-character base62 string (`[A-Za-z0-9]`), generated with
Python's `secrets.choice` (cryptographically strong, not `random`), with a
retry on the near-impossible case of a unique-constraint collision.

**Why:** the alternative that first comes to mind — base62-encoding the
row's auto-increment ID — is simpler to implement but leaks information: the
codes become sequential and enumerable, so anyone can walk `/1`, `/2`, `/3`,
… and scrape every URL ever shortened, including ones the owner considered
private-by-obscurity. Random codes avoid that entirely, need no counter
coordination, and at 62^7 (~3.5 trillion combinations) collisions are rare
enough that a retry loop is sufficient rather than needing a pre-allocated
pool.

**Rejected alternatives:**
- Base62 of the row ID — enumerable, leaks volume of URLs stored.
- Hashing the long URL — couples the code to the URL content, which gets
  awkward the moment you want the same URL to expire and be re-shortened
  under a new code, or want two different expiry windows for the same URL.

### Duplicate URL handling
**Chosen:** normalize the incoming URL (strip a trailing slash on path-less
URLs, lowercase the scheme and host) before checking for an existing row. If
a match exists, return its short code with `200 OK`. If it's genuinely new,
create a row and return `201 Created`.

**Why:** this makes the create endpoint idempotent for the common case (the
same link pasted twice) and the status code difference (`200` vs `201`)
documents the behavior in the API itself — a caller doesn't have to read
prose to know whether they got a new or existing code.

**Rejected alternatives:**
- Always minting a new code per request — technically simpler, but the spec
  explicitly names duplicate handling as an edge case to address, and it
  bloats the table with redundant rows pointing at the same destination.
- Rejecting duplicates outright with `409 Conflict` — this is hostile UX for
  a shortener; a user pasting a link they already shortened last week isn't
  making an error, they just want the code back.

### Redirect status code
**Chosen:** `307 Temporary Redirect`.

**Why:** this is the one decision in the whole project I'd flag as the
subtle correctness point. `301` (and `308`) are cached aggressively by
browsers — once a client's browser has seen a `301` for a given short code,
it will resolve future visits *without ever hitting the server again*. That
silently breaks the click-tracking requirement: the server would undercount
every repeat visit from the same browser. `307` is not cached long-term by
default, preserves the HTTP method, and keeps every visit hitting the
server so the click counter is accurate.

**Rejected alternatives:**
- `301 Moved Permanently` — semantically tempting ("this code always points
  here") but breaks analytics via caching, which is the whole point of the
  stats endpoint.
- `302 Found` — would technically work, but `307` is the modern, precise
  choice that also guarantees method preservation.

### Click counting
**Chosen:** a single SQL statement,
`UPDATE urls SET clicks = clicks + 1 WHERE short_code = ?`, executed on
every redirect, with the row then read back for the destination URL.

**Why:** SQLite executes that statement atomically. A read-then-write
approach (`SELECT clicks`, add one in Python, `UPDATE` with the new value)
has a race window between the read and the write — under concurrent
requests to the same code, updates can be lost. Letting the database do the
increment removes that window entirely.

**Rejected alternatives:**
- Read-then-write in application code — simpler to read, but loses updates
  under concurrency.
- A separate `click_events` table (one row per click, with timestamp) — this
  is the real scaling path if we ever wanted per-day click graphs or referrer
  tracking, but it's overkill for "a few counts" as the spec asks for. Worth
  noting as the natural next step, not worth building now.

### Data model
**Chosen:** a single `urls` table:

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

`expires_at` is nullable — most links never expire. The create endpoint will
accept an optional `expires_in_days`, and the redirect/stats endpoints check
it to distinguish "never existed" (404) from "existed, now expired" (410).

**Why one table:** the whole feature set (create, redirect, stats) reads and
writes from a single entity — a shortened URL and its click count. Splitting
into multiple tables before there's a reason to (e.g. per-click event rows)
would be premature normalization for a project this size.

### Authentication
**Chosen:** an `X-API-Key` header, checked by a FastAPI dependency on
`POST /api/shorten` and `GET /api/stats/{code}`. The expected key is read
from the `API_KEY` environment variable, with a `.env.example` committed and
the real `.env` gitignored. Comparison uses `secrets.compare_digest` rather
than `==`, to avoid a timing side-channel on the key check.

**Why:** the spec asks for "simple authentication via API key" for creation,
with redirects staying public. I decided stats should require the key too —
since it's a byproduct of ownership (only the creator has reason to check a
given code's click count) — and documented that decision rather than leaving
it ambiguous.

**Rejected alternatives:**
- Requiring auth on the redirect — the spec explicitly says redirects must
  stay public; this would break the feature's whole purpose (anyone should
  be able to click a shortened link).
- Passing the key as a query parameter — leaks into browser history, server
  logs, and Referer headers; header is the right transport.

### URL validation
**Chosen:** Pydantic's `HttpUrl` type for scheme/structure validation, plus
two extra checks: rejecting URLs that point back at the shortener's own
host (which would create a redirect loop), and a max length cap (2048
characters, the de facto browser/URL-bar limit).

**Why:** "invalid URLs" is a named edge case, so structural validation alone
isn't enough — I also want to guard against someone shortening a link to the
shortener itself, which is a real (if minor) adversarial case worth showing
I considered.

**Rejected alternatives:**
- Hand-rolled regex validation — more fragile than a maintained URL parser,
  easy to miss edge cases Pydantic already handles.
- Full reachability/DNS checks (actually fetching the URL to confirm it
  resolves) — too slow for a synchronous create request, and out of scope;
  "invalid" here means malformed, not unreachable.

### Error response shape
**Chosen:** FastAPI's default `{"detail": "..."}` shape everywhere, with
status codes used precisely: `400` invalid URL, `401` missing/wrong API key,
`404` unknown short code, `410` expired short code, `422` malformed request
body (FastAPI's default for schema validation failures).

**Why:** consistency over novelty — the frontend can render `error.detail`
directly in every failure path without a switch statement per error shape.

### Stack details
Backend: FastAPI, Python's standard-library `sqlite3`, `uvicorn` as the dev
server. Layout: `app/main.py`, `app/db.py`, `app/auth.py`, `app/routes/`,
`app/schemas.py`.

Frontend: Next.js App Router with TypeScript, plain `fetch` wrappers rather
than a data-fetching library (the app is small enough not to need one). The
create request is proxied through a Next.js route handler running
server-side, so the API key is attached on the server and never shipped to
the browser — a small decision, but one that reads as security awareness
rather than an oversight.

## 3. Test strategy

"Meaningful tests" here means tests that exercise the edge cases the spec
explicitly names, plus the auth boundary — not a smoke test that just checks
a 200 comes back. Planned coverage:

- **Happy path round trip:** shorten a URL, follow the redirect, confirm it
  lands on the original URL, then check the stats endpoint reflects the
  click.
- **Duplicate URL:** shortening the same URL twice returns the same short
  code the second time, with `200` instead of `201`.
- **Invalid URL:** a malformed URL is rejected with `400` before touching
  the database.
- **Missing API key:** `POST /api/shorten` without `X-API-Key` is rejected
  with `401`, and the row is never created.
- **Unknown short code:** requesting a code that was never created returns
  `404`.
- **Expired short code:** a code past its `expires_at` returns `410`, not
  `404` — distinguishing "gone" from "never existed."
- **Click count actually increments:** hitting the redirect endpoint
  multiple times and confirming the stats count goes up by exactly that many
  — this is the test that would actually catch a read-then-write race
  regression if one were introduced later.

Tests will run against a temporary SQLite file (or in-memory DB) via a
pytest fixture, so the suite never touches real data and can run repeatedly
without cleanup.
