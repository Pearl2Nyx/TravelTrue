from __future__ import annotations

import json
from datetime import datetime
from typing import Any, List, Optional

from pydantic import BaseModel, Field, ValidationError


class TravelContext(BaseModel):
    """Structured travel context extracted from screen analysis."""

    intent: str = "unknown"
    origin: Optional[str] = None
    destination: Optional[str] = None
    date: Optional[str] = None
    passengers: int = 1
    travel_class: Optional[str] = None
    platform: Optional[str] = None
    confidence: float = 0.0
    prices: List[Any] = Field(default_factory=list)


def to_json(ctx: TravelContext) -> str:
    """Serialize a TravelContext to a JSON string."""
    try:
        return ctx.model_dump_json()
    except AttributeError:
        return ctx.json()  # Pydantic v1 fallback


def from_json(data: str) -> TravelContext:
    """Deserialize a JSON string into a TravelContext.

    Returns a default TravelContext(intent="unknown", confidence=0.0) on any error.
    Never raises an exception.
    """
    try:
        return TravelContext.model_validate_json(data)
    except Exception:
        try:
            return TravelContext.parse_raw(data)  # Pydantic v1 fallback
        except Exception:
            return TravelContext(intent="unknown", confidence=0.0)


class WsMessage(BaseModel):
    """WebSocket message envelope for bidi-stream communication."""

    type: str
    payload: Any = None
    session_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
