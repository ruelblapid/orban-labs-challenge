from abc import ABC, abstractmethod
from typing import List, Optional
from uuid import UUID

from .entities import Note


class INoteRepository(ABC):
    @abstractmethod
    def get_all(self, user_id: UUID, limit: int = 100, offset: int = 0) -> List[Note]:
        pass

    @abstractmethod
    def count_all(self, user_id: UUID) -> int:
        pass

    @abstractmethod
    def get_by_id(self, note_id: UUID, user_id: UUID) -> Optional[Note]:
        pass

    @abstractmethod
    def search(
        self, user_id: UUID, tag: Optional[str] = None, keyword: Optional[str] = None
    ) -> List[Note]:
        pass

    @abstractmethod
    def create(self, note: Note, user_id: UUID) -> Note:
        pass

    @abstractmethod
    def update(self, note: Note, user_id: UUID) -> Optional[Note]:
        pass

    @abstractmethod
    def delete(self, note_id: UUID, user_id: UUID) -> bool:
        pass
