from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.company import Company
from app.models.enums import UserRole
from app.models.user import User
from app.schemas.company import CompanyCreate, CompanyProfileUpdate


def get_company_by_user_id(db: Session, user_id: int) -> Company | None:
    return db.query(Company).filter(Company.user_id == user_id).first()


def get_company_by_id(db: Session, company_id: int) -> Company | None:
    return db.query(Company).filter(Company.id == company_id).first()


def list_companies(db: Session, skip: int = 0, limit: int = 50) -> list[Company]:
    return db.query(Company).offset(skip).limit(limit).all()


def create_company_with_user(db: Session, payload: CompanyCreate) -> Company:
    """Admin-only: creates the User (role=company) + Company profile together."""
    user = User(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=UserRole.COMPANY,
    )
    db.add(user)
    db.flush()  # assigns user.id without committing yet

    company = Company(
        user_id=user.id,
        company_name=payload.company_name,
        industry=payload.industry,
        website=payload.website,
        contact_person=payload.contact_person,
        contact_phone=payload.contact_phone,
    )
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


def update_company(db: Session, company: Company, payload: CompanyProfileUpdate) -> Company:
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(company, field, value)
    db.commit()
    db.refresh(company)
    return company