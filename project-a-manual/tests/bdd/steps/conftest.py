from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from pytest_bdd import given, parsers, then

from src.interface.api.main import app


@pytest.fixture
@given("the FastAPI test client is available")
def client():
    with TestClient(app) as test_client:
        yield test_client


@then(parsers.parse("the response status code should be {status_code:d}"))
def response_status_code(response, status_code):
    assert response.status_code == status_code


@then(parsers.parse('the response JSON should contain "{key}"'))
def response_should_contain_key(response, key):
    assert key in response.json()


@then(parsers.parse('the response JSON should contain "{key}" as "{expected_value}"'))
def response_should_contain_key_value(response, key, expected_value):
    assert response.json().get(key) == _coerce(expected_value)


@then(parsers.parse('the response JSON "{parent_key}" should contain "{key}"'))
def response_should_contain_nested_key(response, parent_key, key):
    assert key in response.json().get(parent_key, {})


@then(
    parsers.parse(
        'the response JSON "{parent_key}" should contain "{key}" as "{expected_value}"'
    )
)
def response_should_contain_nested_key_value(response, parent_key, key, expected_value):
    value = response.json().get(parent_key, {}).get(key)
    assert value == _coerce(expected_value)


def _coerce(value: str):
    if value.lower() == "true":
        return True
    if value.lower() == "false":
        return False
    return value
