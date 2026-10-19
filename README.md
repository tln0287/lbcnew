# Dr. Lankapalli Bullayya College — website redesign

A React + TypeScript rebuild of [lbc.edu.in](https://lbc.edu.in/) and the
[PG College site](https://lbc.edu.in/pghome). All content is taken from the
official sites; nothing about the college is invented. See
[CONTENT_AUDIT.md](CONTENT_AUDIT.md) for what was migrated and what needs
follow-up from the college.

## Layout

```
site/            Vite + React 19 + TypeScript + Tailwind v4 + Framer Motion + Swiper
  src/content/   Hand-curated, verified copy: navigation, hero, home sections (home.ts), albums, contacts
  src/sections/  Home page sections (one file per section, in page order)
  src/data/      Generated JSON (faculty, committees, NAAC, IQAC, programme pages) — do not edit by hand
  src/pages/     One file per route
  public/img/    Optimised WebP copies of official images (generated)
  public/brand/  Logos, NAAC badge and the white seal
  public/newsletters/  Rendered pages of The LBC Times and Campus Glimpses (generated)
  public/docs/   Every document linked from lbc.edu.in, mirrored (6.2 GB, not in git — run `npm run docs`)
tools/           Content pipeline (Python) and QA scripts
crawl-snapshot/  HTML snapshot of the official sites the data was built from
source-media/    Original images downloaded from lbc.edu.in (not deployed)
```

## Running locally

```bash
cd site
npm install
npm run dev          # http://localhost:5173
npm run build        # production build in site/dist
npm run preview      # serve the build on http://localhost:4173
```

## Updating content from the official site

The Python tools need Python 3.10+ with `beautifulsoup4`, `lxml`, `Pillow`
(and `playwright` for the smoke test).

```bash
cd site
npm run crawl         # refresh crawl-snapshot/ from lbc.edu.in
npm run check:links   # verify every official URL; writes tools/reports/link-status.json
npm run data          # rebuild src/data/*.json (documents the server doesn't return are flagged "unavailable")
npm run images        # create WebP derivatives for any new images in source-media/
npm run newsletters   # render newsletter PDFs in source-media/newsletters/ to page images
npm run docs          # mirror every linked document into public/docs (resumable; ~6.2 GB)
python ../tools/verify_docs.py .   # confirm every document link has a local file
npm run build && npm run preview
npm run test:smoke    # every route at 1440px, 360px and 1366px with reduced motion: console errors, broken assets, overflow, 404 links
```

Text that is not on a crawled page (hero headlines, milestones, quick facts,
leadership messages, news) lives in `src/content/site.ts`; each item there
cites what it was taken from.

## Deployment

**Documents are served by this site, not lbc.edu.in.** All 594 PDFs, Word files and videos linked from the official site are mirrored to `public/docs/<original path>` (e.g. `/static/nirf2024.pdf` → `/docs/static/nirf2024.pdf`). The build copies them into `dist/docs`, so the deployed site is about 6.3 GB; host it on a server with that much space (the college's IIS server is suitable; most free static hosts are not).

The output in `site/dist` is a static single-page app. Client-side routes need
a fallback to `index.html`:

- **IIS** (the current lbc.edu.in server): `web.config` is included and needs the URL Rewrite module.
- **Netlify / Cloudflare Pages**: `_redirects` is included.
- **Apache / nginx**: add an equivalent rewrite to `/index.html`.

Login, Support, Alumni, the support form and Online Payment are **links to the
existing official systems** (lbc.edu.in and CCAvenue); no credentials or
payment details are handled by this site. Keep those systems running.

## Design system

The home page follows the *Home Page Design System* brief: one navy (`#102A43`)
and one gold accent (`#D6AD60`), Fraunces for display and Manrope for text,
sentence-case headings that answer a visitor's question, and alternating
paper / white / navy sections. Tokens live in `src/index.css`; reusable motion
in `src/components/Effects.tsx` (rise text, scroll progress, back to top,
cursor spotlight, rotating seal) and `src/components/Motion.tsx` (image reveal,
count-up, wipe-fill text, self-drawing icons).

| Pattern | File |
| --- | --- |
| Header (two rows, 3D dropdowns, phone panel) | `src/components/Header.tsx` |
| Hero carousel | `src/components/HeroCarousel.tsx` |
| Fact ribbon | `src/sections/Ribbon.tsx` |
| Introduction, scroll timeline, objectives | `src/sections/Intro.tsx` |
| Programmes explorer (scroll-pinned card stack) | `src/sections/Programmes.tsx` |
| Facilities coverflow | `src/sections/FacilitiesCarousel.tsx` |
| Activities panels | `src/sections/ActivitiesPanels.tsx` |
| Gallery highlights | `src/sections/GalleryHighlights.tsx` |
| Newsletter shelf / page-turning reader | `src/sections/NewsletterShelf.tsx`, `src/pages/NewsletterReader.tsx` |
| News & blog, alumni, leadership, quick links, contact | `src/sections/*.tsx` |
| Photo viewer | `src/components/Lightbox.tsx` |

## Accessibility & performance notes

- Keyboard-operable mega menus (Enter/Space, Arrow Down, Escape), skip link,
  visible focus rings, ARIA on carousel, tabs, dialogs and filters.
- `prefers-reduced-motion` turns off autoplay, loops, scroll pinning, tilt and
  entrance motion; content renders in its final state and every control still works.
- Dialogs (photo viewer, phone menu) trap focus, close with Esc and return focus.
- Routes are code-split. Images are WebP and lazy-loaded below the fold; the
  first hero photo is preloaded. YouTube and map embeds load only when needed.
- The newsletter reader shows pre-rendered page images, so visitors never wait
  for a large PDF; the original PDF stays linked.
