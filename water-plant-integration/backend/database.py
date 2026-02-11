"""Database session and setup. SQLite for dev; swap to Postgres for production."""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from elog.models import Base
import models_platform  # noqa: F401 - register ScadaReading, AlarmEvent, Reading, Alert, WorkOrderRecord, AuditLog

# SQLite for zero-config dev. For production use Postgres and set DATABASE_URL.
SQLITE_URL = "sqlite:///./elog.db"
engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db() -> None:
    """Create all tables."""
    Base.metadata.create_all(bind=engine)


def get_session() -> Session:
    """Dependency: yield a DB session (use in FastAPI Depends)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
