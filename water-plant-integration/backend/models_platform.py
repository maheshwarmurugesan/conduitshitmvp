"""Shared platform models. Uses same Base as E-Log.
Spec: ScadaReading (timestamp, tag_name, value, unit, quality, alarm_state), AlarmEvent, audit log.
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, String, Text, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from elog.models import Base


# ----- ScadaReading: normalized OPC UA–style reading -----
class ScadaReading(Base):
    """Normalized SCADA reading: timestamp, tag_name, value, unit, quality, alarm_state (optional)."""

    __tablename__ = "scada_readings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    plant_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    tag_name: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    quality: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)  # good, bad, uncertain
    alarm_state: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


# ----- AlarmEvent: from SCADA tags or historian events -----
class AlarmEvent(Base):
    """Alarm event from SCADA (tag or historian)."""

    __tablename__ = "alarm_events"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    plant_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    tag_name: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    alarm_state: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    value: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


# ----- Backwards compatibility: Reading (ingestion cache) -----
class Reading(Base):
    """Latest/cached readings from SCADA (and later LIMS/WIMS). Ingestion layer writes here."""

    __tablename__ = "readings"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    plant_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    source: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    tag: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    value: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    raw_tag: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


# ----- Audit log: every submitted value (compliance + approvals) -----
class AuditLog(Base):
    """Audit log for compliance and approvals. All actions logged."""

    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    plant_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    action: Mapped[str] = mapped_column(String(64), nullable=False, index=True)  # compliance_export, approval, etc.
    actor_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    actor_role: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    payload: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)


class Alert(Base):
    """Alerts generated from pipeline (e.g. SCADA threshold exceeded)."""

    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    plant_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    asset_name: Mapped[str] = mapped_column(String(128), nullable=False, index=True)
    issue_type: Mapped[str] = mapped_column(String(64), nullable=False, index=True)  # vibration, chlorine_high, etc.
    severity: Mapped[str] = mapped_column(String(32), nullable=False)  # critical, warning, info
    message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    scada_snapshot: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="open")  # open, wo_created, logged_only, dismissed
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class WorkOrderRecord(Base):
    """Audit record when we create a work order in CMMS (e.g. Fiix)."""

    __tablename__ = "work_order_records"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    alert_id: Mapped[Optional[int]] = mapped_column(ForeignKey("alerts.id"), nullable=True, index=True)
    plant_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True, index=True)
    external_wo_id: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)  # Fiix WO number
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow)
    payload_sent: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
