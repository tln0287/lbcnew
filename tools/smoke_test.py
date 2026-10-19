"""Browser smoke test for the LBC site.

Usage: python tools/smoke_test.py <base-url> <screenshot-dir>

Visits every route at desktop, 360px phone and 1366px laptop (reduced motion) and reports:
- console errors / uncaught exceptions
- failed same-origin requests (missing images, chunks)
- horizontal overflow (layout wider than the viewport)
- internal links that render the 404 page
Screenshots of each route are written to <screenshot-dir>.
"""
import os
import sys
from urllib.parse import urljoin, urlparse

from playwright.sync_api import sync_playwright

BASE, SHOTS = sys.argv[1].rstrip("/"), sys.argv[2]
os.makedirs(SHOTS, exist_ok=True)

ROUTES = [
    "/", "/profile", "/faculty", "/faculty?college=PG", "/facilities", "/departments",
    "/departments?category=life", "/courses", "/courses/ug/bsc", "/courses/ug/bca", "/courses/pg/mba",
    "/courses/pg/chemistry-research", "/pg-college", "/academics", "/academics/outcomes",
    "/academics/projects", "/academics/skill-development", "/activities",
    "/activities/bharat-scouts-guides", "/committees", "/committees/anti-ragging", "/iqac",
    "/naac", "/naac?view=dvv&c=5", "/nirf", "/rti", "/aicte", "/placements", "/gallery",
    "/campus-glimpses", "/lbc-times", "/bgv", "/contact", "/search?q=chemistry", "/sitemap",
    "/newsletters", "/newsletters/the-lbc-times", "/newsletters/campus-glimpses-july-2025", "/leadership/1",
]

problems = []
internal_links = set()

with sync_playwright() as p:
    browser = p.chromium.launch()
    for label, viewport, motion in (
        ("desktop", {"width": 1440, "height": 900}, "no-preference"),
        ("mobile", {"width": 360, "height": 780}, "no-preference"),
        ("laptop-reduced-motion", {"width": 1366, "height": 768}, "reduce"),
    ):
        ctx = browser.new_context(viewport=viewport, reduced_motion=motion)
        page = ctx.new_page()
        errors = []
        page.on("console", lambda m: errors.append(f"console: {m.text}") if m.type == "error" else None)
        page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
        page.on(
            "requestfailed",
            lambda r: errors.append(f"requestfailed: {r.url}") if r.url.startswith(BASE) else None,
        )
        page.on(
            "response",
            lambda r: errors.append(f"HTTP {r.status}: {r.url}") if r.url.startswith(BASE) and r.status >= 400 else None,
        )
        for route in ROUTES:
            errors.clear()
            page.goto(BASE + route, wait_until="networkidle")
            page.wait_for_timeout(600)
            # scroll through to trigger lazy content / reveal animations
            page.evaluate("""async () => {
                for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
                window.scrollTo(0, 0);
            }""")
            page.wait_for_timeout(400)
            overflow = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
            if overflow > 1:
                errors.append(f"horizontal overflow {overflow}px")
            if page.locator("h1", has_text="Page not found").count():
                errors.append("rendered 404")
            name = (route.strip("/").replace("/", "_").replace("?", "_").replace("=", "-").replace("&", "_") or "home")
            page.screenshot(path=os.path.join(SHOTS, f"{label}-{name}.png"), full_page=False)
            if label == "desktop":
                for href in page.eval_on_selector_all("a[href]", "els => els.map(e => e.getAttribute('href'))"):
                    if href and href.startswith("/") and not href.startswith("//"):
                        internal_links.add(href.split("#")[0] or "/")
            for e in errors:
                problems.append(f"[{label}] {route}: {e}")
        ctx.close()

    # every internal link must render a real page
    ctx = browser.new_context()
    page = ctx.new_page()
    import urllib.request
    for href in sorted(internal_links):
        if href.startswith("/docs/"):  # mirrored documents: check the file is served
            try:
                urllib.request.urlopen(urllib.request.Request(BASE + href, method="HEAD"), timeout=60)
            except Exception as e:
                problems.append(f"[docs] {href}: {e}")
            continue
        if any(href.startswith(x) for x in ("/img/", "/brand/", "/newsletters/p", "/newsletters/t")):
            continue
        page.goto(BASE + href, wait_until="networkidle")
        if page.locator("h1", has_text="Page not found").count():
            problems.append(f"[links] {href}: renders 404")
    browser.close()

print(f"checked {len(ROUTES)} routes x 3 contexts, {len(internal_links)} internal links")
print("\n".join(problems) if problems else "no problems found")
