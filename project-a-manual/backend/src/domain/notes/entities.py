from datetime import datetime
from typing import List
from uuid import UUID

from pydantic import BaseModel, Field


class Note(BaseModel):
    id: UUID
    title: str
    body: str
    tags: List[str] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
