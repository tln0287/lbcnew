"""Check that every document link in the site points to a file in site/public/docs.

Usage: python tools/verify_docs.py <site-dir>

Scans generated data (src/data/*.json) for "/docs/..." links and the source for
off('/path') / doc('/path') calls that resolve to documents, then checks each
file exists locally. Exits non-zero if any are missing.
"""
import os
import re
import sys
from urllib.parse import unquote

SITE = sys.argv[1]
DOC_RE = re.compile(r"\.(pdf|docx?|xlsx?|pptx?|mp4|zip|txt|csv)$", re.I)
ALIASES = {"/ugcollege/lbctimes": "/ugcollege/lbctimes.pdf", "/pgcollege/lbctimes": "/ugcollege/lbctimes.pdf"}

links = set()
for dp, _, files in os.walk(os.path.join(SITE, "src")):
    for f in files:
        if not f.endswith((".json", ".ts", ".tsx")):
            continue
        t = open(os.path.join(dp, f), encoding="utf-8").read()
        links.update(unquote(m) for m in re.findall(r'"(/docs/[^"]+)"', t))
        for p in re.findall(r"\b(?:off|doc)\('(/[^']*)'\)", t):
            if DOC_RE.search(p) or p in ALIASES:
                links.add("/docs" + ALIASES.get(p, p))
        for p in re.findall(r'"pdf":\s*"https://lbc\.edu\.in([^"]+)"', t):
            links.add("/docs" + ALIASES.get(unquote(p), unquote(p)))

missing = [l for l in sorted(links) if not os.path.isfile(os.path.join(SITE, "public", l.lstrip("/")))]
print(f"{len(links)} document links, {len(missing)} missing locally")
for m in missing:
    print("  missing:", m)
sys.exit(1 if missing else 0)
