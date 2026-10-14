from sqlalchemy.orm import Session

from app.models.announcement import Announcement
from app.schemas.announcement import AnnouncementCreate


def create_announcement(db: Session, payload: AnnouncementCreate) -> Announcement:
    announcement = Announcement(
        title=payload.title.strip(),
        message=payload.message.strip(),
        audience=payload.audience.value,
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return announcement


def list_announcements(db: Session, audience: str | None = None) -> list[Announcement]:
    """audience=None -> everything (admin). Otherwise 'all' + that audience, newest first."""
    query = db.query(Announcement)
    if audience is not None:
        query = query.filter(Announcement.audience.in_(["all", audience]))
    return query.order_by(Announcement.created_at.desc(), Announcement.id.desc()).all()


def get_announcement_by_id(db: Session, announcement_id: int) -> Announcement | None:
    return db.query(Announcement).filter(Announcement.id == announcement_id).first()


def delete_announcement(db: Session, announcement: Announcement) -> None:
    db.delete(announcement)
    db.commit()