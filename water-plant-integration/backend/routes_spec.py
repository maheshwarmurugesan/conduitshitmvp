"""
Spec API endpoints:
POST /scada/test
POST /scada/poll
POST /alerts/process
POST /work-orders/create (already in routes_platform)
POST /compliance/export
POST /logs/write

Security: roles Operator, Supervisor, Admin. Only supervisors approve (stub: header X-Role).
"""

import csv
import io
from datetime import datetime
from typing import Any, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.orm import Session

from database import get_session
from auth import get_current_user, CurrentUser
from compliance_config import get_compliance_csv_columns
from rate_limit import check_rate_limit
from connectors import scada_connector, cmms_connector
from connectors.scada import scada_connector as scada
from models_platform import Reading, ScadaReading, Alert, WorkOrderRecord, AuditLog
from ingestion.service import ingest_scada_latest
from pipeline.alerts import evaluate_alerts
from elog.connector import create_log_entry
from elog.repository import create_entry
from elog.schemas import LogEntryCreate

router = APIRouter(prefix="/api", tags=["Spec APIs"])


def require_supervisor(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    """Only Supervisor or Admin can approve/export. Role from auth only."""
    if current_user.role not in ("supervisor", "admin"):
        raise HTTPException(status_code=403, detail="Only Supervisor or Admin can approve data")
    return current_user


# ----- POST /scada/test -----
@router.post("/scada/test")
def scada_test(current_user: CurrentUser = Depends(get_current_user)):
    """Test SCADA connection (OPC UA endpoint)."""
    ok, err = scada_connector.test_connection()
    return {"connected": ok, "error": err}


# ----- POST /scada/poll -----
@router.post("/scada/poll")
def scada_poll(
    db: Session = Depends(get_session),
    current_user: CurrentUser = Depends(get_current_user),
    _rate_limit=Depends(check_rate_limit),
):
    """Poll SCADA: fetch_data → normalize → store ScadaReading + Reading cache. Returns count."""
    plant_id = current_user.plant_id
    raw = scada_connector.fetch_data(plant_id=plant_id)
    normalized = scada_connector.normalize(raw)
    count = 0
    for n in normalized:
        ts = n.get("timestamp") or datetime.utcnow()
        sr = ScadaReading(
            plant_id=plant_id,
            timestamp=ts,
            tag_name=n.get("tag_name", ""),
            value=float(n.get("value", 0)),
            unit=n.get("unit"),
            quality=n.get("quality"),
            alarm_state=n.get("alarm_state"),
        )
        db.add(sr)
        # Also write to legacy Reading cache for dashboard
        r = Reading(
            plant_id=plant_id,
            source="scada",
            tag=n.get("tag_name", ""),
            value=float(n.get("value", 0)),
            unit=n.get("unit"),
            raw_tag=n.get("tag_name"),
        )
        db.add(r)
        count += 1
    db.commit()
    return {"readings_stored": count}


# ----- POST /alerts/process -----
@router.post("/alerts/process")
def alerts_process(
    db: Session = Depends(get_session),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Process readings into alerts (threshold rules). Run after scada/poll."""
    count = ingest_scada_latest(db, current_user.plant_id)
    new_ids = evaluate_alerts(db, current_user.plant_id)
    return {"readings_evaluated": count, "new_alerts": len(new_ids), "alert_ids": new_ids}


# ----- POST /compliance/export -----
class ComplianceExportBody(BaseModel):
    """Optional overrides; identity from current_user."""

    pass


@router.post("/compliance/export")
def compliance_export(
    body: ComplianceExportBody,
    db: Session = Depends(get_session),
    current_user: CurrentUser = Depends(require_supervisor),
    _rate_limit=Depends(check_rate_limit),
):
    """Generate CSV for WIMS upload. Only Supervisor or Admin can export. Audit log for every submitted value."""
    # Build readings data (tag, value, unit, timestamp)
    q = db.query(Reading).filter(Reading.source == "scada")
    if current_user.role != "admin":
        q = q.filter(Reading.plant_id == current_user.plant_id)
    rows = q.order_by(Reading.created_at.desc()).limit(100).all()
    by_tag = {}
    for r in rows:
        if r.tag not in by_tag:
            by_tag[r.tag] = r
    readings = [{"tag": r.tag, "value": r.value, "unit": r.unit or "", "timestamp": r.created_at.isoformat()} for r in by_tag.values()]

    # Config: column mapping and order (env COMPLIANCE_CSV_COLUMNS or config/compliance_columns.json)
    columns = get_compliance_csv_columns()
    fieldnames = [header for header, _ in columns]

    # Build CSV rows from config: row[csv_header] = reading[our_key]
    data = []
    for r in readings:
        row = {}
        for header, our_key in columns:
            row[header] = r.get(our_key, "")
        data.append(row)

    # Audit log (identity from auth only)
    audit = AuditLog(
        plant_id=current_user.plant_id,
        action="compliance_export",
        actor_id=current_user.operator_id,
        actor_role=current_user.role,
        payload={"row_count": len(data), "operator_name": current_user.operator_name},
    )
    db.add(audit)
    db.commit()

    # CSV with header and column order from config
    out = io.StringIO()
    w = csv.DictWriter(out, fieldnames=fieldnames)
    w.writeheader()
    w.writerows(data)
    return StreamingResponse(
        iter([out.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=compliance_export.csv"},
    )


# ----- POST /logs/write -----
def _no_control_chars(v: Optional[str]) -> Optional[str]:
    if v is None or (isinstance(v, str) and v == ""):
        return v
    s = str(v)
    if any(ord(c) < 32 or ord(c) == 127 for c in s):
        raise ValueError("Control characters not allowed")
    return s


class LogWriteBody(BaseModel):
    entry_type: str = Field(..., min_length=1, max_length=64)
    body: str = Field(..., min_length=1, max_length=2000)
    metadata: Optional[dict[str, Any]] = None

    @field_validator("entry_type", "body")
    @classmethod
    def no_control_chars(cls, v: Optional[str]) -> Optional[str]:
        return _no_control_chars(v)


@router.post("/logs/write")
def logs_write(payload: LogWriteBody, db: Session = Depends(get_session), current_user: CurrentUser = Depends(get_current_user)):
    """Write electronic log entry. Immutable audit trail. Identity from auth only."""
    entry = create_entry(
        db,
        LogEntryCreate(
            plant_id=current_user.plant_id,
            operator_id=current_user.operator_id,
            operator_name=current_user.operator_name,
            entry_type=payload.entry_type,
            body=payload.body,
            metadata=payload.metadata,
        ),
    )
    return {"success": True, "entry_id": entry.id}
