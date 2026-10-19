"""Check every https://lbc.edu.in link used by the site.

Usage: python tools/check_links.py <src-dir> [report.json]

Scans .json/.ts/.tsx files for official URLs and requests each one, so broken
downloads can be fixed or flagged before deployment.
"""
import concurrent.futures as cf
import json
import os
import re
import sys
import urllib.request
from urllib.parse import quote, unquote

SRC = sys.argv[1]
REPORT = sys.argv[2] if len(sys.argv) > 2 else None
URL_RE = re.compile(r"https://lbc\.edu\.in[^\"'`\s]*")  # NAAC file names contain ( )
OFF_RE = re.compile(r"off\('(/[^']*)'\)")  # the off('/path') helper in src/content/site.ts

urls = set()
for root, _, files in os.walk(SRC):
    for name in files:
        if name.endswith((".json", ".ts", ".tsx")):
            text = open(os.path.join(root, name), encoding="utf-8").read()
            urls.update(u.rstrip(",;") for u in URL_RE.findall(text))
            urls.update("https://lbc.edu.in" + p for p in OFF_RE.findall(text))


def check(url):
    safe = quote(unquote(url), safe=":/?&=%#()")
    for method in ("HEAD", "GET"):
        try:
            req = urllib.request.Request(safe, method=method, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=60) as r:
                return url, r.status
        except urllib.error.HTTPError as e:
            if method == "GET":
                return url, e.code
        except Exception as e:  # network error
            if method == "GET":
                return url, str(e)[:60]
    return url, "?"


with cf.ThreadPoolExecutor(12) as ex:
    results = dict(ex.map(check, sorted(urls)))

bad = {u: s for u, s in results.items() if s != 200}
print(f"checked {len(results)} links, {len(bad)} not OK")
for u, s in sorted(bad.items()):
    print(s, u)
if REPORT:
    json.dump(results, open(REPORT, "w"), indent=1)
