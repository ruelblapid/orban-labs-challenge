from typing import List, Optional
from uuid import UUID

from src.shared.commands import Command


class UpdateNoteCommand(Command):
    def __init__(
        self,
        note_id: UUID,
        user_id: UUID,
        title: Optional[str] = None,
        body: Optional[str] = None,
        tags: Optional[List[str]] = None,
    ):
        self.note_id = note_id
        self.user_id = user_id
        self.title = title
        self.body = body
        self.tags = tags
