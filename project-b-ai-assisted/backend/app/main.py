from fastapi import FastAPI

from app.config import settings

app = FastAPI(
    title="Project B — URL Shortener",
    description="Shorten long URLs, redirect short codes, and track clicks.",
    version="0.1.0",
)


@app.on_event("startup")
def _validate_config() -> None:
    settings.require_api_key()


@app.get("/health", tags=["health"])
def health_check() -> dict:
    return {"status": "ok"}
