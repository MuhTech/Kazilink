from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.database import get_db
from app.models.user import Role, User
from app.schemas.job import JobCreate, JobOut
from app.services import job_services

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("", response_model=list[JobOut])
def list_jobs(q: str | None = None, location: str | None = None, db: Session = Depends(get_db)):
    return job_services.list_jobs(db, q, location)


@router.get("/{job_id}", response_model=JobOut)
def get_job(job_id: int, db: Session = Depends(get_db)):
    return job_services.get_job(db, job_id)


@router.post("", response_model=JobOut, status_code=201)
def create_job(data: JobCreate, db: Session = Depends(get_db),
               user: User = Depends(require_role(Role.employer))):
    return job_services.create_job(db, data, user.id)