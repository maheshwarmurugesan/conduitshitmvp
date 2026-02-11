"""
SCADA connector. Target: Ignition, Wonderware, GE Historian via OPC UA.
TODO: Replace fetch_data with real OPC UA client when endpoint and tags are confirmed.
"""

import os
import socket
from datetime import datetime
from typing import Any, Optional
from urllib.parse import urlparse

from .base import BaseConnector, ScadaReadingRow

# Mock tags; in production these come from OPC UA (Ignition/Wonderware/GE Historian).
MOCK_TAGS = [
    {"raw_tag": "FlowRate_Influent_001", "value": 4.2, "unit": "MGD"},
    {"raw_tag": "Chlorine_Effluent_001", "value": 1.2, "unit": "ppm"},
    {"raw_tag": "pH_Effluent_001", "value": 7.1, "unit": ""},
    {"raw_tag": "Pump3_Vibration", "value": 0.85, "unit": "in/s"},
    {"raw_tag": "Pump3_Status", "value": 1, "unit": ""},
]

# Map tag name -> mock value/unit for config-driven mode (when OPC_UA_TAG_LIST is set).
MOCK_VALUES_BY_TAG: dict[str, tuple[float, str]] = {
    t["raw_tag"]: (t["value"], t.get("unit") or "") for t in MOCK_TAGS
}


def _get_configured_tags() -> Optional[list[str]]:
    """If OPC_UA_ENDPOINT and OPC_UA_TAG_LIST are both set, return list of tag names; else None."""
    endpoint = (os.environ.get("OPC_UA_ENDPOINT") or "").strip()
    tag_list = (os.environ.get("OPC_UA_TAG_LIST") or "").strip()
    if endpoint and tag_list:
        return [t.strip() for t in tag_list.split(",") if t.strip()]
    return None


def _check_endpoint_connectivity(url: str, timeout: float = 2.0) -> tuple[bool, Optional[str]]:
    """Simple connectivity check: for opc.tcp://host:port try socket; else return (True, None)."""
    try:
        parsed = urlparse(url)
        scheme = (parsed.scheme or "").lower()
        host = parsed.hostname or ""
        port = parsed.port
        if scheme == "opc.tcp" and host:
            if port is None:
                port = 4840  # default OPC UA port
            with socket.create_connection((host, port), timeout=timeout):
                pass
            return True, None
        # Other schemes (http, etc.) or unparseable: no stub check, assume OK for demo
        return True, None
    except (socket.timeout, OSError, ValueError) as e:
        return False, f"connection refused: {e}"


class ScadaConnector(BaseConnector):
    """OPC UA–based SCADA connector. Config-driven: OPC_UA_ENDPOINT + OPC_UA_TAG_LIST when set."""

    def test_connection(self) -> tuple[bool, Optional[str]]:
        """Test connection to SCADA. If OPC_UA_ENDPOINT set, try connectivity; else OK for demo."""
        endpoint = (os.environ.get("OPC_UA_ENDPOINT") or "").strip()
        if endpoint:
            return _check_endpoint_connectivity(endpoint)
        return True, None

    def fetch_data(self, plant_id: Optional[str] = None, **kwargs: Any) -> list[dict[str, Any]]:
        """Fetch raw readings. If OPC_UA_ENDPOINT + OPC_UA_TAG_LIST set, return mock per tag list; else MOCK_TAGS."""
        now = datetime.utcnow()
        tags = _get_configured_tags()
        if tags is not None:
            # Config-driven: one mock row per configured tag name.
            out: list[dict[str, Any]] = []
            for raw_tag in tags:
                value, unit = MOCK_VALUES_BY_TAG.get(raw_tag, (0.0, ""))
                out.append({
                    "raw_tag": raw_tag,
                    "value": value,
                    "unit": unit,
                    "timestamp": now,
                    "quality": "good",
                    "alarm_state": None,
                    "plant_id": plant_id,
                })
            return out
        # Default: current MOCK_TAGS behavior
        return [
            {
                "raw_tag": t["raw_tag"],
                "value": t["value"],
                "unit": t.get("unit") or "",
                "timestamp": now,
                "quality": "good",
                "alarm_state": None,
                "plant_id": plant_id,
            }
            for t in MOCK_TAGS
        ]

    def normalize(self, raw: list[dict[str, Any]]) -> list[ScadaReadingRow]:
        """Normalized schema: timestamp, tag_name, value, unit, quality, alarm_state."""
        out: list[ScadaReadingRow] = []
        for r in raw:
            out.append({
                "timestamp": r.get("timestamp"),
                "tag_name": r.get("raw_tag") or r.get("tag_name", ""),
                "value": r.get("value", 0),
                "unit": r.get("unit") or "",
                "quality": r.get("quality") or "good",
                "alarm_state": r.get("alarm_state"),
            })
        return out


# Backwards compatibility
def pull_latest(plant_id: str | None = None) -> list[dict[str, Any]]:
    return scada_connector.fetch_data(plant_id=plant_id)


def check_connection() -> tuple[bool, Optional[str]]:
    return scada_connector.test_connection()


scada_connector = ScadaConnector()
