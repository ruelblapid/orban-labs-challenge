from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class NoteCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    body: str
    tags: List[str] = Field(default_factory=list)


class NoteUpdateRequest(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    body: Optional[str] = None
    tags: Optional[List[str]] = None


class NoteResponse(BaseModel):
    id: UUID
    title: str
    body: str
    tags: List[str]
    created_at: datetime
    updated_at: datetime


class NoteListResponse(BaseModel):
    data: List[NoteResponse]
