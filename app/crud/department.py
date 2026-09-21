from sqlalchemy.orm import Session

from app.models.department import Department
from app.schemas.department import DepartmentCreate


def create_department(db: Session, payload: DepartmentCreate) -> Department:
    department = Department(name=payload.name, code=payload.code)
    db.add(department)
    db.commit()
    db.refresh(department)
    return department


def get_all_departments(db: Session) -> list[Department]:
    return db.query(Department).all()


def get_department_by_id(db: Session, department_id: int) -> Department | None:
    return db.query(Department).filter(Department.id == department_id).first()


def delete_department(db: Session, department: Department) -> None:
    db.delete(department)
    db.commit()