"""Pydantic models for task type data — aligned with database-design.md §3.4."""

from __future__ import annotations

from pydantic import BaseModel


class TaskTypeConfig(BaseModel):
    """Task type configuration — hardcoded in config.py."""

    key: str
    name: str
    description: str
    keywords: list[str]
    required: list[str]
    recommended: list[str]
    optional: list[str]


# ---------- API response models (aligned with api-design.md §3.2) ----------


class TaskTypeListItem(BaseModel):
    """Single task type in the GET /api/task-types response."""

    key: str
    name: str
    description: str


class TaskTypesResponse(BaseModel):
    """GET /api/task-types full response."""

    task_types: list[TaskTypeListItem]
