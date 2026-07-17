"""Business logic for creating shortened URLs: validation, normalization,
code generation, and dedup — sitting between the routes and app.db.
"""
from __future__ import annotations

import secrets
import sqlite3
import string
from datetime import datetime, timedelta, timezone
from urllib.parse import urlsplit, urlunsplit

from fastapi import HTTPException, status
from pydantic import HttpUrl, TypeAdapter, ValidationError

from app import db
from app.config import settings

MAX_URL_LENGTH = 2048
SHORT_CODE_LENGTH = 7
SHORT_CODE_ALPHABET = string.ascii_letters + string.digits
_MAX_GENERATION_ATTEMPTS = 10

_http_url_adapter = TypeAdapter(HttpUrl)


def normalize_url(raw_url: str) -> str:
    """Lowercase scheme/host, strip a lone trailing slash on a path-less
    URL. Query string and fragment are left as-is (case can be meaningful
    there)."""
    parts = urlsplit(raw_url)
    path = "" if parts.path in ("", "/") else parts.path
    return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), path, parts.query, parts.fragment))


def validate_long_url(raw_url: str) -> str:
    """Returns the normalized URL, or raises HTTPException(400) with a
    message describing exactly what's wrong."""
    if len(raw_url) > MAX_URL_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"long_url exceeds the maximum length of {MAX_URL_LENGTH} characters",
        )

    try:
        _http_url_adapter.validate_python(raw_url)
    except ValidationError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="long_url is not a valid absolute URL",
        )

    normalized = normalize_url(raw_url)
    host = (urlsplit(normalized).hostname or "").lower()
    if host in settings.self_hosts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="long_url cannot point back at this service",
        )

    return normalized


def generate_short_code() -> str:
    return "".join(secrets.choice(SHORT_CODE_ALPHABET) for _ in range(SHORT_CODE_LENGTH))


def _compute_expires_at(expires_in_days: int | None) -> str | None:
    if expires_in_days is None:
        return None
    expires_at = datetime.now(timezone.utc) + timedelta(days=expires_in_days)
    return expires_at.strftime("%Y-%m-%d %H:%M:%S")


def create_shortened_url(long_url: str, expires_in_days: int | None) -> tuple[sqlite3.Row, bool]:
    """Returns (row, created). created is False when an existing row for
    this normalized URL was reused instead of a new one being minted."""
    normalized = validate_long_url(long_url)

    existing = db.get_url_by_long(normalized)
    if existing is not None:
        return existing, False

    expires_at = _compute_expires_at(expires_in_days)

    for _ in range(_MAX_GENERATION_ATTEMPTS):
        code = generate_short_code()
        try:
            row = db.insert_url(code, normalized, expires_at)
            return row, True
        except sqlite3.IntegrityError:
            # Either the short_code collided (retry with a new one) or a
            # concurrent request just inserted the same long_url first.
            existing = db.get_url_by_long(normalized)
            if existing is not None:
                return existing, False
            continue

    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Could not generate a unique short code, please retry",
    )
