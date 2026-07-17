# Notes API — Backend

A FastAPI backend for **Project A** of the Orban Labs technical challenge: an authenticated Notes CRUD + search service. Functionally the domain is deliberately small (register/login, create/read/update/delete/search/list a note). Structurally it's built the way a production, multi-team backend would be, to demonstrate backend system design rather than just "make the endpoints work."

## Why Clean Architecture + DDD + CQRS-lite for a simple CRUD app?

Notes CRUD doesn't *need* this much structure — a handful of FastAPI routes writing straight to a database would satisfy the requirements. The extra layering here is a deliberate choice to showcase how I design backend systems when the domain is expected to grow, not a claim that this specific app requires it. Concretely:

- **Clean Architecture** (`domain` → `application` → `infrastructure`/`interface`) keeps business rules independent of FastAPI, SQLAlchemy, and JWT libraries. Any of those could be swapped without touching a use case.
- **DDD-flavored boundaries**: entities (`Note`, `User`) and repository *interfaces* live in `domain/`; only `infrastructure/` knows about SQLAlchemy. Application code depends on `INoteRepository`/`IUserRepository`, never on a concrete ORM class.
- **CQRS-lite**: reads and writes are modeled as distinct objects (`Command`/`Query`) with distinct handlers, dispatched through separate in-memory buses. This is *not* full CQRS — there's a single database and a single repository per aggregate, no separate read model, no event sourcing. The point of doing it "lite" here is to show the seam where a real read-model split (e.g. a reporting DB, denormalized projections) would slot in later, without paying for that complexity today.

**Trade-off, stated plainly**: for an app this size, this adds indirection (a command object, a handler, a bus dispatch, a DI registration per operation) that a thinner CRUD layer wouldn't need. That overhead is the point being demonstrated — the same shape scales to a service with many more use cases and several engineers touching it concurrently, where the boundaries prevent business logic from leaking into routers and repositories from leaking into use cases.

## Architecture

```text
HTTP request
  → interface/api/routers/*        (FastAPI router: parses request → Command/Query)
    → infrastructure/bus/*         (CommandBus / QueryBus: routes to the registered handler)
      → application/commands|queries/*  (use case: business rules, returns Either[Error, Result])
        → domain/*                (entities + repository interfaces — no framework deps)
        → infrastructure/repositories/*  (SQLAlchemy implementation of the repository interface)
  ← interface/api/response_mapper.py (Either → JSONResponse, consistent success/error envelope)
```

- **`domain/`** — framework-free entities (`Note`, `User`) and repository interfaces (`INoteRepository`, `IUserRepository`, `ITokenService`). Defines *what* the system does, not how.
- **`application/`** — one `Command`/`Query` + one `*Handler` per use case (e.g. `CreateNoteCommand` / `CreateNoteCommandHandler`). Handlers depend only on domain interfaces and return an `Either[BaseError, Result]` — no exceptions for expected failure paths (validation, not-found, etc.).
- **`infrastructure/`** — the parts that touch the outside world: SQLAlchemy models/repositories, the JWT token service, the pwdlib password hasher, environment-based `Settings`, and the two in-memory buses.
- **`interface/api/`** — FastAPI routers, request/response Pydantic schemas, the `response_mapper` that turns an `Either` into a JSON response, and `main.py` wiring it all into the app.
- **`shared/`** — cross-cutting primitives used by every use case: the `Command`/`Query` marker types, the `Either` result monad, and the `BaseError` hierarchy (`CommandError`, `QueryError`, `AuthenticateError`, `TokenExpiredError`, …).
- **`application/providers/container.py`** — a `dependency-injector` `DeclarativeContainer` that wires repositories → handlers → buses → FastAPI routes (via `container.wire(...)` and `Depends(Provide[...])`). This is the composition root; nothing outside it knows how objects are constructed.

**Either / Result pattern**: instead of throwing exceptions for expected failures (bad input, not found, duplicate email), handlers return `Either.left(SomeError(...))` or `Either.right(SomeResult(...))`. `response_mapper.to_json_response` folds that into a JSON response with a consistent envelope (`{"success": bool, "data" | "error": ..., "timestamp": ...}`) — see [Error Responses](../docs/docs/errors.md). Unexpected exceptions are still caught by FastAPI's global exception handlers in `main.py` and mapped to the same envelope.

## Project Structure

```text
backend/
├── run.py                     # uvicorn entrypoint
├── pyproject.toml             # Poetry deps, pytest/black/isort/mypy/pylint config
├── src/
│   ├── domain/                # entities + repository interfaces (auth, notes)
│   ├── application/
│   │   ├── commands/          # write use cases (auth: register/login, notes: create/update/delete)
│   │   ├── queries/            # read use cases (notes: get/list/search)
│   │   └── providers/         # DI container (composition root)
│   ├── infrastructure/
│   │   ├── bus/                # InMemoryCommandBus / InMemoryQueryBus
│   │   ├── db/                 # SQLAlchemy engine/session/models
│   │   ├── repositories/       # SqlAlchemy{Note,User}Repository
│   │   ├── auth/                # JwtTokenService, PwdlibPasswordHasher
│   │   └── config.py            # env-driven Settings
│   ├── interface/api/
│   │   ├── routers/             # auth_router, notes_router, status_router
│   │   ├── schemas/             # request/response Pydantic models
│   │   ├── dependencies.py      # get_current_user (JWT bearer auth)
│   │   ├── response_mapper.py   # Either -> JSONResponse
│   │   └── main.py              # FastAPI app, CORS, exception handlers, docs routes
│   └── shared/                  # Command/Query base types, Either, BaseError hierarchy
└── notes.db                   # local SQLite file (dev default, gitignored data)

../tests/                       # tests live at the repo root, not backend/tests — see Testing
../docs/                        # MkDocs documentation site — see API Documentation
```

## Tech Stack

| Concern            | Choice                                            |
|---------------------|----------------------------------------------------|
| Framework            | FastAPI + Uvicorn                                  |
| Architecture          | Clean Architecture, DDD-flavored boundaries, CQRS-lite |
| Dependency Injection | `dependency-injector` (declarative container, `@inject`/`Provide`) |
| Persistence           | SQLAlchemy ORM (SQLite by default; swappable via `DATABASE_URL`) |
| Auth                   | OAuth2 password flow, JWT bearer tokens (`pyjwt`/`python-jose`), `pwdlib` (argon2) password hashing |
| Validation             | Pydantic v2 (entities + request/response schemas) |
| Config                 | `python-decouple`, environment-variable driven |
| API docs               | Swagger UI (built-in), Scalar (`/documentations`), MkDocs site (`../docs`) |
| Testing                | pytest, pytest-bdd (Gherkin acceptance tests) |
| Tooling                | black, isort, mypy, pylint |

## Getting Started

### 1. Install dependencies
From the `backend` directory:
```bash
poetry install
```

### 2. Configure environment (optional)
All settings have safe local defaults; override by creating a `.env` file in `backend/`:

| Variable              | Description                                          | Default                     |
|------------------------|-------------------------------------------------------|-------------------------------|
| `DATABASE_URL`         | SQLAlchemy connection string                           | `sqlite:///./notes.db`        |
| `JWT_SECRET_KEY`       | Secret used to sign/verify JWTs                         | `change-me-in-production`     |
| `JWT_ALGORITHM`        | JWT signing algorithm                                    | `HS256`                        |
| `JWT_EXPIRES_MINUTES`  | Access token lifetime (minutes)                           | `60`                            |
| `ALLOWED_ORIGINS`      | Comma-separated CORS origins                              | `http://localhost:3000`        |

Full details: [Configuration Overview](../docs/docs/configurations/index.md).

### 3. Run the application
```bash
poetry run python run.py
```
Serves at `http://0.0.0.0:8000` with auto-reload.

## API Documentation

- **Swagger UI**: `http://localhost:8000/docs` (auto-generated from the FastAPI schema)
- **Scalar**: `http://localhost:8000/documentations` (alternate interactive reference)
- **MkDocs site** (`../docs`): hand-written docs covering entities, endpoint examples, error envelope, and configuration. Serve locally with:
  ```bash
  poetry run mkdocs serve -f ../docs/mkdocs.yml
  ```
  Covers: [Home](../docs/docs/index.md), [Authentication](../docs/docs/endpoints/authentication/index.md), [Notes](../docs/docs/endpoints/notes/index.md) (incl. entity + one example per operation), [Health](../docs/docs/endpoints/health/index.md), [Errors](../docs/docs/errors.md), [Configuration](../docs/docs/configurations/index.md).

## Testing

Tests live in the repo-level [`../tests`](../tests) directory (not `backend/tests`), per the challenge's required submission layout. `tests/conftest.py` adds `backend/` to `sys.path` so `src.*` imports resolve without installing the package.

Run everything from the `backend` directory:
```bash
poetry run pytest ../tests -v
```

Two kinds of tests:

- **Unit tests** (`tests/units/`) — exercise the shared primitives in isolation: the `Either` result monad, `BaseError`/`CommandError` serialization, and the `Command`/`Query`/`CommandBus`/`QueryBus` abstract contracts (including that they reject incomplete implementations and unregistered command/query types).
- **BDD acceptance tests** (`tests/bdd/`) — Gherkin `.feature` files under `tests/bdd/features/` (via `pytest-bdd`), with step definitions in `tests/bdd/steps/`, driving the API through FastAPI's `TestClient` end-to-end (router → bus → handler → repository → SQLite). Coverage includes:
  - **Auth**: register (success/failure/missing field), login (success/failure/missing field)
  - **Notes**: CRUD happy path, validation errors, search, unauthorized access, cross-user authorization (a user can't read/modify another user's notes)

  `tests/bdd/conftest.py` points `DATABASE_URL` at a scratch SQLite file in the OS temp directory and resets it per run, so BDD tests never touch `notes.db`.

## Error Handling

Every failed request — expected (`Either.left(...)`) or unexpected (uncaught exception) — returns the same JSON envelope via `response_mapper.py` and the global exception handlers in `main.py`:

```json
{
  "success": false,
  "error": { "message": "...", "code": "NOT_FOUND", "details": { "exception": null, "message": null } },
  "timestamp": "2026-07-17T09:24:36.597282+00:00"
}
```

Full reference, including the validation-error shape: [Error Responses](../docs/docs/errors.md).

## Known Limitations / Trade-offs

Being upfront about what this design does *not* do, since it's built to demonstrate patterns rather than to be production-hardened:

- **Buses are in-process, not distributed** — `InMemoryCommandBus`/`InMemoryQueryBus` dispatch synchronously within the same process. There's no message broker, no retries, no outbox pattern. `async_dispatch` exists on the interface but isn't exercised by any current use case.
- **No separate read model** — queries hit the same SQLAlchemy tables as commands. The CQRS split here is about *code organization* (distinct request/handler types), not infrastructure (no separate read replica, cache, or projection).
- **SQLite by default** — fine for local dev and the BDD suite; `DATABASE_URL` needs to point at Postgres/MySQL for anything resembling production, and there's no migration tool (Alembic) wired in yet — `create_all_tables` just calls `Base.metadata.create_all`.
- **JWT secret defaults to a placeholder** — must be overridden via `JWT_SECRET_KEY` outside local dev; there's no refresh-token flow implemented despite `RefreshTokenRequiredError`/`RefreshTokenExpiredError` existing in the shared error hierarchy.
