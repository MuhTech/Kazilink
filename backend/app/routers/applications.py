from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import require_role
from app.database import get_db
from app.models.user import Role, User
from app.schemas.application import ApplicationCreate, ApplicationOut
from app.services import application_service

router = APIRouter(tags=["applications"])


@router.post("/jobs/{job_id}/apply", response_model=ApplicationOut, status_code=201)
def apply(job_id: int, data: ApplicationCreate, db: Session = Depends(get_db),
          user: User = Depends(require_role(Role.worker))):
    return application_service.apply_to_job(db, job_id, user.id, data.message)


@router.get("/applications/mine", response_model=list[ApplicationOut])
def my_applications(db: Session = Depends(get_db), user: User = Depends(require_role(Role.worker))):
    return application_service.applications_for_worker(db, user.id)


@router.get("/jobs/{job_id}/applications", response_model=list[ApplicationOut])
def job_applications(job_id: int, db: Session = Depends(get_db),
                     user: User = Depends(require_role(Role.employer))):
    return application_service.applications_for_job(db, job_id, user.id)