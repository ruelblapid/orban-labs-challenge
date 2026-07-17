---
name: orban-project-b
description: Build Project B (AI-assisted URL Shortener) of the Orban Labs Backend Developer technical challenge, end to end. Use this skill whenever the user mentions the Orban Labs challenge, Project B, the URL shortener submission, the hiring-platform repo, /project-b-ai-assisted/, or asks to plan, scaffold, implement, test, document, or validate any part of that submission. Also trigger when the user asks "what's left for the Orban submission" or wants a pre-submission check. Enforces the challenge's required repo structure, plan-first workflow, incremental commits, and AI-usage evidence (/prompts/ folder).
---

# Orban Labs — Project B Builder (AI-Assisted URL Shortener)

Deadline: **July 31, 2026**. Late submissions are not reviewed.

Orban Labs states plainly: *"We're not testing whether you can build something
complex. We're testing how you think, plan, communicate, and work."* Every phase
below exists to produce visible evidence of thinking, not just working code.
Never skip a phase to "get to the code faster" — the planning artifacts and
commit history are graded deliverables, equal in weight to the app itself.

Before writing any code, load `references/challenge-spec.md` (the verbatim
requirements) and `references/technical-decisions.md` (pre-made architecture
decisions with rationale, so every session makes the same choices).

## Ground rules that apply to every phase

1. **Work inside `/project-b-ai-assisted/`** with exactly this layout:
   `docs/`, `prompts/`, `backend/`, `frontend/`, `tests/`. Never restructure.
2. **Commit at the end of every phase, and per feature within a phase.**
   One logical change per commit. Conventional-commit style messages that
   describe the *what* and *why*, e.g.
   `feat(backend): add redirect endpoint with 307 to preserve click tracking`.
   Never batch a day's work into one commit — commit history is graded.
3. **Log AI usage as you go.** After each working session, append an entry to
   `docs/ai-usage-log.md`: date, model used (e.g. "Claude Fable 5 via Claude
   Code"), what was asked, what was accepted/rejected and why. Remind the user
   at the end of every session to export the raw session transcript into
   `prompts/` (e.g. `prompts/2026-07-18-claude-code-session-1.md`) — Claude
   cannot export its own transcript; the user must do this manually.
4. **Honest framing.** The AI-usage narrative should show judgment — where AI
   output was corrected, where the user overrode a suggestion — not pretend
   the AI was flawless. Reviewers value this; it matches how the user
   presents himself elsewhere.

## Phase 0 — Planning documents (before any code)

Create `docs/plan.md` containing, in prose:
- **Requirements understanding**: restate the spec in your own words,
  including the edge cases (duplicate URLs, invalid URLs, expired/missing
  codes) and the auth asymmetry (API key to create, public redirects).
- **Approach chosen** and **alternatives considered** with tradeoffs — pull
  these from `references/technical-decisions.md` and adapt; each decision
  must state the rejected alternative and why (e.g. base62-of-row-id vs
  random codes; 307 vs 301 redirects; SQLite schema shape).
- **Test strategy**: what "meaningful tests" means here (edge cases and
  auth, not trivial 200-checks).

Also create `docs/architecture.md` with the endpoint table, data model, and a
simple request-flow description. Commit: `docs: add Project B plan and architecture`.

## Phase 1 — Backend (FastAPI + Python + SQLite)

Follow `references/technical-decisions.md` for all implementation choices.
Build in this order, committing after each step:
1. Project scaffold: FastAPI app, SQLite via `sqlite3` or SQLModel, config
   for `API_KEY` via environment variable, `.env.example`.
2. Data model + migrations/table creation (`urls` table per the reference).
3. `POST /api/shorten` — API-key protected (header `X-API-Key`), validates
   the URL, dedupes (same long URL returns the existing short code),
   optional `expires_at`.
4. `GET /{short_code}` — public redirect, `307`, atomically increments
   click count, `404` JSON for missing, `410` for expired.
5. `GET /api/stats/{short_code}` — click count + metadata (decide and
   document whether stats require the API key; default: yes, it's tied to
   creation ownership).
6. Input validation with Pydantic and meaningful error responses (consistent
   `{"detail": ...}` shape, correct status codes: 400/401/404/409/410).

## Phase 2 — Backend tests

Write pytest tests in `/tests/` covering the *meaningful* cases: happy-path
shorten→redirect→stats round trip, duplicate URL returns same code, invalid
URL rejected with 400, missing API key rejected with 401, unknown code 404,
expired code 410, click count actually increments. Use a temp SQLite file or
in-memory DB fixture. Commit per test module.

## Phase 3 — Frontend (Next.js + React)

1. Shorten form: paste long URL → show short URL with copy button. Loading
   state while submitting, inline error display from API error responses.
2. Dashboard: table of created URLs with click counts and created dates,
   refresh action, empty state, loading skeleton, error state.
3. Keep it minimal and clean — no component library bloat; the grading
   criterion is proper loading/error states, not visual flash.
Commit per screen.

## Phase 4 — Documentation

- `backend/README.md` or `docs/api.md`: point to auto-generated OpenAPI at
  `/docs`, plus a short written summary of the three endpoints and auth.
- Root-level setup guide (in `/project-b-ai-assisted/README.md`): exact
  commands to run backend and frontend from a fresh clone, including env
  vars. Test the guide by following it literally in a clean directory.
- Finalize `docs/ai-usage-log.md` with the model-choice rationale section
  ("which AI model(s) you used and why" is a mandatory requirement).

## Phase 5 — Pre-submission validation

Run `scripts/check_submission.py <repo-root>` to verify the full required
repo structure (both projects, `/resume.pdf`, root `README.md`, non-empty
`prompts/`). Fix anything it flags. Then remind the user of the manual
checklist it prints: repo public, transcript exported, commits pushed
incrementally, form filled with name/email/WhatsApp/repo URL before
**July 31, 2026**.

Note: the validator checks Project A's folders too because the submission is
one repo — but this skill only builds Project B. Project A must be built by
hand with no AI, so never generate any Project A code, tests, or docs
content, even if asked in passing; point the user back to the no-AI rule.
