from typing import Dict, List

from src.shared.commands import (
    Command,
    CommandBus,
    CommandHandler,
    CommandNotRegisteredError,
)
from src.shared.use_cases.result import CommandResponse


class CommandHandlers:
    def __init__(self, command_handlers: List[CommandHandler]):
        self._handlers: Dict[str, CommandHandler] = {
            handler.subscribed_to().__name__: handler for handler in command_handlers
        }

    def get(self, command: Command) -> CommandHandler:
        handler = self._handlers.get(command.__class__.__name__)
        if handler is None:
            raise CommandNotRegisteredError(command)
        return handler


class InMemoryCommandBus(CommandBus):
    def __init__(self, command_handlers: CommandHandlers):
        self._command_handlers = command_handlers

    def dispatch(self, command: Command) -> CommandResponse:
        handler = self._command_handlers.get(command)
        return handler.handle(command)

    def async_dispatch(self, command: Command) -> CommandResponse:
        handler = self._command_handlers.get(command)
        return handler.async_handle(command)
