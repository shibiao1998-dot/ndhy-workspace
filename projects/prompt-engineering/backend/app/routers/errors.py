"""Shared error helpers — aligned with api-design.md §2.2 / §2.3."""

from __future__ import annotations

from fastapi import HTTPException
from fastapi.responses import JSONResponse


def api_error(status_code: int, code: str, message: str, suggestion: str) -> HTTPException:
    """Create an HTTPException with the unified error body.

    Usage in routers::

        raise api_error(404, "ENGINE_NOT_FOUND", "引擎 'gpt5' 不存在",
                         "请从 /api/engines 获取有效的引擎列表")
    """
    return HTTPException(
        status_code=status_code,
        detail={
            "error": {
                "code": code,
                "message": message,
                "suggestion": suggestion,
            }
        },
    )


def error_response(status_code: int, code: str, message: str, suggestion: str) -> JSONResponse:
    """Return a JSONResponse with the unified error body (for exception handlers)."""
    return JSONResponse(
        status_code=status_code,
        content={
            "error": {
                "code": code,
                "message": message,
                "suggestion": suggestion,
            }
        },
    )
