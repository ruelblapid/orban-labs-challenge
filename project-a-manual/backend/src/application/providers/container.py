from dependency_injector import containers, providers

from src.application.commands.auth.login_command_handler import LoginCommandHandler
from src.application.commands.auth.register_user_command_handler import (
    RegisterUserCommandHandler,
)
from src.application.commands.notes.create_note_command_handler import (
    CreateNoteCommandHandler,
)
from src.application.commands.notes.delete_note_command_handler import (
    DeleteNoteCommandHandler,
)
from src.application.commands.notes.update_note_command_handler import (
    UpdateNoteCommandHandler,
)
from src.application.queries.notes.get_note_by_id_query_handler import (
    GetNoteByIdQueryHandler,
)
from src.application.queries.notes.list_notes_query_handler import ListNotesQueryHandler
from src.application.queries.notes.search_notes_query_handler import (
    SearchNotesQueryHandler,
)
from src.infrastructure.auth.jwt_service import JwtTokenService
from src.infrastructure.auth.password_hasher import PwdlibPasswordHasher
from src.infrastructure.bus.command_bus import CommandHandlers, InMemoryCommandBus
from src.infrastructure.bus.query_bus import InMemoryQueryBus, QueryHandlers
from src.infrastructure.config import Settings
from src.infrastructure.db.session import create_db_engine, create_session_factory
from src.infrastructure.repositories.note_repository import SqlAlchemyNoteRepository
from src.infrastructure.repositories.user_repository import SqlAlchemyUserRepository


class Container(containers.DeclarativeContainer):
    settings = providers.Singleton(Settings)

    engine = providers.Singleton(create_db_engine, database_url=settings.provided.database_url)
    session_factory = providers.Singleton(create_session_factory, engine=engine)

    note_repository = providers.Singleton(SqlAlchemyNoteRepository, session_factory=session_factory)
    user_repository = providers.Singleton(SqlAlchemyUserRepository, session_factory=session_factory)

    password_hasher = providers.Singleton(PwdlibPasswordHasher)
    token_service = providers.Singleton(
        JwtTokenService,
        secret_key=settings.provided.jwt_secret_key,
        algorithm=settings.provided.jwt_algorithm,
        expires_minutes=settings.provided.jwt_expires_minutes,
    )

    create_note_command_handler = providers.Singleton(
        CreateNoteCommandHandler, note_repository=note_repository
    )
    update_note_command_handler = providers.Singleton(
        UpdateNoteCommandHandler, note_repository=note_repository
    )
    delete_note_command_handler = providers.Singleton(
        DeleteNoteCommandHandler, note_repository=note_repository
    )
    register_user_command_handler = providers.Singleton(
        RegisterUserCommandHandler,
        user_repository=user_repository,
        password_hasher=password_hasher,
    )
    login_command_handler = providers.Singleton(
        LoginCommandHandler,
        user_repository=user_repository,
        password_hasher=password_hasher,
        token_service=token_service,
    )

    command_handlers = providers.Singleton(
        CommandHandlers,
        command_handlers=providers.List(
            create_note_command_handler,
            update_note_command_handler,
            delete_note_command_handler,
            register_user_command_handler,
            login_command_handler,
        ),
    )
    command_bus = providers.Singleton(InMemoryCommandBus, command_handlers=command_handlers)

    get_note_by_id_query_handler = providers.Singleton(
        GetNoteByIdQueryHandler, note_repository=note_repository
    )
    list_notes_query_handler = providers.Singleton(
        ListNotesQueryHandler, note_repository=note_repository
    )
    search_notes_query_handler = providers.Singleton(
        SearchNotesQueryHandler, note_repository=note_repository
    )

    query_handlers = providers.Singleton(
        QueryHandlers,
        query_handlers=providers.List(
            get_note_by_id_query_handler,
            list_notes_query_handler,
            search_notes_query_handler,
        ),
    )
    query_bus = providers.Singleton(InMemoryQueryBus, query_handlers=query_handlers)
