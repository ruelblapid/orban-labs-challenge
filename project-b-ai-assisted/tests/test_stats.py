"""GET /api/stats/{short_code} — auth boundary and reported fields."""
from __future__ import annotations


def test_missing_api_key_returns_401(client):
    resp = client.get("/api/stats/whatever")

    assert resp.status_code == 401


def test_unknown_code_returns_404(client, auth_headers):
    resp = client.get("/api/stats/does-not-exist", headers=auth_headers)

    assert resp.status_code == 404


def test_new_url_starts_with_zero_clicks(client, auth_headers):
    create = client.post(
        "/api/shorten",
        json={"long_url": "https://example.com/fresh"},
        headers=auth_headers,
    )
    short_code = create.json()["short_code"]

    resp = client.get(f"/api/stats/{short_code}", headers=auth_headers)

    assert resp.status_code == 200
    body = resp.json()
    assert body["clicks"] == 0
    assert body["short_code"] == short_code
    assert body["long_url"] == "https://example.com/fresh"
