from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class JobCreate(BaseModel):
    title: str = Field(min_length=3)
    description: str = Field(min_length=10)
    location: str
    category: str
    pay_tzs: int | None = None


class JobOut(JobCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    is_open: bool
    employer_id: int
    created_at: datetime