"""POST /api/route — task routing.

Aligned with api-design.md §3.4.
Returns dimension ID lists (list[string]), NOT RoutedDimension objects.
"""

from __future__ import annotations

import logging

from fastapi import APIRouter

from app.core.router_engine import route_task
from app.models.prompt import RouteRequest, RouteResponse
from app.routers.errors import api_error

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/route", response_model=RouteResponse)
def route(body: RouteRequest) -> RouteResponse:
    # Validate task is non-empty (Pydantic min_length handles this,
    # but we add an explicit check for whitespace-only strings).
    if not body.task.strip():
        raise api_error(
            400,
            "INVALID_REQUEST_BODY",
            "请求体格式错误：task 不能为空",
            "请检查请求参数是否完整",
        )

    try:
        result = route_task(body.task, body.task_type)
    except KeyError as exc:
        raise api_error(
            404,
            "TASK_TYPE_NOT_FOUND",
            f"任务类型 '{exc.args[0]}' 不存在",
            "请从 /api/task-types 获取有效的任务类型列表",
        )
    except RuntimeError:
        raise api_error(
            500,
            "ROUTE_FAILED",
            "任务路由处理失败：维度索引未初始化",
            "请稍后重试，若持续失败请联系管理员",
        )
    except Exception:
        logger.exception("Unexpected error in route")
        raise api_error(
            500,
            "ROUTE_FAILED",
            "任务路由处理失败",
            "请稍后重试，若持续失败请联系管理员",
        )

    return RouteResponse(
        task_type=result.task_type,
        task_type_name=result.task_type_name,
        confidence=result.confidence,
        is_manual_override=result.is_manual_override,
        required=result.required,
        recommended=result.recommended,
        optional=result.optional,
        total_chars=result.total_chars,
    )
