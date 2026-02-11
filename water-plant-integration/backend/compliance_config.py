"""
Compliance CSV config: column mapping and order for WIMS export.
Read from COMPLIANCE_CSV_COLUMNS (JSON env) or config/compliance_columns.json.
Returns list of (csv_header, our_field_key) in order.
"""

import json
import os
from pathlib import Path
from typing import List, Tuple, Union

# Default columns when no config
DEFAULT_COLUMNS: List[Tuple[str, str]] = [
    ("tag", "tag"),
    ("value", "value"),
    ("unit", "unit"),
    ("timestamp", "timestamp"),
]

# Our reading dict keys (what we have in compliance_export data)
ALLOWED_KEYS = {"tag", "value", "unit", "timestamp"}


def _parse_config(raw: Union[list, dict]) -> List[Tuple[str, str]]:
    """Parse JSON config: list of column names or dict {csv_header: our_tag_name}. Returns [(header, our_key), ...]."""
    if isinstance(raw, list):
        out = []
        for name in raw:
            if isinstance(name, str) and name in ALLOWED_KEYS:
                out.append((name, name))
        return out if out else DEFAULT_COLUMNS
    if isinstance(raw, dict):
        out = []
        for csv_header, our_key in raw.items():
            if isinstance(csv_header, str) and isinstance(our_key, str) and our_key in ALLOWED_KEYS:
                out.append((str(csv_header), our_key))
        return out if out else DEFAULT_COLUMNS
    return DEFAULT_COLUMNS


def get_compliance_csv_columns() -> List[Tuple[str, str]]:
    """
    Load compliance CSV column config. Order of resolution:
    1. COMPLIANCE_CSV_COLUMNS env (JSON string)
    2. config/compliance_columns.json (if exists)
    3. Default ["tag", "value", "unit", "timestamp"]
    """
    env_val = os.environ.get("COMPLIANCE_CSV_COLUMNS", "").strip()
    if env_val:
        try:
            raw = json.loads(env_val)
            return _parse_config(raw)
        except (json.JSONDecodeError, TypeError):
            pass
    config_path = Path(__file__).parent / "config" / "compliance_columns.json"
    if config_path.exists():
        try:
            with open(config_path, encoding="utf-8") as f:
                raw = json.load(f)
            return _parse_config(raw)
        except (json.JSONDecodeError, TypeError, OSError):
            pass
    return DEFAULT_COLUMNS
