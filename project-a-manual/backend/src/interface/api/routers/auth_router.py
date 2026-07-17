from dependency_injector.wiring import Provide, inject
from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm

from src.application.commands.auth.login_command import LoginCommand
from src.application.commands.auth.register_user_command import RegisterUserCommand
from src.application.providers.container import Container
from src.interface.api.response_mapper import to_json_response
from src.interface.api.schemas.auth_schemas import RegisterRequest
from src.shared.commands import CommandBus

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=201)
@inject
def register(
    request: RegisterRequest,
    command_bus: CommandBus = Depends(Provide[Container.command_bus]),
):
    command = RegisterUserCommand(email=request.email, password=request.password)
    result = command_bus.dispatch(command)
    return to_json_response(result, success_status=201)


@router.post("/login")
@inject
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    command_bus: CommandBus = Depends(Provide[Container.command_bus]),
):
    command = LoginCommand(email=form_data.username, password=form_data.password)
    result = command_bus.dispatch(command)
    return to_json_response(result)
