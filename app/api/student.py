from pathlib import Path
from app.crud.interview import get_my_interviews
from app.schemas.interview import MyInterviewOut
from fastapi import APIRouter, Depends, HTTPException, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.schemas.application import MyApplicationOut
from app.core.deps import require_role
from fastapi.concurrency import run_in_threadpool

from app.core.file_storage import delete_resume_file, resume_response, save_resume_file
from app.crud.student import get_student_by_user_id, set_resume, update_student_self
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.student import Student
from app.models.user import User
from app.crud.job import get_eligible_jobs, job_to_out
from app.schemas.job import JobOut
from app.schemas.student import ResumeOut, StudentProfileOut, StudentProfileUpdate
from app.crud.job import get_eligible_jobs, job_to_out, get_job_by_id
from app.crud.application import has_already_applied, create_application, get_my_applications
from app.schemas.application import ApplicationOut
from app.core.academic_year import student_year, student_year_label
from app.crud.announcement import list_announcements
from app.schemas.announcement import AnnouncementOut

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
        skills=student.skills,
        current_year=student_year(student),
        year_label=student_year_label(student),
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
    old_key = student.resume_path
    filename, key = await save_resume_file(student.id, file)
    student = set_resume(db, student, filename, key)
    await run_in_threadpool(delete_resume_file, old_key)  # remove the previous resume
    return ResumeOut(filename=student.resume_filename, uploaded_at=student.resume_uploaded_at)


@router.get("/me/resume")
def get_my_resume(db: Session = Depends(get_db), current_user: User = Depends(require_student)):
    student = _get_own_student_or_404(db, current_user)
    return resume_response(student.resume_path, student.resume_filename)



@router.get("/me/jobs/eligible", response_model=list[JobOut])
def get_my_eligible_jobs(db: Session = Depends(get_db), current_user: User = Depends(require_student)):
    student = _get_own_student_or_404(db, current_user)
    eligible_jobs = get_eligible_jobs(db, student)
    return [job_to_out(job) for job in eligible_jobs]

@router.post("/me/jobs/{job_id}/apply", response_model=ApplicationOut, status_code=201)
def apply_to_job(job_id: int, db: Session = Depends(get_db), current_user: User = Depends(require_student)):
    student = _get_own_student_or_404(db, current_user)

    job = get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    eligible_jobs = get_eligible_jobs(db, student)
    eligible_job_ids = {j.id for j in eligible_jobs}
    if job_id not in eligible_job_ids:
        raise HTTPException(status_code=403, detail="You are not eligible for this job")

    if has_already_applied(db, student.id, job_id):
        raise HTTPException(status_code=400, detail="You have already applied to this job")

    return create_application(db, student.id, job_id)


@router.get("/me/applications", response_model=list[MyApplicationOut])
def get_my_applications_route(db: Session = Depends(get_db), current_user: User = Depends(require_student)):
    student = _get_own_student_or_404(db, current_user)
    return get_my_applications(db, student.id)

@router.get("/me/interviews", response_model=list[MyInterviewOut])
def get_my_interviews_route(db: Session = Depends(get_db), current_user: User = Depends(require_student)):
    student = _get_own_student_or_404(db, current_user)
    return get_my_interviews(db, student.id)

@router.get("/me/announcements", response_model=list[AnnouncementOut])
def get_my_announcements(db: Session = Depends(get_db), current_user: User = Depends(require_student)):
    return list_announcements(db, "students")