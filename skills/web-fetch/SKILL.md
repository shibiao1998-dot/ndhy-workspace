---
name: web-fetch
description: >-
  Fetch and extract content from web pages, converting HTML to readable Markdown.
  Use when: (1) need to read a specific web page or URL, (2) extract documentation content,
  (3) read articles or blog posts, (4) get content from a known URL.
  NOT for: searching the web (use web-search), downloading binary files, or authenticated pages.
metadata:
  openclaw:
    emoji: "🌐"
---

# Web Fetch

Fetch web pages and convert to readable text/Markdown.

## Setup

Requires Python packages:

```bash
pip install httpx readabilipy markdownify beautifulsoup4
```

Or use the simpler `curl` + `python` approach below which works with minimal dependencies.

## Usage

### Method 1: curl + Python (recommended, minimal deps)

```bash
curl -sL "TARGET_URL" | python -c "
import sys
from html.parser import HTMLParser

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []
        self.skip = False
        self.skip_tags = {'script', 'style', 'nav', 'footer', 'header'}
    def handle_starttag(self, tag, attrs):
        if tag in self.skip_tags: self.skip = True
        if tag in ('p', 'br', 'div', 'h1', 'h2', 'h3', 'h4', 'li', 'tr'): self.text.append('\n')
        if tag in ('h1', 'h2', 'h3'): self.text.append('#' * int(tag[1]) + ' ')
    def handle_endtag(self, tag):
        if tag in self.skip_tags: self.skip = False
    def handle_data(self, data):
        if not self.skip: self.text.append(data.strip())

p = TextExtractor()
p.feed(sys.stdin.read())
print('\n'.join(line for line in ''.join(p.text).split('\n') if line.strip())[:8000])
"
```

### Method 2: Python with readabilipy (higher quality)

```bash
python -c "
import httpx, sys
from readabilipy import simple_json_from_html_string
from markdownify import markdownify

url = 'TARGET_URL'
r = httpx.get(url, follow_redirects=True, timeout=15, verify=False,
              headers={'User-Agent': 'Mozilla/5.0 (compatible; Bot/1.0)'})
article = simple_json_from_html_string(r.text, use_readability=True)
title = article.get('title', '')
content = article.get('content', r.text)
md = markdownify(content)
print(f'# {title}\n\n{md[:8000]}')
"
```

### PowerShell (Windows)

```powershell
curl -sL "TARGET_URL" | python -c "import sys; from html.parser import HTMLParser; ..."
```

## Parameters

| Parameter | Description |
|-----------|-------------|
| `TARGET_URL` | The full URL to fetch (must include `https://`) |

## Tips

- Replace `TARGET_URL` with the actual URL
- Method 1 works everywhere with zero extra packages
- Method 2 gives cleaner output but needs `pip install httpx readabilipy markdownify`
- Output is truncated to ~8000 chars to stay within context limits
- For JavaScript-heavy pages, use the `browser` tool instead
