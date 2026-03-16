from __future__ import annotations

import json
import logging
from typing import Any

logger = logging.getLogger(__name__)


class MemoryBank:
    """Persistent memory store for user travel preferences and search history."""

    def __init__(self, storage_path: str = "memory_bank.json") -> None:
        self._storage_path = storage_path
        self._data: dict = {}
        self._load()

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------

    def _load(self) -> None:
        """Load existing data from the JSON file, silently ignoring errors."""
        try:
            with open(self._storage_path, "r", encoding="utf-8") as f:
                self._data = json.load(f)
        except Exception:
            self._data = {}

    def _persist(self) -> None:
        """Write the in-memory dict to the JSON file. Never raises."""
        try:
            with open(self._storage_path, "w", encoding="utf-8") as f:
                json.dump(self._data, f, indent=2)
        except Exception as exc:
            logger.error("MemoryBank: failed to persist data: %s", exc)

    def _session(self, session_id: str) -> dict:
        """Return (creating if needed) the sub-dict for a session."""
        if session_id not in self._data:
            self._data[session_id] = {"preferences": {}, "searches": []}
        return self._data[session_id]

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def save_preference(self, session_id: str, key: str, value: Any) -> None:
        """Store a user preference under session_id and persist."""
        try:
            self._session(session_id)["preferences"][key] = value
            self._persist()
        except Exception as exc:
            logger.error("MemoryBank: save_preference failed: %s", exc)

    def get_preferences(self, session_id: str) -> dict:
        """Return all preferences for the session, or empty dict if none."""
        return self._data.get(session_id, {}).get("preferences", {})

    def save_search(self, session_id: str, search: dict) -> None:
        """Append a search record to the session's search history and persist."""
        try:
            self._session(session_id)["searches"].append(search)
            self._persist()
        except Exception as exc:
            logger.error("MemoryBank: save_search failed: %s", exc)

    def get_searches(self, session_id: str) -> list:
        """Return list of past searches for the session, or empty list if none."""
        return self._data.get(session_id, {}).get("searches", [])

    def clear(self, session_id: str) -> None:
        """Delete all data for the session_id and persist."""
        try:
            self._data.pop(session_id, None)
            self._persist()
        except Exception as exc:
            logger.error("MemoryBank: clear failed: %s", exc)
