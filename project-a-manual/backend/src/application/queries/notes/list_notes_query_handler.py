from typing import Type

from src.domain.notes.repository import INoteRepository
from src.shared.queries import Query, QueryHandler
from src.shared.use_cases.result import Either, QueryListSuccessResult, QueryResponse

from .list_notes_query import ListNotesQuery


class ListNotesQueryHandler(QueryHandler[ListNotesQuery]):
    def __init__(self, note_repository: INoteRepository):
        self._note_repository = note_repository

    def subscribed_to(self) -> Type[Query]:
        return ListNotesQuery

    def handle(self, query: ListNotesQuery) -> QueryResponse:
        notes = self._note_repository.get_all(
            query.user_id, limit=query.limit, offset=query.offset
        )
        total = self._note_repository.count_all(query.user_id)

        return Either.right(
            QueryListSuccessResult(
                data=[note.model_dump(mode="json") for note in notes],
                links={"total": total, "limit": query.limit, "offset": query.offset},
            )
        )
