#!/usr/bin/env python3
from __future__ import annotations

import hashlib
import mimetypes
import re
import sys
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
ASSETS.mkdir(exist_ok=True)
HTML_FILES = sorted(ROOT.glob("*.html"))
pattern = re.compile(r'https://www\.figma\.com/api/mcp/asset/[A-Za-z0-9._-]+')

found_any = False
for html_file in HTML_FILES:
    text = html_file.read_text(encoding="utf-8")
    urls = list(dict.fromkeys(pattern.findall(text)))
    if not urls:
        continue

    found_any = True
    print(f"{html_file.name}: localizing {len(urls)} Figma asset(s)...")
    for i, url in enumerate(urls, 1):
        parsed = urlparse(url)
        basename = Path(parsed.path).name
        if "." not in basename:
            basename = hashlib.sha1(url.encode()).hexdigest()[:16] + ".bin"

        dest = ASSETS / basename
        if not dest.exists():
            req = Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urlopen(req, timeout=60) as r:
                data = r.read()
                ctype = r.headers.get_content_type()
            if dest.suffix == ".bin":
                ext = mimetypes.guess_extension(ctype) or ".bin"
                dest = dest.with_suffix(ext)
                basename = dest.name
            dest.write_bytes(data)
            print(f"  [{i}/{len(urls)}] {basename}: {len(data)} bytes")
        else:
            print(f"  [{i}/{len(urls)}] reuse {basename}")

        text = text.replace(url, f"assets/{basename}")

    html_file.write_text(text, encoding="utf-8")

if not found_any:
    print("No Figma MCP asset URLs remain; nothing to localize.")
    sys.exit(0)

print("Updated HTML screens to use local assets/ paths.")
