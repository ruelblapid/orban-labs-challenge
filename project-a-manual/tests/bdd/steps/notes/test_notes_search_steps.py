from pytest_bdd import scenario


@scenario(
    "../../features/notes/notes.search.feature",
    "Searching notes by tag returns matching notes",
)
def test_search_notes_by_tag():
    pass


@scenario(
    "../../features/notes/notes.search.feature",
    "Searching notes by keyword returns matching notes",
)
def test_search_notes_by_keyword():
    pass


@scenario(
    "../../features/notes/notes.search.feature",
    "Searching notes without a tag or keyword is rejected",
)
def test_search_notes_without_params():
    pass
