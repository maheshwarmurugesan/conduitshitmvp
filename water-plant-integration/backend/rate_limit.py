"""
Simple in-memory rate limiter per IP. Max 60 requests per minute per key.
Use as Depends(check_rate_limit) on sensitive POST endpoints.
"""

import time
from typing import Dict, List

from fastapi import Request, HTTPException

# key -> list of timestamps in the current window
_storage: Dict[str, List[float]] = {}

WINDOW_SECONDS = 60.0
MAX_PER_WINDOW = 60


def _get_key(request: Request) -> str:
    """Rate limit key: client IP."""
    if request.client:
        return request.client.host or "unknown"
    return "unknown"


def check_rate_limit(request: Request) -> None:
    """
    Dependency: enforce max 60 requests per minute per IP.
    Drops timestamps older than WINDOW_SECONDS, then allows request if count < MAX_PER_WINDOW else 429.
    """
    key = _get_key(request)
    now = time.time()
    cutoff = now - WINDOW_SECONDS
    if key not in _storage:
        _storage[key] = []
    times = _storage[key]
    # drop timestamps outside window
    times[:] = [t for t in times if t > cutoff]
    if len(times) >= MAX_PER_WINDOW:
        raise HTTPException(status_code=429, detail="Too many requests. Try again later.")
    times.append(now)
