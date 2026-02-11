"""
Auth stub: parse token from header into current user. No real OAuth yet.
Other routes will use get_current_user() next.
"""

from typing import Optional

from fastapi import Depends, HTTPException, Header

from pydantic import BaseModel


class CurrentUser(BaseModel):
    operator_id: str
    operator_name: Optional[str] = None
    plant_id: Optional[str] = None
    role: str  # operator | supervisor | admin


def _parse_token(token: str) -> CurrentUser:
    """Parse demo token: operator_id:plant_id:role (e.g. op1:default_plant:operator)."""
    parts = token.strip().split(":")
    if len(parts) != 3:
        raise ValueError("Token must be operator_id:plant_id:role")
    operator_id, plant_id, role = parts[0].strip(), parts[1].strip(), parts[2].strip().lower()
    if not operator_id or not plant_id or not role:
        raise ValueError("Token parts cannot be empty")
    if role not in ("operator", "supervisor", "admin"):
        raise ValueError("Role must be operator, supervisor, or admin")
    return CurrentUser(
        operator_id=operator_id,
        operator_name=operator_id,
        plant_id=plant_id,
        role=role,
    )


def get_current_user(
    authorization: Optional[str] = Header(None),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
) -> CurrentUser:
    """Dependency: parse token from Authorization Bearer or X-API-Key header. Returns CurrentUser or 401."""
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:].strip()
    elif x_api_key:
        token = x_api_key.strip()
    if not token:
        raise HTTPException(status_code=401, detail="Missing Authorization or X-API-Key")
    try:
        return _parse_token(token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
