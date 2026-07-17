from uuid import UUID

from src.shared.queries import Query


class GetNoteByIdQuery(Query):
    def __init__(self, note_id: UUID, user_id: UUID):
        self.note_id = note_id
        self.user_id = user_id
