from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from src.application.providers.container import Container
from src.infrastructure.db.session import create_all_tables
from src.interface.api.routers import auth_router, notes_router, status_router

container = Container()
container.wire(
    modules=[
        "src.interface.api.dependencies",
        "src.interface.api.routers.notes_router",
        "src.interface.api.routers.auth_router",
    ]
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_all_tables(container.engine())
    yield


app = FastAPI(title="Notes API", version="1.0.0", lifespan=lifespan)

app.include_router(auth_router.router)
app.include_router(notes_router.router)
app.include_router(status_router.router)


@app.exception_handler(RequestValidationError)
def handle_validation_error(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "message": "Validation failed",
                "code": "UNPROCESSABLE_ENTITY",
                "details": jsonable_encoder(exc.errors()),
            },
        },
    )


@app.exception_handler(Exception)
def handle_unexpected_error(request: Request, exc: Exception) -> JSONResponse:
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "message": "An unexpected error occurred",
                "code": "INTERNAL_SERVER_ERROR",
                "details": {"exception": exc.__class__.__name__},
            },
        },
    )
