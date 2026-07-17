from datetime import datetime, timezone
from typing import Type
from uuid import uuid4

from src.domain.auth.entities import User
from src.domain.auth.repository import IUserRepository
from src.domain.auth.services import IPasswordHasher
from src.shared.commands import Command, CommandHandler
from src.shared.use_cases.error import CommandError
from src.shared.use_cases.result import CommandResponse, CommandSuccessResult, Either

from .register_user_command import RegisterUserCommand


class RegisterUserCommandHandler(CommandHandler[RegisterUserCommand]):
    def __init__(self, user_repository: IUserRepository, password_hasher: IPasswordHasher):
        self._user_repository = user_repository
        self._password_hasher = password_hasher

    def subscribed_to(self) -> Type[Command]:
        return RegisterUserCommand

    def handle(self, command: RegisterUserCommand) -> CommandResponse:
        if self._user_repository.get_by_email(command.email) is not None:
            return Either.left(
                CommandError(code=409, message="Email is already registered")
            )

        if not command.password or len(command.password) < 8:
            return Either.left(
                CommandError(code=422, message="Password must be at least 8 characters")
            )

        user = User(
            id=uuid4(),
            email=command.email,
            hashed_password=self._password_hasher.hash(command.password),
            created_at=datetime.now(timezone.utc),
        )
        created = self._user_repository.create(user)

        return Either.right(
            CommandSuccessResult(
                message="User registered",
                data={
                    "id": str(created.id),
                    "email": created.email,
                    "created_at": created.created_at.isoformat(),
                },
            )
        )
