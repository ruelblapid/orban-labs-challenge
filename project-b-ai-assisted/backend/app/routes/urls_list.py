from fastapi import APIRouter, Depends

from app import db
from app.auth import require_api_key
from app.schemas import StatsResponse

router = APIRouter()


@router.get(
    "/api/urls",
    response_model=list[StatsResponse],
    dependencies=[Depends(require_api_key)],
)
def list_urls() -> list[StatsResponse]:
    rows = db.list_urls()
    return [
        StatsResponse(
            short_code=row["short_code"],
            long_url=row["long_url"],
            clicks=row["clicks"],
            created_at=row["created_at"],
            expires_at=row["expires_at"],
        )
        for row in rows
    ]
