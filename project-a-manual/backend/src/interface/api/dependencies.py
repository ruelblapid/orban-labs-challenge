import jwt
from dependency_injector.wiring import Provide, inject
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from src.application.providers.container import Container
from src.domain.auth.services import ITokenService

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


@inject
def get_current_user(
    token: str = Depends(oauth2_scheme),
    token_service: ITokenService = Depends(Provide[Container.token_service]),
) -> str:
    try:
        payload = token_service.decode(token)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token")

    subject = payload.get("sub")
    if not subject:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid access token")

    return subject
