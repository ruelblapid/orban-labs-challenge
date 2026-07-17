from __future__ import annotations

from pytest_bdd import given, parsers, when


@given(parsers.parse('a registered user with email "{email}" and password "{password}"'))
def a_registered_user(client, email, password):
    response = client.post("/auth/register", json={"email": email, "password": password})
    assert response.status_code == 201


@when(
    parsers.parse('I register with email "{email}" and password "{password}"'),
    target_fixture="response",
)
def register_with_email_and_password(client, email, password):
    return client.post("/auth/register", json={"email": email, "password": password})


@when(
    parsers.parse('I register with email "{email}" and no password'),
    target_fixture="response",
)
def register_without_password(client, email):
    return client.post("/auth/register", json={"email": email})


@when(
    parsers.parse('I log in with email "{email}" and password "{password}"'),
    target_fixture="response",
)
def login_with_email_and_password(client, email, password):
    return client.post("/auth/login", data={"username": email, "password": password})


@when(
    parsers.parse('I log in with email "{email}" and no password'),
    target_fixture="response",
)
def login_without_password(client, email):
    return client.post("/auth/login", data={"username": email})
