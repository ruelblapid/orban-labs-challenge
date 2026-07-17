"""SQLite access layer.

One table, opened per-call rather than held as a long-lived connection —
simple, and safe under SQLite's own locking for the concurrency levels this
project expects. See docs/plan.md and docs/architecture.md for the schema
rationale.
"""
from __future__ import annotations

import sqlite3
from datetime import datetime, timezone

from app.config import settings

_SCHEMA = """
CREATE TABLE IF NOT EXISTS urls (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    short_code  TEXT NOT NULL UNIQUE,
    long_url    TEXT NOT NULL,
    clicks      INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL DEFAULT (datetime('now')),
    expires_at  TEXT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_urls_long ON urls(long_url);
CREATE INDEX IF NOT EXISTS idx_urls_code ON urls(short_code);
"""


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(settings.database_path)
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    with get_connection() as conn:
        conn.executescript(_SCHEMA)


def now_str() -> str:
    """UTC timestamp in the same 'YYYY-MM-DD HH:MM:SS' format SQLite's
    datetime('now') produces, so stored and computed timestamps compare
    correctly as plain strings."""
    return datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


def get_url_by_code(short_code: str) -> sqlite3.Row | None:
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM urls WHERE short_code = ?", (short_code,)
        ).fetchone()


def get_url_by_long(long_url: str) -> sqlite3.Row | None:
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM urls WHERE long_url = ?", (long_url,)
        ).fetchone()


def insert_url(short_code: str, long_url: str, expires_at: str | None) -> sqlite3.Row:
    """Raises sqlite3.IntegrityError on a short_code or long_url collision;
    callers are responsible for retrying/deduping."""
    with get_connection() as conn:
        conn.execute(
            "INSERT INTO urls (short_code, long_url, expires_at) VALUES (?, ?, ?)",
            (short_code, long_url, expires_at),
        )
        return conn.execute(
            "SELECT * FROM urls WHERE short_code = ?", (short_code,)
        ).fetchone()


def list_urls() -> list[sqlite3.Row]:
    with get_connection() as conn:
        return conn.execute(
            "SELECT * FROM urls ORDER BY created_at DESC, id DESC"
        ).fetchall()


def increment_clicks(short_code: str) -> sqlite3.Row | None:
    """Atomic single-statement increment (no read-modify-write race), then
    returns the updated row in the same statement via RETURNING."""
    with get_connection() as conn:
        return conn.execute(
            "UPDATE urls SET clicks = clicks + 1 WHERE short_code = ? RETURNING *",
            (short_code,),
        ).fetchone()
