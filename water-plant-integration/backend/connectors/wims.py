"""
WIMS / Compliance connector. Reality: assume NO public API; support CSV / structured export.
Compliance data builder + operator approval step; audit log for every submitted value.
TODO: Configurable CSV schema when WIMS format is known.
"""

from typing import Any, Optional

from .base import BaseConnector


class WimsConnector(BaseConnector):
    """WIMS: no push API assumed. We build compliance data + CSV export; operator approves before export."""

    def test_connection(self) -> tuple[bool, Optional[str]]:
        """WIMS has no public API in spec; connection = N/A for CSV export."""
        return False, "WIMS not configured (no API; use compliance/export CSV)"

    def fetch_data(self, **kwargs: Any) -> list[dict[str, Any]]:
        return []

    def push_data(self, payload: dict[str, Any], **kwargs: Any) -> tuple[bool, Optional[str]]:
        """Stub: no direct push. Real flow: POST /compliance/export generates CSV for manual upload."""
        return True, None


def submit_readings(
    plant_id: Optional[str],
    readings: dict[str, float],
    operator_id: str,
    timestamp: Optional[str] = None,
) -> tuple[bool, Optional[str]]:
    ok, err = wims_connector.push_data({"plant_id": plant_id, "readings": readings, "operator_id": operator_id})
    return ok, err


def check_connection() -> tuple[bool, Optional[str]]:
    return wims_connector.test_connection()


wims_connector = WimsConnector()
