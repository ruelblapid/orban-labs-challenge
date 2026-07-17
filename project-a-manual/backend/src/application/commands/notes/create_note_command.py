from typing import List

from src.shared.commands import Command


class CreateNoteCommand(Command):
    def __init__(self, title: str, body: str, tags: List[str]):
        self.title = title
        self.body = body
        self.tags = tags
