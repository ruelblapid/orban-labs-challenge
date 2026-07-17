from __future__ import annotations

import pytest

from src.shared.queries import (
    Query,
    QueryBus,
    QueryHandler,
    QueryNotRegisteredError,
)
from src.shared.use_cases.result import Either


class DummyQuery(Query):
    def __init__(self, payload: str = "payload"):
        self.payload = payload


class DummyQueryBus(QueryBus):
    def __init__(self):
        self.asked = []

    def ask(self, query):
        self.asked.append(query)
        return Either.right({"asked": query.payload})


class DummyQueryHandler(QueryHandler[DummyQuery]):
    def subscribed_to(self):
        return DummyQuery

    def handle(self, query):
        return Either.right({"handled": query.payload})


class IncompleteQueryBus(QueryBus):
    """Doesn't implement `ask`, leaving the abstract method unfulfilled."""


class IncompleteQueryHandler(QueryHandler[DummyQuery]):
    """Only implements `subscribed_to`, leaving `handle` abstract."""

    def subscribed_to(self):
        return DummyQuery


class TestQuery:
    def test_is_instantiable_as_a_plain_marker_class(self):
        query = Query()

        assert isinstance(query, Query)

    def test_subclasses_are_instances_of_query(self):
        query = DummyQuery()

        assert isinstance(query, Query)


class TestQueryBus:
    def test_cannot_be_instantiated_directly(self):
        with pytest.raises(TypeError):
            QueryBus()

    def test_subclass_missing_the_abstract_method_cannot_be_instantiated(self):
        with pytest.raises(TypeError):
            IncompleteQueryBus()

    def test_concrete_subclass_asks_a_query(self):
        bus = DummyQueryBus()
        query = DummyQuery("hello")

        result = bus.ask(query)

        assert bus.asked == [query]
        assert result.is_right()
        assert result.get() == {"asked": "hello"}


class TestQueryHandler:
    def test_cannot_be_instantiated_directly(self):
        with pytest.raises(TypeError):
            QueryHandler()

    def test_subclass_missing_an_abstract_method_cannot_be_instantiated(self):
        with pytest.raises(TypeError):
            IncompleteQueryHandler()

    def test_subscribed_to_returns_the_registered_query_type(self):
        handler = DummyQueryHandler()

        assert handler.subscribed_to() is DummyQuery

    def test_handle_returns_the_handler_result(self):
        handler = DummyQueryHandler()
        query = DummyQuery("hello")

        result = handler.handle(query)

        assert result.is_right()
        assert result.get() == {"handled": "hello"}


class TestQueryNotRegisteredError:
    def test_is_an_exception(self):
        error = QueryNotRegisteredError(DummyQuery)

        assert isinstance(error, Exception)

    def test_message_when_given_a_query_instance(self):
        error = QueryNotRegisteredError(DummyQuery())

        assert "DummyQuery" in str(error)

    def test_message_when_given_a_query_class_does_not_include_class_name(self):

        error = QueryNotRegisteredError(DummyQuery)

        assert "DummyQuery" not in str(error)
        assert "type" in str(error)
