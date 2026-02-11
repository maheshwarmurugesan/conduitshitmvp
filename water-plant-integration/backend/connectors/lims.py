"""LIMS connector stub. Replace with REST/DB when lab system API is available."""

from typing import Any, Optional

from .base import BaseConnector


class LimsConnector(BaseConnector):
    def test_connection(self) -> tuple[bool, Optional[str]]:
        return False, "LIMS not configured (stub)"

    def fetch_data(self, plant_id: Optional[str] = None, **kwargs: Any) -> list[dict[str, Any]]:
        return []

    def normalize(self, raw: list[dict[str, Any]]) -> list[dict[str, Any]]:
        return raw


def pull_latest(plant_id: Optional[str] = None) -> list[dict[str, Any]]:
    return lims_connector.fetch_data(plant_id=plant_id)


def check_connection() -> tuple[bool, Optional[str]]:
    return lims_connector.test_connection()


lims_connector = LimsConnector()
