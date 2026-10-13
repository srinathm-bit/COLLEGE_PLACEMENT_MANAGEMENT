from pydantic import BaseModel, ConfigDict, Field


class DepartmentCreate(BaseModel):
    name: str
    code: str
    duration_years: int = Field(default=4, ge=1, le=6)


class DepartmentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    code: str
    duration_years: int