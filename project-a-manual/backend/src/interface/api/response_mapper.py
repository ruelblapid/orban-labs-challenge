from dataclasses import asdict, is_dataclass
from typing import Any

from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse

from src.shared.use_cases.result import Either


def to_json_response(either: Either, success_status: int = 200) -> JSONResponse:
    if either.is_left():
        error = either.get_left()
        return JSONResponse(status_code=error.code, content=jsonable_encoder(error.to_json()))

    value: Any = either.get_right()
    content = asdict(value) if is_dataclass(value) else value
    return JSONResponse(status_code=success_status, content=jsonable_encoder(content))
