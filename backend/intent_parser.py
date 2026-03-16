"""Intent parser: converts raw Gemini response text into a TravelContext."""

from __future__ import annotations

import json
import logging
import re
from typing import Any

from backend.models import TravelContext

logger = logging.getLogger(__name__)

VALID_INTENTS = {
    "flight_search",
    "flight_results",
    "bus_search",
    "bus_results",
    "train_search",
    "train_results",
    "booking_form",
    "payment_page",
    "unknown",
}

_FENCE_RE = re.compile(r"```(?:json)?\s*(.*?)\s*```", re.DOTALL)


class IntentParser:
    """Parses raw Gemini response text into a structured TravelContext."""

    def __init__(self) -> None:
        pass

    def parse(self, gemini_response: str) -> TravelContext:
        """Parse a raw Gemini text response into a TravelContext.

        Never raises an exception — returns TravelContext(intent="unknown",
        confidence=0.0) on any error.
        """
        try:
            json_text = self._extract_json(gemini_response)
            data: dict[str, Any] = json.loads(json_text)
            return self._map_to_context(data)
        except Exception as exc:
            logger.warning("IntentParser failed to parse response: %s", exc)
            return TravelContext(intent="unknown", confidence=0.0)

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _extract_json(self, text: str) -> str:
        """Strip markdown code fences and return the raw JSON string."""
        match = _FENCE_RE.search(text)
        if match:
            return match.group(1)
        # No fences — try to find the first '{' … '}' block
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return text[start : end + 1]
        return text.strip()

    def _map_to_context(self, data: dict[str, Any]) -> TravelContext:
        """Map a parsed JSON dict to a TravelContext."""
        # intent: prefer page_type / current_page_type, fall back to intent key
        raw_intent = (
            data.get("page_type")
            or data.get("current_page_type")
            or data.get("intent")
            or "unknown"
        )
        intent = raw_intent if raw_intent in VALID_INTENTS else "unknown"

        # travel_class: accept both 'class' and 'travel_class'
        travel_class = data.get("travel_class") or data.get("class")

        # passengers: coerce to int
        raw_passengers = data.get("passengers", 1)
        try:
            passengers = int(raw_passengers)
        except (TypeError, ValueError):
            passengers = 1

        # confidence: default 0.8 on successful parse if not provided
        raw_confidence = data.get("confidence")
        if raw_confidence is None:
            confidence = 0.8
        else:
            try:
                confidence = float(raw_confidence)
            except (TypeError, ValueError):
                confidence = 0.8

        prices = data.get("prices") or []

        return TravelContext(
            intent=intent,
            origin=data.get("origin"),
            destination=data.get("destination"),
            date=data.get("date"),
            passengers=passengers,
            travel_class=travel_class,
            platform=data.get("platform"),
            confidence=confidence,
            prices=prices,
        )
