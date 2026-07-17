"""Shared fixtures for the Project B backend test suite.

Tests live in the repo-level /tests/ folder (not backend/tests/) per the
required submission layout, so this conftest adds backend/ to sys.path
before any `app.*` module gets imported.
"""
from __future__ import annotations

import sys
from pathlib import Path

import pytest

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from fastapi.testclient import TestClient  # noqa: E402

from app.config import settings  # noqa: E402
from app.main import app  # noqa: E402

TEST_API_KEY = "test-api-key-do-not-use-in-prod"


@pytest.fixture()
def client(tmp_path, monkeypatch):
    """A TestClient wired to a fresh temp SQLite file and a known API key.

    Patches attributes directly on the shared `settings` singleton rather
    than env vars, since Settings() already ran at import time — every
    module (app.auth, app.urls, app.routes.*) holds a reference to that same
    object, so mutating it here reaches all of them. follow_redirects=False
    so redirect tests see the raw 307/404/410 instead of TestClient silently
    chasing the Location header (which, for a real external URL, would
    otherwise attempt a genuine outbound network request).
    """
    monkeypatch.setattr(settings, "api_key", TEST_API_KEY)
    monkeypatch.setattr(settings, "database_path", str(tmp_path / "test.db"))

    with TestClient(app, follow_redirects=False) as test_client:
        yield test_client


@pytest.fixture()
def auth_headers() -> dict[str, str]:
    return {"X-API-Key": TEST_API_KEY}
