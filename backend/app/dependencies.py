from app.database import SessionLocal
from app.auth import verificar_autenticacao  # noqa: F401 — re-exportado para os routers


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
