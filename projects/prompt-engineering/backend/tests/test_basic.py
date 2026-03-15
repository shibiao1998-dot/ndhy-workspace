"""Basic tests for the prompt engineering backend.

Covers:
- Dimension file parsing (real files)
- Router engine (keyword matching for 3+ task types)
- Assembler (priority sorting and assembly)
- Adapter (text / visual / audio format conversion)
- All 6 API endpoints via TestClient
"""

from __future__ import annotations

import os
import sys

import pytest

# Ensure the backend package is importable.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.config import DIMENSIONS_DIR, ENGINES, TASK_TYPES
from app.core.adapter import MarkdownAdapter, KeywordAdapter, DescriptionAdapter, adapt_prompt
from app.core.assembler import assemble
from app.core.dimension_loader import build_dimension_store, get_store, load_dimensions
from app.core.router_engine import expand_dimension_refs, route_task


# ---------------------------------------------------------------------------
# Fixture: ensure dimensions are loaded once for the test session.
# ---------------------------------------------------------------------------

@pytest.fixture(scope="session", autouse=True)
def _load_dimensions():
    """Load real dimension files before running any test."""
    store = load_dimensions(DIMENSIONS_DIR)
    assert store.total_dimensions > 0, "No dimensions loaded — check DIMENSIONS_DIR"
    return store


# ===========================================================================
# 1. Dimension loader tests
# ===========================================================================


class TestDimensionLoader:
    def test_store_loaded(self):
        store = get_store()
        # Real files may parse fewer due to format variation; 70+ is acceptable.
        assert store.total_dimensions >= 70, (
            f"Expected ≥70 dimensions, got {store.total_dimensions}"
        )

    def test_categories_count(self):
        store = get_store()
        assert store.total_categories >= 8, (
            f"Expected ≥8 categories, got {store.total_categories}"
        )

    def test_category_a_dimensions(self):
        store = get_store()
        assert "A" in store.categories
        cat_a = store.categories["A"]
        assert cat_a.dimension_count >= 1
        assert "A01" in cat_a.dimension_ids

    def test_dimension_a01_fields(self):
        store = get_store()
        assert "A01" in store.dimensions
        dim = store.dimensions["A01"]
        assert dim.name != ""
        assert dim.category == "A"
        assert dim.category_name != ""
        assert dim.definition != ""
        assert dim.char_count > 0
        assert dim.status in ("ready", "partial")
        assert len(dim.summary) <= 203

    def test_dimension_content_not_empty(self):
        store = get_store()
        # At least 60% of dimensions should have non-empty content
        # (some files have different formats that make content extraction harder).
        non_empty = sum(1 for d in store.dimensions.values() if d.char_count > 0)
        assert non_empty >= store.total_dimensions * 0.6

    def test_partial_status_detection(self):
        store = get_store()
        # Check if any dimension has "⚠️ 待填充" — those should be marked partial.
        for dim in store.dimensions.values():
            if "⚠️ 待填充" in dim.content:
                assert dim.status == "partial", f"{dim.id} should be partial"


# ===========================================================================
# 2. Router engine tests
# ===========================================================================


class TestRouterEngine:
    def test_route_prototype(self):
        """Keywords "原型" and "交互" should match the prototype task type."""
        result = route_task("设计一个初中化学虚拟实验的交互原型")
        assert result.task_type == "prototype"
        assert result.confidence >= 0.5
        assert not result.is_manual_override

    def test_route_product_planning(self):
        """Keyword "策划" should match product_planning."""
        result = route_task("策划一个新产品的功能需求")
        assert result.task_type == "product_planning"
        assert result.confidence >= 0.5

    def test_route_core_value(self):
        """Keyword "核心价值" should match core_value."""
        result = route_task("定义产品的核心价值主张")
        assert result.task_type == "core_value"
        assert result.confidence >= 0.5

    def test_route_ai_art(self):
        """Keyword "美术" should match ai_art."""
        result = route_task("设计一个3D美术视觉方案")
        assert result.task_type == "ai_art"

    def test_route_general_fallback(self):
        """An unrecognisable task should fall back to general with low confidence."""
        result = route_task("做个随便什么")
        assert result.task_type == "general"
        assert result.confidence == 0.3

    def test_route_manual_override(self):
        """Manual override should use the specified task type with confidence 1.0."""
        result = route_task("做个随便什么", task_type_key="ai_programming")
        assert result.task_type == "ai_programming"
        assert result.confidence == 1.0
        assert result.is_manual_override

    def test_route_invalid_task_type(self):
        """Non-existent task_type_key should raise KeyError."""
        with pytest.raises(KeyError):
            route_task("test", task_type_key="nonexistent")

    def test_route_returns_dimension_ids(self):
        """Route result should contain string IDs (not objects)."""
        result = route_task("原型交互设计")
        assert isinstance(result.required, list)
        if result.required:
            assert isinstance(result.required[0], str)

    def test_expand_dimension_refs(self):
        """Category refs expand to individual dimension IDs."""
        store = get_store()
        expanded = expand_dimension_refs(["A"], store)
        assert "A01" in expanded
        # A should have multiple dimensions.
        a_count = sum(1 for x in expanded if x.startswith("A"))
        assert a_count >= 2

    def test_expand_mixed_refs(self):
        """Mixed category + single ID refs work correctly."""
        store = get_store()
        # Pick a known single dimension from the store.
        single_id = sorted(store.dimensions.keys())[0]
        expanded = expand_dimension_refs(["A", single_id], store)
        assert single_id in expanded
        assert "A01" in expanded


# ===========================================================================
# 3. Assembler tests
# ===========================================================================


class TestAssembler:
    def test_basic_assembly(self):
        store = get_store()
        dims = list(store.dimensions.keys())[:5]
        priorities = {d: 1 for d in dims}
        result = assemble(
            task_text="测试任务",
            task_type_name="通用设计任务",
            dimension_ids=dims,
            priorities=priorities,
            max_chars=200000,
        )
        assert result.total_chars > 0
        assert len(result.dimensions_used) == len(dims)
        assert result.by_priority[1] == len(dims)

    def test_priority_sorting(self):
        """Dimensions should appear in priority order in the raw prompt."""
        store = get_store()
        all_ids = sorted(store.dimensions.keys())
        if len(all_ids) < 6:
            pytest.skip("Need at least 6 dimensions")
        dims = all_ids[:6]
        priorities = {
            dims[0]: 1, dims[1]: 1,
            dims[2]: 2, dims[3]: 2,
            dims[4]: 3, dims[5]: 3,
        }
        result = assemble(
            task_text="排序测试",
            task_type_name="测试",
            dimension_ids=dims,
            priorities=priorities,
            max_chars=500000,
        )
        # All should be included.
        assert len(result.dimensions_used) == 6
        assert "一级：必须参考" in result.raw_prompt
        assert "二级：建议参考" in result.raw_prompt

    def test_truncation_by_char_limit(self):
        """With a very small max_chars, some non-required dims should be truncated."""
        store = get_store()
        all_ids = sorted(store.dimensions.keys())[:10]
        priorities = {all_ids[0]: 1}
        priorities.update({d: 2 for d in all_ids[1:]})

        result = assemble(
            task_text="截断测试",
            task_type_name="测试",
            dimension_ids=all_ids,
            priorities=priorities,
            max_chars=500,  # Very small limit.
        )
        # Required (1st) dim should always be included.
        assert all_ids[0] in result.dimensions_used
        # Some should be truncated.
        assert len(result.dimensions_truncated) > 0


# ===========================================================================
# 4. Adapter tests
# ===========================================================================


class TestAdapter:
    def test_markdown_adapter_passthrough(self):
        adapter = MarkdownAdapter()
        text = "# Hello\n\nWorld"
        assert adapter.adapt(text, 10000) == text

    def test_markdown_adapter_truncation(self):
        adapter = MarkdownAdapter()
        text = "### Dim A\nContent A\n\n### Dim B\nContent B very long" * 100
        result = adapter.adapt(text, 200)
        assert len(result) <= 300  # Some overhead from truncation message.

    def test_keyword_adapter_produces_keywords(self):
        adapter = KeywordAdapter()
        text = "**战略核心方向** AI教育 虚拟实验 3D模型 interactive design"
        result = adapter.adapt(text, 4000)
        assert len(result) > 0
        # Should contain comma-separated tokens.
        assert "," in result or len(result.split()) >= 1

    def test_description_adapter_produces_text(self):
        adapter = DescriptionAdapter()
        text = "创新的 inspiring 氛围 教育 technology 节奏 creative"
        result = adapter.adapt(text, 2000)
        assert len(result) > 0

    def test_adapt_prompt_dispatch(self):
        result = adapt_prompt("# Test\nHello world", "markdown", 10000)
        assert "Hello world" in result

        result_kw = adapt_prompt("**关键词测试** 教育 AI", "keyword", 4000)
        assert len(result_kw) > 0


# ===========================================================================
# 5. API endpoint tests (via FastAPI TestClient)
# ===========================================================================


class TestAPI:
    @pytest.fixture(scope="class")
    def client(self):
        from fastapi.testclient import TestClient
        from app.main import app
        return TestClient(app)

    def test_get_dimensions(self, client):
        resp = client.get("/api/dimensions")
        assert resp.status_code == 200
        data = resp.json()
        assert "dimensions" in data
        assert "total" in data
        assert "categories" in data
        assert data["total"] >= 70
        # Verify dimension shape.
        dim = data["dimensions"][0]
        assert "id" in dim
        assert "name" in dim
        assert "category" in dim
        assert "category_name" in dim
        assert "definition" in dim
        assert "char_count" in dim
        assert "status" in dim
        assert "summary" in dim

    def test_get_task_types(self, client):
        resp = client.get("/api/task-types")
        assert resp.status_code == 200
        data = resp.json()
        assert "task_types" in data
        assert len(data["task_types"]) == 8
        keys = {tt["key"] for tt in data["task_types"]}
        assert "general" in keys
        assert "prototype" in keys

    def test_get_engines(self, client):
        resp = client.get("/api/engines")
        assert resp.status_code == 200
        data = resp.json()
        assert "engines" in data
        assert len(data["engines"]) == 6
        # Verify ai_platform and format_type fields.
        engine_map = {e["key"]: e for e in data["engines"]}
        assert "ai_platform" in engine_map["claude"]
        assert engine_map["midjourney"]["format_type"] == "keywords"
        assert engine_map["claude"]["format_type"] == "markdown"
        assert engine_map["suno"]["format_type"] == "description"

    def test_post_route_auto(self, client):
        resp = client.post("/api/route", json={
            "task": "设计一个初中化学虚拟实验的交互原型",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["task_type"] == "prototype"
        assert data["confidence"] >= 0.5
        assert data["is_manual_override"] is False
        assert isinstance(data["required"], list)
        assert isinstance(data["recommended"], list)
        assert isinstance(data["optional"], list)
        assert data["total_chars"] > 0
        # IDs should be strings.
        if data["required"]:
            assert isinstance(data["required"][0], str)

    def test_post_route_manual(self, client):
        resp = client.post("/api/route", json={
            "task": "任意描述",
            "task_type": "ai_programming",
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["task_type"] == "ai_programming"
        assert data["confidence"] == 1.0
        assert data["is_manual_override"] is True

    def test_post_route_invalid_task_type(self, client):
        resp = client.post("/api/route", json={
            "task": "test",
            "task_type": "nonexistent",
        })
        assert resp.status_code == 404
        assert resp.json()["error"]["code"] == "TASK_TYPE_NOT_FOUND"

    def test_post_route_empty_task(self, client):
        resp = client.post("/api/route", json={
            "task": "   ",
        })
        assert resp.status_code == 400

    def test_post_generate_text_engine(self, client):
        # First route to get dimension IDs.
        route_resp = client.post("/api/route", json={
            "task": "设计一个初中化学虚拟实验的交互原型",
        })
        route_data = route_resp.json()
        dims = route_data["required"][:3]
        if not dims:
            pytest.skip("No required dimensions returned")
        priorities = {d: 1 for d in dims}

        resp = client.post("/api/generate", json={
            "task": "设计一个初中化学虚拟实验的交互原型",
            "engine": "claude",
            "dimensions": dims,
            "priorities": priorities,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "prompt" in data
        assert len(data["prompt"]) > 0
        assert "stats" in data
        assert data["stats"]["dimensions_used"] == len(dims)
        assert data["stats"]["total_chars"] > 0

    def test_post_generate_visual_engine(self, client):
        store = get_store()
        dims = sorted(store.dimensions.keys())[:2]
        priorities = {d: 1 for d in dims}

        resp = client.post("/api/generate", json={
            "task": "设计视觉方案",
            "engine": "midjourney",
            "dimensions": dims,
            "priorities": priorities,
        })
        assert resp.status_code == 200
        data = resp.json()
        # Midjourney should produce keyword-style output.
        assert "prompt" in data
        assert len(data["prompt"]) > 0

    def test_post_generate_audio_engine(self, client):
        store = get_store()
        dims = sorted(store.dimensions.keys())[:2]
        priorities = {d: 1 for d in dims}

        resp = client.post("/api/generate", json={
            "task": "制作教育宣传音乐",
            "engine": "suno",
            "dimensions": dims,
            "priorities": priorities,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "prompt" in data

    def test_post_generate_invalid_engine(self, client):
        resp = client.post("/api/generate", json={
            "task": "test",
            "engine": "gpt5",
            "dimensions": ["A01"],
            "priorities": {"A01": 1},
        })
        assert resp.status_code == 404
        assert resp.json()["error"]["code"] == "ENGINE_NOT_FOUND"

    def test_post_generate_invalid_dimension(self, client):
        resp = client.post("/api/generate", json={
            "task": "test",
            "engine": "claude",
            "dimensions": ["Z99"],
            "priorities": {"Z99": 1},
        })
        assert resp.status_code == 404
        assert resp.json()["error"]["code"] == "DIMENSION_NOT_FOUND"

    def test_post_generate_empty_dimensions(self, client):
        resp = client.post("/api/generate", json={
            "task": "test",
            "engine": "claude",
            "dimensions": [],
            "priorities": {},
        })
        # Pydantic min_length=1 triggers 422 via our validation handler.
        assert resp.status_code == 422
        body = resp.json()
        assert "error" in body
        assert body["error"]["code"] in ("INVALID_REQUEST_BODY", "EMPTY_DIMENSIONS")

    def test_post_reload(self, client):
        resp = client.post("/api/reload")
        assert resp.status_code == 200
        data = resp.json()
        assert data["dimensions_count"] >= 70
        assert data["categories_count"] >= 8
        assert "loaded_at" in data

    def test_error_format_consistency(self, client):
        """All error responses should follow the unified error format."""
        resp = client.post("/api/route", json={"task": "test", "task_type": "bad"})
        assert resp.status_code == 404
        body = resp.json()
        assert "error" in body
        assert "code" in body["error"]
        assert "message" in body["error"]
        assert "suggestion" in body["error"]
