"""E-Log database models."""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, String, Text, JSON
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class LogEntry(Base):
    """Single electronic log entry (operator, timestamp, type, body, metadata)."""

    __tablename__ = "log_entries"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    plant_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    operator_id: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    operator_name: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    entry_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    metadata_: Mapped[Optional[dict]] = mapped_column("metadata", JSON, nullable=True)

    def __repr__(self) -> str:
        return f"<LogEntry id={self.id} type={self.entry_type} at={self.created_at}>"
