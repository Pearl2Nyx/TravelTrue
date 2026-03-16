"""ScreenWatcher: continuously captures screenshots from a Playwright browser page."""

from __future__ import annotations

import asyncio
import logging
from typing import Awaitable, Callable

logger = logging.getLogger(__name__)

MIN_INTERVAL = 2.0
MIN_WIDTH = 1280
MIN_HEIGHT = 720


class ScreenWatcher:
    """Captures screenshots from a Playwright page at a regular interval.

    Args:
        page: A Playwright async Page object.
        on_screenshot: Async callback invoked with screenshot bytes on each capture.
        interval: Capture interval in seconds (minimum 2.0).
    """

    def __init__(
        self,
        page,
        on_screenshot: Callable[[bytes], Awaitable[None]],
        interval: float = 2.0,
    ) -> None:
        self._page = page
        self._on_screenshot = on_screenshot
        self._interval = max(interval, MIN_INTERVAL)
        self._running = False
        self._paused = False
        self._task: asyncio.Task | None = None

    async def start(self) -> None:
        """Start the screenshot capture loop."""
        self._running = True
        self._task = asyncio.create_task(self._capture_loop())

    async def stop(self) -> None:
        """Stop the screenshot capture loop."""
        self._running = False
        if self._task is not None:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
            self._task = None

    async def pause(self) -> None:
        """Pause screenshot capture without stopping the loop."""
        self._paused = True

    async def resume(self) -> None:
        """Resume screenshot capture."""
        self._paused = False

    async def _capture_loop(self) -> None:
        """Main capture loop: captures screenshots while running and not paused."""
        while self._running:
            if not self._paused:
                try:
                    await self._ensure_min_viewport()
                    screenshot_bytes: bytes = await self._page.screenshot()
                    await self._on_screenshot(screenshot_bytes)
                except asyncio.CancelledError:
                    raise
                except Exception as exc:
                    logger.error("Error during screenshot capture: %s", exc, exc_info=True)
            await asyncio.sleep(self._interval)

    async def _ensure_min_viewport(self) -> None:
        """Set viewport to at least 1280x720 if current size is smaller."""
        try:
            viewport = self._page.viewport_size
            if viewport is None or viewport["width"] < MIN_WIDTH or viewport["height"] < MIN_HEIGHT:
                await self._page.set_viewport_size({"width": MIN_WIDTH, "height": MIN_HEIGHT})
        except Exception as exc:
            logger.warning("Could not check/set viewport size: %s", exc)
