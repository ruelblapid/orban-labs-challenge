# Notes App — Frontend

A Next.js (App Router) client for **Project A** of the Orban Labs technical challenge: register/login, then create/search/paginate/edit/delete notes against the [backend API](../backend/README.md). Functionally it's a small CRUD screen. Structurally it's organized around **MVVM**, for the same reason the backend uses Clean Architecture + CQRS-lite: to demonstrate how I'd structure a frontend so it stays maintainable and testable as it grows, not because this specific screen count requires it.

## Why MVVM for a two-screen app?

A login form and a notes list don't *need* a dedicated ViewModel layer — the state and the fetch calls could live directly inside the components. The separation here is a deliberate choice:

- **View** (`app/**/page.tsx`, `src/Interfaces/Components/**`) — React components concerned only with markup, layout, and local UI state (an open/closed modal, an input's draft value). They read what they need from a ViewModel hook and call the callbacks it exposes; they don't call `fetch`, touch Zustand stores directly, or contain business rules like "redirect on 401."
- **ViewModel** (`src/Interfaces/ViewModels/{Auth,Notes}/index.ts`) — plain React hooks (`useLoginViewModel`, `useRegisterViewModel`, `useNotesViewModel`) that sit between the View and the Model. They translate Model state/actions into what a specific screen needs: pagination math (`totalPages`), debounced search, redirecting after login, and logging the user out on a `401`. This is where screen-specific orchestration logic lives, kept out of both the View (so it's not tangled with JSX) and the Model (so the store stays reusable across screens).
- **Model** (`src/Domains/{Auth,Notes}/Types.ts` for entities/DTOs, `src/Interfaces/Store/{Auth,Notes}/index.ts` for state + data access) — Zustand stores own the actual state and talk to the API through the shared `apiFetch` client (`src/Interfaces/Store/Types/index.ts`). They know nothing about routing, forms, or any particular screen. Zustand's selector hooks (`useAuthStore((s) => s.email)`) act as the binding mechanism — components re-render when the slice of state they subscribed to changes, which is the reactive-binding piece classic MVVM gets from observable properties.

**Trade-off, stated plainly**: for two screens, this is more files and one more indirection hop (View → ViewModel → Store → API) than a "component calls `fetch` in a `useEffect`" approach would need. What it buys, and what's being demonstrated, is that the Model (state + API calls) and the ViewModel (screen orchestration) can each be unit-tested without rendering a component, and that Views can be re-skinned or swapped (e.g. a different component library) without touching business logic. A couple of components — `Header`, `NotesLayout` — read `useAuthStore` directly instead of going through a ViewModel; that's a deliberate exception for trivial, single-purpose reads (display an email, trigger a logout), not an inconsistency to "fix."

## Architecture

```text
View (Component)
  → ViewModel (hook: useXViewModel)      screen orchestration — routing, pagination, debouncing
    → Model (Zustand store: useXStore)   state + apiFetch() calls
      → Backend API (../backend)
  ← re-render via Zustand selector subscription
```

- **`src/Domains/`** — plain TypeScript types/DTOs shared by store and components (`Note`, `NoteCreatePayload`, `LoginResult`, `RegisteredUser`, …). No framework or fetch logic.
- **`src/Interfaces/Store/`** — the Model. `Store/Types/index.ts` holds the generic `apiFetch` client (attaches the bearer token, normalizes the backend's `{success, data, error}` envelope into an `ApiResult<T>` discriminated union). `Store/Auth` persists the session (access token, expiry) to `sessionStorage` via Zustand's `persist` middleware; `Store/Notes` is in-memory only and exposes CRUD/search/list actions.
- **`src/Interfaces/ViewModels/`** — one hook per screen concern (`Auth` → login/register, `Notes` → the notes list). Own the derived/UI state a screen needs and call into the Model; return a flat object of values + callbacks for the View to consume.
- **`src/Interfaces/Components/`** — the Views, grouped by feature (`Auth/`, `Notes/`, `Layout/`, `Shared/`). `app/**/page.tsx` files are thin route entries that just render these.
- **`src/Interfaces/Hooks/`** — cross-cutting hooks that don't belong to one screen's ViewModel, e.g. `useSessionGuard` (redirects to `/login` when the session is missing/expired; used by `app/notes/layout.tsx`).
- **`components/ui/`** — shadcn/ui primitives (Button, Input, Select, Label, Textarea). Presentation-only, no MVVM role — the design-system layer underneath the Views.

## Project Structure

```text
frontend/
├── app/
│   ├── page.tsx                # redirects to /notes or /login based on session
│   ├── layout.tsx               # root layout
│   ├── login/page.tsx           # renders LoginForm
│   ├── register/page.tsx        # renders RegisterForm
│   └── notes/
│       ├── layout.tsx            # useSessionGuard + Header shell
│       └── page.tsx              # renders NotesPageClient
├── src/
│   ├── Domains/
│   │   ├── Auth/Types.ts         # RegisterPayload, LoginResult, ...
│   │   └── Notes/Types.ts        # Note, NoteCreatePayload, NoteUpdatePayload
│   └── Interfaces/
│       ├── Store/                # Model: Zustand stores + apiFetch client
│       │   ├── Auth/index.ts
│       │   ├── Notes/index.ts
│       │   └── Types/index.ts
│       ├── ViewModels/           # ViewModel: per-screen orchestration hooks
│       │   ├── Auth/index.ts
│       │   └── Notes/index.ts
│       ├── Hooks/
│       │   └── useSessionGuard.ts
│       └── Components/           # View: feature-grouped React components
│           ├── Auth/              # LoginForm, RegisterForm
│           ├── Notes/              # NotesPageClient, NoteCard, NoteFormModal, SearchFilterBar, DeleteConfirmDialog
│           ├── Layout/              # Header
│           └── Shared/               # ErrorBanner, Modal, Pagination
├── components/ui/                # shadcn/ui primitives
└── lib/utils.ts                   # cn() class-merge helper
```

## Tech Stack

| Concern | Choice |
|---------|--------|
| Framework | Next.js 16 (App Router), React 19 |
| Architecture | MVVM (View / ViewModel / Model) on top of Next's App Router |
| State / binding | Zustand (stores double as the Model; selector hooks provide the binding) |
| Session persistence | Zustand `persist` middleware → `sessionStorage` (clears on tab close) |
| UI components | shadcn/ui (Radix primitives) + Tailwind CSS v4 |
| Icons | lucide-react |
| Type safety | TypeScript, `strict: true` |

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure the API URL

Copy the example env file and adjust if the backend isn't on the default port:

```bash
cp .env.local.example .env.local
```

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 3. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The [backend](../backend/README.md) must be running for auth/notes to work — the root route (`/`) redirects to `/login` or `/notes` depending on session state.

### Other scripts

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # eslint
```

## Session Handling

- On login, the backend's JWT (`access_token`, `expires_in`) is stored in `useAuthStore` and persisted to `sessionStorage` (not `localStorage`, so it doesn't outlive the browser tab).
- `useSessionGuard` (used by `app/notes/layout.tsx`) checks validity on mount and schedules a timeout to auto-logout exactly when the token expires, redirecting to `/login?reason=expired`.
- `apiFetch` attaches `Authorization: Bearer <token>` to every request; ViewModels additionally treat any `401` response as "session invalid" and force a logout + redirect, so an expired/revoked token is caught even between the guard's scheduled checks.

## Known Limitations / Trade-offs

- **Frontend has automated test coverage** — Vitest + React Testing Library (`npm test`, `npm run test:watch`, `npm run test:ui`) cover both Stores (`useAuthStore`, `useNotesStore`, `apiFetch`), both ViewModels (`useLoginViewModel`, `useRegisterViewModel`, `useNotesViewModel`), `useSessionGuard`, every component under `Interfaces/Components`, and the App Router entry points (`app/page.tsx`, `app/login/page.tsx`, `app/notes/layout.tsx`). Deliberately out of scope: the generated shadcn primitives in `components/ui/`, and the one-line page wrappers (`app/register/page.tsx`, `app/notes/page.tsx`, root `app/layout.tsx`) that have no branching logic of their own to test beyond the components/pages already covered.
- **No dedicated API-client/service layer per domain** — `apiFetch` is a single generic HTTP helper called directly from each store, rather than one repository-style module per resource. Fine at two resources (auth, notes); would be worth splitting if more domains are added.
- **A couple of components read the store directly** (`Header`, `NotesLayout` via `useSessionGuard`) instead of going through a ViewModel, since their entire job is a single store read/action. Documented above as a deliberate exception, not drift.
- **No optimistic updates** — create/update/delete all wait for the API response, then trigger a full `reload()` of the current page instead of patching local state.
