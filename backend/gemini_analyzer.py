"""Gemini Analyzer — sends browser screenshots to Gemini for travel context analysis."""

from __future__ import annotations

import asyncio
import base64
import logging
from typing import Awaitable, Callable, Optional

import google.generativeai as genai

logger = logging.getLogger(__name__)

ANALYSIS_PROMPT = (
    "Analyze this travel booking website screenshot. "
    "Identify: 1) The travel platform (MakeMyTrip/Redbus/IRCTC/other), "
    "2) The current page type (flight_search/flight_results/bus_search/bus_results/"
    "train_search/train_results/booking_form/payment_page/unknown), "
    "3) Travel parameters visible: origin, destination, date, passengers, class, "
    "4) All visible prices as a list. "
    "Respond in JSON format."
)

_RECONNECT_DELAY_SECONDS = 5


class GeminiAnalyzer:
    """Analyzes browser screenshots using the Gemini generative AI API."""

    def __init__(
        self,
        api_key: str,
        on_disconnect: Optional[Callable[[], Awaitable[None]]] = None,
    ) -> None:
        self._api_key = api_key
        self._on_disconnect = on_disconnect
        self._model: Optional[genai.GenerativeModel] = None
        self._init_client()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def analyze(self, screenshot_bytes: bytes) -> str:
        """Send *screenshot_bytes* to Gemini and return the raw text response.

        On any exception the error is logged, the optional *on_disconnect*
        callback is invoked, a reconnect is scheduled after 5 seconds, and an
        empty string is returned so callers can continue gracefully.
        """
        try:
            image_data = base64.b64encode(screenshot_bytes).decode("utf-8")
            image_part = {"mime_type": "image/png", "data": image_data}
            response = await asyncio.to_thread(
                self._model.generate_content,
                [ANALYSIS_PROMPT, image_part],
            )
            return response.text
        except Exception as exc:
            logger.error("GeminiAnalyzer.analyze failed: %s", exc, exc_info=True)
            await self._handle_disconnect()
            return ""

    # ------------------------------------------------------------------
    # Private helpers
    # ------------------------------------------------------------------

    def _init_client(self) -> None:
        """(Re-)initialise the Gemini generative model."""
        genai.configure(api_key=self._api_key)
        self._model = genai.GenerativeModel("gemini-1.5-flash")

    async def _handle_disconnect(self) -> None:
        """Invoke the disconnect callback (if any) and schedule a reconnect."""
        if self._on_disconnect is not None:
            try:
                await self._on_disconnect()
            except Exception as cb_exc:
                logger.error("on_disconnect callback raised: %s", cb_exc, exc_info=True)
        asyncio.ensure_future(self._reconnect())

    async def _reconnect(self) -> None:
        """Wait *_RECONNECT_DELAY_SECONDS* seconds then re-initialise the client."""
        logger.info(
            "GeminiAnalyzer: reconnecting in %d seconds…", _RECONNECT_DELAY_SECONDS
        )
        await asyncio.sleep(_RECONNECT_DELAY_SECONDS)
        try:
            self._init_client()
            logger.info("GeminiAnalyzer: reconnected successfully.")
        except Exception as exc:
            logger.error("GeminiAnalyzer: reconnect failed: %s", exc, exc_info=True)
