from datetime import datetime

from pydantic import BaseModel, Field, field_validator


def _skills_to_list(v):
    if v is None:
        return None
    if isinstance(v, str):
        return [s.strip() for s in v.split(",") if s.strip()]
    return v


class JobCreate(BaseModel):
    """Company posts a new job."""
    title: str
    description: str | None = None
    min_cgpa: float = 0
    min_year: int | None = Field(default=None, ge=1, le=6)
    required_skills: list[str] | None = None
    department_ids: list[int]

    @field_validator("required_skills", mode="before")
    @classmethod
    def skills_as_list(cls, v):
        return _skills_to_list(v)


class JobOut(BaseModel):
    id: int
    company_id: int
    company_name: str
    title: str
    description: str | None = None
    min_cgpa: float
    min_year: int | None = None
    required_skills: list[str] | None = None
    created_at: datetime
    department_ids: list[int]

    model_config = {"from_attributes": True}

    @field_validator("required_skills", mode="before")
    @classmethod
    def skills_as_list(cls, v):
        return _skills_to_list(v)