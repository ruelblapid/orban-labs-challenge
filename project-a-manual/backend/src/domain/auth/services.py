from abc import ABC, abstractmethod
from typing import Any, Dict


class IPasswordHasher(ABC):
    @abstractmethod
    def hash(self, plain_password: str) -> str:
        pass

    @abstractmethod
    def verify(self, plain_password: str, hashed_password: str) -> bool:
        pass


class ITokenService(ABC):
    @abstractmethod
    def create_access_token(self, subject: str) -> str:
        pass

    @abstractmethod
    def decode(self, token: str) -> Dict[str, Any]:
        pass

    @abstractmethod
    def expires_in_seconds(self) -> int:
        pass
