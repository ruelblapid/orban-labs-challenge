from pytest_bdd import scenario


@scenario(
    "../../features/notes/notes.unauthorized.feature",
    "An unauthenticated request to list notes is denied",
)
def test_list_notes_without_authentication():
    pass
