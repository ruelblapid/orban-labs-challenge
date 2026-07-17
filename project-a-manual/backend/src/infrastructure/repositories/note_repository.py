from typing import Callable, List, Optional
from uuid import UUID

from sqlalchemy import or_
from sqlalchemy.orm import Session

from src.domain.notes.entities import Note
from src.domain.notes.repository import INoteRepository
from src.infrastructure.db.models import NoteModel


def _to_entity(model: NoteModel) -> Note:
    return Note(
        id=UUID(model.id),
        title=model.title,
        body=model.body,
        tags=list(model.tags or []),
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def _apply_to_model(model: NoteModel, note: Note) -> None:
    model.id = str(note.id)
    model.title = note.title
    model.body = note.body
    model.tags = list(note.tags)
    model.created_at = note.created_at
    model.updated_at = note.updated_at


class SqlAlchemyNoteRepository(INoteRepository):
    def __init__(self, session_factory: Callable[[], Session]):
        self._session_factory = session_factory

    def get_all(self, user_id: UUID, limit: int = 100, offset: int = 0) -> List[Note]:
        with self._session_factory() as session:
            models = (
                session.query(NoteModel)
                .filter(NoteModel.user_id == str(user_id))
                .order_by(NoteModel.created_at.desc())
                .offset(offset)
                .limit(limit)
                .all()
            )
            return [_to_entity(model) for model in models]

    def count_all(self, user_id: UUID) -> int:
        with self._session_factory() as session:
            return (
                session.query(NoteModel).filter(NoteModel.user_id == str(user_id)).count()
            )

    def get_by_id(self, note_id: UUID, user_id: UUID) -> Optional[Note]:
        with self._session_factory() as session:
            model = (
                session.query(NoteModel)
                .filter_by(id=str(note_id), user_id=str(user_id))
                .first()
            )
            return _to_entity(model) if model else None

    def search(
        self, user_id: UUID, tag: Optional[str] = None, keyword: Optional[str] = None
    ) -> List[Note]:
        with self._session_factory() as session:
            query = session.query(NoteModel).filter(NoteModel.user_id == str(user_id))
            if keyword:
                like_pattern = f"%{keyword}%"
                query = query.filter(
                    or_(NoteModel.title.ilike(like_pattern), NoteModel.body.ilike(like_pattern))
                )
            models = query.order_by(NoteModel.created_at.desc()).all()
            results = [_to_entity(model) for model in models]
            if tag:
                results = [note for note in results if tag in note.tags]
            return results

    def create(self, note: Note, user_id: UUID) -> Note:
        with self._session_factory() as session:
            model = NoteModel()
            _apply_to_model(model, note)
            model.user_id = str(user_id)
            session.add(model)
            session.commit()
            session.refresh(model)
            return _to_entity(model)

    def update(self, note: Note, user_id: UUID) -> Optional[Note]:
        with self._session_factory() as session:
            model = (
                session.query(NoteModel)
                .filter_by(id=str(note.id), user_id=str(user_id))
                .first()
            )
            if model is None:
                return None
            _apply_to_model(model, note)
            session.commit()
            session.refresh(model)
            return _to_entity(model)

    def delete(self, note_id: UUID, user_id: UUID) -> bool:
        with self._session_factory() as session:
            model = (
                session.query(NoteModel)
                .filter_by(id=str(note_id), user_id=str(user_id))
                .first()
            )
            if model is None:
                return False
            session.delete(model)
            session.commit()
            return True
