from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.enums import UserRole
from app.models.student import Student
from app.models.user import User
from app.schemas.student import AdminStudentUpdate, StudentProfileUpdate, StudentRegister


def get_student_by_user_id(db: Session, user_id: int) -> Student | None:
    return db.query(Student).filter(Student.user_id == user_id).first()


def get_student_by_id(db: Session, student_id: int) -> Student | None:
    return db.query(Student).filter(Student.id == student_id).first()


def list_students(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    department_id: int | None = None,
    graduation_year: int | None = None,
) -> list[Student]:
    query = db.query(Student)
    if department_id is not None:
        query = query.filter(Student.department_id == department_id)
    if graduation_year is not None:
        query = query.filter(Student.graduation_year == graduation_year)
    return query.offset(skip).limit(limit).all()


def create_student_with_user(db: Session, payload: StudentRegister) -> Student:
    """Creates the User (role=student) and linked Student profile in one transaction."""
    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=UserRole.STUDENT,
    )
    db.add(user)
    db.flush()  # assigns user.id without committing yet

    student = Student(
        user_id=user.id,
        department_id=payload.department_id,
        roll_number=payload.roll_number,
        full_name=payload.full_name,
        cgpa=payload.cgpa,
        active_backlogs=payload.active_backlogs,
        graduation_year=payload.graduation_year,
        phone=payload.phone,
        skills=payload.skills,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


def update_student_self(db: Session, student: Student, payload: StudentProfileUpdate) -> Student:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(student, field, value)
    db.commit()
    db.refresh(student)
    return student


def update_student_as_admin(db: Session, student: Student, payload: AdminStudentUpdate) -> Student:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(student, field, value)
    db.commit()
    db.refresh(student)
    return student


def set_resume(db: Session, student: Student, filename: str, path: str) -> Student:
    student.resume_filename = filename
    student.resume_path = path
    student.resume_uploaded_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(student)
    return student