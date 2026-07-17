"""Request/response models.

long_url is deliberately typed as a plain `str`, not Pydantic's `HttpUrl`.
Using `HttpUrl` directly on the field would make a malformed URL fail at
FastAPI's schema-validation layer and come back as a generic 422 — but the
spec names "invalid URL" as a distinct edge case, and the technical
decisions call for it to be a precise 400 with its own message. So
structural URL validation happens explicitly in app.urls, on a plain
string field; 422 is reserved for genuinely malformed request bodies
(missing/mistyped fields).
"""
from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class ShortenRequest(BaseModel):
    long_url: str = Field(..., min_length=1)
    expires_in_days: Optional[int] = Field(default=None, gt=0, le=3650)


class ShortenResponse(BaseModel):
    short_code: str
    short_url: str
    long_url: str
    created_at: str
    expires_at: Optional[str] = None


class StatsResponse(BaseModel):
    short_code: str
    short_url: str
    long_url: str
    clicks: int
    created_at: str
    expires_at: Optional[str] = None
