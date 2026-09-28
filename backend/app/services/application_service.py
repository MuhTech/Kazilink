from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.application import Application
from app.services.job_services import get_job


def apply_to_job(db: Session, job_id: int, worker_id: int, message: str) -> Application:
    job = get_job(db, job_id)
    if not job.is_open:
        raise HTTPException(400, "This job is closed")
    exists = db.query(Application).filter_by(job_id=job_id, worker_id=worker_id).first()
    if exists:
        raise HTTPException(400, "You already applied to this job")
    application = Application(job_id=job_id, worker_id=worker_id, message=message)
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


def applications_for_worker(db: Session, worker_id: int) -> list[Application]:
    return db.query(Application).filter_by(worker_id=worker_id).order_by(Application.created_at.desc()).all()


def applications_for_job(db: Session, job_id: int, employer_id: int) -> list[Application]:
    job = get_job(db, job_id)
    if job.employer_id != employer_id:
        raise HTTPException(403, "Not your job")
    return db.query(Application).filter_by(job_id=job_id).all()