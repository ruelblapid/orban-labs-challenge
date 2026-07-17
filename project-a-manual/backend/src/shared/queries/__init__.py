from abc import ABC, abstractmethod
from typing import Generic, Type, TypeVar

from ..use_cases.result import QueryResponse


class Query:
    pass


class QueryBus(ABC):
    @abstractmethod
    def ask(self, query: Query) -> QueryResponse:
        pass


# Create a generic type for the QueryHandler
Q = TypeVar("Q", bound=Query)


# Define the QueryHandler abstract class
class QueryHandler(ABC, Generic[Q]):
    @abstractmethod
    def subscribed_to(self) -> Type[Query]:
        pass

    @abstractmethod
    def handle(self, query: Q) -> QueryResponse:
        pass


class QueryNotRegisteredError(Exception):
    def __init__(self, query: Type[Query]):
        # Construct the error message with the query class name
        super().__init__(
            f"The query <{query.__class__.__name__}> hasn't a query handler associated"
        )
