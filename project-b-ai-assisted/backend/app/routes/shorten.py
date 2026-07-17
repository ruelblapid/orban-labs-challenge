from fastapi import APIRouter, Depends, Response, status

from app.auth import require_api_key
from app.config import settings
from app.schemas import ShortenRequest, ShortenResponse
from app.urls import create_shortened_url

router = APIRouter()


@router.post(
    "/api/shorten",
    response_model=ShortenResponse,
    dependencies=[Depends(require_api_key)],
)
def shorten_url(payload: ShortenRequest, response: Response) -> ShortenResponse:
    row, created = create_shortened_url(payload.long_url, payload.expires_in_days)
    response.status_code = status.HTTP_201_CREATED if created else status.HTTP_200_OK
    return ShortenResponse(
        short_code=row["short_code"],
        short_url=f"{settings.base_url}/{row['short_code']}",
        long_url=row["long_url"],
        created_at=row["created_at"],
        expires_at=row["expires_at"],
    )
