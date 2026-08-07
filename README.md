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

## Editing content

All content lives in two places — no code changes needed:

- **`src/data/site.json`** — artist name, tagline, description, and the channel links.
  - Add or edit entries under `channels`. Set `"status": "active"` with a `"url"` to show
    a real link; `"status": "placeholder"` shows a "coming soon" chip without a link.
  - Set `"seo": { "indexable": true }` at launch to allow search engines to index the site.
- **`src/content/legal/`** — `imprint.md` (Impressum) and `privacy.md`
  (Datenschutzerklärung). Both are placeholders and MUST be filled with real information
  before the site is promoted publicly.

Every merge to `main` is automatically checked, built, and deployed by GitHub Actions
(`.github/workflows/deploy.yml`). If the build fails, the previous version stays live.

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
