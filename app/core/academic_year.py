from datetime import date


def academic_end_year(today: date | None = None) -> int:
    """Academic year runs June to May. Oct 2026 -> the year ends in 2027."""
    today = today or date.today()
    return today.year + 1 if today.month >= 6 else today.year


def get_year_of_study(graduation_year: int, duration_years: int = 4, today: date | None = None) -> int:
    return duration_years - (graduation_year - academic_end_year(today))


def year_label(year: int, duration_years: int = 4) -> str:
    if year < 1:
        return "Not started"
    if year > duration_years:
        return "Passed out"
    suffix = {1: "st", 2: "nd", 3: "rd"}.get(year, "th")
    return f"{year}{suffix} Year"


def student_year(student) -> int:
    return get_year_of_study(student.graduation_year, student.department.duration_years)


def student_year_label(student) -> str:
    return year_label(student_year(student), student.department.duration_years)