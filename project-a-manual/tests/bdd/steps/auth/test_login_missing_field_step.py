from pytest_bdd import scenario


@scenario(
    "../../features/auth/login.missing.field.feature",
    "A user submits a login request without a password",
)
def test_login_missing_field():
    pass
