from fastapi import FastAPI

from app.config import settings
from app.db import init_db

app = FastAPI(
    title="Project B — URL Shortener",
    description="Shorten long URLs, redirect short codes, and track clicks.",
    version="0.1.0",
)


@app.on_event("startup")
def _startup() -> None:
    settings.require_api_key()
    init_db()


@app.get("/health", tags=["health"])
def health_check() -> dict:
    return {"status": "ok"}
