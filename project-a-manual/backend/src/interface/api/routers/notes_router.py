from typing import Optional
from uuid import UUID

from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response

from src.application.commands.notes.create_note_command import CreateNoteCommand
from src.application.commands.notes.delete_note_command import DeleteNoteCommand
from src.application.commands.notes.update_note_command import UpdateNoteCommand
from src.application.providers.container import Container
from src.application.queries.notes.get_note_by_id_query import GetNoteByIdQuery
from src.application.queries.notes.list_notes_query import ListNotesQuery
from src.application.queries.notes.search_notes_query import SearchNotesQuery
from src.interface.api.dependencies import get_current_user
from src.interface.api.response_mapper import to_json_response
from src.interface.api.schemas.note_schemas import NoteCreateRequest, NoteUpdateRequest
from src.shared.commands import CommandBus
from src.shared.queries import QueryBus

router = APIRouter(prefix="/notes", tags=["notes"])


@router.post("", status_code=201)
@inject
def create_note(
    request: NoteCreateRequest,
    current_user: str = Depends(get_current_user),
    command_bus: CommandBus = Depends(Provide[Container.command_bus]),
):
    command = CreateNoteCommand(
        title=request.title, body=request.body, tags=request.tags, user_id=UUID(current_user)
    )
    result = command_bus.dispatch(command)
    return to_json_response(result, success_status=201)


@router.get("")
@inject
def list_notes(
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    current_user: str = Depends(get_current_user),
    query_bus: QueryBus = Depends(Provide[Container.query_bus]),
):
    result = query_bus.ask(ListNotesQuery(user_id=UUID(current_user), limit=limit, offset=offset))
    return to_json_response(result)


@router.get("/search")
@inject
def search_notes(
    tag: Optional[str] = Query(default=None),
    keyword: Optional[str] = Query(default=None),
    current_user: str = Depends(get_current_user),
    query_bus: QueryBus = Depends(Provide[Container.query_bus]),
):
    result = query_bus.ask(SearchNotesQuery(user_id=UUID(current_user), tag=tag, keyword=keyword))
    return to_json_response(result)


@router.get("/{note_id}")
@inject
def get_note_by_id(
    note_id: UUID,
    current_user: str = Depends(get_current_user),
    query_bus: QueryBus = Depends(Provide[Container.query_bus]),
):
    result = query_bus.ask(GetNoteByIdQuery(note_id=note_id, user_id=UUID(current_user)))
    return to_json_response(result)


@router.put("/{note_id}")
@inject
def update_note(
    note_id: UUID,
    request: NoteUpdateRequest,
    current_user: str = Depends(get_current_user),
    command_bus: CommandBus = Depends(Provide[Container.command_bus]),
):
    command = UpdateNoteCommand(
        note_id=note_id,
        user_id=UUID(current_user),
        title=request.title,
        body=request.body,
        tags=request.tags,
    )
    result = command_bus.dispatch(command)
    return to_json_response(result)


@router.delete("/{note_id}", status_code=204)
@inject
def delete_note(
    note_id: UUID,
    current_user: str = Depends(get_current_user),
    command_bus: CommandBus = Depends(Provide[Container.command_bus]),
):
    result = command_bus.dispatch(DeleteNoteCommand(note_id=note_id, user_id=UUID(current_user)))
    if result.is_left():
        return to_json_response(result)
    return Response(status_code=204)
