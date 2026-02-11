"""Processing pipeline: normalize (in ingestion), correlate, compliance, AI. Stubs for MVP."""

from .alerts import evaluate_alerts

__all__ = ["evaluate_alerts"]
