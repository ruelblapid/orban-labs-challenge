# AI Usage Log — Project B

Running log of AI-assisted work sessions. Model-choice rationale lives at the
bottom (finalized in Phase 4, per the challenge's mandatory requirement).

## 2026-07-17 — Session 1: Phase 0 planning

**Model:** Claude Sonnet 5, via Claude Code (VS Code extension).

**Asked for:** Phase 0 planning documents only (`docs/plan.md`,
`docs/architecture.md`) — explicitly no application code yet, per the
challenge's plan-first requirement.

**What happened:** Used the project's `orban-project-b` skill, which loads
pre-agreed technical decisions (short-code generation, dedup strategy, 307
redirects, click-counting concurrency, auth placement, error shapes) with
rationale and rejected alternatives already reasoned through. The AI adapted
that reference material into prose for `plan.md` and built the endpoint
table / data model / request-flow sections of `architecture.md`.

**Accepted:** All of it, as a starting point — the technical decisions
(random base62 codes over sequential IDs, 307 over 301, atomic SQL
increment over read-then-write, stats requiring the API key) were reasoned
through with explicit tradeoffs before this session, not generated fresh by
the AI in the moment. Nothing was blindly accepted without the "why" being
checked against the spec first.

**Rejected/deferred:** Nothing yet — no code has been written. Expect this
section to get more interesting once Phase 1 implementation starts and
generated code needs actual review.

**Next:** Phase 1 — backend scaffold (FastAPI app, SQLite table, `.env.example`).

---

## 2026-07-17 — Session 2: Phase 1 backend implementation

**Model:** Claude Sonnet 5, via Claude Code (VS Code extension).

**Asked for:** the full FastAPI backend — scaffold, data model, all three
endpoints (`POST /api/shorten`, `GET /{short_code}`, `GET /api/stats/{code}`)
— built and committed incrementally, one logical step per commit.

**What happened:** the AI implemented each layer (config, db access,
service logic, routes) following `technical-decisions.md`, then manually
smoke-tested every endpoint and edge case with a locally running `uvicorn`
server and `curl` before each commit — missing/wrong API key, valid create,
true duplicate dedup, invalid URL, self-referential URL, oversized URL,
malformed body, unknown code, expired code, and click-count increments
across repeated redirects.

**Accepted:**

- The overall module split (`config`/`db`/`auth`/`schemas`/`urls`/`routes`)
  and the atomic `UPDATE ... RETURNING` for click increments — clean and
  matches the plan's concurrency rationale.
- Route registration order in `main.py` (the catch-all `GET /{short_code}`
  included last, after `/health` and the `/api/*` routers) — verified by
  hand that `/health` still resolves correctly instead of being swallowed
  by the short-code redirect route.

**Corrected/caught during review:**

- The first draft of `ShortenRequest.long_url` used Pydantic's `HttpUrl`
  type directly on the field. That would route a malformed URL through
  FastAPI's automatic schema validation and come back as a generic `422`,
  not the `400` the spec's "invalid URL" edge case and the decisions doc
  call for. Fixed by keeping `long_url` a plain `str` in the schema and
  doing structural URL validation explicitly in `app/urls.py`
  (`validate_long_url`), so `400` is reserved for a bad URL value and `422`
  stays FastAPI's default for a genuinely malformed request body (missing
  field, wrong type). This is the one place in Phase 1 where the natural
  Pydantic-first approach didn't match what the spec actually asked for.
- Ran a manual "duplicate" test with two URLs that differed only by a
  trailing slash on a non-root path (`/some/page` vs `/some/page/`) and
  initially misread the two different short codes as a dedup bug. On
  review, that's correct per the normalization rule (trailing slash is
  only stripped when the path is empty/root) — re-tested with a true exact
  duplicate and confirmed dedup returns the same code with `200`.

**Next:** Phase 2 — backend tests (pytest, covering the same edge cases
just smoke-tested manually).

---

## Model-choice rationale

*(To be finalized in Phase 4 once the full session history is in. Current
model in use: Claude Sonnet 5 via Claude Code — chosen for strong multi-step
agentic coding across a multi-file repo, ability to keep repo-wide context
across a long session, and straightforward transcript export for the
`/prompts/` requirement.)*
