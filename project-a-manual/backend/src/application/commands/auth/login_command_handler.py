from typing import Type

from src.domain.auth.repository import IUserRepository
from src.domain.auth.services import IPasswordHasher, ITokenService
from src.shared.commands import Command, CommandHandler
from src.shared.use_cases.error import AuthenticateError
from src.shared.use_cases.result import CommandResponse, CommandSuccessResult, Either

from .login_command import LoginCommand


class LoginCommandHandler(CommandHandler[LoginCommand]):
    def __init__(
        self,
        user_repository: IUserRepository,
        password_hasher: IPasswordHasher,
        token_service: ITokenService,
    ):
        self._user_repository = user_repository
        self._password_hasher = password_hasher
        self._token_service = token_service

    def subscribed_to(self) -> Type[Command]:
        return LoginCommand

    def handle(self, command: LoginCommand) -> CommandResponse:
        user = self._user_repository.get_by_email(command.email)
        if user is None or not self._password_hasher.verify(command.password, user.hashed_password):
            return Either.left(
                AuthenticateError(code=401, message="Invalid email or password")
            )

        access_token = self._token_service.create_access_token(subject=str(user.id))

        return Either.right(
            CommandSuccessResult(
                message="Login successful",
                data={
                    "access_token": access_token,
                    "token_type": "bearer",
                    "expires_in": self._token_service.expires_in_seconds(),
                },
            )
        )
