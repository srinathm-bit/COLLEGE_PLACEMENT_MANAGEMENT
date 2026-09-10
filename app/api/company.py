from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.deps import require_role
from app.crud.student import list_students
from app.crud.user import get_user_by_id
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.student import Student
from app.schemas.student import StudentProfileOut

router = APIRouter(prefix="/api/companies", tags=["Company Self-Service"])

require_company = require_role(UserRole.COMPANY)


def _to_profile_out(db: Session, student: Student) -> StudentProfileOut:
    user = get_user_by_id(db, student.user_id)
    return StudentProfileOut(
        id=student.id,
        user_id=student.user_id,
        email=user.email if user else "",
        full_name=student.full_name,
        roll_number=student.roll_number,
        department_id=student.department_id,
        graduation_year=student.graduation_year,
        cgpa=float(student.cgpa),
        active_backlogs=student.active_backlogs,
        phone=student.phone,
        resume_filename=student.resume_filename,
        resume_uploaded_at=student.resume_uploaded_at,
    )


@router.get("/students", response_model=list[StudentProfileOut])
def company_view_students(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    department_id: int | None = None,
    graduation_year: int | None = None,
    db: Session = Depends(get_db),
    _company=Depends(require_company),
):
    students = list_students(db, skip, limit, department_id, graduation_year)
    return [_to_profile_out(db, s) for s in students]