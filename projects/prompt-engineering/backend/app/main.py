"""FastAPI application entry point.

- Registers all 6 API routers under ``/api``.
- Loads dimension files on startup.
- Configures CORS for development.
- Mounts static files for production SPA serving.
"""

from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.config import DIMENSIONS_DIR
from app.core.dimension_loader import load_dimensions
from app.routers import dimensions, engines, generate, reload, route, task_types

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan — load dimensions at startup
# ---------------------------------------------------------------------------


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: load dimension files into memory."""
    logger.info("Loading dimensions from: %s", DIMENSIONS_DIR)
    store = load_dimensions(DIMENSIONS_DIR)
    logger.info(
        "Startup complete: %d dimensions, %d categories, %d parse errors",
        store.total_dimensions,
        store.total_categories,
        len(store.parse_errors),
    )
    if store.parse_errors:
        for err in store.parse_errors:
            logger.warning("Parse error: [%s] %s — %s", err.file, err.error_type, err.message)
    yield


# ---------------------------------------------------------------------------
# App creation
# ---------------------------------------------------------------------------

app = FastAPI(
    title="提示词工程系统",
    description="华渔教育 AI 设计师/策划提示词工程 v1",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS (development environment only)
# ---------------------------------------------------------------------------

if os.getenv("ENV", "production") == "development":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:5173"],
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
        allow_credentials=False,
    )

# ---------------------------------------------------------------------------
# Exception handlers — ensure all errors follow unified error format
# ---------------------------------------------------------------------------


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    """Unwrap HTTPException.detail to the unified error body.

    Our ``api_error()`` helper puts ``{"error": {...}}`` in ``detail``.
    FastAPI by default wraps it in ``{"detail": ...}`` — we unwrap.
    """
    detail = exc.detail
    if isinstance(detail, dict) and "error" in detail:
        return JSONResponse(status_code=exc.status_code, content=detail)
    # Fallback for any HTTPException not created by api_error().
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": str(detail),
                "suggestion": "请稍后重试",
            }
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Convert Pydantic validation errors to unified error format."""
    errors = exc.errors()
    if errors:
        first = errors[0]
        loc = " → ".join(str(l) for l in first.get("loc", []))
        msg = first.get("msg", "")
        detail_msg = f"请求参数校验失败: {loc} — {msg}"
    else:
        detail_msg = "请求参数校验失败"
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "INVALID_REQUEST_BODY",
                "message": detail_msg,
                "suggestion": "请检查请求参数是否完整且格式正确",
            }
        },
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception: %s", exc)
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "服务内部错误",
                "suggestion": "请稍后重试，若持续失败请联系管理员",
            }
        },
    )


# ---------------------------------------------------------------------------
# API routers
# ---------------------------------------------------------------------------

app.include_router(dimensions.router, prefix="/api", tags=["dimensions"])
app.include_router(task_types.router, prefix="/api", tags=["task-types"])
app.include_router(engines.router, prefix="/api", tags=["engines"])
app.include_router(route.router, prefix="/api", tags=["route"])
app.include_router(generate.router, prefix="/api", tags=["generate"])
app.include_router(reload.router, prefix="/api", tags=["reload"])

# ---------------------------------------------------------------------------
# Static files (production — Vite build output served as SPA fallback)
# ---------------------------------------------------------------------------
# Only mount if the static/ directory exists (i.e. in Docker production build).

_static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.isdir(_static_dir):
    from fastapi.staticfiles import StaticFiles

    app.mount("/", StaticFiles(directory=_static_dir, html=True), name="static")
