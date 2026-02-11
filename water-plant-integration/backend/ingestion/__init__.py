"""Ingestion layer: pull from connectors, normalize, store in readings table."""

from .service import ingest_scada_latest

__all__ = ["ingest_scada_latest"]
