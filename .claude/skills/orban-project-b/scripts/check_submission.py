#!/usr/bin/env python3
"""Pre-submission validator for the Orban Labs challenge repository.

Checks the required folder structure, required files, and Project B content
signals (non-empty prompts/, planning docs, tests). Mirrors what the hiring
platform's immediate validation is likely to check, so failures surface
before the form is submitted.

Usage:
    python3 check_submission.py /path/to/repo-root
Exit code 0 = all required checks pass; 1 = at least one required check failed.
"""

import sys
from pathlib import Path

REQUIRED_DIRS = [
    "project-a-manual/docs",
    "project-a-manual/backend",
    "project-a-manual/frontend",
    "project-a-manual/tests",
    "project-b-ai-assisted/docs",
    "project-b-ai-assisted/prompts",
    "project-b-ai-assisted/backend",
    "project-b-ai-assisted/frontend",
    "project-b-ai-assisted/tests",
]

REQUIRED_FILES = [
    "resume.pdf",
    "README.md",
]


def has_content(directory: Path) -> bool:
    """True if the directory contains at least one non-hidden file (recursively)."""
    return any(
        p.is_file() and not p.name.startswith(".")
        for p in directory.rglob("*")
    )


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 1

    root = Path(sys.argv[1]).resolve()
    if not root.is_dir():
        print(f"ERROR: {root} is not a directory")
        return 1

    failures = []
    warnings = []

    print(f"Validating submission at: {root}\n")

    for rel in REQUIRED_DIRS:
        path = root / rel
        if not path.is_dir():
            failures.append(f"Missing required directory: /{rel}/")
        elif not has_content(path):
            warnings.append(f"Directory exists but is empty: /{rel}/")

    for rel in REQUIRED_FILES:
        path = root / rel
        if not path.is_file():
            failures.append(f"Missing required file: /{rel}")
        elif path.stat().st_size == 0:
            failures.append(f"Required file is empty: /{rel}")

    # Project B specific signals
    prompts = root / "project-b-ai-assisted" / "prompts"
    if prompts.is_dir() and not has_content(prompts):
        failures.append(
            "/project-b-ai-assisted/prompts/ is empty — the AI transcript "
            "export is a MANDATORY requirement. Export the session log(s) "
            "with model names before submitting."
        )

    docs_b = root / "project-b-ai-assisted" / "docs"
    if docs_b.is_dir():
        doc_files = [p.name.lower() for p in docs_b.rglob("*") if p.is_file()]
        if not any("plan" in n or "architecture" in n for n in doc_files):
            warnings.append(
                "No plan/architecture doc detected in project-b docs/ — "
                "planning notes are a graded requirement."
            )
        if not any("ai" in n and ("usage" in n or "log" in n) for n in doc_files):
            warnings.append(
                "No AI usage log detected in project-b docs/ — the spec asks "
                "for an AI usage log and model-choice rationale."
            )

    tests_b = root / "project-b-ai-assisted" / "tests"
    if tests_b.is_dir():
        test_files = [
            p for p in tests_b.rglob("*.py")
            if p.name.startswith("test_") or p.name.endswith("_test.py")
        ]
        if not test_files:
            warnings.append(
                "No pytest-style test files found in project-b tests/ — "
                "'a few meaningful tests' is required."
            )

    if failures:
        print("REQUIRED CHECKS FAILED:")
        for f in failures:
            print(f"  ✗ {f}")
    else:
        print("All required structure checks passed. ✓")

    if warnings:
        print("\nWARNINGS (review before submitting):")
        for w in warnings:
            print(f"  ⚠ {w}")

    print(
        "\nMANUAL CHECKLIST (cannot be verified by this script):\n"
        "  [ ] GitHub repository is PUBLIC\n"
        "  [ ] Commit history is incremental with descriptive messages\n"
        "      (run: git log --oneline — one giant commit will fail review)\n"
        "  [ ] prompts/ transcript names the AI model(s) used\n"
        "  [ ] docs/ai-usage-log.md states which model(s) and WHY\n"
        "  [ ] Setup guide tested from a fresh clone\n"
        "  [ ] Project A contains ZERO AI-generated content\n"
        "  [ ] Form ready: full name, email, WhatsApp number, repo URL\n"
        "  [ ] Submitting before the July 31, 2026 deadline\n"
    )

    return 1 if failures else 0


if __name__ == "__main__":
    raise SystemExit(main())
