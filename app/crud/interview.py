from sqlalchemy.orm import Session

from app.models.interview import Interview
from app.schemas.interview import InterviewSchedule, InterviewUpdate


def get_interview_by_id(db: Session, interview_id: int) -> Interview | None:
    return db.query(Interview).filter(Interview.id == interview_id).first()


def get_interview_by_application_id(db: Session, application_id: int) -> Interview | None:
    return db.query(Interview).filter(Interview.application_id == application_id).first()


def create_interview(db: Session, application_id: int, payload: InterviewSchedule) -> Interview:
    interview = Interview(
        application_id=application_id,
        scheduled_at=payload.scheduled_at,
        mode=payload.mode.value,
        location_or_link=payload.location_or_link,
        notes=payload.notes,
    )
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return interview


def update_interview(db: Session, interview: Interview, payload: InterviewUpdate) -> Interview:
    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        if field in ("mode", "result") and value is not None:
            value = value.value if hasattr(value, "value") else value
        setattr(interview, field, value)
    db.commit()
    db.refresh(interview)
    return interview


def get_my_interviews(db: Session, student_id: int) -> list[dict]:
    interviews = (
        db.query(Interview)
        .join(Interview.application)
        .filter(Interview.application.has(student_id=student_id))
        .all()
    )

    result = []
    for iv in interviews:
        result.append({
            "id": iv.id,
            "application_id": iv.application_id,
            "job_title": iv.application.job.title,
            "company_name": iv.application.job.company.company_name,
            "scheduled_at": iv.scheduled_at,
            "mode": iv.mode,
            "location_or_link": iv.location_or_link,
            "notes": iv.notes,
            "result": iv.result,
        })
    return result