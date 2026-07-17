from typing import List
from uuid import UUID

from src.shared.commands import Command


class CreateNoteCommand(Command):
    def __init__(self, title: str, body: str, tags: List[str], user_id: UUID):
        self.title = title
        self.body = body
        self.tags = tags
        self.user_id = user_id
