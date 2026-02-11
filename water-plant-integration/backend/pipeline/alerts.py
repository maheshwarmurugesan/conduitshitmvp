"""Simple alert rules: e.g. vibration > threshold. Runs after ingestion."""

from sqlalchemy.orm import Session

from models_platform import Reading, Alert

# Thresholds (MVP: hardcoded; later from config per plant).
THRESHOLDS = {
    "pump3_vibration": {"max": 0.8, "unit": "in/s", "issue_type": "vibration", "severity": "warning"},
    "effluent_chlorine": {"min": 0.5, "max": 4.0, "unit": "ppm", "issue_type": "chlorine", "severity": "warning"},
}


def evaluate_alerts(db: Session, plant_id: str | None = None) -> list[int]:
    """Evaluate latest readings and create alerts if thresholds exceeded. Returns list of new alert IDs."""
    q = db.query(Reading).filter(Reading.source == "scada")
    if plant_id:
        q = q.filter(Reading.plant_id == plant_id)
    rows = q.order_by(Reading.created_at.desc()).all()
    by_tag = {}
    for r in rows:
        if r.tag not in by_tag:
            by_tag[r.tag] = r
    new_ids = []
    for tag, cfg in THRESHOLDS.items():
        r = by_tag.get(tag)
        if not r:
            continue
        if "max" in cfg and r.value > cfg["max"]:
            alert = Alert(
                plant_id=plant_id,
                asset_name=tag.split("_")[0].capitalize() + " " + tag.split("_")[1] if "_" in tag else tag,
                issue_type=cfg["issue_type"],
                severity=cfg.get("severity", "warning"),
                message=f"{tag} = {r.value} {cfg.get('unit', '')} (max {cfg['max']})",
                scada_snapshot={"tag": tag, "value": r.value, "unit": r.unit},
                status="open",
            )
            db.add(alert)
            db.flush()
            new_ids.append(alert.id)
        elif "min" in cfg and r.value < cfg["min"]:
            alert = Alert(
                plant_id=plant_id,
                asset_name="Effluent",
                issue_type=cfg["issue_type"],
                severity=cfg.get("severity", "warning"),
                message=f"{tag} = {r.value} (min {cfg['min']})",
                scada_snapshot={"tag": tag, "value": r.value, "unit": r.unit},
                status="open",
            )
            db.add(alert)
            db.flush()
            new_ids.append(alert.id)
    db.commit()
    return new_ids
