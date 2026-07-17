# Frontend — URL Shortener

Next.js (App Router, TypeScript) frontend for Project B. Two screens:

- `/` — paste a long URL, get a short one back, with a copy button.
- `/dashboard` — table of every created URL with click counts.

The backend's `X-API-Key` never reaches the browser: `app/api/shorten/route.ts`
and `app/api/urls/route.ts` are server-side route handlers that attach the key
(via `lib/backend.ts`) and proxy to the FastAPI backend. Client components only
ever call these same-origin `/api/*` routes.

## Setup

```bash
npm install
cp .env.example .env.local   # then fill in BACKEND_API_KEY to match the backend's API_KEY
npm run dev
```

Requires the backend running (see `../backend`) at the URL set in `BACKEND_URL`
(defaults to `http://localhost:8000`).

Open [http://localhost:3000](http://localhost:3000).
