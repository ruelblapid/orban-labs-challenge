from pytest_bdd import scenario


@scenario(
    "../../features/auth/register.feature",
    "A new user registers with a valid email and password",
)
def test_register():
    pass
