from __future__ import annotations

import os
import tempfile
from pathlib import Path

_TEST_DB_PATH = Path(tempfile.gettempdir()) / "project_a_manual_bdd_tests.db"
if _TEST_DB_PATH.exists():
    _TEST_DB_PATH.unlink()

os.environ["DATABASE_URL"] = f"sqlite:///{_TEST_DB_PATH.as_posix()}"
os.environ.setdefault("JWT_SECRET_KEY", "bdd-test-secret-key-with-at-least-32-bytes")
