from uuid import UUID

from src.shared.commands import Command


class DeleteNoteCommand(Command):
    def __init__(self, note_id: UUID):
        self.note_id = note_id
