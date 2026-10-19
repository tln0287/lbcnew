"""Render newsletter PDFs (Campus Glimpses, The LBC Times) to page images.

Usage: python tools/render_issues.py <source-media-dir> <site-dir>

Reads source-media/newsletters/*.pdf (downloaded from lbc.edu.in) and writes
  <site>/public/newsletters/<slug>/p001.webp ...   reader pages (1100px wide)
  <site>/public/newsletters/<slug>/t001.webp ...   thumbnails (180px wide)
  <site>/src/data/newsletters.json                 index used by the shelf and reader
The reader shows these images, so visitors never wait for a large PDF; the
original PDF on lbc.edu.in stays linked for the full document.
"""
import io
import json
import os
import re
import sys

import pymupdf
from PIL import Image

SRC, SITE = sys.argv[1], sys.argv[2]
docs = json.load(open(os.path.join(SITE, "src/data/documents.json"), encoding="utf-8"))

issues = [{"label": "The LBC Times", "href": "https://lbc.edu.in/ugcollege/lbctimes", "file": "LBC_Times.pdf", "kind": "The LBC Times"}]
for g in docs["campusGlimpses"]:
    issues.append({"label": g["label"], "href": g["href"], "file": os.path.basename(g["href"]), "kind": "Campus Glimpses"})


def webp(pix, width, path):
    im = Image.open(io.BytesIO(pix.tobytes("png"))).convert("RGB")
    im.thumbnail((width, width * 3))
    im.save(path, "WEBP", quality=72, method=5)
    return im.size


out = []
for it in issues:
    pdf = os.path.join(SRC, "newsletters", it["file"])
    if not os.path.exists(pdf):
        print("missing", pdf)
        continue
    name = it["kind"] if it["label"] == it["kind"] else f"{it['kind']} {it['label']}"
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    dest = os.path.join(SITE, "public", "newsletters", slug)
    os.makedirs(dest, exist_ok=True)
    doc = pymupdf.open(pdf)
    size = None
    for i, page in enumerate(doc):
        n = f"{i + 1:03d}"
        if not os.path.exists(os.path.join(dest, f"p{n}.webp")):
            pix = page.get_pixmap(dpi=110)
            size = webp(pix, 1100, os.path.join(dest, f"p{n}.webp"))
            webp(pix, 180, os.path.join(dest, f"t{n}.webp"))
        elif size is None:
            size = Image.open(os.path.join(dest, f"p{n}.webp")).size
    m = re.match(r"(\w+)\s+(\d{4})$", it["label"])
    out.append({
        "slug": slug,
        "kind": it["kind"],
        "title": it["label"],
        "month": m.group(1) if m else it["label"],
        "year": m.group(2) if m else "",
        "pages": len(doc),
        "ratio": round(size[0] / size[1], 4) if size else 0.7071,
        "pdf": it["href"],
    })
    print(slug, len(doc), "pages")

json.dump(out, open(os.path.join(SITE, "src/data/newsletters.json"), "w", encoding="utf-8"), indent=1, ensure_ascii=False)
