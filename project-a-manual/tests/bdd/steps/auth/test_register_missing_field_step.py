from pytest_bdd import scenario


@scenario(
    "../../features/auth/register.missing.field.feature",
    "A user submits a registration request without a password",
)
def test_register_missing_field():
    pass
