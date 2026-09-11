from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.deps import require_role
from app.crud.department import create_department, get_all_departments
from app.db.session import get_db
from app.models.enums import UserRole
from app.schemas.department import DepartmentCreate, DepartmentOut

router = APIRouter(prefix="/api/admin/departments", tags=["Admin - Department Management"])

require_admin = require_role(UserRole.ADMIN)


@router.post("", response_model=DepartmentOut)
def add_department(
    payload: DepartmentCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    try:
        return create_department(db, payload)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Department name or code already exists")


@router.get("", response_model=list[DepartmentOut])
def list_departments(
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    return get_all_departments(db)