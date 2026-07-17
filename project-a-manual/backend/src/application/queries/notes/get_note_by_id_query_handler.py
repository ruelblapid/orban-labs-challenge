from typing import Type

from src.domain.notes.repository import INoteRepository
from src.shared.queries import Query, QueryHandler
from src.shared.use_cases.error import QueryError
from src.shared.use_cases.result import Either, QueryResponse, QuerySuccessResult

from .get_note_by_id_query import GetNoteByIdQuery


class GetNoteByIdQueryHandler(QueryHandler[GetNoteByIdQuery]):
    def __init__(self, note_repository: INoteRepository):
        self._note_repository = note_repository

    def subscribed_to(self) -> Type[Query]:
        return GetNoteByIdQuery

    def handle(self, query: GetNoteByIdQuery) -> QueryResponse:
        note = self._note_repository.get_by_id(query.note_id, query.user_id)
        if note is None:
            return Either.left(QueryError(code=404, message="Note not found"))

        return Either.right(QuerySuccessResult(data=note.model_dump(mode="json")))
