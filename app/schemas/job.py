from datetime import datetime

from pydantic import BaseModel


class JobCreate(BaseModel):
    """Company posts a new job."""
    title: str
    description: str | None = None
    min_cgpa: float = 0
    required_skills: str | None = None
    department_ids: list[int]


class JobOut(BaseModel):
    id: int
    company_id: int
    title: str
    description: str | None = None
    min_cgpa: float
    required_skills: str | None = None
    created_at: datetime
    department_ids: list[int]

    model_config = {"from_attributes": True}