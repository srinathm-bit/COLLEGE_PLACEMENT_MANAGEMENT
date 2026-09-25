from datetime import datetime
from enum import Enum
from pydantic import BaseModel


class ApplicationStatus(str, Enum):
    applied = "applied"
    shortlisted = "shortlisted"
    interview_scheduled = "interview_scheduled"
    selected = "selected"
    rejected = "rejected"

class MyApplicationOut(BaseModel):
    application_id: int
    status: str
    applied_at: datetime
    job_id: int
    job_title: str
    company_name: str
    min_cgpa: float

class ApplicationStatusUpdate(BaseModel):
    status: ApplicationStatus

class ApplicationOut(BaseModel):
    id: int
    student_id: int
    job_id: int
    status: str
    applied_at: datetime

    model_config = {"from_attributes": True}


class ApplicantOut(BaseModel):
    """What a company sees when viewing applicants for their job — student details + application info."""
    application_id: int
    status: str
    applied_at: datetime
    student_id: int
    full_name: str
    roll_number: str
    email: str
    department_id: int
    cgpa: float
    skills: str | None = None
    phone: str | None = None

class AdminApplicationOut(BaseModel):
    application_id: int
    status: str
    applied_at: datetime
    student_name: str
    roll_number: str
    job_title: str
    company_name: str
    interview_scheduled_at: datetime | None = None
    interview_mode: str | None = None
    interview_result: str | None = None