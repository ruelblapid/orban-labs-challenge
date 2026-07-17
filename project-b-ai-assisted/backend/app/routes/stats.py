from fastapi import APIRouter, Depends, HTTPException, status

from app import db
from app.auth import require_api_key
from app.config import settings
from app.schemas import StatsResponse

router = APIRouter()


@router.get(
    "/api/stats/{short_code}",
    response_model=StatsResponse,
    dependencies=[Depends(require_api_key)],
)
def get_stats(short_code: str) -> StatsResponse:
    row = db.get_url_by_code(short_code)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Short code not found")

    return StatsResponse(
        short_code=row["short_code"],
        short_url=f"{settings.base_url}/{row['short_code']}",
        long_url=row["long_url"],
        clicks=row["clicks"],
        created_at=row["created_at"],
        expires_at=row["expires_at"],
    )
