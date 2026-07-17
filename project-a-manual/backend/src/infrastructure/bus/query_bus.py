from typing import Dict, List

from src.shared.queries import Query, QueryBus, QueryHandler, QueryNotRegisteredError
from src.shared.use_cases.result import QueryResponse


class QueryHandlers:
    def __init__(self, query_handlers: List[QueryHandler]):
        self._handlers: Dict[str, QueryHandler] = {
            handler.subscribed_to().__name__: handler for handler in query_handlers
        }

    def get(self, query: Query) -> QueryHandler:
        handler = self._handlers.get(query.__class__.__name__)
        if handler is None:
            raise QueryNotRegisteredError(query)
        return handler


class InMemoryQueryBus(QueryBus):
    def __init__(self, query_handlers: QueryHandlers):
        self._query_handlers = query_handlers

    def ask(self, query: Query) -> QueryResponse:
        handler = self._query_handlers.get(query)
        return handler.handle(query)
