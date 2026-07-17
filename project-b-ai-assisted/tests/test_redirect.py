"""GET /{short_code} — public redirect, and the 404-vs-410 distinction."""
from __future__ import annotations

from app import db


def test_unknown_code_returns_404(client):
    resp = client.get("/does-not-exist")

    assert resp.status_code == 404
    assert resp.json() == {"detail": "Short code not found"}


def test_known_code_redirects_with_307(client, auth_headers):
    create = client.post(
        "/api/shorten",
        json={"long_url": "https://example.com/target"},
        headers=auth_headers,
    )
    short_code = create.json()["short_code"]

    resp = client.get(f"/{short_code}")

    assert resp.status_code == 307
    assert resp.headers["location"] == "https://example.com/target"


def test_expired_code_returns_410_not_404(client):
    # expires_in_days only accepts a positive value (future date) via the
    # API, so an already-expired row is written directly through the DB
    # layer — this is exactly the "existed, now expired" case the redirect
    # route has to distinguish from "never existed".
    row = db.insert_url("expired", "https://example.com/gone", "2000-01-01 00:00:00")

    resp = client.get(f"/{row['short_code']}")

    assert resp.status_code == 410
    assert resp.json() == {"detail": "Short code has expired"}
