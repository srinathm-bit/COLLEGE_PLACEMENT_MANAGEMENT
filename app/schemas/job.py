from datetime import datetime
from pydantic import BaseModel, field_validator
from pydantic import BaseModel
from typing import List

class JobCreate(BaseModel):
    """Company posts a new job."""
    title: str
    description: str | None = None
    min_cgpa: float = 0
    required_skills: list[str] | None = None
    department_ids: list[int]


class JobOut(BaseModel):
    id: int
    company_id: int
    company_name: str
    title: str
    description: str | None = None
    min_cgpa: float
    required_skills: list[str] | None = None
    created_at: datetime
    department_ids: list[int]

    model_config = {"from_attributes": True}