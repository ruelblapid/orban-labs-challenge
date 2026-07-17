from typing import Optional
from uuid import UUID

from src.shared.queries import Query


class SearchNotesQuery(Query):
    def __init__(self, user_id: UUID, tag: Optional[str] = None, keyword: Optional[str] = None):
        self.user_id = user_id
        self.tag = tag
        self.keyword = keyword
