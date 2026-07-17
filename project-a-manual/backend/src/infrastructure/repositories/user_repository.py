from typing import Callable, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from src.domain.auth.entities import User
from src.domain.auth.repository import IUserRepository
from src.infrastructure.db.models import UserModel


def _to_entity(model: UserModel) -> User:
    return User(
        id=UUID(model.id),
        email=model.email,
        hashed_password=model.hashed_password,
        created_at=model.created_at,
    )


class SqlAlchemyUserRepository(IUserRepository):
    def __init__(self, session_factory: Callable[[], Session]):
        self._session_factory = session_factory

    def get_by_email(self, email: str) -> Optional[User]:
        with self._session_factory() as session:
            model = session.query(UserModel).filter(UserModel.email == email).first()
            return _to_entity(model) if model else None

    def create(self, user: User) -> User:
        with self._session_factory() as session:
            model = UserModel(
                id=str(user.id),
                email=user.email,
                hashed_password=user.hashed_password,
                created_at=user.created_at,
            )
            session.add(model)
            session.commit()
            session.refresh(model)
            return _to_entity(model)
