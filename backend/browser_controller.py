"""Browser controller with retry logic for Playwright automation.

Requirements: 4.1, 4.2, 4.4, 4.5
"""
from __future__ import annotations

import asyncio
import logging

logger = logging.getLogger(__name__)


class ActionFailedError(Exception):
    """Raised when a browser action fails after MAX_RETRIES attempts."""


class BrowserController:
    """Wraps a Playwright async Page with retry logic for all actions."""

    MAX_RETRIES = 3

    def __init__(self, page) -> None:
        self._page = page

    # ------------------------------------------------------------------
    # Public action methods
    # ------------------------------------------------------------------

    async def click(self, selector: str) -> None:
        await self._retry("click", self._page.click, selector)

    async def fill(self, selector: str, value: str) -> None:
        await self._retry("fill", self._page.fill, selector, value)

    async def scroll(self, x: int = 0, y: int = 500) -> None:
        await self._retry(
            "scroll",
            self._page.evaluate,
            f"window.scrollBy({x}, {y})",
        )

    async def select(self, selector: str, value: str) -> None:
        await self._retry("select", self._page.select_option, selector, value)

    async def wait_for_load(self) -> None:
        await self._retry(
            "wait_for_load",
            self._page.wait_for_load_state,
            "networkidle",
        )

    async def screenshot(self) -> bytes:
        return await self._retry("screenshot", self._page.screenshot)

    # ------------------------------------------------------------------
    # Retry helper
    # ------------------------------------------------------------------

    async def _retry(self, action_name: str, coro_fn, *args):
        last_exc: Exception | None = None
        for attempt in range(1, self.MAX_RETRIES + 1):
            try:
                return await coro_fn(*args)
            except Exception as exc:
                last_exc = exc
                logger.warning(
                    "Action '%s' failed on attempt %d/%d: %s",
                    action_name,
                    attempt,
                    self.MAX_RETRIES,
                    exc,
                )
                if attempt < self.MAX_RETRIES:
                    await asyncio.sleep(1)
        raise ActionFailedError(
            f"{action_name} failed after {self.MAX_RETRIES} retries"
        ) from last_exc
