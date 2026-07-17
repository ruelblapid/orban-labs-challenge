from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, Callable, Generic, List, Optional, TypeVar, Union

from .error import BaseError

L = TypeVar("L")
R = TypeVar("R")
T = TypeVar("T")


class Either(Generic[L, R]):
    """
    Left holds an error (L), Right holds a success value (R).
    """

    def __init__(self, is_left: bool, left_value: Any = None, right_value: Any = None):
        self._is_left = is_left
        self._left_value = left_value
        self._right_value = right_value

    def is_left(self) -> bool:
        return self._is_left

    def is_right(self) -> bool:
        return not self._is_left

    def fold(self, left_fn: Callable[[L], T], right_fn: Callable[[R], T]) -> T:
        if self._is_left:
            return left_fn(self._left_value)
        return right_fn(self._right_value)

    def map(self, fn: Callable[[R], T]) -> "Either[L, T]":
        return self.flat_map(lambda r: Either.right(fn(r)))

    def flat_map(self, fn: Callable[[R], "Either[L, T]"]) -> "Either[L, T]":
        return self.fold(
            lambda left_value: Either.left(left_value),
            lambda right_value: fn(right_value),
        )

    def map_left(self, fn: Callable[[L], T]) -> "Either[T, R]":
        return self.flat_map_left(lambda l: Either.left(fn(l)))

    def flat_map_left(self, fn: Callable[[L], "Either[T, R]"]) -> "Either[T, R]":
        return self.fold(
            lambda left_value: fn(left_value),
            lambda right_value: Either.right(right_value),
        )

    def get(self, error_message: Optional[str] = None) -> R:
        return self.get_or_throw(error_message)

    def get_or_throw(self, error_message: Optional[str] = None) -> R:
        def throw_fn(left_value):
            raise ValueError(
                error_message
                if error_message
                else f"An error has occurred retrieving value: {left_value!r}"
            )

        return self.fold(throw_fn, lambda right_value: right_value)

    def get_left(self) -> L:
        def throw_fn(right_value):
            raise ValueError(f"The value is right: {right_value!r}")

        return self.fold(lambda left_value: left_value, throw_fn)

    def get_right(self) -> R:
        def throw_fn(left_value):
            raise ValueError(f"The value is left: {left_value!r}")

        return self.fold(throw_fn, lambda right_value: right_value)

    def get_or_else(self, default_value: R) -> R:
        return self.fold(lambda _: default_value, lambda right_value: right_value)

    @staticmethod
    def left(value: L) -> "Either[L, Any]":
        return Either(True, left_value=value)

    @staticmethod
    def right(value: R) -> "Either[Any, R]":
        return Either(False, right_value=value)


QueryResponse = Union[Either[BaseError, Any], None]
CommandResponse = Union[Either[BaseError, Any], None]


@dataclass
class CommandSuccessResult:
    message: str
    data: dict = field(default_factory=dict)
    success: bool = True
    timestamp: str = datetime.now(timezone.utc).isoformat()

    def __post_init__(self):
        self.success = True
        self.timestamp = datetime.now(timezone.utc).isoformat()
        self.data = self.data or {}


@dataclass
class QuerySuccessResult:
    data: dict
    success: bool = True
    timestamp: str = datetime.now(timezone.utc).isoformat()

    def __post_init__(self):
        self.success = True
        self.timestamp = datetime.now(timezone.utc).isoformat()
        self.data = self.data or {}


@dataclass
class QuerySuccessResponse:
    data: dict
    success: bool = True
    timestamp: str = datetime.now(timezone.utc).isoformat()

    def __post_init__(self):
        self.success = True
        self.timestamp = datetime.now(timezone.utc).isoformat()
        self.data = self.data or {}


@dataclass
class QueryListSuccessResult:
    data: List[dict]
    links: dict = None
    success: bool = True
    timestamp: str = datetime.now(timezone.utc).isoformat()

    def __post_init__(self):
        self.success = True
        self.timestamp = datetime.now(timezone.utc).isoformat()
        self.data = self.data or []


@dataclass
class ResourceCollection:
    data: List[dict]
    links: dict = None
    meta: dict = None
    success: bool = True
    timestamp: str = datetime.now(timezone.utc).isoformat()

    def __post_init__(self):
        self.success = True
        self.timestamp = datetime.now(timezone.utc).isoformat()
        self.data = self.data or []
        self.meta = self.meta or {}
        self.links = self.links or {}


@dataclass
class ReportResourceCollection(ResourceCollection):
    columns: List[dict] = None
    query: dict = None

    def __post_init__(self):
        self.success = True
        self.timestamp = datetime.now(timezone.utc).isoformat()
        self.data = self.data or []
        self.columns = self.columns or []
        self.query = self.query or {}
        self.meta = self.meta or {}
        self.links = self.links or {}


class IResponse(ABC):

    @abstractmethod
    def toResponse(self):
        raise NotImplementedError
