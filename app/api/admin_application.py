from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import require_role
from app.crud.application import get_all_applications
from app.db.session import get_db
from app.models.enums import UserRole
from app.schemas.application import AdminApplicationOut

router = APIRouter(prefix="/api/admin/applications", tags=["Admin - Placement Overview"])

require_admin = require_role(UserRole.ADMIN)


@router.get("", response_model=list[AdminApplicationOut])
def admin_list_applications(
    status: str | None = None,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    return get_all_applications(db, status)