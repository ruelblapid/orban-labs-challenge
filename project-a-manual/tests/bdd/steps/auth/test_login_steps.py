from pytest_bdd import scenario


@scenario(
    "../../features/auth/login.feature",
    "A registered user logs in with valid credentials and receives an access token",
)
def test_login():
    pass
