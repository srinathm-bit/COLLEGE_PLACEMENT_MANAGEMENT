from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class AnnouncementAudience(str, Enum):
    all = "all"
    students = "students"
    companies = "companies"


class AnnouncementCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    message: str = Field(min_length=1)
    audience: AnnouncementAudience = AnnouncementAudience.all


class AnnouncementOut(BaseModel):
    id: int
    title: str
    message: str
    audience: str
    created_at: datetime

    model_config = {"from_attributes": True}