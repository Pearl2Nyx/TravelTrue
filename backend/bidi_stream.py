"""BidiStream — manages the WebSocket session lifecycle for the Travel UI Agent.

Requirements: 1.2, 2.3, 3.3, 4.1, 4.5, 5.2, 5.3, 5.4, 5.5, 6.2, 6.3, 8.4
"""
from __future__ import annotations

import asyncio
import base64
import json
import logging
from typing import Any, Optional

from fastapi import WebSocket
from fastapi.websockets import WebSocketState
from starlette.websockets import WebSocketDisconnect

from backend.browser_controller import ActionFailedError
from backend.models import TravelContext, WsMessage

logger = logging.getLogger(__name__)

_MAX_RECONNECT_ATTEMPTS = 5


class BidiStream:
    """Manages bidirectional WebSocket communication for an agent session."""

    def __init__(
        self,
        websocket: WebSocket,
        session_id: str,
        gemini_analyzer,
        intent_parser,
        suggestion_engine,
        browser_controller,
        strategy_router,
        memory_bank,
    ) -> None:
        self._ws = websocket
        self._session_id = session_id
        self._gemini_analyzer = gemini_analyzer
        self._intent_parser = intent_parser
        self._suggestion_engine = suggestion_engine
        self._browser_controller = browser_controller
        self._strategy_router = strategy_router
        self._memory_bank = memory_bank

        self._last_intent: Optional[str] = None
        self._last_context: Optional[TravelContext] = None  # Task 22.1
        self._receive_task: Optional[asyncio.Task] = None
        self._screen_watcher = None

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def start(self) -> None:
        """Start the ScreenWatcher and the receive loop."""
        from backend.screen_watcher import ScreenWatcher

        self._screen_watcher = ScreenWatcher(
            page=self._browser_controller._page,
            on_screenshot=self._on_screenshot,
        )
        await self._screen_watcher.start()
        self._receive_task = asyncio.create_task(self._receive_loop())
        # Keep running until receive loop finishes (disconnect)
        await self._receive_task

    async def stop(self) -> None:
        """Stop the ScreenWatcher and cancel the receive loop."""
        # Task 22.4 — persist last search to MemoryBank before stopping
        if self._last_context and self._last_context.origin and self._last_context.destination:
            self._memory_bank.save_search(self._session_id, {
                "origin": self._last_context.origin,
                "destination": self._last_context.destination,
                "date": self._last_context.date,
                "intent": self._last_context.intent,
                "platform": self._last_context.platform,
            })

        if self._screen_watcher is not None:
            await self._screen_watcher.stop()
        if self._receive_task is not None and not self._receive_task.done():
            self._receive_task.cancel()
            try:
                await self._receive_task
            except asyncio.CancelledError:
                pass

    # ------------------------------------------------------------------
    # Screenshot callback
    # ------------------------------------------------------------------

    async def _on_screenshot(self, screenshot_bytes: bytes) -> None:
        """Process a new screenshot: send to frontend immediately, then analyze with Gemini."""
        # Always send screenshot first — never block on Gemini
        encoded = base64.b64encode(screenshot_bytes).decode("utf-8")
        await self.send("screenshot", {"data": encoded})

        # Gemini analysis is best-effort — failures don't block the screenshot stream
        try:
            response = await self._gemini_analyzer.analyze(screenshot_bytes)
            if not response:
                return

            context: TravelContext = self._intent_parser.parse(response)
            self._last_context = context

            # Notify frontend if intent changed
            if context.intent != self._last_intent:
                self._last_intent = context.intent
                await self.send(
                    "intent_change",
                    {
                        "intent": context.intent,
                        "platform": context.platform,
                        "confidence": context.confidence,
                    },
                )

            # When a results page is detected, send a summary message
            if context.intent and context.intent.endswith("_results"):
                await self.send(
                    "agent_message",
                    {
                        "message": (
                            f"Detected {context.intent} on {context.platform}. "
                            f"Found {len(context.prices)} price options."
                        )
                    },
                )

            suggestion = self._suggestion_engine.generate(context, self._session_id)
            if suggestion:
                await self.send("suggestion", {"message": suggestion})

        except Exception as exc:
            logger.error("Gemini analysis error (screenshot still sent): %s", exc)

    # ------------------------------------------------------------------
    # Receive loop with exponential backoff
    # ------------------------------------------------------------------

    async def _receive_loop(self) -> None:
        """Receive messages from the WebSocket and dispatch them."""
        attempt = 0
        while attempt <= _MAX_RECONNECT_ATTEMPTS:
            try:
                while True:
                    raw = await self._ws.receive_text()
                    attempt = 0  # reset on successful receive
                    try:
                        data = json.loads(raw)
                        msg = WsMessage(**data)
                    except Exception as parse_exc:
                        logger.warning("Failed to parse WsMessage: %s", parse_exc)
                        continue

                    await self._dispatch(msg)

            except WebSocketDisconnect:
                logger.info("WebSocket disconnected for session %s", self._session_id)
                break
            except Exception as exc:
                if attempt >= _MAX_RECONNECT_ATTEMPTS:
                    logger.error(
                        "Receive loop giving up after %d attempts: %s",
                        _MAX_RECONNECT_ATTEMPTS,
                        exc,
                    )
                    break
                delay = 2 ** attempt
                logger.warning(
                    "Receive loop error (attempt %d/%d), retrying in %ds: %s",
                    attempt + 1,
                    _MAX_RECONNECT_ATTEMPTS,
                    delay,
                    exc,
                )
                await asyncio.sleep(delay)
                attempt += 1

    # ------------------------------------------------------------------
    # Message dispatcher
    # ------------------------------------------------------------------

    async def _dispatch(self, msg: WsMessage) -> None:
        """Route an incoming WsMessage to the appropriate handler."""
        if msg.type == "user_message":
            # Task 22.3 — echo acknowledgement back to the chat panel
            text = (msg.payload or {}).get("text", "") if isinstance(msg.payload, dict) else str(msg.payload or "")
            logger.info("User message [session=%s]: %s", self._session_id, text)
            await self.send("agent_message", {"message": f"Got it. Processing: '{text}'"})

        elif msg.type == "accept_suggestion":
            suggestion_type = (msg.payload or {}).get("suggestion_type", "unknown")
            self._suggestion_engine.record_accepted(self._session_id, suggestion_type)

        elif msg.type == "dismiss_suggestion":
            suggestion_type = (msg.payload or {}).get("suggestion_type", "unknown")
            self._suggestion_engine.record_dismissed(self._session_id, suggestion_type)

        elif msg.type == "execute_action":
            await self._handle_execute_action(msg.payload or {})

        else:
            logger.debug("Unknown message type: %s", msg.type)

    async def _handle_execute_action(self, payload: dict) -> None:
        """Route an execute_action payload through the StrategyRouter."""
        platform = payload.get("platform", "")
        strategy = self._strategy_router.get_strategy(platform)
        if strategy is None:
            msg = self._strategy_router.get_unsupported_message(platform)
            await self.send("error", {"message": msg})
            return

        action = payload.get("action")
        params = payload.get("params", {})
        try:
            if hasattr(strategy, action or ""):
                await getattr(strategy, action)(**params)

                # Task 22.3 — capture confirmation screenshot and notify frontend
                screenshot_bytes = await self._browser_controller.screenshot()
                await self.send("screenshot", {"data": base64.b64encode(screenshot_bytes).decode()})
                await self.send("agent_message", {"message": f"Action '{action}' completed on {platform}."})
            else:
                await self.send("error", {"message": f"Unknown action: {action}"})
        except ActionFailedError as exc:
            logger.error("Strategy action failed after retries: %s", exc)
            await self.send(
                "agent_message",
                {
                    "message": (
                        f"❌ I tried to {action} on {platform} but it failed after 3 attempts. "
                        f"The page element may have changed. Please try manually or refresh the page."
                    )
                },
            )
        except Exception as exc:
            logger.error("execute_action failed: %s", exc, exc_info=True)
            await self.send("error", {"message": str(exc)})

    # ------------------------------------------------------------------
    # Send helper
    # ------------------------------------------------------------------

    async def send(self, msg_type: str, payload: Any = None) -> None:
        """Send a WsMessage as JSON over the WebSocket."""
        try:
            msg = WsMessage(
                type=msg_type,
                payload=payload,
                session_id=self._session_id,
            )
            await self._ws.send_text(msg.model_dump_json())
        except Exception as exc:
            logger.error("BidiStream.send failed (type=%s): %s", msg_type, exc)
