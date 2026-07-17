# Orban Labs — Backend Developer Technical Challenge

This repository contains both required submissions, each self-contained with
its own docs, backend, frontend, and tests.

## Project A — manual, no AI

`/project-a-manual/` — built entirely by hand, with no AI assistance at any
stage, per the challenge rules. See `project-a-manual/docs/` for its
planning notes once written.

## Project B — AI-assisted URL shortener

`/project-b-ai-assisted/` — a URL shortener (FastAPI + SQLite backend,
Next.js frontend) built with AI assistance under a plan-first workflow.
Start at [`project-b-ai-assisted/README.md`](project-b-ai-assisted/README.md)
for setup instructions; AI usage is logged in
[`project-b-ai-assisted/docs/ai-usage-log.md`](project-b-ai-assisted/docs/ai-usage-log.md)
with the full session transcripts in `project-b-ai-assisted/prompts/`.

## Approach across both

Both projects follow the same discipline even though only one used AI:
planning documents written before code, small incremental commits with
descriptive messages, and tests that exercise real edge cases rather than
happy-path smoke checks. The difference is what each project's commit
history and `docs/ai-usage-log.md` (Project B only) show about *how* that
work got done — by hand throughout for Project A, AI-assisted with explicit
human review and correction for Project B.

## Resume

`/resume.pdf`
