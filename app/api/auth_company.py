from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.security import create_access_token, create_refresh_token
from app.crud.user import authenticate_user
from app.db.session import get_db
from app.models.enums import UserRole
from app.schemas.student import Token  # reusing the same Token shape
from app.schemas.company import CompanyLogin

router = APIRouter(prefix="/api/auth", tags=["Auth - Company"])


@router.post("/company/login", response_model=Token)
def company_login(payload: CompanyLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.email, payload.password)
    if not user or user.role != UserRole.COMPANY:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    access_token = create_access_token(subject=str(user.id), role=user.role.value)
    refresh_token = create_refresh_token(subject=str(user.id))
    return Token(access_token=access_token, refresh_token=refresh_token)