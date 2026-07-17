from pytest_bdd import scenario


@scenario(
    "../../features/auth/login.failure.feature",
    "A user provides the wrong password and is denied access",
)
def test_login_failure():
    pass
