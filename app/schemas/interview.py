from datetime import datetime
from enum import Enum

from pydantic import BaseModel


class InterviewMode(str, Enum):
    online = "online"
    offline = "offline"


class InterviewResult(str, Enum):
    pending = "pending"
    passed = "passed"
    failed = "failed"


class InterviewSchedule(BaseModel):
    """Company schedules an interview for a shortlisted application."""
    scheduled_at: datetime
    mode: InterviewMode
    location_or_link: str | None = None
    notes: str | None = None


class InterviewUpdate(BaseModel):
    """Company reschedules or records a result — all fields optional."""
    scheduled_at: datetime | None = None
    mode: InterviewMode | None = None
    location_or_link: str | None = None
    notes: str | None = None
    result: InterviewResult | None = None


class InterviewOut(BaseModel):
    id: int
    application_id: int
    scheduled_at: datetime
    mode: str
    location_or_link: str | None = None
    notes: str | None = None
    result: str
    created_at: datetime

    model_config = {"from_attributes": True}


class MyInterviewOut(BaseModel):
    """What a student sees — interview details + job/company context."""
    id: int
    application_id: int
    job_title: str
    company_name: str
    scheduled_at: datetime
    mode: str
    location_or_link: str | None = None
    notes: str | None = None
    result: str