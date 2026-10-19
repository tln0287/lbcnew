"""Create web-optimised WebP derivatives of the official LBC images.

Usage: python tools/optimize_images.py <source-media-dir> <public-img-dir>

- Mirrors the folder structure: source-media/a/b.jpg -> public/img/a/b.webp
- Faculty portraits are capped at 480px, everything else at 1800px.
- UG facility photos (1024x768, under media/jrcollege/news) carry a GPS-camera
  stamp in the lower part of the frame; that strip is cropped off.
"""
import os
import sys

from PIL import Image, ImageOps

SRC, DST = sys.argv[1], sys.argv[2]
EXTS = (".jpg", ".jpeg", ".png", ".webp", ".jfif")

count = 0
for root, _, files in os.walk(SRC):
    for name in files:
        if not name.lower().endswith(EXTS):
            continue
        src = os.path.join(root, name)
        rel = os.path.relpath(src, SRC)
        out = os.path.join(DST, os.path.splitext(rel)[0] + ".webp")
        if os.path.exists(out) and os.path.getmtime(out) >= os.path.getmtime(src):
            continue
        try:
            im = ImageOps.exif_transpose(Image.open(src))
        except Exception as exc:  # unreadable upload on the source site
            print("skip", rel, exc)
            continue
        has_alpha = im.mode in ("RGBA", "LA", "P") and name.lower().endswith(".png")
        im = im.convert("RGBA" if has_alpha else "RGB")
        norm = rel.replace("\\", "/")
        if norm.startswith("media/jrcollege/news/") and im.size == (1024, 768):
            im = im.crop((0, 0, 1024, 462))
        cap = 480 if "/faculty/" in norm or "aboutiqac" in norm else 1800
        im.thumbnail((cap, cap * 2))
        os.makedirs(os.path.dirname(out), exist_ok=True)
        im.save(out, "WEBP", quality=78, method=5)
        count += 1
print("written", count)
