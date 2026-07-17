from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from scalar_fastapi import get_scalar_api_reference

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

app.add_middleware(
    CORSMiddleware,
    allow_origins=container.settings().allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(notes_router.router)
app.include_router(status_router.router)


@app.get("/documentations", include_in_schema=False)
def scalar_docs():
    return get_scalar_api_reference(
        openapi_url=app.openapi_url,
        title=app.title,
    )


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
