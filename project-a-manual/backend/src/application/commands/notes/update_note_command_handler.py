from datetime import datetime, timezone
from typing import Type

from src.domain.notes.repository import INoteRepository
from src.shared.commands import Command, CommandHandler
from src.shared.use_cases.error import CommandError
from src.shared.use_cases.result import CommandResponse, CommandSuccessResult, Either

from .update_note_command import UpdateNoteCommand


class UpdateNoteCommandHandler(CommandHandler[UpdateNoteCommand]):
    def __init__(self, note_repository: INoteRepository):
        self._note_repository = note_repository

    def subscribed_to(self) -> Type[Command]:
        return UpdateNoteCommand

    def handle(self, command: UpdateNoteCommand) -> CommandResponse:
        note = self._note_repository.get_by_id(command.note_id)
        if note is None:
            return Either.left(
                CommandError(code=404, message="Note not found")
            )

        if command.title is not None and not command.title.strip():
            return Either.left(
                CommandError(code=422, message="Title must not be empty")
            )

        updated_note = note.model_copy(
            update={
                "title": command.title if command.title is not None else note.title,
                "body": command.body if command.body is not None else note.body,
                "tags": command.tags if command.tags is not None else note.tags,
                "updated_at": datetime.now(timezone.utc),
            }
        )
        result = self._note_repository.update(updated_note)

        return Either.right(
            CommandSuccessResult(message="Note updated", data=result.model_dump(mode="json"))
        )
