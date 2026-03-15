"""Router engine — match task description to task type and expand dimension refs.

Implements the routing algorithm from technical-architecture.md §3.3 and
database-design.md §六 (reference expansion rules).
"""

from __future__ import annotations

import logging

from app.config import TASK_TYPES
from app.core.dimension_loader import get_store
from app.models.dimension import DimensionStore
from app.models.task_type import TaskTypeConfig

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Reference expansion (database-design.md §六)
# ---------------------------------------------------------------------------


def expand_dimension_refs(refs: list[str], store: DimensionStore) -> list[str]:
    """Expand a list of dimension references to concrete dimension IDs.

    A reference can be:
    - A single letter (category ID like ``"A"``) → all dimensions in that category
    - A dimension ID (like ``"A01"``) → used as-is

    Returns a sorted, deduplicated list of dimension IDs.
    """
    result: set[str] = set()
    for ref in refs:
        if len(ref) == 1 and ref in store.categories:
            result.update(store.categories[ref].dimension_ids)
        elif ref in store.dimensions:
            result.add(ref)
        else:
            logger.warning("Invalid dimension reference '%s' — skipping", ref)
    return sorted(result)


def _deduplicate_priority_levels(
    required_ids: list[str],
    recommended_ids: list[str],
    optional_ids: list[str],
) -> tuple[list[str], list[str], list[str]]:
    """Remove duplicates across priority levels.

    If a dimension appears in multiple levels, it is kept only in the
    highest priority level (required > recommended > optional).
    """
    req_set = set(required_ids)
    rec_set = set(recommended_ids) - req_set
    opt_set = set(optional_ids) - req_set - rec_set
    return sorted(req_set), sorted(rec_set), sorted(opt_set)


# ---------------------------------------------------------------------------
# Route result dataclass (internal, converted to API response in router)
# ---------------------------------------------------------------------------


class RouteResultInternal:
    """Internal route result — converted to API RouteResponse by the router layer."""

    def __init__(
        self,
        task_type: str,
        task_type_name: str,
        confidence: float,
        is_manual_override: bool,
        matched_keywords: list[str],
        required: list[str],
        recommended: list[str],
        optional: list[str],
        total_chars: int,
    ) -> None:
        self.task_type = task_type
        self.task_type_name = task_type_name
        self.confidence = confidence
        self.is_manual_override = is_manual_override
        self.matched_keywords = matched_keywords
        self.required = required
        self.recommended = recommended
        self.optional = optional
        self.total_chars = total_chars


# ---------------------------------------------------------------------------
# Public routing function
# ---------------------------------------------------------------------------


def route_task(task_text: str, task_type_key: str | None = None) -> RouteResultInternal:
    """Route a task description to a task type and return expanded dimension lists.

    Parameters
    ----------
    task_text:
        User's task description text.
    task_type_key:
        If provided, skip auto-matching and use this task type directly.
        Must be a valid key in ``TASK_TYPES``.

    Returns
    -------
    RouteResultInternal with matched type + three-level dimension ID lists.

    Raises
    ------
    KeyError: if ``task_type_key`` is provided but not found in TASK_TYPES.
    """
    store = get_store()

    if task_type_key is not None:
        # Manual override — bypass keyword matching.
        if task_type_key not in TASK_TYPES:
            raise KeyError(task_type_key)
        tt = TASK_TYPES[task_type_key]
        return _build_route_result(
            tt=tt,
            confidence=1.0,
            is_manual_override=True,
            matched_keywords=[],
            store=store,
        )

    # Auto-match: score each task type by keyword hits.
    best_tt: TaskTypeConfig | None = None
    best_score: int = 0
    best_matched: list[str] = []

    for tt in TASK_TYPES.values():
        if not tt.keywords:
            continue  # Skip "general" (fallback) during matching.
        matched = [kw for kw in tt.keywords if kw in task_text]
        score = len(matched)
        if score > best_score:
            best_score = score
            best_tt = tt
            best_matched = matched

    if best_score == 0 or best_tt is None:
        # Fallback to "general".
        tt = TASK_TYPES["general"]
        return _build_route_result(
            tt=tt,
            confidence=0.3,
            is_manual_override=False,
            matched_keywords=[],
            store=store,
        )

    # Confidence: max(0.5, hits / total_keywords)
    confidence = max(0.5, best_score / len(best_tt.keywords))
    return _build_route_result(
        tt=best_tt,
        confidence=round(confidence, 2),
        is_manual_override=False,
        matched_keywords=best_matched,
        store=store,
    )


def _build_route_result(
    *,
    tt: TaskTypeConfig,
    confidence: float,
    is_manual_override: bool,
    matched_keywords: list[str],
    store: DimensionStore,
) -> RouteResultInternal:
    """Expand dimension refs and compute total chars."""
    req_ids = expand_dimension_refs(tt.required, store)
    rec_ids = expand_dimension_refs(tt.recommended, store)
    opt_ids = expand_dimension_refs(tt.optional, store)

    req_ids, rec_ids, opt_ids = _deduplicate_priority_levels(req_ids, rec_ids, opt_ids)

    total_chars = sum(
        store.dimensions[did].char_count
        for did in (req_ids + rec_ids + opt_ids)
        if did in store.dimensions
    )

    return RouteResultInternal(
        task_type=tt.key,
        task_type_name=tt.name,
        confidence=confidence,
        is_manual_override=is_manual_override,
        matched_keywords=matched_keywords,
        required=req_ids,
        recommended=rec_ids,
        optional=opt_ids,
        total_chars=total_chars,
    )
