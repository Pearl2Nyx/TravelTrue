"""IRCTC train automation strategy.

Requirements: 4.3, 7.1, 7.4
"""
from __future__ import annotations

from backend.browser_controller import BrowserController


class IRCTCStrategy:
    """Platform-specific automation strategy for IRCTC trains."""

    SELECTORS = {
        "origin": "#origin",
        "destination": "#destination",
        "date": ".journey-date",
        "search_btn": ".search_btn",
        "results": ".train-item",
    }

    def __init__(self, controller: BrowserController) -> None:
        self._controller = controller

    async def search_trains(
        self, origin: str, destination: str, date: str
    ) -> None:
        """Fill search fields and trigger a train search."""
        await self._controller.fill(self.SELECTORS["origin"], origin)
        await self._controller.fill(self.SELECTORS["destination"], destination)
        await self._controller.fill(self.SELECTORS["date"], date)
        await self._controller.click(self.SELECTORS["search_btn"])

    async def filter_cheapest(self) -> None:
        """Sort results by fare (cheapest first)."""
        await self._controller.click(".fare-sort")
