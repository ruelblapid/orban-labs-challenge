from fastapi import FastAPI

from app.config import settings
from app.db import init_db
from app.routes import redirect, shorten, stats, urls_list

app = FastAPI(
    title="Project B — URL Shortener",
    description="Shorten long URLs, redirect short codes, and track clicks.",
    version="0.1.0",
)

app.include_router(shorten.router)
app.include_router(stats.router)
app.include_router(urls_list.router)


@app.on_event("startup")
def _startup() -> None:
    settings.require_api_key()
    init_db()


@app.get("/health", tags=["health"])
def health_check() -> dict:
    return {"status": "ok"}


# Registered last: GET /{short_code} is a single-segment catch-all and must
# not shadow the more specific routes above (e.g. /health, /api/...).
app.include_router(redirect.router)
