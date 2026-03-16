"""MakeMyTrip flight automation strategy.

Requirements: 4.3, 7.1, 7.4
"""
from __future__ import annotations

from backend.browser_controller import BrowserController


class MakeMytripStrategy:
    """Platform-specific automation strategy for MakeMyTrip flights."""

    SELECTORS = {
        "origin": 'input[placeholder*="From"]',
        "destination": 'input[placeholder*="To"]',
        "date": ".datePickerInput",
        "search_btn": 'button[class*="primaryBtn"]',
        "results": ".listingCard",
    }

    def __init__(self, controller: BrowserController) -> None:
        self._controller = controller

    async def search_flights(
        self, origin: str, destination: str, date: str
    ) -> None:
        """Fill search fields and trigger a flight search."""
        await self._controller.fill(self.SELECTORS["origin"], origin)
        await self._controller.fill(self.SELECTORS["destination"], destination)
        await self._controller.fill(self.SELECTORS["date"], date)
        await self._controller.click(self.SELECTORS["search_btn"])

    async def filter_cheapest(self) -> None:
        """Sort results by price (cheapest first)."""
        await self._controller.click('.sortSection [data-cy="price"]')
