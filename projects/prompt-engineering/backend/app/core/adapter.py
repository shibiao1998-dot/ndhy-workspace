"""Engine adapter — convert raw prompt to engine-specific format.

Implements the adapter pattern from technical-architecture.md §3.5.
"""

from __future__ import annotations

import re
from abc import ABC, abstractmethod


class BaseAdapter(ABC):
    """Abstract adapter base class."""

    @abstractmethod
    def adapt(self, raw_prompt: str, max_chars: int) -> str:
        """Transform *raw_prompt* into the target engine format."""
        ...


class MarkdownAdapter(BaseAdapter):
    """Text engines (Claude / GPT-4 / DeepSeek) — keep full Markdown."""

    def adapt(self, raw_prompt: str, max_chars: int) -> str:
        if len(raw_prompt) <= max_chars:
            return raw_prompt
        # Truncate at last complete dimension boundary (### header).
        # Walk backwards from the limit to find the last ### header start.
        truncated = raw_prompt[:max_chars]
        last_header = truncated.rfind("\n### ")
        if last_header > 0:
            truncated = truncated[:last_header]
        return truncated.rstrip() + "\n\n[... 因引擎字符限制已截断 ...]"


class KeywordAdapter(BaseAdapter):
    """Visual engines (Midjourney / DALL-E) — extract keywords, comma-separated.

    Strategy (60-score version — regex-based, no NLP):
    1. Extract bold/heading text.
    2. Extract Chinese/English noun phrases.
    3. De-duplicate, join with commas, truncate.
    """

    # Patterns to extract meaningful tokens.
    _BOLD_RE = re.compile(r"\*\*(.+?)\*\*")
    _HEADING_RE = re.compile(r"^#+\s+(?:[A-L]\d{2}\s+)?(.+)$", re.MULTILINE)
    _CN_PHRASE_RE = re.compile(r"[\u4e00-\u9fff]{2,8}")
    _EN_PHRASE_RE = re.compile(r"[A-Za-z][A-Za-z\- ]{2,30}")

    # Words that are too generic / structural to be useful.
    _STOP_WORDS = {
        "具体信息内容", "维度定义", "质量作用", "用户任务", "关键信息维度",
        "一级", "二级", "三级", "必须参考", "建议参考", "可选参考",
        "约束与禁忌", "数据来源", "更新机制", "使用说明",
    }

    def adapt(self, raw_prompt: str, max_chars: int) -> str:
        tokens: list[str] = []
        seen: set[str] = set()

        def _add(t: str) -> None:
            t = t.strip().strip("*#")
            if t and t not in seen and t not in self._STOP_WORDS and len(t) > 1:
                seen.add(t)
                tokens.append(t)

        # Headings.
        for m in self._HEADING_RE.finditer(raw_prompt):
            _add(m.group(1))

        # Bold text.
        for m in self._BOLD_RE.finditer(raw_prompt):
            _add(m.group(1))

        # Chinese phrases.
        for m in self._CN_PHRASE_RE.finditer(raw_prompt):
            _add(m.group(0))

        # English phrases.
        for m in self._EN_PHRASE_RE.finditer(raw_prompt):
            _add(m.group(0).strip())

        # Join and truncate.
        result = ", ".join(tokens)
        if len(result) > max_chars:
            result = result[:max_chars].rsplit(",", 1)[0]
        return result


class DescriptionAdapter(BaseAdapter):
    """Audio engines (Suno) — extract mood / atmosphere descriptions.

    Strategy: extract adjective-rich phrases, emotional keywords, rhythm cues.
    """

    _MOOD_RE = re.compile(
        r"([\u4e00-\u9fff]{1,4}(?:的|地|风格|氛围|情感|节奏|感觉|旋律|基调|色彩|情绪))"
    )
    _EN_MOOD_RE = re.compile(
        r"\b(inspiring|energetic|calm|dramatic|hopeful|melancholic|upbeat|intense"
        r"|cheerful|gentle|powerful|serene|epic|playful|warm|creative|innovative"
        r"|educational|futuristic|modern|digital|technology)\b",
        re.IGNORECASE,
    )

    def adapt(self, raw_prompt: str, max_chars: int) -> str:
        tokens: list[str] = []
        seen: set[str] = set()

        def _add(t: str) -> None:
            t = t.strip()
            if t and t not in seen and len(t) > 1:
                seen.add(t)
                tokens.append(t)

        for m in self._MOOD_RE.finditer(raw_prompt):
            _add(m.group(1))

        for m in self._EN_MOOD_RE.finditer(raw_prompt):
            _add(m.group(1).lower())

        # If not enough tokens, fall back to keyword extraction.
        if len(tokens) < 5:
            # Add a few nouns for context.
            cn_phrases = re.findall(r"[\u4e00-\u9fff]{2,6}", raw_prompt)
            for p in cn_phrases[:20]:
                _add(p)

        result = ", ".join(tokens)
        if len(result) > max_chars:
            result = result[:max_chars].rsplit(",", 1)[0]
        return result


# ---------------------------------------------------------------------------
# Adapter registry (mapped by EngineConfig.adapter_type)
# ---------------------------------------------------------------------------

ADAPTER_MAP: dict[str, BaseAdapter] = {
    "markdown": MarkdownAdapter(),
    "keyword": KeywordAdapter(),
    "description": DescriptionAdapter(),
}


def adapt_prompt(raw_prompt: str, adapter_type: str, max_chars: int) -> str:
    """Adapt *raw_prompt* using the adapter registered for *adapter_type*.

    Falls back to MarkdownAdapter if the adapter_type is unknown.
    """
    adapter = ADAPTER_MAP.get(adapter_type, ADAPTER_MAP["markdown"])
    return adapter.adapt(raw_prompt, max_chars)
