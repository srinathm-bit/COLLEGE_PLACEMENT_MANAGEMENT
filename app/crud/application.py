from sqlalchemy.orm import Session

from app.models.application import Application
from app.models.job import Job
from app.models.student import Student
from app.models.user import User


def get_application_by_id(db: Session, application_id: int) -> Application | None:
    return db.query(Application).filter(Application.id == application_id).first()


def update_application_status(db: Session, application: Application, status: str) -> Application:
    application.status = status
    db.commit()
    db.refresh(application)
    return application

def has_already_applied(db: Session, student_id: int, job_id: int) -> bool:
    return db.query(Application).filter(
        Application.student_id == student_id,
        Application.job_id == job_id,
    ).first() is not None


def create_application(db: Session, student_id: int, job_id: int) -> Application:
    application = Application(student_id=student_id, job_id=job_id)
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


def get_my_applications(db: Session, student_id: int) -> list[dict]:
    applications = db.query(Application).filter(Application.student_id == student_id).all()

    result = []
    for app in applications:
        result.append({
            "application_id": app.id,
            "status": app.status,
            "applied_at": app.applied_at,
            "job_id": app.job.id,
            "job_title": app.job.title,
            "company_name": app.job.company.company_name,
            "min_cgpa": float(app.job.min_cgpa),
        })
    return result


def get_applicants_for_job(db: Session, job_id: int) -> list[dict]:
    """Returns applicant details (student profile + application info) for a given job."""
    applications = db.query(Application).filter(Application.job_id == job_id).all()

    result = []
    for app in applications:
        student = db.query(Student).filter(Student.id == app.student_id).first()
        if not student:
            continue
        user = db.query(User).filter(User.id == student.user_id).first()

        result.append({
            "application_id": app.id,
            "status": app.status,
            "applied_at": app.applied_at,
            "student_id": student.id,
            "full_name": student.full_name,
            "roll_number": student.roll_number,
            "email": user.email if user else "",
            "department_id": student.department_id,
            "cgpa": float(student.cgpa),
            "skills": student.skills,
            "phone": student.phone,
        })
    return result