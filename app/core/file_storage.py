import re
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

UPLOAD_ROOT = Path("uploads/resumes")
ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_RESUME_BYTES = 5 * 1024 * 1024  # 5 MB


def _safe_filename(original_name: str) -> str:
    name = Path(original_name).name  # strip any path components
    name = re.sub(r"[^A-Za-z0-9._-]", "_", name)
    return name or "resume"


async def save_resume_file(student_id: int, upload: UploadFile) -> tuple[str, str]:
    """
    Validates and saves an uploaded resume to disk.
    Returns (stored_filename, absolute_path_as_string).
    """
    ext = Path(upload.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(sorted(ALLOWED_EXTENSIONS))}",
        )

    contents = await upload.read()
    if len(contents) > MAX_RESUME_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume file too large (max 5 MB)",
        )

    student_dir = UPLOAD_ROOT / str(student_id)
    student_dir.mkdir(parents=True, exist_ok=True)

    safe_name = _safe_filename(upload.filename or f"resume{ext}")
    dest_path = student_dir / safe_name

    dest_path.write_bytes(contents)
    return safe_name, str(dest_path)