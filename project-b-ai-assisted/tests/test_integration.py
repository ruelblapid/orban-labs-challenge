"""End-to-end flows across all three endpoints together.

These are the tests that would actually catch a regression in the
click-counting concurrency story (docs/plan.md's "atomic UPDATE, not
read-then-write") — a single-endpoint test can't see that class of bug.
"""
from __future__ import annotations


def test_shorten_redirect_stats_round_trip(client, auth_headers):
    create = client.post(
        "/api/shorten",
        json={"long_url": "https://example.com/round-trip"},
        headers=auth_headers,
    )
    assert create.status_code == 201
    short_code = create.json()["short_code"]

    redirect = client.get(f"/{short_code}")
    assert redirect.status_code == 307
    assert redirect.headers["location"] == "https://example.com/round-trip"

    stats = client.get(f"/api/stats/{short_code}", headers=auth_headers)
    assert stats.status_code == 200
    assert stats.json()["clicks"] == 1


def test_click_count_increments_exactly_once_per_redirect(client, auth_headers):
    create = client.post(
        "/api/shorten",
        json={"long_url": "https://example.com/popular"},
        headers=auth_headers,
    )
    short_code = create.json()["short_code"]

    visits = 5
    for _ in range(visits):
        assert client.get(f"/{short_code}").status_code == 307

    stats = client.get(f"/api/stats/{short_code}", headers=auth_headers)
    assert stats.json()["clicks"] == visits
