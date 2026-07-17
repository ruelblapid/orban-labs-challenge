from uuid import UUID

from src.shared.queries import Query


class GetNoteByIdQuery(Query):
    def __init__(self, note_id: UUID):
        self.note_id = note_id
