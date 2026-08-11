# Quickstart & Validation: Website Skeleton for Valence

**Date**: 2026-08-07 | **Plan**: [plan.md](./plan.md)

## Prerequisites

- Node.js 22+ (LTS) and npm
- Repository cloned; GitHub repository created with GitHub Pages set to "GitHub Actions"
  as the source (Settings → Pages → Build and deployment → Source)

## Local development

```bash
npm install       # once
npm run dev       # dev server at http://localhost:4321/valence-electronica/
```

## Quality gates (same as CI)

```bash
npm run check     # astro check: types + content schema validation
npm run build     # astro build: outputs static site to dist/
npm run preview   # serve the built site locally
```

## Validation scenarios (map to spec acceptance criteria)

1. **US1 — identity**: Open the dev/preview URL on a desktop browser and a phone (or
   narrow the viewport to 320px). Expect: artist name "Valence" and tagline visible
   without scrolling, no horizontal scrollbar.
2. **US1 — link preview**: View page source. Expect: `<title>`, `meta description`, and
   `og:title` / `og:description` / `og:image` present, values from `site.json`.
3. **US2 — channels**: Expect: Bandcamp, SoundCloud, YouTube, Instagram, TikTok, and
   Spotify each render as an active link (with brand icon + label) opening the configured
   `https://` URL in a new tab. Placeholder entries (if any) stay non-linked "coming soon".
4. **US3 — auto publish**: Edit `artist.tagline` in `src/data/site.json`, commit to
   `main`, push. Expect: GitHub Actions run succeeds and the change is live on the public
   URL within 10 minutes.
5. **US3 — failure safety**: Push a commit with invalid `site.json` (e.g. missing
   `artist.name`) to a branch and run `npm run check`. Expect: check/build fails; on
   `main` this would block deployment and keep the previous version live.
6. **US4 — legal pages**: From the landing page footer, click "Impressum" and
   "Datenschutzerklärung". Expect: both pages load and are clearly marked as placeholders.
7. **Weight budget**: In browser dev tools (network tab, cache disabled), reload the
   landing page. Expect: total transfer < 300 KB, no JavaScript files loaded, no requests
   to third-party domains.
