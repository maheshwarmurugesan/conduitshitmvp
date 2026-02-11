"""
CMMS connector. Primary: Maintenance Connection. Secondary: SAP (stub).
Generic interface: create work orders, map asset names → CMMS asset IDs.
TODO: Maintenance Connection API details (endpoint, auth) when available.
"""

import os
import time
from typing import Any, Optional, TYPE_CHECKING

from .base import BaseConnector, WorkOrderPayload

if TYPE_CHECKING:
    from sqlalchemy.orm import Session


def _stub_create(
    asset_name: str,
    description: str,
    priority: str,
    assignee_id: Optional[str],
    asset_id: Optional[str],
    source_alarm_id: Optional[int],
    created_by_system: bool,
    scada_snapshot: Optional[dict[str, Any]],
    plant_id: Optional[str],
) -> tuple[bool, Optional[str], Optional[str]]:
    """Single attempt: call CMMS (stub or real API). Returns (success, wo_id, error)."""
    # For testing: set CMMS_FORCE_FAILURE=1 to simulate failure and verify retry + log
    if os.environ.get("CMMS_FORCE_FAILURE", "").strip() == "1":
        return False, None, "forced failure (CMMS_FORCE_FAILURE=1)"
    fake_wo_id = "WO-MC-STUB-2026-0001"
    return True, fake_wo_id, None


def _create_with_retry(
    asset_name: str,
    description: str,
    priority: str = "high",
    assignee_id: Optional[str] = None,
    asset_id: Optional[str] = None,
    source_alarm_id: Optional[int] = None,
    created_by_system: bool = True,
    scada_snapshot: Optional[dict[str, Any]] = None,
    plant_id: Optional[str] = None,
    db: Optional["Session"] = None,
) -> tuple[bool, Optional[str], Optional[str]]:
    """Max 3 attempts, backoff 1s, 2s. On final failure log to audit_logs if db provided."""
    payload_snapshot = {
        "asset_name": asset_name,
        "description": description,
        "priority": priority,
        "assignee_id": assignee_id,
        "asset_id": asset_id,
        "source_alarm_id": source_alarm_id,
        "plant_id": plant_id,
    }
    last_error: Optional[str] = None
    for attempt in range(3):
        ok, wo_id, err = _stub_create(
            asset_name=asset_name,
            description=description,
            priority=priority,
            assignee_id=assignee_id,
            asset_id=asset_id,
            source_alarm_id=source_alarm_id,
            created_by_system=created_by_system,
            scada_snapshot=scada_snapshot,
            plant_id=plant_id,
        )
        if ok:
            return True, wo_id, None
        last_error = err
        if attempt < 2:
            time.sleep(1 * (attempt + 1))  # 1s, 2s backoff
    # Final failure: log to audit_logs if db provided
    if db is not None:
        from models_platform import AuditLog
        audit = AuditLog(
            plant_id=plant_id,
            action="cmms_create_failed",
            actor_id=None,
            actor_role=None,
            payload={"payload": payload_snapshot, "error": last_error, "attempts": 3},
        )
        db.add(audit)
        db.commit()
    return False, None, last_error


class CmmsConnector(BaseConnector):
    """REST-based CMMS connector. Implements work order creation, retry + failure logging."""

    def test_connection(self) -> tuple[bool, Optional[str]]:
        """Test CMMS API reachable. Stub: True. Real: GET health or auth check."""
        return True, None

    def fetch_data(self, **kwargs: Any) -> list[dict[str, Any]]:
        """CMMS is push-only for our use (create WO). No fetch_data for WO list in phase 1."""
        return []

    def push_data(self, payload: dict[str, Any], **kwargs: Any) -> tuple[bool, Optional[str]]:
        """Create work order. Payload: asset_id, asset_name, description, priority, source_alarm_id, created_by_system."""
        ok, wo_id, err = self.create_work_order(
            asset_name=payload.get("asset_name", ""),
            description=payload.get("description", ""),
            priority=payload.get("priority", "high"),
            assignee_id=payload.get("assignee_id"),
            asset_id=payload.get("asset_id"),
            source_alarm_id=payload.get("source_alarm_id"),
            created_by_system=payload.get("created_by_system", True),
            **kwargs,
        )
        if not ok:
            return False, err
        return True, None

    def create_work_order(
        self,
        asset_name: str,
        description: str,
        priority: str = "high",
        assignee_id: Optional[str] = None,
        asset_id: Optional[str] = None,
        source_alarm_id: Optional[int] = None,
        created_by_system: bool = True,
        scada_snapshot: Optional[dict[str, Any]] = None,
        plant_id: Optional[str] = None,
        db: Optional["Session"] = None,
        **kwargs: Any,
    ) -> tuple[bool, Optional[str], Optional[str]]:
        """Create work order in CMMS with retry (max 3 attempts, backoff 1s, 2s). On final failure log to audit_logs."""
        return _create_with_retry(
            asset_name=asset_name,
            description=description,
            priority=priority,
            assignee_id=assignee_id,
            asset_id=asset_id,
            source_alarm_id=source_alarm_id,
            created_by_system=created_by_system,
            scada_snapshot=scada_snapshot,
            plant_id=plant_id,
            db=db,
        )


# Backwards compatibility
def create_work_order(
    asset_name: str,
    description: str,
    priority: str = "high",
    assignee_id: Optional[str] = None,
    scada_snapshot: Optional[dict[str, Any]] = None,
    plant_id: Optional[str] = None,
    db: Optional["Session"] = None,
) -> tuple[bool, Optional[str], Optional[str]]:
    return cmms_connector.create_work_order(
        asset_name=asset_name,
        description=description,
        priority=priority,
        assignee_id=assignee_id,
        scada_snapshot=scada_snapshot,
        plant_id=plant_id,
        db=db,
    )


def check_connection() -> tuple[bool, Optional[str]]:
    return cmms_connector.test_connection()


cmms_connector = CmmsConnector()
