from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.company import Company
from app.models.job import Job
from app.models.student import Student
from app.models.user import User


def get_company_details(db: Session, company: Company) -> dict:
    user = db.query(User).filter(User.id == company.user_id).first()
    jobs = db.query(Job).filter(Job.company_id == company.id).all()
    job_ids = [j.id for j in jobs]

    applications = []
    if job_ids:
        applications = db.query(Application).filter(Application.job_id.in_(job_ids)).all()

    selected_apps = [a for a in applications if a.status == "selected"]
    shortlisted_apps = [a for a in applications if a.status in ("shortlisted", "interview_scheduled")]

    job_rows = []
    for job in jobs:
        job_apps = [a for a in applications if a.job_id == job.id]
        job_rows.append({
            "id": job.id,
            "title": job.title,
            "min_cgpa": float(job.min_cgpa),
            "required_skills": job.required_skills,
            "department_ids": [d.id for d in job.departments],
            "created_at": job.created_at,
            "applicants": len(job_apps),
            "shortlisted": len([a for a in job_apps if a.status in ("shortlisted", "interview_scheduled")]),
            "selected": len([a for a in job_apps if a.status == "selected"]),
        })

    placed_students = []
    for a in selected_apps:
        s = a.student
        placed_students.append({
            "student_id": s.id,
            "full_name": s.full_name,
            "roll_number": s.roll_number,
            "department_id": s.department_id,
            "cgpa": float(s.cgpa),
            "job_title": a.job.title,
        })

    return {
        "company": {
            "id": company.id,
            "company_name": company.company_name,
            "industry": company.industry,
            "website": company.website,
            "contact_person": company.contact_person,
            "contact_phone": company.contact_phone,
            "email": user.email if user else "",
        },
        "stats": {
            "total_jobs": len(jobs),
            "total_applicants": len(applications),
            "shortlisted": len(shortlisted_apps),
            "selected": len(selected_apps),
            "placed": len({a.student_id for a in selected_apps}),
        },
        "jobs": job_rows,
        "placed_students": placed_students,
    }


def get_student_details(db: Session, student: Student) -> dict:
    user = db.query(User).filter(User.id == student.user_id).first()
    applications = db.query(Application).filter(Application.student_id == student.id).all()

    application_rows = []
    for a in applications:
        interview = a.interview
        application_rows.append({
            "application_id": a.id,
            "job_id": a.job.id,
            "job_title": a.job.title,
            "company_name": a.job.company.company_name,
            "status": a.status,
            "applied_at": a.applied_at,
            "interview_scheduled_at": interview.scheduled_at if interview else None,
            "interview_mode": interview.mode if interview else None,
            "interview_result": interview.result if interview else None,
        })

    placements = [row for row in application_rows if row["status"] == "selected"]

    return {
        "student": {
            "id": student.id,
            "email": user.email if user else "",
            "full_name": student.full_name,
            "roll_number": student.roll_number,
            "department_id": student.department_id,
            "graduation_year": student.graduation_year,
            "cgpa": float(student.cgpa),
            "active_backlogs": student.active_backlogs,
            "phone": student.phone,
            "skills": student.skills,
            "resume_filename": student.resume_filename,
        },
        "applications": application_rows,
        "placements": placements,
    }