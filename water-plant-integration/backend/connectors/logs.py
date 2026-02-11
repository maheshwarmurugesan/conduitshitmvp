"""
Electronic log connector. If no vendor API: we use internal e-log system (already in repo).
Capabilities: shift logs, auto-entries ("Readings approved", "Work order created", "Alarm acknowledged"), immutable audit trail.
"""

from typing import Any, Optional

from .base import BaseConnector


class LogsConnector(BaseConnector):
    """Electronic logs. Internal implementation in elog/; this connector wraps it for unified interface."""

    def test_connection(self) -> tuple[bool, Optional[str]]:
        """Internal DB always available."""
        return True, None

    def fetch_data(self, **kwargs: Any) -> list[dict[str, Any]]:
        """Fetch log entries. Delegated to elog repository in routes."""
        return []

    def push_data(self, payload: dict[str, Any], **kwargs: Any) -> tuple[bool, Optional[str]]:
        """Write log entry. Delegated to elog.connector in POST /logs/write."""
        return True, None


logs_connector = LogsConnector()
