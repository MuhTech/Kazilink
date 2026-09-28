from fastapi import HTTPException
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.job import Job
from app.schemas.job import JobCreate


def create_job(db: Session, data: JobCreate, employer_id: int) -> Job:
    job = Job(**data.model_dump(), employer_id=employer_id)
    db.add(job)
    db.commit()
    db.refresh(job)
    return job


def list_jobs(db: Session, q: str | None, location: str | None) -> list[Job]:
    query = db.query(Job).filter(Job.is_open.is_(True))
    if q:
        like = f"%{q}%"
        query = query.filter(or_(Job.title.ilike(like), Job.description.ilike(like)))
    if location:
        query = query.filter(Job.location.ilike(f"%{location}%"))
    return query.order_by(Job.created_at.desc()).all()


def get_job(db: Session, job_id: int) -> Job:
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(404, "Job not found")
    return job