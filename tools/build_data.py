"""Convert crawled pages of lbc.edu.in into JSON content for the website.

Usage: python tools/build_data.py <crawled-pages-dir> <output-dir> <source-media-dir> [link-report.json]

The optional link report comes from tools/check_links.py; documents that the
official server does not return are flagged "unavailable" instead of linked.

Every value written here is extracted from the official site; nothing is invented.
Document links are kept as absolute https://lbc.edu.in URLs so the original
downloads are preserved.
"""
import json
import os
import re
import sys
from urllib.parse import urljoin, quote

from bs4 import BeautifulSoup, Comment

BASE = "https://lbc.edu.in/"
SRC, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)


def load(name):
    path = os.path.join(SRC, name + ".html")
    if not os.path.exists(path):
        print("missing", name)
        return None
    return open(path, encoding="utf-8", errors="ignore").read()


def body(html):
    """Main content between page title and footer."""
    i = html.find("kingster-page-title-wrap")
    j = html.find("kingster-footer-wrapper")
    i = html.rfind("<", 0, i) if i > 0 else 0  # start at the opening tag, not mid-attribute
    j = html.rfind("<", 0, j) if j > 0 else len(html)
    return html[i:j]


def clean(t):
    # an AI-tool artefact on the official IIC page: "such as :contentReference[...]{...} (ARIIA)"
    t = re.sub(r":contentReference\[[^\]]*\]\{[^}]*\}\s*", "", t or "")
    t = re.sub(r"such as\s+\(([^)]+)\)", r"such as \1", t)
    return " ".join(t.replace("\xa0", " ").split())


DOC_RE = re.compile(r"\.(pdf|docx?|xlsx?|pptx?|mp4|zip|txt|csv)$", re.I)


def localize(url):
    """Documents are mirrored into the site (tools/mirror_docs.py): serve /docs/<path>."""
    from urllib.parse import unquote as _u, urlparse as _p
    u = _p(url)
    if u.netloc == "lbc.edu.in" and DOC_RE.search(_u(u.path)):
        return "/docs" + quote(_u(u.path), safe="/()")
    return url


def absurl(href):
    href = href.strip().strip('"').strip()
    if href.startswith(("http", "mailto:", "tel:")):
        return href
    href = re.sub(r"^(\.\./)+", "/", href)
    return localize(quote(urljoin(BASE, href), safe=":/?&=%#()"))


def local_img(src):
    """Path of the optimised WebP derivative produced by tools/optimize_images.py."""
    src = re.sub(r"^(\.\./)+", "/", src)
    src = src if src.startswith("/") else "/" + src
    return "/img" + os.path.splitext(src)[0] + ".webp"


def write(name, data):
    with open(os.path.join(OUT, name + ".json"), "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)


# ---------------------------------------------------------------- committees
COMMITTEES = [
    ("committees", "admission", "Admission Committee"),
    ("antiragging", "anti-ragging", "Anti-Ragging & Disciplinary Committee"),
    ("griviance", "grievance-redressal", "Grievances & Redressal Committee"),
    ("internal", "icc", "Internal Compliance Committee (ICC)"),
    ("Enter", "entrepreneurship-cell", "Entrepreneurship Cell"),
    ("iqaccom", "iqac", "IQAC"),
    ("women", "women-empowerment", "Women Empowerment Cell"),
    ("sportscom", "sports", "Sports Committee"),
    ("academiccom", "academic", "Academic Committee"),
    ("examination", "examination", "Examination Committee"),
    ("minority", "minority-welfare", "Minority Students' Welfare Committee"),
    ("scholarship", "scholarship", "Scholarship Committee"),
    ("scst", "sc-st", "SC / ST Committee"),
    ("cultural", "cultural", "Cultural Committee"),
]


def lines_of(td):
    for br in td.find_all("br"):
        br.replace_with("\n")
    parts = []
    for el in td.find_all(["p", "li"]) or [td]:
        parts += el.get_text("\n").split("\n")
    out = [clean(x) for x in parts]
    return [x for x in dict.fromkeys(out) if x]


def committees(college):
    res = []
    for path, slug, name in COMMITTEES:
        html = load(f"{college}_{path}")
        if not html:
            continue
        soup = BeautifulSoup(body(html), "lxml")
        members, roles, contacts = [], [], []
        for table in soup.select("table"):
            heads = [clean(th.get_text()).lower() for th in table.find_all("th")]
            if "name" in heads:
                # PG layout: S.No | Name | Status | Email ID | Phone Number
                col = {h: i for i, h in enumerate(heads)}
                for tr in table.find_all("tr"):
                    tds = [clean(td.get_text(" ")) for td in tr.find_all("td")]
                    if len(tds) < len(heads) or not tds[col["name"]]:
                        continue
                    get = lambda key: next((tds[i] for h, i in col.items() if key in h), "")
                    person = {"name": get("name"), "status": get("status"), "email": get("email"), "phone": get("phone")}
                    contacts.append(person)
                    members.append(f"{person['name']} – {person['status']}" if person["status"] else person["name"])
                continue
            for tr in table.find_all("tr"):
                tds = tr.find_all("td")
                if len(tds) >= 2:
                    members += lines_of(tds[0])
                    roles += lines_of(tds[1])
        entry = {"slug": slug, "name": name, "members": members, "roles": roles,
                 "official": f"{BASE}{college}/{path}"}
        if contacts:
            entry["contacts"] = contacts
        res.append(entry)
    return res


write("committees", {"ug": committees("ugcollege"), "pg": committees("pgcollege")})

# ------------------------------------------------------------------- faculty
UG_FACULTY = [
    ("B. A. (Social Science)", "ugcollege_faculty_B_20A_20_Social_20Science", "B.A."),
    ("BBA", "ugcollege_faculty_BBA", "BBA"),
    ("BCA", "ugcollege_faculty_BCA", "BCA"),
    ("B. Com.", "ugcollege_faculty_B_20Com", "B.Com."),
    ("B. Sc.", "ugcollege_faculty_B_20Sc", "B.Sc."),
    ("Library", "ugcollege_faculty_Library", "Library Science"),
]
PG_DEPTS = {1: "MBA", 2: "MCA", 3: "Computer Science", 4: "Mathematics", 5: "Biochemistry",
            6: "Biotechnology", 7: "Chemistry", 8: "English", 9: "Human Resource Management",
            10: "Microbiology", 11: "M.Com.", 12: "Placements", 13: "Library Science",
            14: "Chemistry – Research"}


def photo_map(html):
    """Photo cards are commented out on the live site; map them by name."""
    raw = html.replace("<!--", "").replace("-->", "")
    m = {}
    for src, name in re.findall(r'<img src="([^"]+)">.{0,900}?<h3 class="title"[^>]*>([^<]+)</h3>', raw, re.S):
        if "blank-profile" in src:
            continue
        m[clean(name)] = local_img(src)
    return m


def faculty_tables(html, default_group):
    photos = photo_map(html)
    soup = BeautifulSoup(body(html), "lxml")
    people = []
    for table in soup.select("table"):
        heads = [clean(th.get_text()) for th in table.find_all("th")]
        if "Name" not in heads:
            continue
        h3 = table.find_previous("h3")
        group = clean(h3.get_text()) if h3 and "gdlr-core-block-item-title" in (h3.get("class") or []) else default_group
        for tr in table.select("tbody tr"):
            tds = tr.find_all("td")
            if len(tds) < 3:
                continue
            name = clean(tds[0].get_text())
            if not name:
                continue
            a = tds[3].find("a") if len(tds) > 3 else None
            people.append({
                "name": name,
                "designation": clean(tds[1].get_text()),
                "qualification": clean(tds[2].get_text()).rstrip(","),
                "group": group,
                "profile": absurl(a["href"]) if a and a.get("href") and a["href"] != "#" else None,
                "photo": photos.get(name),
            })
    return people


faculty = []
for key, fname, label in UG_FACULTY:
    html = load(fname)
    if html:
        for p in faculty_tables(html, label):
            p.update(college="UG", programme=label,
                     official=BASE + "ugcollege/faculty/" + quote(key))
            faculty.append(p)
for i, label in PG_DEPTS.items():
    html = load(f"pgcollege_department_{i}")
    if html:
        for p in faculty_tables(html, label):
            p.update(college="PG", programme=label, group=label,
                     official=f"{BASE}pgcollege/department/{i}")
            faculty.append(p)


def source_of(web_path):
    stem = os.path.join(sys.argv[3], web_path[len("/img/"):-len(".webp")])
    matches = [stem + ext for ext in (".jpg", ".jpeg", ".png", ".webp", ".jfif", ".JPG", ".PNG")]
    return next((m for m in matches if os.path.exists(m)), None)


def is_real_photo(web_path):
    """Many uploaded 'photos' are grey silhouettes; keep only real colour portraits."""
    if not web_path or len(sys.argv) < 4:
        return False
    from PIL import Image
    path = source_of(web_path)
    if not path:
        return False
    im = Image.open(path).convert("RGB").resize((48, 48))
    sat = [px[1] for px in im.convert("HSV").getdata()]
    return sum(sat) / len(sat) > 30


for p in faculty:
    if not is_real_photo(p["photo"]):
        p["photo"] = None
write("faculty", faculty)

# ------------------------------------------------------- department profiles


def content_blocks(html, stop_words=("Departments",)):
    soup = BeautifulSoup(body(html), "lxml")
    for c in soup.find_all(string=lambda s: isinstance(s, Comment)):
        c.extract()
    title_el = soup.select_one(".kingster-page-caption") or soup.select_one(".kingster-page-title")
    title = clean(title_el.get_text()) if title_el else ""
    blocks = []
    # Content sits inside the page wrapper on some pages and after it on others.
    for el in soup.find_all(["h2", "h3", "h4", "h5", "h6", "p", "li", "table"]):
        if el.find_parent(class_="kingster-page-title-wrap"):
            continue
        if el.find_parent("table") and el.name != "table":
            continue
        if el.name in ("p", "li") and el.find(["p", "li"]):
            continue
        if el.name == "table":
            rows = [[clean(c.get_text(" · ")) for c in tr.find_all(["td", "th"])] for tr in el.find_all("tr")]
            rows = [r for r in rows if any(r)]
            if any("Name" in r for r in rows[:1]):
                break  # faculty tables are handled separately
            if rows:
                blocks.append({"t": "table", "rows": rows})
            continue
        text = clean(el.get_text(" "))
        if not text:
            continue
        if text in stop_words:
            break
        if el.name == "li" or text.startswith("•"):
            kind = "li"
            text = text.lstrip("• ")
        elif el.name != "p":
            kind = "h"
        else:
            strong = clean(" ".join(s.get_text(" ") for s in el.find_all(["strong", "b"])))
            heading_like = (strong == text or (len(text) <= 40 and not text.endswith(".") and ":" not in text[:-1]))
            kind = "h" if heading_like and len(text) <= 80 else "p"
        if blocks and blocks[-1].get("text") == text:
            continue
        blocks.append({"t": kind, "text": text.rstrip(":") if kind == "h" else text})
    imgs = [local_img(i["src"]) for i in soup.find_all("img") if i.get("src")]
    return title, blocks, [x for x in dict.fromkeys(imgs) if source_of(x)]


UG_PROGRAMMES = {5: "ba", 6: "bcom", 7: "bsc", 8: "bba", 12: "library-science", 13: "bca"}
ug_progs = []
for i, slug in UG_PROGRAMMES.items():
    html = load(f"ugcollege_department_{i}")
    if not html:
        continue
    title, blocks, imgs = content_blocks(html)
    ug_progs.append({"slug": slug, "id": i, "title": title, "blocks": blocks, "images": imgs,
                     "official": f"{BASE}ugcollege/department/{i}"})
write("ug_programmes", ug_progs)

pg_progs = []
for i, label in PG_DEPTS.items():
    html = load(f"pgcollege_department_{i}")
    if not html:
        continue
    title, blocks, imgs = content_blocks(html)
    slug = re.sub(r"[^a-z0-9]+", "-", label.lower()).strip("-")
    pg_progs.append({"slug": slug, "id": i, "name": label, "title": title, "blocks": blocks,
                     "images": [x for x in imgs if "faculty" not in x],
                     "official": f"{BASE}pgcollege/department/{i}"})
write("pg_programmes", pg_progs)

# Bharat Scouts & Guides, Skill Development, IIC, Profiles: rich text pages
pages = {}
for key, fname in [("bharat", "ugcollege_bharat"), ("skill", "lbc_skill_development"),
                   ("iic", "pgcollege_about_iic"), ("ugProfile", "ugcollege_profile"),
                   ("pgProfile", "pgcollege_profile"), ("bgv", "ugcollege_bgv"),
                   ("grievance", "pgcollege_grievance"), ("iqacUg", "ugcollege_iqac"),
                   ("iqacPg", "pgcollege_iqac")]:
    html = load(fname)
    if html:
        title, blocks, imgs = content_blocks(html, stop_words=())
        pages[key] = {"title": title, "blocks": blocks,
                      "images": [x for x in imgs if not x.endswith("shutterstock_299633474.jpg")]}
write("pages", pages)

# ----------------------------------------------- document tables (NAAC etc.)


def doc_table(html):
    """Rows of tables that link to documents, with rowspan carry-forward."""
    soup = BeautifulSoup(body(html), "lxml")
    rows = []
    for table in soup.select("table"):
        heads = [clean(th.get_text()) for th in table.select("thead th")] or None
        prev = []
        for tr in table.find_all("tr"):
            tds = tr.find_all("td")
            if not tds:
                continue
            links = [a for td in tds for a in td.find_all("a") if a.get("href") and a["href"] not in ("#", "")]
            cells = [clean(td.get_text(" ")) for td in tds if not td.find("a")]
            if heads:
                want = len(heads) - 1
                if len(cells) < want:
                    cells = prev[: want - len(cells)] + cells
                prev = cells
            for a in links:
                label = clean(a.get_text(" "))
                rows.append({"cells": cells, "label": label if label.lower() != "view" else "",
                             "href": absurl(a["href"])})
    return rows


LINK_STATUS = json.load(open(sys.argv[4])) if len(sys.argv) > 4 else {}


def flag(rows):
    prev = None
    for r in rows:
        official = BASE.rstrip("/") + r["href"][len("/docs"):] if r["href"].startswith("/docs/") else r["href"]
        if LINK_STATUS.get(official, 200) != 200:
            r["unavailable"] = True
        # long DVV queries repeat on every row of a metric; keep them once
        if len(r["cells"]) > 1 and len(r["cells"][1]) > 90:
            if prev and prev["cells"][:2] == r["cells"][:2]:
                r["cells"][1] = ""
            else:
                prev = {"cells": list(r["cells"])}
    return rows


naac = {}
for college in ("ugcollege", "pgcollege"):
    sec = {}
    for n in range(1, 8):
        for prefix, key in (("criteria", "ssr"), ("dvvcriteria", "dvv")):
            html = load(f"{college}_{prefix}{n}")
            if html:
                sec.setdefault(key, {})[str(n)] = flag(doc_table(html))
    for extra in ("quality", "extended"):
        html = load(f"{college}_{extra}")
        if html:
            sec[extra] = flag(doc_table(html))
    naac["ug" if college == "ugcollege" else "pg"] = sec
write("naac", naac)


def grouped_links(html):
    """Tables whose first cell is a category and the rest are document links."""
    soup = BeautifulSoup(body(html), "lxml")
    groups = []
    # IQAC style: one table per category, the category in <thead>, one link per row.
    for table in soup.select("table"):
        th = table.select_one("thead th")
        links = [{"label": clean(a.get_text(" ")), "href": absurl(a["href"])}
                 for a in table.select("tbody a") if a.get("href") and clean(a.get_text())]
        if th and links and len(table.select("thead th")) == 1:
            groups.append({"group": clean(th.get_text(" ")), "docs": links})
    if groups:
        return groups
    for tr in soup.select("table tr"):
        cells = tr.find_all(["td", "th"])
        if not cells:
            continue
        docs = [{"label": clean(a.get_text(" ")), "href": absurl(a["href"])}
                for a in tr.find_all("a") if a.get("href") and clean(a.get_text())]
        head = clean(cells[0].get_text(" ")) if not cells[0].find("a") else ""
        if not head:
            head = clean(cells[1].get_text(" ")) if len(cells) > 1 and not cells[1].find("a") else ""
        if docs:
            groups.append({"group": head, "docs": docs})
    return groups


def flat_links(html):
    soup = BeautifulSoup(body(html), "lxml")
    seen, out = set(), []
    for a in soup.select("table a"):
        href = a.get("href")
        label = clean(a.get_text(" "))
        if href and label and label.lower() != "view" and href not in seen:
            seen.add(href)
            out.append({"label": label, "href": absurl(href)})
        elif href and label.lower() == "view":
            row = a.find_parent("tr")
            cells = [clean(td.get_text(" ")) for td in row.find_all("td") if not td.find("a")]
            if href not in seen:
                seen.add(href)
                out.append({"label": " ".join(c for c in cells if c and not c.isdigit()), "href": absurl(href)})
    return out


def poscos(html):
    soup = BeautifulSoup(body(html), "lxml")
    out = {"ug": [], "pg": []}
    cur = "ug"
    for tr in soup.select("table tr"):
        t = clean(tr.get_text(" "))
        if "PG PO" in t:
            cur = "pg"
            continue
        a = tr.find("a")
        if a and clean(a.get_text()):
            out[cur].append({"label": clean(a.get_text()), "href": absurl(a["href"])})
    return out


docs = {
    "iqac": {"ug": grouped_links(load("ugcollege_iqac")), "pg": grouped_links(load("pgcollege_iqac"))},
    "poscos": poscos(load("ugcollege_poscos")),
    "projects": flat_links(load("ugcollege_projects")),
    "eoa": flat_links(load("pgcollege_eoa")),
    "campusGlimpses": flat_links(load("ugcollege_campus_glimpses")),
}
write("documents", docs)

print("faculty", len(faculty), "| ug progs", len(ug_progs), "| pg progs", len(pg_progs))
print("naac ug ssr rows", sum(len(v) for v in naac["ug"]["ssr"].values()),
      "| dvv", sum(len(v) for v in naac["ug"]["dvv"].values()))
print("iqac groups", len(docs["iqac"]["ug"]), "| poscos", len(docs["poscos"]["ug"]), len(docs["poscos"]["pg"]),
      "| glimpses", len(docs["campusGlimpses"]), "| eoa", len(docs["eoa"]))
