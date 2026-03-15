"""Pydantic models for route / generate / reload API — aligned with api-design.md §3.4-§3.6."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


# ---------- Route (§3.4) ----------


class RouteRequest(BaseModel):
    task: str = Field(..., min_length=1)
    task_type: Optional[str] = None


class RouteResponse(BaseModel):
    task_type: str
    task_type_name: str
    confidence: float
    is_manual_override: bool
    required: list[str]
    recommended: list[str]
    optional: list[str]
    total_chars: int


# ---------- Generate (§3.5) ----------


class GenerateRequest(BaseModel):
    task: str = Field(..., min_length=1)
    engine: str
    dimensions: list[str] = Field(..., min_length=1)
    priorities: dict[str, int]


class ByLevel(BaseModel):
    required_count: int
    recommended_count: int
    optional_count: int


class GenerateStats(BaseModel):
    total_chars: int
    dimensions_used: int
    dimensions_total: int
    coverage_percent: float
    by_level: ByLevel
    missing_required: list[str]
    truncated_dimensions: list[str]


class GenerateResponse(BaseModel):
    prompt: str
    stats: GenerateStats


# ---------- Reload (§3.6) ----------


class ReloadResponse(BaseModel):
    dimensions_count: int
    categories_count: int
    loaded_at: str


# ---------- Error (§2.2) ----------


class ErrorDetail(BaseModel):
    code: str
    message: str
    suggestion: str


class ErrorResponse(BaseModel):
    error: ErrorDetail
