from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.admin_credentials import ADMIN_EMAIL
from app.core.security import create_access_token, create_refresh_token
from app.crud.student import create_student_with_user
from app.crud.user import authenticate_user, get_user_by_email
from app.db.session import get_db
from app.models.enums import UserRole
from app.schemas.student import AdminLogin, StudentLogin, StudentRegister, Token

router = APIRouter(prefix="/api/auth", tags=["Auth - Student & Admin"])


@router.post("/student/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def student_register(payload: StudentRegister, db: Session = Depends(get_db)):
    if get_user_by_email(db, payload.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    student = create_student_with_user(db, payload)

    access_token = create_access_token(subject=str(student.user_id), role=UserRole.STUDENT.value)
    refresh_token = create_refresh_token(subject=str(student.user_id))
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/student/login", response_model=Token)
def student_login(payload: StudentLogin, db: Session = Depends(get_db)):
    user = authenticate_user(db, payload.email, payload.password)
    if not user or user.role != UserRole.STUDENT:
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")

    access_token = create_access_token(subject=str(user.id), role=user.role.value)
    refresh_token = create_refresh_token(subject=str(user.id))
    return Token(access_token=access_token, refresh_token=refresh_token)


@router.post("/admin/login", response_model=Token)
def admin_login(payload: AdminLogin, db: Session = Depends(get_db)):
    if payload.email != ADMIN_EMAIL:
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    user = authenticate_user(db, payload.email, payload.password)
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = create_access_token(subject=str(user.id), role=user.role.value)
    refresh_token = create_refresh_token(subject=str(user.id))
    return Token(access_token=access_token, refresh_token=refresh_token)