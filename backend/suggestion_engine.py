from __future__ import annotations

import logging

from backend.memory.memory_bank import MemoryBank
from backend.models import TravelContext
from backend.price_comparator import PriceComparator

logger = logging.getLogger(__name__)


class SuggestionEngine:
    """Generates proactive travel suggestions using price data and user preferences."""

    def __init__(self, memory_bank: MemoryBank) -> None:
        self._memory_bank = memory_bank
        self._comparator = PriceComparator()

    def generate(self, context: TravelContext, session_id: str) -> str | None:
        """Generate a suggestion message for the cheapest option, or None if unavailable."""
        cheapest = self._comparator.get_cheapest(context)
        if cheapest is None:
            return None

        travel_type = cheapest["travel_type"]
        price = cheapest["price"]

        message = f"The cheapest {travel_type} is ₹{price}. Would you like me to filter results?"

        prefs = self._memory_bank.get_preferences(session_id)
        max_budget = prefs.get("max_budget")
        if max_budget is not None:
            try:
                if price > float(max_budget):
                    message += f" (Note: this exceeds your budget of ₹{max_budget})"
            except (TypeError, ValueError):
                logger.warning("SuggestionEngine: invalid max_budget value: %s", max_budget)

        return message

    def record_accepted(self, session_id: str, suggestion_type: str) -> None:
        """Record that the user accepted a suggestion."""
        self._memory_bank.save_preference(session_id, f"accepted_{suggestion_type}", True)

    def record_dismissed(self, session_id: str, suggestion_type: str) -> None:
        """Record that the user dismissed a suggestion."""
        self._memory_bank.save_preference(session_id, f"dismissed_{suggestion_type}", True)
