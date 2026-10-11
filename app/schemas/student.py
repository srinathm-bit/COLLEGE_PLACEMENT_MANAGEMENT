from datetime import datetime
from typing import List


from pydantic import BaseModel, EmailStr, field_validator


def _skills_to_list(v):
    if v is None:
        return None
    if isinstance(v, str):
        return [s.strip() for s in v.split(",") if s.strip()]
    return v 

class StudentRegister(BaseModel):
    """Public registration payload — creates both the User and Student rows."""
    email: EmailStr
    password: str
    full_name: str
    roll_number: str
    department_id: int
    graduation_year: int
    cgpa: float = 0
    active_backlogs: int = 0
    phone: str | None = None
    skills: list[str] | None = None

    @field_validator("skills", mode="before")
    @classmethod
    def skills_as_list(cls, v):
        return _skills_to_list(v)

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v


class StudentLogin(BaseModel):
    email: EmailStr
    password: str


class AdminLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class StudentProfileOut(BaseModel):
    id: int
    user_id: int
    email: EmailStr
    full_name: str
    roll_number: str
    department_id: int
    graduation_year: int
    cgpa: float
    active_backlogs: int
    phone: str | None = None
    skills: list[str] | None = None

    @field_validator("skills", mode="before")
    @classmethod
    def skills_as_list(cls, v):
        return _skills_to_list(v)
    resume_filename: str | None = None
    resume_uploaded_at: datetime | None = None

    model_config = {"from_attributes": True}


class StudentProfileUpdate(BaseModel):
    """Fields a student may update on their own profile."""
    full_name: str | None = None
    graduation_year: int | None = None
    cgpa: float | None = None
    active_backlogs: int | None = None
    phone: str | None = None
    skills: list[str] | None = None

    @field_validator("skills", mode="before")
    @classmethod
    def skills_as_list(cls, v):
        return _skills_to_list(v)


class AdminStudentUpdate(BaseModel):
    """Fields an admin may update on any student's profile — superset of self-update."""
    full_name: str | None = None
    department_id: int | None = None
    graduation_year: int | None = None
    cgpa: float | None = None
    active_backlogs: int | None = None
    phone: str | None = None
    roll_number: str | None = None
    skills: list[str] | None = None

    @field_validator("skills", mode="before")
    @classmethod
    def skills_as_list(cls, v):
        return _skills_to_list(v)


class ResumeOut(BaseModel):
    filename: str
    uploaded_at: datetime | None = None