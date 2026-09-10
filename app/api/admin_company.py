from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.deps import require_role
from app.crud.company import create_company_with_user, get_company_by_id, list_companies
from app.crud.user import get_user_by_email, get_user_by_id
from app.db.session import get_db
from app.models.company import Company
from app.models.enums import UserRole
from app.schemas.company import CompanyCreate, CompanyProfileOut

router = APIRouter(prefix="/api/admin/companies", tags=["Admin - Company Management"])

require_admin = require_role(UserRole.ADMIN)


def _to_profile_out(db: Session, company: Company) -> CompanyProfileOut:
    user = get_user_by_id(db, company.user_id)
    return CompanyProfileOut(
        id=company.id,
        user_id=company.user_id,
        email=user.email if user else "",
        company_name=company.company_name,
        industry=company.industry,
        website=company.website,
        contact_person=company.contact_person,
        contact_phone=company.contact_phone,
    )


@router.post("", response_model=CompanyProfileOut, status_code=status.HTTP_201_CREATED)
def admin_create_company(
    payload: CompanyCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    if get_user_by_email(db, payload.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    company = create_company_with_user(db, payload)
    return _to_profile_out(db, company)


@router.get("", response_model=list[CompanyProfileOut])
def admin_list_companies(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _admin=Depends(require_admin),
):
    companies = list_companies(db, skip, limit)
    return [_to_profile_out(db, c) for c in companies]


@router.get("/{company_id}", response_model=CompanyProfileOut)
def admin_get_company(company_id: int, db: Session = Depends(get_db), _admin=Depends(require_admin)):
    company = get_company_by_id(db, company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return _to_profile_out(db, company)