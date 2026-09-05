from sqlalchemy.orm import Session

from app.core.admin_credentials import ADMIN_EMAIL, ADMIN_PASSWORD
from app.core.security import hash_password
from app.crud.user import get_user_by_email
from app.models.enums import UserRole
from app.models.user import User


def seed_admin_user(db: Session) -> None:
    """
    Ensures exactly one admin user exists, matching ADMIN_EMAIL from the local
    config file. Safe to call on every app startup — no-ops if already present.
    There is intentionally no API endpoint to create additional admins.
    """
    existing = get_user_by_email(db, ADMIN_EMAIL)
    if existing:
        return

    admin = User(
        email=ADMIN_EMAIL,
        hashed_password=hash_password(ADMIN_PASSWORD),
        role=UserRole.ADMIN,
        is_active=True,
        is_verified=True,
    )
    db.add(admin)
    db.commit()