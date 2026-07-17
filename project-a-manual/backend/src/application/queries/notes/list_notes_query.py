from src.shared.queries import Query


class ListNotesQuery(Query):
    def __init__(self, limit: int = 100, offset: int = 0):
        self.limit = limit
        self.offset = offset
