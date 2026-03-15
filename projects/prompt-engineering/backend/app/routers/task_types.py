"""GET /api/task-types — task type list.

Aligned with api-design.md §3.2.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.config import TASK_TYPES
from app.models.task_type import TaskTypeListItem, TaskTypesResponse

router = APIRouter()


@router.get("/task-types", response_model=TaskTypesResponse)
def list_task_types() -> TaskTypesResponse:
    items = [
        TaskTypeListItem(
            key=tt.key,
            name=tt.name,
            description=tt.description,
        )
        for tt in TASK_TYPES.values()
    ]
    return TaskTypesResponse(task_types=items)
