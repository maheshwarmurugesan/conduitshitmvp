"""E-Log Pydantic schemas for API request/response."""

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, Field, field_validator

MAX_FREE_TEXT = 2000
MAX_NAME = 256


def _no_control_chars(v: Optional[str]) -> Optional[str]:
    if v is None or (isinstance(v, str) and v == ""):
        return v
    s = str(v)
    if any(ord(c) < 32 or ord(c) == 127 for c in s):
        raise ValueError("Control characters not allowed")
    return s


class LogEntryCreate(BaseModel):
    """Request body for creating a log entry."""

    plant_id: Optional[str] = Field(None, max_length=MAX_NAME)
    operator_id: str = Field(..., min_length=1, max_length=MAX_NAME)
    operator_name: Optional[str] = Field(None, max_length=MAX_NAME)
    entry_type: str = Field(..., min_length=1, max_length=64)
    body: str = Field(..., min_length=1, max_length=MAX_FREE_TEXT)
    metadata: Optional[dict[str, Any]] = None

    @field_validator("plant_id", "operator_id", "operator_name", "entry_type", "body")
    @classmethod
    def no_control_chars(cls, v: Optional[str]) -> Optional[str]:
        return _no_control_chars(v)


class LogEntryResponse(BaseModel):
    """Response model for a single log entry."""

    id: int
    plant_id: Optional[str]
    operator_id: str
    operator_name: Optional[str]
    entry_type: str
    body: str
    created_at: datetime
    metadata: Optional[dict[str, Any]] = None

    model_config = {"from_attributes": True}


class LogEntryListResponse(BaseModel):
    """Paginated list of log entries."""

    entries: list[LogEntryResponse]
    total: int
    limit: int
    offset: int
