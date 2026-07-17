from typing import Optional

from src.shared.queries import Query


class SearchNotesQuery(Query):
    def __init__(self, tag: Optional[str] = None, keyword: Optional[str] = None):
        self.tag = tag
        self.keyword = keyword
