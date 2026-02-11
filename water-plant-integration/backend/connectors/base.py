"""
Connector base interface. All vendor-specific connectors must implement:
- test_connection()
- fetch_data()
- normalize()
- push_data() [where applicable]
"""

from abc import ABC, abstractmethod
from typing import Any, Optional

# Normalized shapes used across connectors
ScadaReadingRow = dict[str, Any]  # timestamp, tag_name, value, unit, quality, alarm_state
AlarmEventRow = dict[str, Any]   # timestamp, tag_name, alarm_state, message, etc.
WorkOrderPayload = dict[str, Any]  # asset_id, asset_name, description, priority, source_alarm_id, created_by_system


class BaseConnector(ABC):
    """Base for all connectors. Vendor logic lives in subclasses."""

    @abstractmethod
    def test_connection(self) -> tuple[bool, Optional[str]]:
        """Returns (success, error_message)."""
        ...

    @abstractmethod
    def fetch_data(self, **kwargs: Any) -> list[dict[str, Any]]:
        """Fetch raw data from the system. Returns list of raw records."""
        ...

    def normalize(self, raw: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Convert raw records to normalized schema. Override per connector."""
        return raw

    def push_data(self, payload: dict[str, Any], **kwargs: Any) -> tuple[bool, Optional[str]]:
        """Push data to the system (e.g. WIMS submit, CMMS create WO). Override where applicable."""
        return True, None
