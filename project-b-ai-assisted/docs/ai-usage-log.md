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

## Model-choice rationale

*(To be finalized in Phase 4 once the full session history is in. Current
model in use: Claude Sonnet 5 via Claude Code — chosen for strong multi-step
agentic coding across a multi-file repo, ability to keep repo-wide context
across a long session, and straightforward transcript export for the
`/prompts/` requirement.)*
