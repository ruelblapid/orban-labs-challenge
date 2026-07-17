from pytest_bdd import scenario


@scenario(
    "../../features/auth/register.failure.feature",
    "A user tries to register with an email that is already taken",
)
def test_register_failure():
    pass
