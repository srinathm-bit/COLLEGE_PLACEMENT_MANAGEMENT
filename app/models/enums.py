import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    PLACEMENT_OFFICER = "placement_officer"
    STUDENT = "student"
    COMPANY = "company"