from __future__ import annotations

import pytest

from src.shared.commands import (
    Command,
    CommandBus,
    CommandHandler,
    CommandNotRegisteredError,
)
from src.shared.use_cases.result import Either


class DummyCommand(Command):
    def __init__(self, payload: str = "payload"):
        self.payload = payload


class OtherCommand(Command):
    pass


class DummyCommandBus(CommandBus):
    def __init__(self):
        self.dispatched = []
        self.async_dispatched = []

    def dispatch(self, command):
        self.dispatched.append(command)
        return Either.right({"dispatched": command.payload})

    def async_dispatch(self, command):
        self.async_dispatched.append(command)
        return Either.right({"async_dispatched": command.payload})


class DummyCommandHandler(CommandHandler[DummyCommand]):
    def subscribed_to(self):
        return DummyCommand

    def handle(self, command):
        return Either.right({"handled": command.payload})


class DefaultAsyncHandleHandler(CommandHandler[DummyCommand]):
    """A handler that relies on the base class's default `async_handle`."""

    def subscribed_to(self):
        return DummyCommand

    def handle(self, command):
        return Either.right({"handled": command.payload})


class IncompleteCommandBus(CommandBus):
    """Only implements `dispatch`, leaving `async_dispatch` abstract."""

    def dispatch(self, command):
        return None


class IncompleteCommandHandler(CommandHandler[DummyCommand]):
    """Only implements `subscribed_to`, leaving `handle` abstract."""

    def subscribed_to(self):
        return DummyCommand


class TestCommand:
    def test_is_instantiable_as_a_plain_marker_class(self):
        command = Command()

        assert isinstance(command, Command)

    def test_subclasses_are_instances_of_command(self):
        command = DummyCommand()

        assert isinstance(command, Command)


class TestCommandBus:
    def test_cannot_be_instantiated_directly(self):
        with pytest.raises(TypeError):
            CommandBus()

    def test_subclass_missing_an_abstract_method_cannot_be_instantiated(self):
        with pytest.raises(TypeError):
            IncompleteCommandBus()

    def test_concrete_subclass_dispatches_a_command(self):
        bus = DummyCommandBus()
        command = DummyCommand("hello")

        result = bus.dispatch(command)

        assert bus.dispatched == [command]
        assert result.is_right()
        assert result.get() == {"dispatched": "hello"}

    def test_concrete_subclass_async_dispatches_a_command(self):
        bus = DummyCommandBus()
        command = DummyCommand("hello")

        result = bus.async_dispatch(command)

        assert bus.async_dispatched == [command]
        assert result.is_right()
        assert result.get() == {"async_dispatched": "hello"}


class TestCommandHandler:
    def test_cannot_be_instantiated_directly(self):
        with pytest.raises(TypeError):
            CommandHandler()

    def test_subclass_missing_an_abstract_method_cannot_be_instantiated(self):
        with pytest.raises(TypeError):
            IncompleteCommandHandler()

    def test_subscribed_to_returns_the_registered_command_type(self):
        handler = DummyCommandHandler()

        assert handler.subscribed_to() is DummyCommand

    def test_handle_returns_the_handler_result(self):
        handler = DummyCommandHandler()
        command = DummyCommand("hello")

        result = handler.handle(command)

        assert result.is_right()
        assert result.get() == {"handled": "hello"}

    def test_async_handle_defaults_to_a_no_op(self):
        handler = DefaultAsyncHandleHandler()

        result = handler.async_handle(DummyCommand("hello"))

        assert result is None


class TestCommandNotRegisteredError:
    def test_is_an_exception(self):
        error = CommandNotRegisteredError(DummyCommand)

        assert isinstance(error, Exception)

    def test_message_when_given_a_command_instance(self):

        error = CommandNotRegisteredError(DummyCommand())

        assert "DummyCommand" in str(error)

    def test_message_when_given_a_command_class_does_not_include_class_name(self):

        error = CommandNotRegisteredError(DummyCommand)

        assert "DummyCommand" not in str(error)
        assert "type" in str(error)
