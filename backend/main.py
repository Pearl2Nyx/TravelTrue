"""FastAPI application entry point for the Travel UI Agent."""
from __future__ import annotations

import asyncio
import logging
import os
import sys

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.models import WsMessage
from backend.bidi_stream import BidiStream
from backend.browser_controller import BrowserController
from backend.gemini_analyzer import GeminiAnalyzer
from backend.intent_parser import IntentParser
from backend.memory.memory_bank import MemoryBank
from backend.strategy_router import StrategyRouter
from backend.suggestion_engine import SuggestionEngine

load_dotenv()
logger = logging.getLogger(__name__)

app = FastAPI(title="Travel UI Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request, exc: Exception) -> JSONResponse:
    logger.error("Unhandled exception: %s", exc, exc_info=True)
    return JSONResponse(status_code=500, content={"error": str(exc), "type": type(exc).__name__})


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str) -> None:
    import json

    await websocket.accept()
    logger.info("WebSocket connected: %s", session_id)

    # Send immediate connected confirmation
    await websocket.send_text(
        WsMessage(type="agent_message", payload={"message": "✅ Connected. Click 'Start Agent' to begin."}, session_id=session_id).model_dump_json()
    )

    browser = None
    playwright = None
    playwright_ctx = None
    stream = None

    async def launch_browser_and_stream():
        nonlocal browser, playwright, playwright_ctx, stream

        from playwright.async_api import async_playwright

        try:
            playwright_ctx = async_playwright()
            playwright = await playwright_ctx.__aenter__()
            browser = await playwright.chromium.launch(headless=False)
            page = await browser.new_page()
        except Exception as exc:
            logger.error("Playwright launch failed: %s", exc)
            await websocket.send_text(
                WsMessage(type="agent_message", payload={"message": f"⚠️ Browser launch failed: {exc}. Run: playwright install chromium"}, session_id=session_id).model_dump_json()
            )
            return False

        api_key = os.environ.get("GEMINI_API_KEY", "")
        memory_bank = MemoryBank()
        intent_parser = IntentParser()
        suggestion_engine = SuggestionEngine(memory_bank)
        controller = BrowserController(page)
        strategy_router = StrategyRouter(controller)
        stream_ref = [None]

        async def on_gemini_disconnect():
            if stream_ref[0]:
                await stream_ref[0].send("agent_message", {"message": "⚠️ Lost connection to AI service. Reconnecting in 5s..."})

        gemini_analyzer = GeminiAnalyzer(api_key=api_key, on_disconnect=on_gemini_disconnect)
        stream = BidiStream(
            websocket=websocket,
            session_id=session_id,
            gemini_analyzer=gemini_analyzer,
            intent_parser=intent_parser,
            suggestion_engine=suggestion_engine,
            browser_controller=controller,
            strategy_router=strategy_router,
            memory_bank=memory_bank,
        )
        stream_ref[0] = stream
        await stream.start()
        return True

    async def cleanup():
        if stream:
            await stream.stop()
        if browser:
            try:
                await browser.close()
            except Exception:
                pass
        if playwright_ctx:
            try:
                await playwright_ctx.__aexit__(None, None, None)
            except Exception:
                pass

    # Main message loop — wait for start_agent before launching Playwright
    try:
        while True:
            raw = await websocket.receive_text()
            try:
                data = json.loads(raw)
                msg_type = data.get("type", "")
            except Exception:
                continue

            if msg_type == "start_agent":
                await websocket.send_text(
                    WsMessage(type="agent_message", payload={"message": "🚀 Starting agent..."}, session_id=session_id).model_dump_json()
                )
                # launch_browser_and_stream runs the full receive loop internally
                await launch_browser_and_stream()
                break  # stream.start() returns when disconnected

            elif msg_type == "stop_agent":
                await cleanup()
                await websocket.send_text(
                    WsMessage(type="agent_message", payload={"message": "🛑 Agent stopped."}, session_id=session_id).model_dump_json()
                )

            # Pass other messages through if stream is already running
            # (handled inside BidiStream._receive_loop)

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected: %s", session_id)
    except Exception as exc:
        logger.error("WebSocket error: %s", exc, exc_info=True)
    finally:
        await cleanup()
