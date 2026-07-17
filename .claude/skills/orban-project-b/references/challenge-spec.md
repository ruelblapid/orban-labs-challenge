# Orban Labs Backend Developer Challenge — Project B Spec

Source: https://hiring-platform-production-13e1.up.railway.app/
Deadline: **July 31, 2026** (late submissions not reviewed).

Overall framing from Orban Labs: both projects are intentionally small; they
are testing how you **think, plan, communicate, and work** — not complexity.

## Project B: Build It With AI — URL Shortener

An application that takes long URLs, generates short codes, redirects users,
and tracks how many times each short link has been clicked.

### Backend (FastAPI + Python) — required

- Endpoint to create a short URL from a long URL
- Redirect endpoint that resolves a short code and redirects to the original URL
- Stats endpoint returning the click count for a given short URL
- Simple authentication via API key **for creating URLs** (redirects are public)
- Persist data to SQLite
- Handle edge cases: **duplicate URLs, invalid URLs, expired or missing short codes**

### Frontend (Next.js + React) — required

- Form to paste a long URL and get a short one
- Simple dashboard showing created URLs and their click counts
- Proper loading and error states

### Testing — required

- A few **meaningful** tests for the backend

### Documentation — required

- API documentation (auto-generated OpenAPI/Swagger is acceptable)
- Setup guide

### AI Usage Requirements — MANDATORY

- MUST use AI coding tools for this project
- Export and include the **full conversation transcript** with the AI tool in
  a `/prompts/` folder (e.g. Claude Code session log, copy-pasted session)
- State **which AI model(s) were used and why**

## Planning Documents (required for both projects)

A `/docs/` folder with planning notes showing thinking **before** coding:
understanding of requirements, chosen approach, alternatives considered,
tradeoffs identified. Format free (markdown, diagrams, notes).

## Required repository structure (single public GitHub repo)

```
/project-a-manual/
  /docs/     planning notes, architecture decisions
  /backend/
  /frontend/
  /tests/
/project-b-ai-assisted/
  /docs/     planning notes + AI usage log
  /prompts/  every prompt used, with model name
  /backend/
  /frontend/
  /tests/
/resume.pdf
/README.md   overview of approach to both projects
```

## Commit history requirements

Meaningful, **incremental** commits. No single-commit dumps. Commit messages
must clearly describe what each change does.

## Submission process

1. Repository must be **public**
2. Submit form with: full name, email, **WhatsApp number** (their primary
   contact channel for next-stage invites), GitHub repo URL, optional
   500-char "tell us about yourself"
3. Their system validates the repository immediately on submission
4. Confirmation sent when accepted

## Project A boundary (do not cross)

Project A (Notes API) must be built **entirely without AI tools**. This skill
and any Claude session must never produce Project A code, tests, docs text,
or planning content. If asked, decline and cite this rule — an AI-generated
artifact in Project A would compromise the whole submission's integrity.
