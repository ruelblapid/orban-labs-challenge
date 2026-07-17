from datetime import datetime, timezone
from fastapi import APIRouter
from dependency_injector.wiring import inject

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
@inject
def on_health_check():
    return {"healthpeak": "Ok", "timestamp": datetime.now(timezone.utc).isoformat()}
