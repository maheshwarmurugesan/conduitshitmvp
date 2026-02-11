"""
E-Log connector: create log entries from the rest of the platform.

Use this when:
- Operator approves morning readings → log "Morning readings recorded"
- Operator creates a work order from an alert → log "WO created for Pump 3"

Stores entries in our DB. Later you can add a forwarder to an external E-Log API
(e.g. Elogger) when you have credentials and spec.
"""

from typing import Any, Optional

from sqlalchemy.orm import Session

from .repository import create_entry
from .schemas import LogEntryCreate


# Standard entry types used by the platform (extend as needed)
ENTRY_TYPES = {
    "readings_approved": "Morning readings recorded",
    "wo_created": "Work order created",
    "alert_log_only": "Alert logged (no WO)",
    "sync_wims": "Data synced to WIMS",
    "general": "General log entry",
}


def log_readings_approved(
    db: Session,
    *,
    operator_id: str,
    operator_name: Optional[str] = None,
    plant_id: Optional[str] = None,
    body: Optional[str] = None,
    metadata: Optional[dict[str, Any]] = None,
) -> int:
    """Log that an operator approved and synced morning readings."""
    payload = LogEntryCreate(
        plant_id=plant_id,
        operator_id=operator_id,
        operator_name=operator_name,
        entry_type="readings_approved",
        body=body or "Morning readings recorded and synced to WIMS.",
        metadata=metadata,
    )
    entry = create_entry(db, payload)
    return entry.id


def log_wo_created(
    db: Session,
    *,
    operator_id: str,
    operator_name: Optional[str] = None,
    plant_id: Optional[str] = None,
    asset_name: str,
    wo_number: Optional[str] = None,
    description: Optional[str] = None,
    metadata: Optional[dict[str, Any]] = None,
) -> int:
    """Log that a work order was created (e.g. from an alert)."""
    body = f"Work order created for {asset_name}."
    if wo_number:
        body += f" WO #{wo_number}."
    if description:
        body += f" {description}"
    meta = dict(metadata or {}, asset_name=asset_name)
    if wo_number:
        meta["wo_number"] = wo_number
    payload = LogEntryCreate(
        plant_id=plant_id,
        operator_id=operator_id,
        operator_name=operator_name,
        entry_type="wo_created",
        body=body,
        metadata=meta,
    )
    entry = create_entry(db, payload)
    return entry.id


def log_alert_only(
    db: Session,
    *,
    operator_id: str,
    operator_name: Optional[str] = None,
    plant_id: Optional[str] = None,
    asset_name: str,
    alert_summary: str,
    metadata: Optional[dict[str, Any]] = None,
) -> int:
    """Log that an alert was acknowledged but no work order created."""
    body = f"Alert logged for {asset_name}: {alert_summary}"
    meta = dict(metadata or {}, asset_name=asset_name)
    payload = LogEntryCreate(
        plant_id=plant_id,
        operator_id=operator_id,
        operator_name=operator_name,
        entry_type="alert_log_only",
        body=body,
        metadata=meta,
    )
    entry = create_entry(db, payload)
    return entry.id


def create_log_entry(
    db: Session,
    *,
    operator_id: str,
    entry_type: str,
    body: str,
    operator_name: Optional[str] = None,
    plant_id: Optional[str] = None,
    metadata: Optional[dict[str, Any]] = None,
) -> int:
    """Create a generic log entry. Use for custom types or one-off messages."""
    payload = LogEntryCreate(
        plant_id=plant_id,
        operator_id=operator_id,
        operator_name=operator_name,
        entry_type=entry_type,
        body=body,
        metadata=metadata,
    )
    entry = create_entry(db, payload)
    return entry.id
