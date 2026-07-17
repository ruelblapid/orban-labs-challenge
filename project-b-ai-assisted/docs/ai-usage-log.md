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

## 2026-07-17 — Session 3: Phase 2 backend tests

**Model:** Claude Sonnet 5, via Claude Code (VS Code extension).

**Asked for:** pytest tests in `/tests/` covering the edge cases named in
`docs/plan.md`'s test strategy section — not smoke tests, the actual
duplicate/invalid/auth/expiry/click-count cases.

**What happened:** the AI read every backend module first (`config`,
`auth`, `db`, `schemas`, `urls`, all three routes) rather than guessing at
behavior, then wrote a `conftest.py` fixture that patches the shared
`settings` singleton (API key + a per-test temp SQLite path) and yields a
`TestClient` inside its context manager so the app's startup event
(`init_db`) actually runs against the temp file. Four test modules:
`test_shorten.py`, `test_redirect.py`, `test_stats.py`, and
`test_integration.py` for the round-trip and click-count-under-repeat-hits
cases the plan called "the test that would actually catch a
read-then-write race regression." 19 tests, all passing.

**Accepted:**

- Patching attributes directly on the `settings` object instead of
  environment variables — `Settings()` already ran at import time, so an
  env-var approach wouldn't reach the already-imported reference every
  route module holds. Verified this actually isolates tests by running the
  suite twice and confirming no leftover `.db` file state between runs.
- `follow_redirects=False` on the TestClient, checking `307` status and the
  `Location` header directly instead of letting the client chase the
  redirect — letting it follow would have made a **real outbound network
  request** to `example.com` for every redirect test, since TestClient only
  intercepts the app's own ASGI routes, not arbitrary external hosts. Caught
  this before it became a flaky/slow-test problem rather than after.
- Seeding the expired-code test directly through `app.db.insert_url()`
  instead of the public API — `expires_in_days` only accepts a positive
  (future) value by design, so there's no way to create an already-expired
  row through `POST /api/shorten` itself.

**Rejected/deferred:** Left the two pre-existing `DeprecationWarning`s
(`on_event` startup hook, starlette's httpx test-client shim) alone — both
are Phase 1 code, out of scope for a test-writing session, and don't affect
correctness.

**Next:** Phase 3 — frontend (Next.js shorten form + dashboard).

---

## 2026-07-17 — Session 4: Phase 3 frontend

**Model:** Claude Sonnet 5, via Claude Code (VS Code extension).

**Asked for:** the Next.js frontend — shorten form and dashboard screens,
with real loading/error states, per `docs/architecture.md`'s frontend
structure section.

**What happened:** before writing any frontend code, the AI re-read the
backend routes and `docs/architecture.md` and caught a gap: the
architecture doc already promised the dashboard "fetches the list of
created URLs," but no endpoint existed to produce that list — only
per-code stats. Rather than build the dashboard against an endpoint that
didn't exist (or fake it with browser `localStorage`, which would break if
opened from a different machine — a real risk for a reviewer testing the
submission), the AI added `GET /api/urls` to the backend first (same
API-key dependency as `/api/stats/{code}`, reuses `StatsResponse`), with
its own tests, before touching the frontend. It also added a `short_url`
field to `StatsResponse` for the same reason — the dashboard needs a
clickable link per row, and reconstructing it from a second public env var
on the frontend would have duplicated logic the backend already owns.

Scaffolded the Next.js app via `create-next-app`, then stripped the
template boilerplate (Geist fonts, sample landing page, unused SVGs,
generated `AGENTS.md`/`CLAUDE.md`) rather than building on top of it. Chose
plain CSS over Tailwind — the app is two screens, not enough surface to
justify a build-tool dependency. Built `lib/backend.ts` as the single place
that reads `BACKEND_API_KEY` (guarded by the `server-only` package so a
future accidental client import fails at build time, not silently), used
by two route handlers (`app/api/shorten`, `app/api/urls`) that proxy to the
backend — this is the pattern `technical-decisions.md` specified so the key
never reaches the browser.

**Accepted:**

- The `refreshKey`-counter pattern in `UrlsTable.tsx` (bump a number in the
  refresh button's click handler, effect depends on it and re-fetches) over
  an extracted `useCallback` fetch function called from both the effect and
  the button. `eslint-plugin-react-hooks` v7 (bundled with Next 16's default
  config) has a `set-state-in-effect` rule that flags *any* function called
  from inside a `useEffect` if that function's body contains a `setState`
  call anywhere — including after an `await`, not just before it. An
  async IIFE written directly inside the effect body passes the rule; a
  named function referenced from the effect does not, even with identical
  runtime behavior. Verified this empirically by trying both shapes and
  running `npm run lint`. The counter pattern gave a single fetch
  implementation that satisfies the rule without duplicating the fetch
  logic between mount and refresh.
- Full functional verification against the real running stack rather than
  trusting the build alone: started both servers, drove the create →
  duplicate-dedup → invalid-URL-rejected → redirect → click-increment →
  list-refresh flow end-to-end through the frontend's own proxy routes with
  `curl`, confirmed `npm run lint`, `npx tsc --noEmit`, and `npm run build`
  all pass clean, then re-ran the full pytest suite (24 tests) after the
  backend schema change.

**Corrected/caught during review:**

- First lint pass flagged two `<a href="/...">` internal links (nav bar,
  dashboard empty-state link) — `@next/next/no-html-link-for-pages` wants
  `next/link` for same-app navigation. Fixed both; left the short-URL links
  in the dashboard table as plain `<a target="_blank">` since those point
  at the backend's redirect endpoint, not an internal Next.js route.
- The first version of `UrlsTable`'s effect called `setLoading(true)`
  synchronously as the first line of the function it invoked — flagged by
  the rule described above. Rewrote per the accepted approach rather than
  suppressing the lint rule, since the fix was a genuine simplification
  (one fetch implementation instead of two), not just lint-appeasement.

**Rejected/deferred:** No visual/browser screenshot verification — this
environment has no browser automation tool available, so the frontend was
verified functionally (curl against the live dev server, SSR HTML output
inspected for both routes) and by a clean production build, not by eye.
Flagged this limitation explicitly rather than claiming a visual check that
didn't happen.

**Next:** Phase 4 — documentation (backend README/API docs, root setup
guide, finalize this log's model-choice rationale).

---

## Model-choice rationale

*(To be finalized in Phase 4 once the full session history is in. Current
model in use: Claude Sonnet 5 via Claude Code — chosen for strong multi-step
agentic coding across a multi-file repo, ability to keep repo-wide context
across a long session, and straightforward transcript export for the
`/prompts/` requirement.)*
