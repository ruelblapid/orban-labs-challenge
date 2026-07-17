from __future__ import annotations

from datetime import datetime

from src.shared.use_cases.error import (
    DEFAULT_ERROR_MESSAGE,
    AuthenticateError,
    BaseError,
    CommandError,
    CommandErrors,
    InvalidTokenError,
    InvalidTokenSubjectError,
    MaxRetryReachedError,
    QueryError,
    RefreshTokenExpiredError,
    RefreshTokenRequiredError,
    TokenExpiredError,
    UnhandledError,
    UseCaseError,
)


def assert_is_iso_timestamp(value: str) -> None:
    datetime.fromisoformat(value)


class Entity:
    def __init__(self):
        self.id = 1
        self.name = "widget"


class TestBaseError:
    def test_success_is_always_false(self):
        error = BaseError(success=True, message="oops")

        assert error.success is False

    def test_defaults_to_the_generic_message_when_none_given(self):
        error = BaseError()

        assert error.error["message"] == "An unexpected error occurred."

    def test_uses_the_given_message(self):
        error = BaseError(message="specific failure")

        assert error.error["message"] == "specific failure"

    def test_code_is_mapped_to_a_known_error_code_name(self):
        error = BaseError(code=404)

        assert error.error["code"] == "NOT_FOUND"

    def test_unknown_code_falls_back_to_bad_request(self):
        error = BaseError(code=999)

        assert error.error["code"] == "BAD_REQUEST"

    def test_details_capture_the_exception_class_and_message(self):
        error = BaseError(exception=ValueError("bad value"))

        assert error.error["details"]["exception"] == "ValueError"
        assert error.error["details"]["message"] == "bad value"

    def test_details_are_none_without_an_exception(self):
        error = BaseError()

        assert error.error["details"]["exception"] is None
        assert error.error["details"]["message"] is None

    def test_timestamp_is_an_iso_string(self):
        error = BaseError()

        assert_is_iso_timestamp(error.timestamp)

    def test_str_includes_code_message_and_exception(self):
        error = BaseError(message="boom", code=500, exception=ValueError("bad"))

        text = str(error)

        assert "code: 500" in text
        assert "message: boom" in text
        assert "exception: bad" in text

    def test_to_json_excludes_the_entity_field(self):
        error = BaseError(message="boom", entity=Entity())

        payload = error.to_json()

        assert "entity" not in payload

    def test_to_json_serializes_the_exception_as_a_string(self):
        error = BaseError(message="boom", exception=ValueError("bad value"))

        payload = error.to_json()

        assert payload["exception"] == "bad value"

    def test_to_json_includes_the_core_fields(self):
        error = BaseError(message="boom", code=404)

        payload = error.to_json()

        assert payload["success"] is False
        assert payload["message"] == "boom"
        assert payload["code"] == 404
        assert payload["error"]["code"] == "NOT_FOUND"

    def test_serialize_object_walks_nested_dict_attributes(self):
        error = BaseError()

        assert error.serialize_object(Entity()) == {"id": 1, "name": "widget"}

    def test_serialize_object_stringifies_values_without_a_dict(self):
        error = BaseError()

        assert error.serialize_object(42) == "42"


class TestErrorSubclassesUseDefaultDetails:
    """UseCaseError/QueryError/CommandError add no behavior of their own,
    so they should behave exactly like BaseError."""

    def test_use_case_error_behaves_like_base_error(self):
        error = UseCaseError(message="boom")

        assert error.error["message"] == "boom"
        assert isinstance(error, BaseError)

    def test_query_error_behaves_like_base_error(self):
        error = QueryError(message="boom")

        assert error.error["message"] == "boom"
        assert isinstance(error, BaseError)

    def test_command_error_behaves_like_base_error(self):
        error = CommandError(message="boom")

        assert error.error["message"] == "boom"
        assert isinstance(error, BaseError)


class TestNamedErrorCodes:
    def test_unhandled_error_defaults_to_the_default_error_message(self):
        error = UnhandledError()

        assert error.error["code"] == "UNHANDLED_ERROR"
        assert error.error["message"] == DEFAULT_ERROR_MESSAGE

    def test_unhandled_error_uses_a_given_message(self):
        error = UnhandledError(message="custom")

        assert error.error["message"] == "custom"

    def test_authenticate_error_code(self):
        error = AuthenticateError()

        assert error.error["code"] == "AUTHENTICATION_ERROR"

    def test_token_expired_error_code(self):
        error = TokenExpiredError()

        assert error.error["code"] == "ACCESS_TOKEN_EXPIRED"

    def test_refresh_token_required_error_code(self):
        error = RefreshTokenRequiredError()

        assert error.error["code"] == "REFRESH_TOKEN_REQUIRED"

    def test_invalid_token_error_code(self):
        error = InvalidTokenError()

        assert error.error["code"] == "INVALID_TOKEN"

    def test_invalid_token_subject_error_code(self):
        error = InvalidTokenSubjectError()

        assert error.error["code"] == "INVALID_TOKEN_SUBJECT"

    def test_refresh_token_expired_error_code(self):
        error = RefreshTokenExpiredError()

        assert error.error["code"] == "REFRESH_TOKEN_EXPIRED"

    def test_max_retry_reached_error_behaves_like_base_error(self):
        error = MaxRetryReachedError(message="too many retries")

        assert error.error["message"] == "too many retries"
        assert isinstance(error, BaseError)


class TestCommandErrors:
    def test_code_is_mapped_like_base_error(self):
        error = CommandErrors(message="boom", code=400)

        assert error.error["code"] == "BAD_REQUEST"

    def test_errors_list_reflects_the_super_error_dicts_keys_not_sub_errors(self):

        error = CommandErrors(message="boom", code=400)

        assert error.error["details"]["errors"] == ["message", "code", "details"]
