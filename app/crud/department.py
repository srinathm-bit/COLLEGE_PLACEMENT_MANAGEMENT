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