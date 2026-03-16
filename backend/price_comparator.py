from __future__ import annotations

import logging
from typing import Any

from backend.models import TravelContext

logger = logging.getLogger(__name__)

_INTENT_TO_TRAVEL_TYPE: dict[str, str] = {
    "flight_results": "flight",
    "bus_results": "bus",
    "train_results": "train",
}


class PriceComparator:
    """Extracts and compares prices from TravelContext objects."""

    def __init__(self) -> None:
        pass

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _extract_price_value(entry: Any) -> float | None:
        """Return the numeric price from a price entry (dict or number)."""
        if isinstance(entry, (int, float)):
            return float(entry)
        if isinstance(entry, dict):
            for key in ("price", "amount", "fare"):
                if key in entry:
                    try:
                        return float(entry[key])
                    except (TypeError, ValueError):
                        pass
        return None

    @staticmethod
    def _extract_operator(entry: Any) -> str:
        """Return the operator/airline/name string from a price entry."""
        if isinstance(entry, dict):
            for key in ("operator", "airline", "name"):
                if key in entry and entry[key]:
                    return str(entry[key])
        return "Unknown"

    @staticmethod
    def _travel_type_from_intent(intent: str) -> str:
        return _INTENT_TO_TRAVEL_TYPE.get(intent, intent)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def get_cheapest(self, context: TravelContext) -> dict | None:
        """Return the cheapest price entry from context.prices, or None."""
        if not context.prices:
            return None

        best_entry = None
        best_price: float | None = None

        for entry in context.prices:
            value = self._extract_price_value(entry)
            if value is None:
                continue
            if best_price is None or value < best_price:
                best_price = value
                best_entry = entry

        if best_price is None or best_entry is None:
            return None

        return {
            "price": best_price,
            "operator": self._extract_operator(best_entry),
            "travel_type": self._travel_type_from_intent(context.intent),
            "entry": best_entry,
        }

    def cross_mode_summary(self, contexts: list[TravelContext]) -> list[dict]:
        """Return cheapest option per travel mode, sorted by price ascending."""
        results: list[dict] = []

        for ctx in contexts:
            cheapest = self.get_cheapest(ctx)
            if cheapest is None:
                continue
            results.append(
                {
                    "travel_type": cheapest["travel_type"],
                    "price": cheapest["price"],
                    "operator": cheapest["operator"],
                }
            )

        results.sort(key=lambda x: x["price"])
        return results
