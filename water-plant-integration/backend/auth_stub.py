"""Stub auth: no real SSO. Operator name + plant for session. Replace with Plant SSO/badge when available."""

from typing import Optional

from pydantic import BaseModel


class OperatorSession(BaseModel):
    operator_id: str
    operator_name: Optional[str] = None
    plant_id: Optional[str] = None


def validate_operator(operator_id: str, operator_name: Optional[str] = None, plant_id: Optional[str] = None) -> OperatorSession:
    """Accept operator id (and optional name/plant). In MVP we trust the client; later use real auth."""
    return OperatorSession(operator_id=operator_id, operator_name=operator_name or "Operator", plant_id=plant_id or "default_plant")
