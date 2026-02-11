"""Shared Pydantic schemas for dashboard, readings, alerts, work orders."""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field, field_validator

# Max lengths and validation: free text 2000, names/ids 256. No control chars (ASCII 0-31, 127).
MAX_FREE_TEXT = 2000
MAX_NAME = 256


def _no_control_chars(v: Optional[str]) -> Optional[str]:
    """Reject control characters (ASCII 0-31, 127). Allow printable ASCII + UTF-8."""
    if v is None or (isinstance(v, str) and v == ""):
        return v
    s = str(v)
    if any(ord(c) < 32 or ord(c) == 127 for c in s):
        raise ValueError("Control characters not allowed")
    return s


# ----- System status (for "All systems connected?" on dashboard) -----
class SystemStatus(BaseModel):
    name: str
    connected: bool
    last_checked: Optional[datetime] = None
    error: Optional[str] = None


# ----- Readings (ingestion → dashboard) -----
class ReadingOut(BaseModel):
    tag: str
    value: float
    unit: Optional[str] = None
    source: str
    last_updated: Optional[datetime] = None


# ----- Morning review: approve & sync (operator_id/plant_id from auth) -----
class MorningReviewApprove(BaseModel):
    overrides: Optional[dict[str, float]] = None  # tag -> value if operator corrects (keys max 256, no control chars)

    @field_validator("overrides")
    @classmethod
    def overrides_keys_valid(cls, v: Optional[dict[str, float]]) -> Optional[dict[str, float]]:
        if v is None:
            return v
        for key in v:
            if len(key) > MAX_NAME:
                raise ValueError(f"Override key too long (max {MAX_NAME})")
            if any(ord(c) < 32 or ord(c) == 127 for c in key):
                raise ValueError("Control characters not allowed in override keys")
        return v


# ----- Alerts -----
class AlertOut(BaseModel):
    id: int
    asset_name: str
    issue_type: str
    severity: str
    message: Optional[str] = None
    status: str
    created_at: datetime
    scada_snapshot: Optional[dict[str, Any]] = None

    model_config = {"from_attributes": True}


class AlertListResponse(BaseModel):
    alerts: list[AlertOut]
    total: int


# ----- Work order (create from alert; operator_id/plant_id from auth) -----
class WorkOrderCreate(BaseModel):
    alert_id: int
    assignee_id: Optional[str] = Field(None, max_length=MAX_NAME)
    priority: Optional[str] = Field(None, max_length=64)
    notes: Optional[str] = Field(None, max_length=MAX_FREE_TEXT)

    @field_validator("assignee_id", "priority", "notes")
    @classmethod
    def no_control_chars(cls, v: Optional[str]) -> Optional[str]:
        return _no_control_chars(v)


class WorkOrderCreated(BaseModel):
    success: bool
    work_order_id: Optional[str] = None  # external ID (e.g. Fiix)
    message: Optional[str] = None


class WorkOrderOut(BaseModel):
    id: int
    external_wo_id: Optional[str] = None
    alert_id: Optional[int] = None
    plant_id: Optional[str] = None
    created_at: datetime
    payload_sent: Optional[dict[str, Any]] = None

    model_config = {"from_attributes": True}


class WorkOrderListResponse(BaseModel):
    work_orders: list[WorkOrderOut]
    total: int


# ----- Shift handoff -----
class ShiftSummary(BaseModel):
    shift_id: Optional[str] = None
    operator_id: str
    operator_name: Optional[str] = None
    syncs_count: int = 0
    alerts_handled: int = 0
    work_orders_created: int = 0
    time_saved_minutes: Optional[int] = None


# ----- Shift sign-off (operator_id/plant_id from auth) -----
class ShiftSignOff(BaseModel):
    final_notes: Optional[str] = Field(None, max_length=MAX_FREE_TEXT)

    @field_validator("final_notes")
    @classmethod
    def no_control_chars(cls, v: Optional[str]) -> Optional[str]:
        return _no_control_chars(v)
