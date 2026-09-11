from datetime import datetime, timezone

from sqlalchemy import String, Text, Numeric, ForeignKey, DateTime, Table, Column, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base

# Association table for the many-to-many between jobs and departments
job_departments = Table(
    "job_departments",
    Base.metadata,
    Column("job_id", Integer, ForeignKey("jobs.id", ondelete="CASCADE"), primary_key=True),
    Column("department_id", Integer, ForeignKey("departments.id", ondelete="CASCADE"), primary_key=True),
)


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    company_id: Mapped[int] = mapped_column(ForeignKey("companies.id", ondelete="CASCADE"), nullable=False)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=True)
    min_cgpa: Mapped[float] = mapped_column(Numeric(4, 2), nullable=False, default=0)
    required_skills: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    company = relationship("Company", backref="jobs")
    departments = relationship("Department", secondary=job_departments, backref="jobs")