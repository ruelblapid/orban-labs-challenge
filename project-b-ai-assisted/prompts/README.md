# AI Session Prompts

This folder contains the full AI-assisted development transcripts for Project B
(the URL Shortener), one file per build phase. Each transcript is generated with
`claude-code-log` and records the prompts given to the AI and its responses,
serving as evidence of the thinking, planning, and iteration behind the
submission.

## Files

| File | Phase | Summary |
| --- | --- | --- |
| [phase-0-1-planning-backend-2026-07-18-claude-fable-5.md](phase-0-1-planning-backend-2026-07-18-claude-fable-5.md) | Phase 0–1 | Planning and backend implementation. Covers the initial planning documents (requirements breakdown, architecture, technical decisions) followed by building the backend for the URL shortener. |
| [phase-2-tests-2026-07-19-claude-fable-5.md](phase-2-tests-2026-07-19-claude-fable-5.md) | Phase 2 | Backend test suite. Covers writing automated tests for the backend built in Phase 0–1. |
| [phase-3-frontend-2026-07-20-claude-fable-5.md](phase-3-frontend-2026-07-20-claude-fable-5.md) | Phase 3 | Frontend implementation. Covers building the Next.js frontend that consumes the backend API. |
| [phase-4-docs-validation-2026-07-21-claude-fable-5.md](phase-4-docs-validation-2026-07-21-claude-fable-5.md) | Phase 4 | Documentation and validation. Covers writing final project documentation and running the pre-submission validator to confirm the submission is complete. |

## Reading a transcript

Each file follows the same structure:

- A session header with the date and the model used (`claude-sonnet-5`).
- The user prompt that started the session.
- The AI's thinking, tool use, and responses in chronological order.

Open any file directly to read the full session, or use the table above to
jump to the phase you're interested in.
