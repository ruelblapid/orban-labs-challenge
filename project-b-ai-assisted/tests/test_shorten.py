"""POST /api/shorten — auth boundary, validation, and dedup behavior."""
from __future__ import annotations

import pytest


def test_missing_api_key_returns_401(client):
    resp = client.post("/api/shorten", json={"long_url": "https://example.com/page"})

    assert resp.status_code == 401
    assert resp.json() == {"detail": "Missing or invalid API key"}


def test_wrong_api_key_returns_401(client):
    resp = client.post(
        "/api/shorten",
        json={"long_url": "https://example.com/page"},
        headers={"X-API-Key": "not-the-real-key"},
    )

    assert resp.status_code == 401


def test_creates_new_url_returns_201(client, auth_headers):
    resp = client.post(
        "/api/shorten",
        json={"long_url": "https://example.com/some/page"},
        headers=auth_headers,
    )

    assert resp.status_code == 201
    body = resp.json()
    assert len(body["short_code"]) == 7
    assert body["short_code"] in body["short_url"]
    assert body["long_url"] == "https://example.com/some/page"
    assert body["expires_at"] is None


def test_duplicate_url_returns_existing_code_with_200(client, auth_headers):
    payload = {"long_url": "https://example.com/duplicate-me"}

    first = client.post("/api/shorten", json=payload, headers=auth_headers)
    second = client.post("/api/shorten", json=payload, headers=auth_headers)

    assert first.status_code == 201
    assert second.status_code == 200
    assert first.json()["short_code"] == second.json()["short_code"]


@pytest.mark.parametrize(
    "bad_url",
    ["not-a-url", "ftp://example.com/resource", "www.example.com"],
)
def test_invalid_url_returns_400(client, auth_headers, bad_url):
    resp = client.post("/api/shorten", json={"long_url": bad_url}, headers=auth_headers)

    assert resp.status_code == 400
    assert "detail" in resp.json()


def test_self_referential_url_returns_400(client, auth_headers):
    resp = client.post(
        "/api/shorten",
        json={"long_url": "http://localhost:8000/loop"},
        headers=auth_headers,
    )

    assert resp.status_code == 400


def test_oversized_url_returns_400(client, auth_headers):
    long_url = "https://example.com/" + ("a" * 2100)

    resp = client.post("/api/shorten", json={"long_url": long_url}, headers=auth_headers)

    assert resp.status_code == 400


def test_missing_long_url_field_returns_422(client, auth_headers):
    resp = client.post("/api/shorten", json={}, headers=auth_headers)

    assert resp.status_code == 422


def test_expires_in_days_is_persisted(client, auth_headers):
    resp = client.post(
        "/api/shorten",
        json={"long_url": "https://example.com/expiring", "expires_in_days": 1},
        headers=auth_headers,
    )

    assert resp.status_code == 201
    assert resp.json()["expires_at"] is not None
