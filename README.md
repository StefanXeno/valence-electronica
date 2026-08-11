# Valence — Artist Website

Static website for the electronic music artist [Valence](https://valenceelectronica.bandcamp.com/),
built with [Astro](https://astro.build) and deployed to GitHub Pages. No servers, no
running costs.

## Local development

Requires Node.js 22+ (LTS).

```bash
npm install       # once
npm run dev       # dev server at http://localhost:4321/valence-electronica/
npm run check     # type + content schema validation
npm run build     # check + static build into dist/
npm run preview   # serve the built site locally
```

## Editing content (artist)

**Start here:** [`docs/artist-guide.md`](docs/artist-guide.md) — authoritative map of what
you may change, what you must not touch, and how to publish (GitHub web editor →
`pre-release` → promote to `main`).

Quick pointers:

- **Site info & channels:** `src/data/site.json`
- **Stage schedule:** `src/data/stage-schedule.json` — see [`docs/stage-schedule.md`](docs/stage-schedule.md)
- **Everything else** (jukebox, bio, releases, shows, UI copy, legal, media): see the artist guide.

**Do not rename ids** (jukebox slugs, `jukeboxId`, legal slugs, `themeId`s) without developer help.

Run `npm run check` after content edits when using a local clone. Invalid schedule ids or
dates, and content files missing required fields, fail the build and name the offending
file. Pushes to `pre-release` and pull requests run the same checks in CI.

## Theme packs (developer)

Visual moods are **theme packs**: registry + CSS tokens. Jukebox `themeId` selects the pack.

**Add or change a pack (developer only):**

1. Add the pack to `src/lib/theme-packs.ts` and `PACK_CSS_THEME_IDS`.
2. Add a `[data-theme='your-id'] { … }` block in `src/styles/themes.css`.
3. Update [`docs/artist-guide.md`](docs/artist-guide.md) theme table if artist-selectable.
4. Run `npm run check && npm run build`.

Full contract: [`specs/005-theme-packs/contracts/theme-packs.md`](specs/005-theme-packs/contracts/theme-packs.md).

## Landing intro

First visit to `/` plays a portal intro (copy in `src/content/ui/chrome.md`). Dev replay:
`/?replay-intro` or `/dev/intro`. Contract:
[`specs/006-landing-intro/contracts/intro-ui.md`](specs/006-landing-intro/contracts/intro-ui.md).

## Deploy

Content integrates on **`pre-release`**; the **live** site updates when **`main`** is
updated. GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys from `main`.
If the build fails, the previous version stays live.

To deploy another integration branch (currently `pre-release`) without merging to `main`:
Actions → **Deploy to GitHub Pages** → **Run workflow** → use workflow from `main` →
choose the target branch. That overwrites the same GitHub Pages URL.

## One-time GitHub setup

1. Create the GitHub repository (name `valence-electronica` matches the configured base
   path) and push this repo.
2. In the repository: Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Replace `OWNER` in `astro.config.mjs` with the GitHub username/organization.

The site is then served at `https://<owner>.github.io/valence-electronica/`.

## Project workflow

This project uses [spec-kit](https://github.com/github/spec-kit): features are specified
in `specs/` before implementation, governed by the project constitution in
`.specify/memory/constitution.md`.
