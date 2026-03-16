"""Strategy router — maps platform names to their automation strategies.

Requirements: 7.2, 7.3
"""
from __future__ import annotations

from backend.browser_controller import BrowserController
from backend.strategies.irctc import IRCTCStrategy
from backend.strategies.makemytrip import MakeMytripStrategy
from backend.strategies.redbus import RedbusStrategy

PLATFORM_MAP = {
    "makemytrip": "MakeMytripStrategy",
    "redbus": "RedbusStrategy",
    "irctc": "IRCTCStrategy",
}

_STRATEGY_CLASSES = {
    "makemytrip": MakeMytripStrategy,
    "redbus": RedbusStrategy,
    "irctc": IRCTCStrategy,
}


class StrategyRouter:
    """Returns the correct platform strategy for a given platform name."""

    def __init__(self, controller: BrowserController) -> None:
        self._controller = controller

    def get_strategy(self, platform: str) -> object | None:
        """Return an instantiated strategy for *platform*, or None if unsupported."""
        key = platform.lower()
        cls = _STRATEGY_CLASSES.get(key)
        if cls is None:
            return None
        return cls(self._controller)

    def get_unsupported_message(self, platform: str) -> str:
        """Return a user-facing message for an unsupported platform."""
        return (
            f"Sorry, {platform} is not yet supported. "
            "Try MakeMyTrip (flights), Redbus (buses), or IRCTC (trains)."
        )
