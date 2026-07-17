from fastapi import APIRouter, HTTPException, status
from fastapi.responses import RedirectResponse

from app import db

router = APIRouter()


@router.get("/{short_code}")
def redirect_short_code(short_code: str) -> RedirectResponse:
    row = db.get_url_by_code(short_code)
    if row is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Short code not found")

    if row["expires_at"] is not None and row["expires_at"] <= db.now_str():
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Short code has expired")

    updated = db.increment_clicks(short_code)
    return RedirectResponse(url=updated["long_url"], status_code=status.HTTP_307_TEMPORARY_REDIRECT)
