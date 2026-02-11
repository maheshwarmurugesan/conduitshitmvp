"""Ingestion: pull from SCADA (and later LIMS/WIMS), normalize tag names, store in DB."""

from sqlalchemy.orm import Session

from connectors.scada import scada_connector
from models_platform import Reading

# Map raw SCADA tags to normalized names (wastewater standard model).
TAG_MAP = {
    "FlowRate_Influent_001": "influent_flow",
    "Chlorine_Effluent_001": "effluent_chlorine",
    "pH_Effluent_001": "effluent_ph",
    "Pump3_Vibration": "pump3_vibration",
    "Pump3_Status": "pump3_status",
}


def ingest_scada_latest(db: Session, plant_id: str | None = None) -> int:
    """Pull latest from SCADA, normalize, upsert into readings. Returns count of readings stored."""
    raw = scada_connector.pull_latest(plant_id)
    count = 0
    for r in raw:
        raw_tag = r.get("raw_tag") or ""
        tag = TAG_MAP.get(raw_tag, raw_tag.replace(" ", "_").lower())
        reading = Reading(
            plant_id=plant_id,
            source="scada",
            tag=tag,
            value=float(r["value"]),
            unit=r.get("unit"),
            raw_tag=raw_tag,
        )
        db.add(reading)
        count += 1
    db.commit()
    return count
