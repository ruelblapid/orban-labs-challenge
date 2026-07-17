from src.shared.commands import Command


class LoginCommand(Command):
    def __init__(self, email: str, password: str):
        self.email = email
        self.password = password
