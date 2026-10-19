"""Mirror every document linked from lbc.edu.in into the website.

Usage:
  python tools/mirror_docs.py inventory <crawl-dir> <site-dir> <out.json>   list documents + sizes
  python tools/mirror_docs.py download  <inventory.json> <site-dir>          download to site/public/docs

A "document" is any linked file that is not a web page or an image used in the
design: PDF, Word, Excel, PowerPoint, MP4 and the PDF served at /ugcollege/lbctimes.
Files are stored at site/public/docs/<original path>, so /static/nirf2024.pdf is
served by the app as /docs/static/nirf2024.pdf.
"""
import concurrent.futures as cf
import json
import os
import re
import sys
import urllib.request
from urllib.parse import quote, unquote, urljoin, urlparse

BASE = "https://lbc.edu.in"
DOC_RE = re.compile(r"\.(pdf|docx?|xlsx?|pptx?|mp4|zip|txt|csv)$", re.I)
SPECIAL = {"/ugcollege/lbctimes": "/ugcollege/lbctimes.pdf", "/pgcollege/lbctimes": "/ugcollege/lbctimes.pdf"}
UA = {"User-Agent": "Mozilla/5.0"}


def norm(href):
    href = href.strip().strip('"').strip()
    u = urlparse(urljoin(BASE + "/", re.sub(r"^(\.\./)+", "/", href)))
    if u.netloc and u.netloc != "lbc.edu.in":
        return None
    path = unquote(u.path)
    if path in SPECIAL or DOC_RE.search(path):
        return path
    return None


def local_path(path):
    return "/docs" + SPECIAL.get(path, path)


def inventory(crawl, site, out):
    paths = set()
    for root in (crawl, os.path.join(site, "src")):
        for dp, _, files in os.walk(root):
            for f in files:
                if not f.endswith((".html", ".json", ".ts", ".tsx")):
                    continue
                t = open(os.path.join(dp, f), encoding="utf-8", errors="ignore").read()
                hrefs = re.findall(r'href=["\']([^"\']+)["\']', t)
                hrefs += re.findall(r"https://lbc\.edu\.in[^\"'`\s]*", t)
                hrefs += [m for m in re.findall(r"off\('(/[^']*)'\)", t)]
                for h in hrefs:
                    p = norm(h)
                    if p:
                        paths.add(p)

    def head(p):
        url = BASE + quote(p, safe="/()")
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, method="HEAD", headers=UA), timeout=60)
            return p, r.status, int(r.headers.get("Content-Length") or 0)
        except urllib.error.HTTPError as e:
            return p, e.code, 0
        except Exception as e:
            return p, str(e)[:40], 0

    with cf.ThreadPoolExecutor(12) as ex:
        rows = sorted(ex.map(head, sorted(paths)))
    data = [{"path": p, "status": s, "bytes": n, "local": local_path(p)} for p, s, n in rows]
    json.dump(data, open(out, "w"), indent=1)
    ok = [d for d in data if d["status"] == 200]
    print(f"{len(data)} documents, {len(ok)} available, {sum(d['bytes'] for d in ok) / 1e6:.0f} MB")


def download(inv, site):
    data = json.load(open(inv))

    def get(d):
        if d["status"] != 200:
            return d["path"], "skip"
        dest = os.path.join(site, "public", d["local"].lstrip("/"))
        if os.path.exists(dest) and (not d["bytes"] or os.path.getsize(dest) == d["bytes"]):
            return d["path"], "cached"
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        url = BASE + quote(d["path"], safe="/()")
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=600) as r, open(dest + ".part", "wb") as f:
                while chunk := r.read(1 << 20):
                    f.write(chunk)
            os.replace(dest + ".part", dest)
            return d["path"], "ok"
        except Exception as e:
            return d["path"], "ERR " + str(e)[:60]

    done = 0
    with cf.ThreadPoolExecutor(6) as ex:
        for p, r in ex.map(get, data):
            done += 1
            if r.startswith("ERR"):
                print(r, p)
    print("finished", done)


if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "inventory":
        inventory(*sys.argv[2:5])
    else:
        download(*sys.argv[2:4])
