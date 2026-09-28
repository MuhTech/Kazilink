from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401  (registers tables)
from app.core.config import settings
from app.database import Base, engine
from app.routers import applications, auth, job

Base.metadata.create_all(bind=engine)

app = FastAPI(title="KAZILINK API")
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_list,
                   allow_methods=["*"], allow_headers=["*"])

app.include_router(auth.router)
app.include_router(job.router)
app.include_router(applications.router)


@app.get("/health")
def health():
    return {"status": "ok"}