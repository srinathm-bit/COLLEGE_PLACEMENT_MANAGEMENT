from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.deps import require_role
from app.crud.announcement import (
    create_announcement,
    delete_announcement,
    get_announcement_by_id,
    list_announcements,
)
from app.db.session import get_db
from app.models.enums import UserRole
from app.schemas.announcement import AnnouncementCreate, AnnouncementOut

router = APIRouter(prefix="/api/admin/announcements", tags=["Admin - Announcements"])

require_admin = require_role(UserRole.ADMIN)


@router.post("", response_model=AnnouncementOut, status_code=201)
def admin_post_announcement(
    payload: AnnouncementCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    return create_announcement(db, payload)


@router.get("", response_model=list[AnnouncementOut])
def admin_list_announcements(
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    return list_announcements(db)


@router.delete("/{announcement_id}", status_code=204)
def admin_delete_announcement(
    announcement_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    announcement = get_announcement_by_id(db, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    delete_announcement(db, announcement)