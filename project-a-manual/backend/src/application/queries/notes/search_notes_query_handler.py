from typing import Type

from src.domain.notes.repository import INoteRepository
from src.shared.queries import Query, QueryHandler
from src.shared.use_cases.error import QueryError
from src.shared.use_cases.result import Either, QueryListSuccessResult, QueryResponse

from .search_notes_query import SearchNotesQuery


class SearchNotesQueryHandler(QueryHandler[SearchNotesQuery]):
    def __init__(self, note_repository: INoteRepository):
        self._note_repository = note_repository

    def subscribed_to(self) -> Type[Query]:
        return SearchNotesQuery

    def handle(self, query: SearchNotesQuery) -> QueryResponse:
        if not query.tag and not query.keyword:
            return Either.left(
                QueryError(code=422, message="Provide a tag or keyword to search by")
            )

        notes = self._note_repository.search(
            query.user_id, tag=query.tag, keyword=query.keyword
        )

        return Either.right(
            QueryListSuccessResult(data=[note.model_dump(mode="json") for note in notes])
        )
