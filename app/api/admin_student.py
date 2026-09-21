from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.deps import require_role
from app.crud.student import get_student_by_id, list_students, update_student_as_admin, delete_student
from app.crud.user import get_user_by_id
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.student import Student
from app.schemas.student import AdminStudentUpdate, StudentProfileOut

router = APIRouter(prefix="/api/admin/students", tags=["Admin - Student Management"])

require_admin = require_role(UserRole.ADMIN)


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


def _get_student_or_404(db: Session, student_id: int) -> Student:
    student = get_student_by_id(db, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.get("", response_model=list[StudentProfileOut])
def list_all_students(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    department_id: int | None = None,
    graduation_year: int | None = None,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    if not any([department_id, graduation_year]):
        raise HTTPException(
            status_code=400,
            detail="Please provide at least one filter: department_id, or graduation_year",
        )

    students = list_students(db, skip, limit, department_id, graduation_year)
    return [_to_profile_out(db, s) for s in students]


@router.get("/{student_id}", response_model=StudentProfileOut)
def get_student_detail(student_id: int, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    student = _get_student_or_404(db, student_id)
    return _to_profile_out(db, student)


@router.put("/{student_id}", response_model=StudentProfileOut)
def update_student_detail(
    student_id: int,
    payload: AdminStudentUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    student = _get_student_or_404(db, student_id)
    student = update_student_as_admin(db, student, payload)
    return _to_profile_out(db, student)


@router.get("/{student_id}/resume")
def get_student_resume(student_id: int, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    student = _get_student_or_404(db, student_id)
    if not student.resume_path or not Path(student.resume_path).exists():
        raise HTTPException(status_code=404, detail="No resume uploaded for this student")
    return FileResponse(
        path=student.resume_path,
        filename=student.resume_filename,
        media_type="application/octet-stream",
    )

@router.delete("/{student_id}", status_code=204)
def delete_student_detail(student_id: int, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    student = _get_student_or_404(db, student_id)
    delete_student(db, student)