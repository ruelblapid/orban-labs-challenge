from pytest_bdd import scenario


@scenario(
    "../../features/notes/notes.validation.feature",
    "Creating a note with an empty title is rejected",
)
def test_create_note_with_empty_title():
    pass


@scenario(
    "../../features/notes/notes.validation.feature",
    "Retrieving a note that does not exist returns 404",
)
def test_get_missing_note():
    pass
