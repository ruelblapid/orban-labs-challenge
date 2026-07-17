from __future__ import annotations

from uuid import uuid4

from pytest_bdd import given, parsers, then, when


def _split_tags(tags: str) -> list:
    return [tag.strip() for tag in tags.split(",") if tag.strip()]


@given("I am authenticated as a new user", target_fixture="auth_headers")
def authenticated_as_new_user(client):
    email = f"notes.user.{uuid4()}@example.com"
    password = "Sup3rSecret!"

    register_response = client.post("/auth/register", json={"email": email, "password": password})
    assert register_response.status_code == 201

    login_response = client.post("/auth/login", data={"username": email, "password": password})
    assert login_response.status_code == 200

    token = login_response.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


@given("I am authenticated as a different user", target_fixture="auth_headers")
def authenticated_as_a_different_user(client):
    return authenticated_as_new_user(client)


@given(
    parsers.parse('a note titled "{title}" with body "{body}" and tags "{tags}" exists'),
    target_fixture="existing_note",
)
def a_note_exists(client, auth_headers, title, body, tags):
    response = client.post(
        "/notes",
        headers=auth_headers,
        json={"title": title, "body": body, "tags": _split_tags(tags)},
    )
    assert response.status_code == 201
    return response.json()["data"]


@when(
    parsers.parse('I create a note titled "{title}" with body "{body}" and tags "{tags}"'),
    target_fixture="response",
)
def create_note(client, auth_headers, title, body, tags):
    return client.post(
        "/notes",
        headers=auth_headers,
        json={"title": title, "body": body, "tags": _split_tags(tags)},
    )


@when("I create a note with an empty title", target_fixture="response")
def create_note_with_empty_title(client, auth_headers):
    return client.post(
        "/notes", headers=auth_headers, json={"title": "", "body": "x", "tags": []}
    )


@when("I list notes", target_fixture="response")
def list_notes(client, auth_headers):
    return client.get("/notes", headers=auth_headers)


@when("I list notes without authentication", target_fixture="response")
def list_notes_without_authentication(client):
    return client.get("/notes")


@when("I get the note", target_fixture="response")
def get_the_note(client, auth_headers, existing_note):
    return client.get(f"/notes/{existing_note['id']}", headers=auth_headers)


@when("I get a note that does not exist", target_fixture="response")
def get_a_missing_note(client, auth_headers):
    return client.get(f"/notes/{uuid4()}", headers=auth_headers)


@when(parsers.parse('I update the note with title "{title}"'), target_fixture="response")
def update_the_note(client, auth_headers, existing_note, title):
    return client.put(
        f"/notes/{existing_note['id']}", headers=auth_headers, json={"title": title}
    )


@when("I delete the note", target_fixture="response")
def delete_the_note(client, auth_headers, existing_note):
    return client.delete(f"/notes/{existing_note['id']}", headers=auth_headers)


@when("I delete the note again", target_fixture="response")
def delete_the_note_again(client, auth_headers, existing_note):
    return client.delete(f"/notes/{existing_note['id']}", headers=auth_headers)


@when(parsers.parse('I search notes by tag "{tag}"'), target_fixture="response")
def search_notes_by_tag(client, auth_headers, tag):
    return client.get(f"/notes/search?tag={tag}", headers=auth_headers)


@when(parsers.parse('I search notes by keyword "{keyword}"'), target_fixture="response")
def search_notes_by_keyword(client, auth_headers, keyword):
    return client.get(f"/notes/search?keyword={keyword}", headers=auth_headers)


@when("I search notes without a tag or keyword", target_fixture="response")
def search_notes_without_params(client, auth_headers):
    return client.get("/notes/search", headers=auth_headers)


@then(parsers.parse('the response JSON "{key}" should contain a note titled "{title}"'))
def response_json_should_contain_note_titled(response, key, title):
    items = response.json().get(key, [])
    assert any(item.get("title") == title for item in items)


@then(parsers.parse('the response JSON "{key}" should not contain a note titled "{title}"'))
def response_json_should_not_contain_note_titled(response, key, title):
    items = response.json().get(key, [])
    assert not any(item.get("title") == title for item in items)
