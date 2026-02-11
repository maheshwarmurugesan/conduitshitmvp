"""E-Log REST API routes."""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from .connector import ENTRY_TYPES
from .repository import create_entry, get_entry, list_entries
from .schemas import LogEntryCreate, LogEntryListResponse, LogEntryResponse

from database import get_session
from auth import get_current_user, CurrentUser

router = APIRouter(prefix="/elog", tags=["E-Log"])


def _entry_to_response(entry):
    return LogEntryResponse(
        id=entry.id,
        plant_id=entry.plant_id,
        operator_id=entry.operator_id,
        operator_name=entry.operator_name,
        entry_type=entry.entry_type,
        body=entry.body,
        created_at=entry.created_at,
        metadata=entry.metadata_,
    )


@router.post("/entries", response_model=LogEntryResponse)
def create_log_entry(payload: LogEntryCreate, db: Session = Depends(get_session), current_user: CurrentUser = Depends(get_current_user)):
    """Create a new log entry. Used by UI or by other connectors (e.g. after sync)."""
    # Enforce plant from auth so client cannot create entries for another plant
    payload = payload.model_copy(update={"plant_id": current_user.plant_id})
    entry = create_entry(db, payload)
    return _entry_to_response(entry)


@router.get("/entries/{entry_id}", response_model=LogEntryResponse)
def read_log_entry(entry_id: int, db: Session = Depends(get_session), current_user: CurrentUser = Depends(get_current_user)):
    """Get a single log entry by id."""
    entry = get_entry(db, entry_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Log entry not found")
    if current_user.role != "admin" and entry.plant_id != current_user.plant_id:
        raise HTTPException(status_code=404, detail="Log entry not found")
    return _entry_to_response(entry)


@router.get("/entries", response_model=LogEntryListResponse)
def list_log_entries(
    operator_id: Optional[str] = Query(None),
    entry_type: Optional[str] = Query(None),
    from_time: Optional[datetime] = Query(None),
    to_time: Optional[datetime] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_session),
    current_user: CurrentUser = Depends(get_current_user),
):
    """List log entries with optional filters (plant from auth, operator, type, time range)."""
    plant_id = None if current_user.role == "admin" else current_user.plant_id
    entries, total = list_entries(
        db,
        plant_id=plant_id,
        operator_id=operator_id,
        entry_type=entry_type,
        from_time=from_time,
        to_time=to_time,
        limit=limit,
        offset=offset,
    )
    return LogEntryListResponse(
        entries=[_entry_to_response(e) for e in entries],
        total=total,
        limit=limit,
        offset=offset,
    )


@router.get("/entry-types")
def get_entry_types(current_user: CurrentUser = Depends(get_current_user)):
    """Return standard entry types (for UI dropdowns or validation)."""
    return {"entry_types": list(ENTRY_TYPES.keys()), "labels": ENTRY_TYPES}
