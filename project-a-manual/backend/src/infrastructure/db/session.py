from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, sessionmaker

from .base import Base


def create_db_engine(database_url: str) -> Engine:
    connect_args = {"check_same_thread": False} if database_url.startswith("sqlite") else {}
    return create_engine(database_url, connect_args=connect_args)


def create_session_factory(engine: Engine) -> sessionmaker[Session]:
    return sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def create_all_tables(engine: Engine) -> None:
    Base.metadata.create_all(bind=engine)
