"""Shared pytest configuration for the Project A backend test suite.

Tests live in the repo-level /tests/ folder (not backend/tests/) per the
required submission layout, so this conftest adds backend/ to sys.path
before any `src.*` module gets imported.
"""
from __future__ import annotations

import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))
