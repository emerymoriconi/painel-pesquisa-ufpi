import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base
from app.dependencies import get_db, verificar_autenticacao

SQLALCHEMY_TEST_URL = "sqlite:///./test.db"

engine_test = create_engine(
    SQLALCHEMY_TEST_URL,
    connect_args={"check_same_thread": False},
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


def override_auth():
    return {"sub": "admin"}


@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine_test)
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[verificar_autenticacao] = override_auth
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=engine_test)


@pytest.fixture
def client_sem_auth(client):
    """Function-scoped: remove o mock de auth temporariamente para testar 401."""
    saved = app.dependency_overrides.pop(verificar_autenticacao, None)
    with TestClient(app) as c:
        yield c
    if saved is not None:
        app.dependency_overrides[verificar_autenticacao] = saved
