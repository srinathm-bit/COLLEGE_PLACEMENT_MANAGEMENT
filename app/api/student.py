from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.deps import require_role
from app.core.file_storage import save_resume_file
from app.crud.student import get_student_by_user_id, set_resume, update_student_self
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.student import Student
from app.models.user import User
from app.schemas.student import ResumeOut, StudentProfileOut, StudentProfileUpdate

router = APIRouter(prefix="/api/students", tags=["Student Self-Service"])

require_student = require_role(UserRole.STUDENT)


def _get_own_student_or_404(db: Session, current_user: User) -> Student:
    student = get_student_by_user_id(db, current_user.id)
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
    return student


def _to_profile_out(student: Student, email: str) -> StudentProfileOut:
    return StudentProfileOut(
        id=student.id,
        user_id=student.user_id,
        email=email,
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


@router.get("/me", response_model=StudentProfileOut)
def get_my_profile(db: Session = Depends(get_db), current_user: User = Depends(require_student)):
    student = _get_own_student_or_404(db, current_user)
    return _to_profile_out(student, current_user.email)


@router.put("/me", response_model=StudentProfileOut)
def update_my_profile(
    payload: StudentProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student),
):
    student = _get_own_student_or_404(db, current_user)
    student = update_student_self(db, student, payload)
    return _to_profile_out(student, current_user.email)


@router.post("/me/resume", response_model=ResumeOut, status_code=status.HTTP_201_CREATED)
async def upload_my_resume(
    file: UploadFile,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student),
):
    student = _get_own_student_or_404(db, current_user)
    filename, path = await save_resume_file(student.id, file)
    student = set_resume(db, student, filename, path)
    return ResumeOut(filename=student.resume_filename, uploaded_at=student.resume_uploaded_at)


@router.get("/me/resume")
def get_my_resume(db: Session = Depends(get_db), current_user: User = Depends(require_student)):
    student = _get_own_student_or_404(db, current_user)
    if not student.resume_path or not Path(student.resume_path).exists():
        raise HTTPException(status_code=404, detail="No resume uploaded yet")
    return FileResponse(
        path=student.resume_path,
        filename=student.resume_filename,
        media_type="application/octet-stream",
    )