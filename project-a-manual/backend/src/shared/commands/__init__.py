from abc import ABC, abstractmethod
from typing import Generic, Type, TypeVar

from ..use_cases.result import CommandResponse


class Command:
    pass


class CommandBus(ABC):
    @abstractmethod
    def dispatch(self, command: Command) -> CommandResponse:
        pass

    @abstractmethod
    def async_dispatch(self, command: Command) -> CommandResponse:
        pass


# Create a generic type for the CommandHandler
Q = TypeVar("Q", bound=Command)


# Define the CommandHandler abstract class
class CommandHandler(ABC, Generic[Q]):
    @abstractmethod
    def subscribed_to(self) -> Type[Command]:
        pass

    @abstractmethod
    def handle(self, command: Q) -> CommandResponse:
        pass

    def async_handle(self, command: Q) -> CommandResponse:
        pass


class CommandNotRegisteredError(Exception):
    def __init__(self, command: Type[Command]):
        # Construct the error message with the command class name
        super().__init__(
            f"The command <{command.__class__.__name__}> hasn't a command handler associated"
        )
