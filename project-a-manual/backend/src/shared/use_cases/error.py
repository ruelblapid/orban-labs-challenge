from dataclasses import dataclass, field, fields
from datetime import datetime, timezone
from typing import Any, Optional

DEFAULT_ERROR_MESSAGE = (
    "Looks like something went wrong on our end. If the issue persists, please shoot us a note so we can help out. "
    "We apologize for the inconvenience."
)

ERROR_CODES = {
    201: "CREATED",
    202: "ACCEPTED",
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    405: "METHOD_NOT_ALLOWED",
    406: "NOT_ACCEPTABLE",
    409: "CONFLICT",
    410: "GONE",
    411: "LENGTH_REQUIRED",
    412: "PRECONDITION_FAILED",
    413: "PAYLOAD_TOO_LARGE",
    415: "UNSUPPORTED_MEDIA_TYPE",
    422: "UNPROCESSABLE_ENTITY",
    429: "TOO_MANY_REQUESTS",
    500: "INTERNAL_SERVER_ERROR",
    501: "NOT_IMPLEMENTED",
    502: "BAD_GATEWAY",
    503: "SERVICE_UNAVAILABLE",
    504: "GATEWAY_TIMEOUT",
}


@dataclass
class BaseError:
    success: bool = False
    error: Optional[dict] = None
    timestamp: str = datetime.now(timezone.utc).isoformat()
    exception: Optional[Exception] = None
    code: int = 400
    message: Optional[str] = None
    details: Optional[dict] = None
    entity: Any = field(default=None, repr=False, metadata={"exclude_from_json": True})

    def __post_init__(self):
        self.success = False
        self.timestamp = datetime.now(timezone.utc).isoformat()
        self.error = {
            "message": self.message or "An unexpected error occurred.",
            "code": ERROR_CODES.get(self.code, ERROR_CODES[400]),
            "details": {
                "exception": (
                    self.exception.__class__.__name__ if self.exception else None
                ),
                "message": str(self.exception) if self.exception else None,
            },
        }

    def __str__(self):
        return (
            f"{self.__class__.__name__}: code: {self.code} "
            f"message: {self.message} : exception: {self.exception} "
            f": datetime: {self.timestamp}"
        )

    def to_serializable(self, value):
        """
        Convert non-serializable values to a JSON-serializable format.
        """
        if isinstance(value, (datetime,)):
            return value.isoformat()
        elif isinstance(value, Exception):
            return str(value)
        elif hasattr(value, "__dict__"):  # Handling complex objects like `User` class
            return self.serialize_object(value)
        return value

    def serialize_object(self, obj):
        """
        Recursively serialize complex objects (like User).
        """
        if hasattr(obj, "__dict__"):
            return {
                key: self.to_serializable(value) for key, value in obj.__dict__.items()
            }
        return str(obj)

    def to_json(self):
        """
        Serialize the error object to JSON, excluding fields marked with `exclude_from_json`.
        Recursively handle nested complex objects.
        """
        data = {
            field_.name: getattr(self, field_.name)
            for field_ in fields(self)
            if not field_.metadata.get("exclude_from_json", False)
        }

        # Recursively make everything serializable, even nested complex objects
        serializable_data = {
            key: self.to_serializable(value) for key, value in data.items()
        }
        return serializable_data


class UseCaseError(BaseError):
    pass


class QueryError(BaseError):
    pass


class CommandError(BaseError):
    pass


class UnhandledError(BaseError):

    def __post_init__(self):
        super().__post_init__()
        self.error = {
            "message": self.message or DEFAULT_ERROR_MESSAGE,
            "code": "UNHANDLED_ERROR",
            "details": {
                "exception": (
                    self.exception.__class__.__name__ if self.exception else None
                ),
                "message": str(self.exception) if self.exception else None,
            },
        }


class AuthenticateError(BaseError):

    def __post_init__(self):
        super().__post_init__()
        self.error = {
            "message": self.message or DEFAULT_ERROR_MESSAGE,
            "code": "AUTHENTICATION_ERROR",
            "details": {
                "exception": (
                    self.exception.__class__.__name__ if self.exception else None
                ),
                "message": str(self.exception) if self.exception else None,
            },
        }


class TokenExpiredError(BaseError):
    def __post_init__(self):
        super().__post_init__()
        self.error = {
            "message": self.message or DEFAULT_ERROR_MESSAGE,
            "code": "ACCESS_TOKEN_EXPIRED",
            "details": {
                "exception": (
                    self.exception.__class__.__name__ if self.exception else None
                ),
                "message": str(self.exception) if self.exception else None,
            },
        }


class RefreshTokenRequiredError(BaseError):
    def __post_init__(self):
        super().__post_init__()
        self.error = {
            "message": self.message or DEFAULT_ERROR_MESSAGE,
            "code": "REFRESH_TOKEN_REQUIRED",
            "details": {
                "exception": (
                    self.exception.__class__.__name__ if self.exception else None
                ),
                "message": str(self.exception) if self.exception else None,
            },
        }


class InvalidTokenError(BaseError):
    def __post_init__(self):
        super().__post_init__()
        self.error = {
            "message": self.message or DEFAULT_ERROR_MESSAGE,
            "code": "INVALID_TOKEN",
            "details": {
                "exception": (
                    self.exception.__class__.__name__ if self.exception else None
                ),
                "message": str(self.exception) if self.exception else None,
            },
        }


class InvalidTokenSubjectError(BaseError):
    def __post_init__(self):
        super().__post_init__()
        self.error = {
            "message": self.message or DEFAULT_ERROR_MESSAGE,
            "code": "INVALID_TOKEN_SUBJECT",
            "details": {
                "exception": (
                    self.exception.__class__.__name__ if self.exception else None
                ),
                "message": str(self.exception) if self.exception else None,
            },
        }


class RefreshTokenExpiredError(BaseError):
    def __post_init__(self):
        super().__post_init__()
        self.error = {
            "message": self.message or DEFAULT_ERROR_MESSAGE,
            "code": "REFRESH_TOKEN_EXPIRED",
            "details": {
                "exception": (
                    self.exception.__class__.__name__ if self.exception else None
                ),
                "message": str(self.exception) if self.exception else None,
            },
        }


class MaxRetryReachedError(BaseError):
    pass


class CommandErrors(BaseError):
    def __post_init__(self):
        super().__post_init__()
        self.error = {
            "message": self.message or DEFAULT_ERROR_MESSAGE,
            "code": ERROR_CODES.get(self.code, ERROR_CODES[400]),
            "details": {
                "exception": (
                    self.exception.__class__.__name__ if self.exception else None
                ),
                "message": str(self.exception) if self.exception else None,
                "errors": [error for error in self.error] if self.error else [],
            },
        }
