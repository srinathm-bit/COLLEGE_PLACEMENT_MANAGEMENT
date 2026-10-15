import logging
import re
import uuid
from functools import lru_cache
from pathlib import Path

import boto3
from botocore.exceptions import BotoCoreError, ClientError
from fastapi import HTTPException, UploadFile, status
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import StreamingResponse

from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

ALLOWED_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_RESUME_BYTES = 5 * 1024 * 1024  # 5 MB
KEY_PREFIX = "resumes/"

CONTENT_TYPES = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}


@lru_cache
def _s3_client():
    if not (settings.S3_BUCKET_NAME and settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY):
        raise HTTPException(status_code=500, detail="File storage is not configured")
    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )


def _safe_filename(original_name: str) -> str:
    name = Path(original_name).name  # strip any path components
    name = re.sub(r"[^A-Za-z0-9._-]", "_", name)
    return name or "resume"


async def save_resume_file(student_id: int, upload: UploadFile) -> tuple[str, str]:
    """
    Validates a resume and uploads it to S3.
    Returns (safe_filename, s3_key).
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

    safe_name = _safe_filename(upload.filename or f"resume{ext}")
    key = f"{KEY_PREFIX}{student_id}/{uuid.uuid4().hex}_{safe_name}"

    client = _s3_client()
    try:
        await run_in_threadpool(
            lambda: client.put_object(
                Bucket=settings.S3_BUCKET_NAME,
                Key=key,
                Body=contents,
                ContentType=CONTENT_TYPES[ext],
            )
        )
    except (BotoCoreError, ClientError) as exc:
        logger.error(f"S3 upload failed: {exc}")
        raise HTTPException(status_code=502, detail="Could not upload the resume. Please try again.")

    return safe_name, key


def delete_resume_file(key: str | None) -> None:
    """Best effort: never raises, so a storage problem can't break a profile update or delete."""
    if not key or not key.startswith(KEY_PREFIX):
        return  # nothing stored, or an old local-disk path
    try:
        _s3_client().delete_object(Bucket=settings.S3_BUCKET_NAME, Key=key)
    except Exception as exc:  # noqa: BLE001
        logger.error(f"S3 delete failed for {key}: {exc}")


def resume_response(key: str | None, filename: str | None) -> StreamingResponse:
    """Streams a resume from the private bucket to the client."""
    if not key or not key.startswith(KEY_PREFIX):
        raise HTTPException(status_code=404, detail="No resume uploaded yet")

    try:
        obj = _s3_client().get_object(Bucket=settings.S3_BUCKET_NAME, Key=key)
    except ClientError as exc:
        logger.error(f"S3 download failed for {key}: {exc}")
        if exc.response.get("Error", {}).get("Code") in ("NoSuchKey", "404"):
            raise HTTPException(status_code=404, detail="Resume file not found. Please upload it again.")
        raise HTTPException(status_code=502, detail="Could not fetch the resume. Please try again.")
    except BotoCoreError as exc:
        logger.error(f"S3 download failed for {key}: {exc}")
        raise HTTPException(status_code=502, detail="Could not fetch the resume. Please try again.")

    ext = Path(key).suffix.lower()
    return StreamingResponse(
        obj["Body"].iter_chunks(chunk_size=64 * 1024),
        media_type=CONTENT_TYPES.get(ext, "application/octet-stream"),
        headers={"Content-Disposition": f'attachment; filename="{filename or Path(key).name}"'},
    )