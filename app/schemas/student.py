from datetime import datetime

from pydantic import BaseModel, EmailStr, field_validator


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
    skills: str | None = None

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
    skills: str | None = None
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
    skills: str | None = None


class AdminStudentUpdate(BaseModel):
    """Fields an admin may update on any student's profile — superset of self-update."""
    full_name: str | None = None
    department_id: int | None = None
    graduation_year: int | None = None
    cgpa: float | None = None
    active_backlogs: int | None = None
    phone: str | None = None
    roll_number: str | None = None
    skills: str | None = None


class ResumeOut(BaseModel):
    filename: str
    uploaded_at: datetime | None = None