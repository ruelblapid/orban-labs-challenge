from typing import Type

from src.domain.notes.repository import INoteRepository
from src.shared.commands import Command, CommandHandler
from src.shared.use_cases.error import CommandError
from src.shared.use_cases.result import CommandResponse, CommandSuccessResult, Either

from .delete_note_command import DeleteNoteCommand


class DeleteNoteCommandHandler(CommandHandler[DeleteNoteCommand]):
    def __init__(self, note_repository: INoteRepository):
        self._note_repository = note_repository

    def subscribed_to(self) -> Type[Command]:
        return DeleteNoteCommand

    def handle(self, command: DeleteNoteCommand) -> CommandResponse:
        deleted = self._note_repository.delete(command.note_id, command.user_id)
        if not deleted:
            return Either.left(
                CommandError(code=404, message="Note not found")
            )

        return Either.right(CommandSuccessResult(message="Note deleted"))
