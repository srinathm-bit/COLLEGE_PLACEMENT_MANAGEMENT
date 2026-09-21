from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import require_role
from app.crud.company import get_company_by_user_id
from app.crud.job import create_job, job_to_out
from app.crud.student import list_students
from app.crud.user import get_user_by_id
from app.db.session import get_db
from app.models.enums import UserRole
from app.models.student import Student
from app.schemas.company import CompanyProfileOut
from app.schemas.job import JobCreate, JobOut
from app.schemas.student import StudentProfileOut
from app.crud.job import create_job, job_to_out, list_jobs_by_company, get_job_by_id, delete_job
from app.crud.department import get_all_departments
from app.schemas.department import DepartmentOut



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
        skills=student.skills,
        resume_filename=student.resume_filename,
        resume_uploaded_at=student.resume_uploaded_at,
    )


def _get_current_company(db: Session, user):
    company = get_company_by_user_id(db, user.id)
    if not company:
        raise HTTPException(status_code=404, detail="Company profile not found")
    return company


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


@router.get("/me", response_model=CompanyProfileOut)
def company_view_self(
    db: Session = Depends(get_db),
    current_user=Depends(require_company),
):
    company = _get_current_company(db, current_user)
    return CompanyProfileOut(
        id=company.id,
        user_id=company.user_id,
        email=current_user.email,
        company_name=company.company_name,
        industry=company.industry,
        website=company.website,
        contact_person=company.contact_person,
        contact_phone=company.contact_phone,
    )


@router.post("/jobs", response_model=JobOut, status_code=201)
def company_post_job(
    payload: JobCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_company),
):
    company = _get_current_company(db, current_user)
    job = create_job(db, company.id, payload)
    return job_to_out(job)

@router.get("/jobs", response_model=list[JobOut])
def company_list_own_jobs(
    db: Session = Depends(get_db),
    current_user=Depends(require_company),
):
    company = _get_current_company(db, current_user)
    jobs = list_jobs_by_company(db, company.id)
    return [job_to_out(job) for job in jobs]

@router.get("/departments", response_model=list[DepartmentOut])
def company_list_departments(
    db: Session = Depends(get_db),
    _company=Depends(require_company),
):
    return get_all_departments(db)

@router.delete("/jobs/{job_id}", status_code=204)
def company_delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_company),
):
    company = _get_current_company(db, current_user)
    job = get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    if job.company_id != company.id:
        raise HTTPException(status_code=403, detail="You do not have permission to delete this job")
    delete_job(db, job)