from fastapi import FastAPI

from app.api.auth_student import router as auth_student_router
from app.core.admin_seed import seed_admin_user
from app.core.config import settings
from app.db.session import SessionLocal
from app.api.student import router as student_router
from app.api.admin_student import router as admin_student_router

app = FastAPI(
    title="College Placement Management System (CPMS)",
    description="API-first backend for managing student placements, companies, and interviews.",
    version="0.1.0",
)

app.include_router(auth_student_router)
app.include_router(student_router)
app.include_router(admin_student_router)

@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        seed_admin_user(db)
    finally:
        db.close()


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "env": settings.ENV}