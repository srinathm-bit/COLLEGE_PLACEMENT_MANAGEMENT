from fastapi import FastAPI,Request
import logging
from app.api.admin_application import router as admin_application_router
from app.api.auth_student import router as auth_student_router
from app.core.admin_seed import seed_admin_user
from app.core.config import settings
from app.db.session import SessionLocal
from app.api.student import router as student_router
from app.api.admin_student import router as admin_student_router
from app.api.auth_company import router as auth_company_router
from app.api.company import router as company_router
from app.api.admin_company import router as admin_company_router
from fastapi.middleware.cors import CORSMiddleware

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from app.api.department import router as department_router

app = FastAPI(
    title="College Placement Management System (CPMS)",
    description="API-first backend for managing student placements, companies, and interviews.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev only — restrict this to your actual frontend URL before real deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_student_router)
app.include_router(student_router)
app.include_router(admin_student_router)
app.include_router(auth_company_router)
app.include_router(company_router)
app.include_router(admin_company_router)
app.include_router(department_router)
app.include_router(admin_application_router)

logger = logging.getLogger("uvicorn.error")

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

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    first_error = exc.errors()[0]
    field = " -> ".join(str(loc) for loc in first_error["loc"])
    message = f"{field}: {first_error['msg']}"
    return JSONResponse(status_code=422, content={"detail": message})

@app.exception_handler(Exception)
async def internal_server_error_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}")
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})      