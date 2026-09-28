import enum
from sqlalchemy import Column, Enum, Integer, String
from app.database import Base


class Role(str, enum.Enum):
    worker = "worker"
    employer = "employer"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(Role), nullable=False)