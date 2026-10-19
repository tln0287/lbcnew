# Content audit — lbc.edu.in & lbc.edu.in/pghome

Inspection date: **19 Oct 2026**. 136 internal pages crawled (snapshot in
`crawl-snapshot/`), 668 official links checked (`tools/reports/link-status.json`).

## Navigation reproduced

| Official menu | Destination in the new site |
|---|---|
| Home, Profile, Facilities, Gallery | `/`, `/profile` (UG + PG profiles), `/facilities`, `/gallery` |
| Faculty ▸ B.A., BBA, BCA, B.Com., B.Sc., Library Science | `/faculty` directory with programme filters (161 people, UG + PG) |
| Courses ▸ B.A., B.Com., B.Sc., BBA, Library Science, BCA | `/courses/ug/*` (official department pages) |
| Departments (`/ugcollege/depts`, `/physical` …) | `/departments` explorer: Physical Sciences, Life Sciences, Arts, Commerce, Management, Languages + 14 PG departments |
| PG Departments ▸ MBA … Chemistry-Research | `/courses/pg/*`, `/pg-college` |
| Academics ▸ Academic Calendar, SDC, Value Addition, PO's/CO's, Projects & Internship, Placements, LBC Times, Campus Glimpses, Blog | `/academics` (+ sections), `/academics/skill-development`, `/academics/outcomes`, `/academics/projects`, `/placements`, `/lbc-times`, `/campus-glimpses`, blog → official |
| Activities ▸ Sports, NCC, NSS, Bharat Scouts & Guides, IQAC | `/activities` (#sports, #ncc, #nss …), `/activities/bharat-scouts-guides`, `/iqac` |
| RTI (`#`) | **Resolved:** `/rti` → `static/images/RTI2005OLDANDNEWFILE.pdf` |
| NIRF (`#`) | **Resolved:** `/nirf` → NIRF 2021–2026 PDFs (2022 appears only in one official menu variant; file exists) |
| NAAC ▸ SSR Criteria 1–7, Quality Metrics, DVV 1–7, Extended Profile, RAR-2015 | `/naac` — 340 UG documents (SSR, DVV, quality metrics, extended profile) searchable by criterion; PG set included |
| Committees ▸ 14 committees | `/committees/*` with members & responsibilities, UG and PG |
| AICTE (PG) ▸ scholarships, Courses, EOA, Feedback, disclosures; IIC; Grievances | `/aicte` |
| Login, Support, BGV, Alumni, Online Payment | Login/Support/Alumni/Payment link to the existing systems; `/bgv` reproduces the BGV process |

## Pages the official server did not return (follow up with the college)

| URL | Status | What the new site does |
|---|---|---|
| `/lbc/placements` | HTTP 500 | `/placements` uses the PG Placement Cell page (`/pgcollege/department/12`), UG profile text and NAAC 5.x documents; official link kept |
| `/lbc/sports`, `/lbc/ncc`, `/lbc/nss` | HTTP 500 | `/activities` uses verified text from the PG profile, Sports Committee, news and NAAC 5.3 / 3.4 documents; official links kept |
| `/lbc/academic_calendar` | HTTP 500 | `/academics#calendar` links to the official page; **no calendar content is available to migrate** |
| `/lbc/value_addition` | HTTP 500 | `/academics#value-addition` lists add-on courses from the B.Com./BBA pages and NAAC 1.2.1 brochures |
| `/pgcollege/bharat`, `/pgcollege/poscos`, `/pgcollege/projects`, `/pgcollege/dvvquality` | HTTP 404 (linked from PG menus) | Mapped to the UG equivalents, which hold the combined UG & PG content |
| `static/DVV/` and `static/DVV/7.1.2().pdf` (NAAC DVV) | HTTP 404 — malformed links in the source | Shown as "not currently returned by the official server" |
| `static/1.2.1(3).pdf` | Source href contained a stray `"` | Fixed — links to the real file |

## Deliberately not reproduced

- **Homepage counters** "2000+ Students / Teaching Faculty / Class Rooms / Labs" on lbc.edu.in are template placeholders. The PG homepage counters (2016 / 83 / 20 / 13) conflict with the PG profile (31 classrooms, 17 labs). The new site uses only the profile figures: 56 UG + 31 PG classrooms, 16 UG + 17 PG labs.
- **Placement statistics, salary figures, recruiter logos** — the PG page says "Below is the year-wise track record of placements:" but no data follows. Nothing was added.
- **Faculty photos** — the official pages hide the photo cards (HTML comments); most uploads are grey placeholder silhouettes. Only the 53 genuine portraits are shown, matched to names in the same card; everyone else gets an initials monogram. *Please confirm the college is happy to show these portraits.*
- **Stock photo** `shutterstock_299633474.jpg` (used as a title background on the official profile pages) is not used, so it can't be mistaken for the LBC campus.
- **Vice Principals' names** — the homepage shows two Vice Principal messages with photos but no names; the new site does the same. The Principal is named (Prof. G. S. K. Chakravarty) because the committee and faculty pages identify him as Principal.

## Data quality notes for the college

- UG lab photos carry GPS-camera stamps; the web copies are cropped. Originals are in `source-media/`.
- The official white logo (`logo-white.png`) is missing "College" and the sponsor lines; the site uses a white recolour of the full logo (`public/brand/logo-light.png`).
- The UG and PG "The LBC Times" links serve the same PDF.
- "January 2026" Campus Glimpses links to a file named `January_Campus_Glimpses_2025_1-compressed.pdf` (label kept as published).
- The IIC page on the official site contains a stray `:contentReference[oaicite:3]{index=3}` artefact; removed, leaving "…rankings such as ARIIA."
- The Biochemistry page describes its programme pattern as "Master of Science in Biotechnology" (reproduced as published).
- Social links in the official footer point to individual posts, not profile pages; reproduced as published.

## Added in the design-system redesign

- **Newsletters:** all 14 Campus Glimpses issues and The LBC Times were downloaded from lbc.edu.in and rendered to page images (118 pages) for the shelf and page-turning reader. The LBC Times cover is dated *Tuesday, March 31, 2026*; that date is shown. The "January 2026" Campus Glimpses cover prints "2025" (its contents cover the 77th Republic Day, i.e. January 2026); the official label is kept.
- **Seal:** the rotating white seal behind page headers, the newsletter shelf and the footer is made from the official high-resolution emblem supplied by the college (`source-media/emblem-official.jpg`, 1600px), recoloured to white on transparent (`public/brand/seal-white.png`).
- **Blog card:** the single blog post ("How is Python the most popular & secure programming language…", July 14, 2023) is about 2,000 words, shown as a 10-minute read; it links to the official blog listing because post URLs on lbc.edu.in are session-specific tokens.
- **Alumni:** the "Join the Alumni Association" button opens the official alumni form. The steps describe that form's fields; nothing is promised beyond submitting it.
- **Programmes explorer seat counts:** UG figures are the 2023-24 sanctioned strengths (1,450); the PG figure is the convener + management intake in the PG profile table (663). Note the MBA and MCA department pages state an intake of 132 each, while the profile table gives 120 — flagged for the college to reconcile.
- **NCC & NSS:** no photographs are published on the official site, so the activities panel shows "Photographs to be added".

## Documents served locally

All documents linked from lbc.edu.in (crawled pages plus links used by this site) were mirrored into the application on request, so visitors download them from this site rather than being sent to lbc.edu.in:

- **594 documents, 6.2 GB** — NAAC SSR and DVV evidence, IQAC reports, NIRF 2021–2026, RTI, RAR-2015, AICTE approvals and disclosures, PO/CO documents, project and internship records, Campus Glimpses, The LBC Times, faculty résumés, the PG application form and the campus video.
- Inventory with sizes: `tools/reports/documents.json`. Largest files are NAAC evidence scans of 100–160 MB each.
- One linked document does not exist on the official server (`/static/DVV/7.1.2().pdf`, HTTP 404) and a NAAC row links to the `/static/DVV/` folder; both remain marked unavailable.
- Still linked to lbc.edu.in, because they are live systems or pages rather than documents: Login, Support, Alumni registration form, the UG/PG blog, and "official page" references. Online Payment stays on CCAvenue.
