"""E-Log repository: persistence for log entries."""

from datetime import datetime
from typing import Optional

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from .models import LogEntry
from .schemas import LogEntryCreate


def create_entry(db: Session, payload: LogEntryCreate) -> LogEntry:
    """Persist a new log entry."""
    entry = LogEntry(
        plant_id=payload.plant_id,
        operator_id=payload.operator_id,
        operator_name=payload.operator_name,
        entry_type=payload.entry_type,
        body=payload.body,
        metadata_=payload.metadata,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_entry(db: Session, entry_id: int) -> Optional[LogEntry]:
    """Get a single log entry by id."""
    return db.get(LogEntry, entry_id)


def list_entries(
    db: Session,
    *,
    plant_id: Optional[str] = None,
    operator_id: Optional[str] = None,
    entry_type: Optional[str] = None,
    from_time: Optional[datetime] = None,
    to_time: Optional[datetime] = None,
    limit: int = 50,
    offset: int = 0,
) -> tuple[list[LogEntry], int]:
    """List log entries with optional filters. Returns (entries, total_count)."""
    q = select(LogEntry)
    count_q = select(func.count()).select_from(LogEntry)

    if plant_id is not None:
        q = q.where(LogEntry.plant_id == plant_id)
        count_q = count_q.where(LogEntry.plant_id == plant_id)
    if operator_id is not None:
        q = q.where(LogEntry.operator_id == operator_id)
        count_q = count_q.where(LogEntry.operator_id == operator_id)
    if entry_type is not None:
        q = q.where(LogEntry.entry_type == entry_type)
        count_q = count_q.where(LogEntry.entry_type == entry_type)
    if from_time is not None:
        q = q.where(LogEntry.created_at >= from_time)
        count_q = count_q.where(LogEntry.created_at >= from_time)
    if to_time is not None:
        q = q.where(LogEntry.created_at <= to_time)
        count_q = count_q.where(LogEntry.created_at <= to_time)

    total = db.scalar(count_q) or 0
    q = q.order_by(LogEntry.created_at.desc()).limit(limit).offset(offset)
    entries = list(db.scalars(q).all())
    return entries, total
