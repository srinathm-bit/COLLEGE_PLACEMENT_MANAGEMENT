from pydantic import BaseModel, EmailStr


class CompanyCreate(BaseModel):
    """Admin-only: creates the User (role=company) + Company profile together."""
    email: EmailStr
    password: str
    company_name: str
    industry: str | None = None
    website: str | None = None
    contact_person: str | None = None
    contact_phone: str | None = None


class CompanyLogin(BaseModel):
    email: EmailStr
    password: str


class CompanyProfileOut(BaseModel):
    id: int
    user_id: int
    email: EmailStr
    company_name: str
    industry: str | None = None
    website: str | None = None
    contact_person: str | None = None
    contact_phone: str | None = None

    model_config = {"from_attributes": True}


class CompanyProfileUpdate(BaseModel):
    """Fields an admin may update on a company's profile."""
    company_name: str | None = None
    industry: str | None = None
    website: str | None = None
    contact_person: str | None = None
    contact_phone: str | None = None