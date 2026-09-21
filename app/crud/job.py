from sqlalchemy.orm import Session

from app.models.department import Department
from app.models.job import Job
from app.schemas.job import JobCreate


def create_job(db: Session, company_id: int, payload: JobCreate) -> Job:
    departments = db.query(Department).filter(Department.id.in_(payload.department_ids)).all()

    job = Job(
        company_id=company_id,
        title=payload.title,
        description=payload.description,
        min_cgpa=payload.min_cgpa,
        required_skills=payload.required_skills,
        departments=departments,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def job_to_out(job: Job) -> dict:
    return {
        "id": job.id,
        "company_id": job.company_id,
        "company_name": job.company.company_name,
        "title": job.title,
        "description": job.description,
        "min_cgpa": float(job.min_cgpa),
        "required_skills": job.required_skills,
        "created_at": job.created_at,
        "department_ids": [d.id for d in job.departments],
    }

def list_jobs_by_company(db: Session, company_id: int) -> list[Job]:
    return db.query(Job).filter(Job.company_id == company_id).all()

def _parse_skills(skills_str: str | None) -> set[str]:
    if not skills_str:
        return set()
    return {s.strip().lower() for s in skills_str.split(",") if s.strip()}


def get_eligible_jobs(db: Session, student) -> list[Job]:
    """
    Computed eligibility - not stored. A job is eligible if:
    - student's cgpa >= job's min_cgpa
    - student's department is among the job's eligible departments
    - student has ALL of the job's required skills
    """
    all_jobs = db.query(Job).all()
    student_skills = _parse_skills(student.skills)

    eligible = []
    for job in all_jobs:
        if float(student.cgpa) < float(job.min_cgpa):
            continue

        job_department_ids = {d.id for d in job.departments}
        if job_department_ids and student.department_id not in job_department_ids:
            continue

        required_skills = _parse_skills(job.required_skills)
        if required_skills and not required_skills.issubset(student_skills):
            continue

        eligible.append(job)

    return eligible

def delete_job(db: Session, job: Job) -> None:
    db.delete(job)
    db.commit()

def get_job_by_id(db: Session, job_id: int) -> Job | None:
    return db.query(Job).filter(Job.id == job_id).first()