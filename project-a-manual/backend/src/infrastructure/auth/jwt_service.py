from datetime import datetime, timedelta, timezone
from typing import Any, Dict

import jwt

from src.domain.auth.services import ITokenService


class JwtTokenService(ITokenService):
    def __init__(self, secret_key: str, algorithm: str, expires_minutes: int):
        self._secret_key = secret_key
        self._algorithm = algorithm
        self._expires_minutes = expires_minutes

    def create_access_token(self, subject: str) -> str:
        now = datetime.now(timezone.utc)
        payload = {
            "sub": subject,
            "iat": now,
            "exp": now + timedelta(minutes=self._expires_minutes),
        }
        return jwt.encode(payload, self._secret_key, algorithm=self._algorithm)

    def decode(self, token: str) -> Dict[str, Any]:
        return jwt.decode(token, self._secret_key, algorithms=[self._algorithm])

    def expires_in_seconds(self) -> int:
        return self._expires_minutes * 60
