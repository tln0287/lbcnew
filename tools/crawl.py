"""Snapshot the official LBC websites for the content pipeline.

Usage: python tools/crawl.py <output-dir>

Fetches https://lbc.edu.in/ and https://lbc.edu.in/pghome, then every internal
HTML page they link to (one level deep), plus the department category pages
that are only linked from inner pages. Pages are saved with names derived from
their path, e.g. /ugcollege/profile -> ugcollege_profile.html. A summary of
status codes is written to _index.json so unavailable pages can be followed up.
"""
import concurrent.futures as cf
import json
import os
import re
import sys
import urllib.error
import urllib.request
from urllib.parse import quote, unquote, urljoin

BASE = "https://lbc.edu.in"
OUT = sys.argv[1]
os.makedirs(OUT, exist_ok=True)

EXTRA = ["/ugcollege/Lifesciences", "/ugcollege/Arts", "/ugcollege/Commerce", "/ugcollege/Management", "/ugcollege/Languages"]


def name_for(path):
    return re.sub(r"[^A-Za-z0-9]+", "_", quote(unquote(path), safe="/()")).strip("_") or "root"


def fetch(path):
    url = BASE + quote(unquote(path), safe="/()?=&")
    try:
        with urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}), timeout=60) as r:
            ctype = r.headers.get("Content-Type", "")
            body = r.read().decode("utf-8", "ignore") if "html" in ctype else None
            return path, r.status, ctype, body
    except urllib.error.HTTPError as e:
        return path, e.code, "", None
    except Exception as e:  # network failure
        return path, str(e)[:80], "", None


paths = set(EXTRA)
for home in ("/", "/pghome"):
    _, _, _, html = fetch(home)
    open(os.path.join(OUT, name_for(home) + ".html"), "w", encoding="utf-8").write(html or "")
    for href in re.findall(r'href=["\']([^"\'#][^"\']*)["\']', html or ""):
        url = urljoin(BASE + "/", href)
        if url.startswith(BASE) and not re.search(r"\.(pdf|png|jpe?g|docx?|xlsx?|css|js|mp4)$", url, re.I):
            paths.add(url[len(BASE):] or "/")

index = {}
with cf.ThreadPoolExecutor(8) as ex:
    for path, status, ctype, html in ex.map(fetch, sorted(paths)):
        index[path] = {"status": status, "type": ctype}
        if html:
            open(os.path.join(OUT, name_for(path) + ".html"), "w", encoding="utf-8").write(html)

json.dump(index, open(os.path.join(OUT, "_index.json"), "w"), indent=1)
bad = {p: v["status"] for p, v in index.items() if v["status"] != 200}
print(f"{len(index)} pages, {len(bad)} unavailable")
for p, s in sorted(bad.items()):
    print(s, p)
