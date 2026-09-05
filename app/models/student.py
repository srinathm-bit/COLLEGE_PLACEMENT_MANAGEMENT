from datetime import datetime

from sqlalchemy import String, ForeignKey, Numeric, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Student(Base):
    """
    Student profile — 1:1 with User (via user_id), N:1 with Department.
    Eligibility is NOT stored here as a boolean; it's computed per job posting
    against cgpa/backlogs at query time (a later module).
    """
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    department_id: Mapped[int] = mapped_column(ForeignKey("departments.id"), nullable=False)

    roll_number: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    cgpa: Mapped[float] = mapped_column(Numeric(4, 2), nullable=False, default=0)
    active_backlogs: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    graduation_year: Mapped[int] = mapped_column(Integer, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), nullable=True)

    resume_filename: Mapped[str] = mapped_column(String(255), nullable=True)
    resume_path: Mapped[str] = mapped_column(String(500), nullable=True)
    resume_uploaded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="student_profile")
    department = relationship("Department", back_populates="students")