"""Environment-driven configuration.

Loaded once at import time. API_KEY is required; the app should fail fast
at startup rather than silently accepting every request if it's missing.
"""
from __future__ import annotations

import os
from urllib.parse import urlsplit

from dotenv import load_dotenv

load_dotenv()


class Settings:
    def __init__(self) -> None:
        self.api_key: str = os.environ.get("API_KEY", "")
        self.database_path: str = os.environ.get("DATABASE_PATH", "urls.db")
        self.base_url: str = os.environ.get("BASE_URL", "http://localhost:8000").rstrip("/")

        base_host = urlsplit(self.base_url).hostname or ""
        # Hosts that count as "this service" for self-referential URL checks.
        self.self_hosts: set[str] = {h for h in {base_host.lower(), "localhost", "127.0.0.1"} if h}

    def require_api_key(self) -> str:
        if not self.api_key:
            raise RuntimeError(
                "API_KEY environment variable is not set. Copy .env.example to "
                ".env and set a real key before starting the server."
            )
        return self.api_key


settings = Settings()
