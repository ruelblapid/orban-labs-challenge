# Notes API

## Overview
The Notes API is a backend service that lets authenticated users create, organize, and search personal notes. It is built with FastAPI following Clean Architecture and CQRS: HTTP routers translate requests into commands/queries dispatched through a command bus and a query bus, which are handled by application-layer use cases operating on the domain model.

## Tech Stack
- **Backend**: Python (FastAPI)
- **Architecture**: Clean Architecture, CQRS
- **Database**: SQLAlchemy (SQLite by default)
- **Auth**: OAuth2 password flow with JWT bearer tokens

## Installation & Setup

### 1. Install dependencies
From the `backend` directory:
```bash
poetry install
```

### 2. Run the application
```bash
poetry run python run.py
```

By default the API is served at `http://0.0.0.0:8000`.

### 3. Interactive API references
- Swagger UI: `/docs`
- Scalar: `/documentations`

## Entity Documentation
- [Note](endpoints/notes/entities/index.md)

## Endpoint Documentation
- [Authentication](endpoints/authentication/index.md)
- [Notes](endpoints/notes/index.md)
- [Health](endpoints/health/index.md)

## Errors
All error responses share a common envelope. See [Error Responses](errors.md) for the format and status codes.

## Configuration Documentation
The system is configured through environment variables. See [Configuration Overview](configurations/index.md) for the full list.
