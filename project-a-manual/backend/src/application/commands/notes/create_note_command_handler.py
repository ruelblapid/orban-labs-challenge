from datetime import datetime, timezone
from typing import Type
from uuid import uuid4

from src.domain.notes.entities import Note
from src.domain.notes.repository import INoteRepository
from src.shared.commands import Command, CommandHandler
from src.shared.use_cases.error import CommandError
from src.shared.use_cases.result import CommandResponse, CommandSuccessResult, Either

from .create_note_command import CreateNoteCommand


class CreateNoteCommandHandler(CommandHandler[CreateNoteCommand]):
    def __init__(self, note_repository: INoteRepository):
        self._note_repository = note_repository

    def subscribed_to(self) -> Type[Command]:
        return CreateNoteCommand

    def handle(self, command: CreateNoteCommand) -> CommandResponse:
        if not command.title or not command.title.strip():
            return Either.left(
                CommandError(code=422, message="Title must not be empty")
            )

        now = datetime.now(timezone.utc)
        note = Note(
            id=uuid4(),
            title=command.title,
            body=command.body,
            tags=command.tags,
            created_at=now,
            updated_at=now,
        )
        created = self._note_repository.create(note)

        return Either.right(
            CommandSuccessResult(message="Note created", data=created.model_dump(mode="json"))
        )
