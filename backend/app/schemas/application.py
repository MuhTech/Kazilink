from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.application import AppStatus
from app.schemas.job import JobOut
from app.schemas.user import UserOut


class ApplicationCreate(BaseModel):
    message: str = ""


class ApplicationOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    job_id: int
    status: AppStatus
    message: str
    created_at: datetime
    job: JobOut
    worker: UserOut