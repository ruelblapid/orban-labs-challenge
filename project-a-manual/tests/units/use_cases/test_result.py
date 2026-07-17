from __future__ import annotations

from datetime import datetime

import pytest

from src.shared.use_cases.result import (
    CommandSuccessResult,
    Either,
    IResponse,
    QueryListSuccessResult,
    QuerySuccessResponse,
    QuerySuccessResult,
    ReportResourceCollection,
    ResourceCollection,
)


def assert_is_iso_timestamp(value: str) -> None:
    # Raises ValueError if not parseable, failing the test.
    datetime.fromisoformat(value)


class TestEither:
    def test_right_is_right_not_left(self):
        either = Either.right(5)

        assert either.is_right()
        assert not either.is_left()

    def test_left_is_left_not_right(self):
        either = Either.left("boom")

        assert either.is_left()
        assert not either.is_right()

    def test_fold_calls_the_right_branch_for_a_right(self):
        either = Either.right(5)

        result = either.fold(lambda l: f"left:{l}", lambda r: f"right:{r}")

        assert result == "right:5"

    def test_fold_calls_the_left_branch_for_a_left(self):
        either = Either.left("boom")

        result = either.fold(lambda l: f"left:{l}", lambda r: f"right:{r}")

        assert result == "left:boom"

    def test_map_transforms_a_right_value(self):
        either = Either.right(5).map(lambda x: x + 1)

        assert either.get() == 6

    def test_map_is_a_no_op_on_a_left(self):
        either = Either.left("boom").map(lambda x: x + 1)

        assert either.is_left()
        assert either.get_left() == "boom"

    def test_flat_map_chains_right_producing_functions(self):
        either = Either.right(5).flat_map(lambda x: Either.right(x * 2))

        assert either.get() == 10

    def test_flat_map_can_turn_a_right_into_a_left(self):
        either = Either.right(5).flat_map(lambda x: Either.left("failed"))

        assert either.is_left()
        assert either.get_left() == "failed"

    def test_map_left_transforms_a_left_value(self):
        either = Either.left("boom").map_left(lambda e: e.upper())

        assert either.get_left() == "BOOM"

    def test_map_left_is_a_no_op_on_a_right(self):
        either = Either.right(5).map_left(lambda e: e.upper())

        assert either.get() == 5

    def test_flat_map_left_chains_left_producing_functions(self):
        either = Either.left("boom").flat_map_left(lambda e: Either.left(f"{e}!"))

        assert either.get_left() == "boom!"

    def test_get_returns_the_right_value(self):
        assert Either.right(5).get() == 5

    def test_get_or_throw_returns_the_right_value(self):
        assert Either.right(5).get_or_throw() == 5

    def test_get_raises_value_error_on_a_left_with_default_message(self):
        with pytest.raises(ValueError, match="'boom'"):
            Either.left("boom").get()

    def test_get_raises_value_error_on_a_left_with_custom_message(self):
        with pytest.raises(ValueError, match="custom failure"):
            Either.left("boom").get("custom failure")

    def test_get_left_returns_the_left_value(self):
        assert Either.left("boom").get_left() == "boom"

    def test_get_left_raises_value_error_on_a_right(self):
        with pytest.raises(ValueError):
            Either.right(5).get_left()

    def test_get_right_returns_the_right_value(self):
        assert Either.right(5).get_right() == 5

    def test_get_right_raises_value_error_on_a_left(self):
        with pytest.raises(ValueError):
            Either.left("boom").get_right()

    def test_get_or_else_returns_default_on_a_left(self):
        assert Either.left("boom").get_or_else(99) == 99

    def test_get_or_else_returns_value_on_a_right(self):
        assert Either.right(5).get_or_else(99) == 5


class TestCommandSuccessResult:
    def test_success_is_always_forced_true(self):
        result = CommandSuccessResult(message="ok", success=False)

        assert result.success is True

    def test_data_defaults_to_an_empty_dict(self):
        result = CommandSuccessResult(message="ok")

        assert result.data == {}

    def test_falsy_data_is_normalized_to_an_empty_dict(self):
        result = CommandSuccessResult(message="ok", data=None)

        assert result.data == {}

    def test_data_is_preserved_when_provided(self):
        result = CommandSuccessResult(message="ok", data={"id": 1})

        assert result.data == {"id": 1}

    def test_timestamp_is_an_iso_string(self):
        result = CommandSuccessResult(message="ok")

        assert_is_iso_timestamp(result.timestamp)


class TestQuerySuccessResult:
    def test_success_is_always_forced_true(self):
        result = QuerySuccessResult(data={"id": 1}, success=False)

        assert result.success is True

    def test_falsy_data_is_normalized_to_an_empty_dict(self):
        result = QuerySuccessResult(data=None)

        assert result.data == {}

    def test_timestamp_is_an_iso_string(self):
        result = QuerySuccessResult(data={})

        assert_is_iso_timestamp(result.timestamp)


class TestQuerySuccessResponse:
    def test_success_is_always_forced_true(self):
        response = QuerySuccessResponse(data={"id": 1}, success=False)

        assert response.success is True

    def test_falsy_data_is_normalized_to_an_empty_dict(self):
        response = QuerySuccessResponse(data=None)

        assert response.data == {}


class TestQueryListSuccessResult:
    def test_falsy_data_is_normalized_to_an_empty_list(self):
        result = QueryListSuccessResult(data=None)

        assert result.data == []

    def test_data_is_preserved_when_provided(self):
        result = QueryListSuccessResult(data=[{"id": 1}])

        assert result.data == [{"id": 1}]

    def test_links_is_not_normalized_and_defaults_to_none(self):
        # Unlike `data`, `links` has no `self.links = self.links or {}`
        # normalization in __post_init__, so it passes through untouched.
        result = QueryListSuccessResult(data=[])

        assert result.links is None

    def test_success_is_always_forced_true(self):
        result = QueryListSuccessResult(data=[], success=False)

        assert result.success is True


class TestResourceCollection:
    def test_falsy_fields_are_normalized(self):
        collection = ResourceCollection(data=None, links=None, meta=None)

        assert collection.data == []
        assert collection.links == {}
        assert collection.meta == {}

    def test_provided_values_are_preserved(self):
        collection = ResourceCollection(
            data=[{"id": 1}], links={"self": "/x"}, meta={"total": 1}
        )

        assert collection.data == [{"id": 1}]
        assert collection.links == {"self": "/x"}
        assert collection.meta == {"total": 1}


class TestReportResourceCollection:
    def test_falsy_fields_are_normalized(self):
        collection = ReportResourceCollection(
            data=None, links=None, meta=None, columns=None, query=None
        )

        assert collection.data == []
        assert collection.links == {}
        assert collection.meta == {}
        assert collection.columns == []
        assert collection.query == {}

    def test_provided_values_are_preserved(self):
        collection = ReportResourceCollection(
            data=[{"id": 1}],
            columns=[{"name": "id"}],
            query={"filter": "active"},
        )

        assert collection.columns == [{"name": "id"}]
        assert collection.query == {"filter": "active"}


class TestIResponse:
    def test_cannot_be_instantiated_directly(self):
        with pytest.raises(TypeError):
            IResponse()

    def test_concrete_subclass_can_implement_to_response(self):
        class DummyResponse(IResponse):
            def toResponse(self):
                return {"ok": True}

        assert DummyResponse().toResponse() == {"ok": True}
