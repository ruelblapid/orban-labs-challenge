from pytest_bdd import scenario


@scenario("../../features/notes/notes.feature", "An authenticated user creates a note")
def test_create_note():
    pass


@scenario("../../features/notes/notes.feature", "An authenticated user lists notes")
def test_list_notes():
    pass


@scenario("../../features/notes/notes.feature", "An authenticated user retrieves a note by id")
def test_get_note_by_id():
    pass


@scenario("../../features/notes/notes.feature", "An authenticated user updates a note")
def test_update_note():
    pass


@scenario("../../features/notes/notes.feature", "An authenticated user deletes a note")
def test_delete_note():
    pass
