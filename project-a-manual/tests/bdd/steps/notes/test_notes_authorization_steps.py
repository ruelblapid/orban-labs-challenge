from pytest_bdd import scenario


@scenario(
    "../../features/notes/notes.authorization.feature",
    "A user's note list does not include another user's notes",
)
def test_list_notes_excludes_other_users_notes():
    pass


@scenario(
    "../../features/notes/notes.authorization.feature",
    "A user cannot retrieve another user's note by id",
)
def test_get_note_by_id_denies_other_users_note():
    pass


@scenario(
    "../../features/notes/notes.authorization.feature",
    "A user cannot update another user's note",
)
def test_update_note_denies_other_users_note():
    pass


@scenario(
    "../../features/notes/notes.authorization.feature",
    "A user cannot delete another user's note",
)
def test_delete_note_denies_other_users_note():
    pass
