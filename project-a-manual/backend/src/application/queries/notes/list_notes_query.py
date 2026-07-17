from uuid import UUID

from src.shared.queries import Query


class ListNotesQuery(Query):
    def __init__(self, user_id: UUID, limit: int = 100, offset: int = 0):
        self.user_id = user_id
        self.limit = limit
        self.offset = offset
