from src.shared.commands import Command


class RegisterUserCommand(Command):
    def __init__(self, email: str, password: str):
        self.email = email
        self.password = password
