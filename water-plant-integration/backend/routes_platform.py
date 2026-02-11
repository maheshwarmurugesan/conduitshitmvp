"""API routes for dashboard, morning review, alerts, work orders, shift handoff. Maps to Mermaid flow."""

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from database import get_session
from auth import get_current_user, CurrentUser
from rate_limit import check_rate_limit
from connectors import scada_connector, lims_connector, wims_connector, cmms_connector
from connectors.wims import wims_connector as wims
from ingestion.service import ingest_scada_latest
from pipeline.alerts import evaluate_alerts
from models_platform import Reading, Alert, WorkOrderRecord
from schemas_shared import (
    SystemStatus,
    ReadingOut,
    MorningReviewApprove,
    AlertOut,
    AlertListResponse,
    WorkOrderCreate,
    WorkOrderCreated,
    WorkOrderOut,
    WorkOrderListResponse,
    ShiftSummary,
    ShiftSignOff,
)
from elog.connector import log_readings_approved, log_wo_created, log_alert_only
from connectors.cmms import cmms_connector as cmms

router = APIRouter(prefix="/api", tags=["Platform"])


def _systems_status() -> list[SystemStatus]:
    """All systems connected? Used by dashboard."""
    now = datetime.utcnow()
    out = []
    for name, conn in [
        ("SCADA", scada_connector),
        ("LIMS", lims_connector),
        ("WIMS", wims_connector),
        ("CMMS", cmms_connector),
    ]:
        ok, err = conn.test_connection()
        out.append(SystemStatus(name=name, connected=ok, last_checked=now, error=err))
    return out


@router.get("/dashboard/systems", response_model=list[SystemStatus])
def get_systems_status(current_user: CurrentUser = Depends(get_current_user)):
    """Dashboard: are SCADA, LIMS, WIMS, CMMS connected?"""
    return _systems_status()


def _scope_readings_by_plant(q, current_user: CurrentUser):
    """Restrict to current user's plant unless admin."""
    if current_user.role != "admin":
        q = q.filter(Reading.plant_id == current_user.plant_id)
    return q


@router.get("/dashboard/readings/latest", response_model=list[ReadingOut])
def get_latest_readings(
    db: Session = Depends(get_session),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Dashboard: latest readings (after normalization). Pulls from DB; run ingest first if empty."""
    q = db.query(Reading).filter(Reading.source == "scada")
    q = _scope_readings_by_plant(q, current_user)
    rows = q.order_by(Reading.created_at.desc()).limit(50).all()
    by_tag = {}
    for r in rows:
        if r.tag not in by_tag:
            by_tag[r.tag] = r
    return [
        ReadingOut(tag=r.tag, value=r.value, unit=r.unit, source=r.source, last_updated=r.created_at)
        for r in by_tag.values()
    ]


@router.post("/ingest")
def run_ingest(
    db: Session = Depends(get_session),
    current_user: CurrentUser = Depends(get_current_user),
    _rate_limit=Depends(check_rate_limit),
):
    """Trigger ingestion: pull SCADA (and optionally others), normalize, store. Then evaluate alerts."""
    count = ingest_scada_latest(db, current_user.plant_id)
    new_alert_ids = evaluate_alerts(db, current_user.plant_id)
    return {"readings_stored": count, "new_alerts": len(new_alert_ids), "alert_ids": new_alert_ids}


# ----- Morning data review: approve & sync (Supervisor or Admin only) -----
@router.post("/morning-review/approve")
def morning_review_approve(
    payload: MorningReviewApprove,
    db: Session = Depends(get_session),
    current_user: CurrentUser = Depends(get_current_user),
    _rate_limit=Depends(check_rate_limit),
):
    """Operator approved morning data. Sync to WIMS (stub) and E-Log. Only Supervisor or Admin."""
    if current_user.role not in ("supervisor", "admin"):
        raise HTTPException(status_code=403, detail="Only Supervisor or Admin can approve data")
    wims_ok, wims_err = wims.submit_readings(
        current_user.plant_id,
        payload.overrides or {},
        current_user.operator_id,
    )
    log_readings_approved(
        db,
        operator_id=current_user.operator_id,
        operator_name=current_user.operator_name,
        plant_id=current_user.plant_id,
        metadata={"wims_sync_ok": wims_ok, "wims_error": wims_err},
    )
    return {"success": True, "wims_synced": wims_ok, "message": "Data synced. 15 min saved."}


# ----- Alerts -----
@router.get("/alerts", response_model=AlertListResponse)
def list_alerts(
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_session),
    current_user: CurrentUser = Depends(get_current_user),
):
    """List alerts (open first, then by created_at desc)."""
    q = db.query(Alert)
    if current_user.role != "admin":
        q = q.filter(Alert.plant_id == current_user.plant_id)
    if status:
        q = q.filter(Alert.status == status)
    total = q.count()
    rows = q.order_by(Alert.created_at.desc()).offset(offset).limit(limit).all()
    return AlertListResponse(
        alerts=[AlertOut.model_validate(r) for r in rows],
        total=total,
    )


@router.get("/alerts/{alert_id}", response_model=AlertOut)
def get_alert(alert_id: int, db: Session = Depends(get_session), current_user: CurrentUser = Depends(get_current_user)):
    """Alert detail (for context screen: SCADA live, historical match, suggested actions)."""
    q = db.query(Alert).filter(Alert.id == alert_id)
    if current_user.role != "admin":
        q = q.filter(Alert.plant_id == current_user.plant_id)
    a = q.first()
    if not a:
        raise HTTPException(status_code=404, detail="Alert not found")
    return AlertOut.model_validate(a)


@router.post("/alerts/{alert_id}/dismiss")
def dismiss_alert(alert_id: int, reason: Optional[str] = Query(None), db: Session = Depends(get_session), current_user: CurrentUser = Depends(get_current_user)):
    """Mark alert as dismissed."""
    q = db.query(Alert).filter(Alert.id == alert_id)
    if current_user.role != "admin":
        q = q.filter(Alert.plant_id == current_user.plant_id)
    a = q.first()
    if not a:
        raise HTTPException(status_code=404, detail="Alert not found")
    a.status = "dismissed"
    a.resolved_at = datetime.utcnow()
    db.commit()
    return {"success": True}


@router.post("/alerts/{alert_id}/log-only")
def alert_log_only(
    alert_id: int,
    db: Session = Depends(get_session),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Log only path: create E-Log entry, mark alert as logged_only."""
    q = db.query(Alert).filter(Alert.id == alert_id)
    if current_user.role != "admin":
        q = q.filter(Alert.plant_id == current_user.plant_id)
    a = q.first()
    if not a:
        raise HTTPException(status_code=404, detail="Alert not found")
    log_alert_only(
        db,
        operator_id=current_user.operator_id,
        operator_name=current_user.operator_name,
        plant_id=current_user.plant_id,
        asset_name=a.asset_name,
        alert_summary=a.message or a.issue_type,
    )
    a.status = "logged_only"
    a.resolved_at = datetime.utcnow()
    db.commit()
    return {"success": True, "message": "Logged successfully."}


# ----- Work orders list -----
@router.get("/work-orders", response_model=WorkOrderListResponse)
def list_work_orders(
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_session),
    current_user: CurrentUser = Depends(get_current_user),
):
    """List work orders (created from alerts) for the current plant."""
    q = db.query(WorkOrderRecord)
    if current_user.role != "admin":
        q = q.filter(WorkOrderRecord.plant_id == current_user.plant_id)
    total = q.count()
    rows = q.order_by(WorkOrderRecord.created_at.desc()).offset(offset).limit(limit).all()
    return WorkOrderListResponse(work_orders=[WorkOrderOut.model_validate(r) for r in rows], total=total)


# ----- Work order from alert -----
@router.post("/work-orders/create", response_model=WorkOrderCreated)
def create_work_order(
    payload: WorkOrderCreate,
    db: Session = Depends(get_session),
    current_user: CurrentUser = Depends(get_current_user),
    _rate_limit=Depends(check_rate_limit),
):
    """Auto-create work order from alert: pre-fill from SCADA + AI, push to CMMS, E-Log, notify."""
    q = db.query(Alert).filter(Alert.id == payload.alert_id)
    if current_user.role != "admin":
        q = q.filter(Alert.plant_id == current_user.plant_id)
    a = q.first()
    if not a:
        raise HTTPException(status_code=404, detail="Alert not found")
    ok, wo_id, err = cmms.create_work_order(
        asset_name=a.asset_name,
        description=a.message or a.issue_type,
        priority=payload.priority or "high",
        assignee_id=payload.assignee_id,
        scada_snapshot=a.scada_snapshot,
        plant_id=current_user.plant_id or a.plant_id,
        db=db,
    )
    if not ok:
        return WorkOrderCreated(success=False, message=err)
    rec = WorkOrderRecord(
        alert_id=a.id,
        plant_id=current_user.plant_id or a.plant_id,
        external_wo_id=wo_id,
        payload_sent={"asset": a.asset_name, "description": a.message},
    )
    db.add(rec)
    log_wo_created(
        db,
        operator_id=current_user.operator_id,
        operator_name=current_user.operator_name,
        plant_id=current_user.plant_id,
        asset_name=a.asset_name,
        wo_number=wo_id,
        description=a.message,
    )
    a.status = "wo_created"
    a.resolved_at = datetime.utcnow()
    db.commit()
    return WorkOrderCreated(success=True, work_order_id=wo_id, message="Work order created. 10 min saved.")


# ----- Shift handoff -----
@router.get("/shift/summary", response_model=ShiftSummary)
def get_shift_summary(
    db: Session = Depends(get_session),
    current_user: CurrentUser = Depends(get_current_user),
):
    """AI-generated shift summary: syncs, alerts, WOs, time saved. Stub: counts from DB."""
    from elog.repository import list_entries
    elog_plant = None if current_user.role == "admin" else current_user.plant_id
    _, syncs_total = list_entries(db, plant_id=elog_plant, entry_type="readings_approved", limit=1000)
    syncs_count = syncs_total
    aq = db.query(Alert).filter(Alert.status != "open")
    if current_user.role != "admin":
        aq = aq.filter(Alert.plant_id == current_user.plant_id)
    alerts_handled = aq.count()
    wq = db.query(WorkOrderRecord)
    if current_user.role != "admin":
        wq = wq.filter(WorkOrderRecord.plant_id == current_user.plant_id)
    wo_count = wq.count()
    return ShiftSummary(
        operator_id=current_user.operator_id,
        operator_name=current_user.operator_name,
        syncs_count=syncs_count,
        alerts_handled=alerts_handled,
        work_orders_created=wo_count,
        time_saved_minutes=(syncs_count * 15) + (wo_count * 10),
    )


@router.post("/shift/sign-off")
def shift_sign_off(payload: ShiftSignOff, db: Session = Depends(get_session), current_user: CurrentUser = Depends(get_current_user)):
    """Operator sign-off: review summary, add notes, seal shift. Creates E-Log entry."""
    from elog.connector import create_log_entry
    create_log_entry(
        db,
        operator_id=current_user.operator_id,
        operator_name=current_user.operator_name,
        plant_id=current_user.plant_id,
        entry_type="shift_handoff",
        body=payload.final_notes or "Shift handoff complete.",
        metadata={"event": "shift_sign_off"},
    )
    return {"success": True, "message": "Shift handoff complete."}
