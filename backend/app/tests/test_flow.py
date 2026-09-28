from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app

engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
Testing = sessionmaker(bind=engine)
Base.metadata.create_all(engine)


def override():
    db = Testing()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override
client = TestClient(app)


def token(email, role):
    client.post("/auth/register", json={"email": email, "full_name": "Test User", "password": "secret1", "role": role})
    r = client.post("/auth/login", data={"username": email, "password": "secret1"})
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


def test_full_flow():
    emp, wrk = token("e@x.com", "employer"), token("w@x.com", "worker")
    job = client.post("/jobs", headers=emp, json={
        "title": "House painter", "description": "Paint a 3 bedroom house",
        "location": "Dar es Salaam", "category": "Construction", "pay_tzs": 150000}).json()
    assert client.post("/jobs", headers=wrk, json=job).status_code == 403
    assert client.post(f"/jobs/{job['id']}/apply", headers=wrk, json={"message": "Hi"}).status_code == 201
    assert client.post(f"/jobs/{job['id']}/apply", headers=wrk, json={}).status_code == 400
    assert len(client.get(f"/jobs/{job['id']}/applications", headers=emp).json()) == 1