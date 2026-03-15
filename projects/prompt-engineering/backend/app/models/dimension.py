"""Pydantic models for dimension data — aligned with database-design.md §三."""

from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel


class DimensionIndex(BaseModel):
    """Single dimension memory index object, parsed from a Markdown file."""

    id: str
    name: str
    category: str
    category_name: str
    definition: str
    quality_role: str
    content: str
    char_count: int
    status: Literal["ready", "partial"]
    summary: str
    source_file: str


class DimensionCategory(BaseModel):
    """Aggregated category information, generated during parsing."""

    id: str
    name: str
    dimension_count: int
    dimension_ids: list[str]
    total_chars: int
    source_files: list[str]


class ParseError(BaseModel):
    """Dimension file parse error record."""

    file: str
    dimension_id: Optional[str] = None
    error_type: Literal[
        "missing_id",
        "missing_definition",
        "missing_content",
        "format_error",
        "file_read_error",
    ]
    message: str


class DimensionStore:
    """In-memory dimension store, process-level singleton.

    Built at startup, atomically replaced on reload.
    """

    def __init__(
        self,
        dimensions: dict[str, DimensionIndex],
        categories: dict[str, DimensionCategory],
        total_dimensions: int,
        total_categories: int,
        total_chars: int,
        loaded_at: str,
        parse_errors: list[ParseError],
    ) -> None:
        self.dimensions = dimensions
        self.categories = categories
        self.total_dimensions = total_dimensions
        self.total_categories = total_categories
        self.total_chars = total_chars
        self.loaded_at = loaded_at
        self.parse_errors = parse_errors


# ---------- API response models (aligned with api-design.md §3.1) ----------


class DimensionListItem(BaseModel):
    """Single dimension in the GET /api/dimensions response."""

    id: str
    name: str
    category: str
    category_name: str
    definition: str
    char_count: int
    status: Literal["ready", "partial"]
    summary: str


class CategoryListItem(BaseModel):
    """Category summary in the GET /api/dimensions response."""

    key: str
    name: str
    count: int


class DimensionsResponse(BaseModel):
    """GET /api/dimensions full response."""

    dimensions: list[DimensionListItem]
    total: int
    categories: list[CategoryListItem]
