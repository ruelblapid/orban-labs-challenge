"""GET /api/urls — the dashboard's list endpoint."""
from __future__ import annotations


def test_missing_api_key_returns_401(client):
    resp = client.get("/api/urls")

    assert resp.status_code == 401


def test_empty_list_when_no_urls_created(client, auth_headers):
    resp = client.get("/api/urls", headers=auth_headers)

    assert resp.status_code == 200
    assert resp.json() == []


def test_lists_created_urls_with_click_counts(client, auth_headers):
    client.post(
        "/api/shorten",
        json={"long_url": "https://example.com/one"},
        headers=auth_headers,
    )
    second = client.post(
        "/api/shorten",
        json={"long_url": "https://example.com/two"},
        headers=auth_headers,
    )
    second_code = second.json()["short_code"]
    client.get(f"/{second_code}")
    client.get(f"/{second_code}")

    resp = client.get("/api/urls", headers=auth_headers)

    assert resp.status_code == 200
    body = resp.json()
    assert len(body) == 2
    by_code = {row["short_code"]: row for row in body}
    assert by_code[second_code]["clicks"] == 2
    assert by_code[second_code]["long_url"] == "https://example.com/two"


def test_duplicate_shorten_does_not_duplicate_list_entry(client, auth_headers):
    client.post(
        "/api/shorten",
        json={"long_url": "https://example.com/dup"},
        headers=auth_headers,
    )
    client.post(
        "/api/shorten",
        json={"long_url": "https://example.com/dup"},
        headers=auth_headers,
    )

    resp = client.get("/api/urls", headers=auth_headers)

    assert len(resp.json()) == 1
