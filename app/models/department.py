from sqlalchemy import String, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    code: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)  # e.g. "CSE", "ECE"
    duration_years: Mapped[int] = mapped_column(Integer, nullable=False, default=4, server_default="4")

    students = relationship("Student", back_populates="department")