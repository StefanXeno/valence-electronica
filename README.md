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

All visitor-facing copy lives in structured data/files — no layout or component edits for
routine updates. Preview locally with `npm run dev`. **Do not rename ids** (jukebox
filename slugs, `jukeboxId` values, legal slugs, or `themeId`s) unless a developer is
updating the matching references.

- **`src/data/site.json`** — artist name, tagline, description, and the channel links.
  - Add or edit entries under `channels`. Set `"status": "active"` with a `"url"` to show
    a real link; `"status": "placeholder"` shows a "coming soon" chip without a link.
  - Set `"seo": { "indexable": true }` at launch to allow search engines to index the site.
- **`src/content/jukebox/`** — one Markdown file per stage record. Filename slug = stable
  id (e.g. `placeholder-loop.md` → `placeholder-loop`). Frontmatter: `label`, `themeId`
  (must match a **complete** theme pack — registry entry in `src/lib/theme-packs.ts` and
  CSS block in `src/styles/themes.css`; see [Theme packs](#theme-packs) below), `hasAudio`,
  `default: true` on exactly one usable entry. The Markdown **body** is the lyrics for
  that record (leave empty for instrumentals).
  - Put media files under `public/videos/` and `public/images/posters/`, then point
    `sources` / `poster` at those paths. An entry with only a `poster` (no `sources`)
    is a static still — looping video is used for the Nightmare theme (`nightmare-crimson`).
- **`src/content/about/me.md`** — short bio. Empty or missing body hides the About control.
- **`src/content/releases/`** — discography rows (`title`, `year`, optional `kind`, `url`,
  `jukeboxId`). `jukeboxId` must match a jukebox filename slug to show “Play on stage”.
  Rows are not the jukebox — following a link does not change the stage.
- **`src/content/shows/`** — upcoming dates (`date`, `city`, `venue`, optional `ticketUrl`).
  Past dates (Europe/Berlin) are hidden. v1 can ship with no show files (empty-state copy).
- **`src/content/ui/chrome.md`** — region titles, empty-state strings, jukebox/social labels,
  and the stage-button label.
- **`src/content/legal/`** — `imprint.md` (Impressum) and `privacy.md`
  (Datenschutzerklärung). Both are placeholders and MUST be filled with real information
  before the site is promoted publicly.

**Omit-invalid-item:** a release missing `title`/`year`, or a show missing `date`/`city`/
`venue`, is dropped with a build warning. The rest of the page still builds. Unparseable
Markdown can still fail the whole build — the last good live deploy stays up.

## Theme packs

Visual moods are **theme packs**: a registry entry plus matching CSS tokens. Jukebox
`themeId` selects the pack; capabilities (looping video, mute, HUD glitch) are defined in
code, not in Markdown.

**Add or change a pack (developer):**

1. Add the pack to `src/lib/theme-packs.ts` (capabilities) and `PACK_CSS_THEME_IDS`.
2. Add a `[data-theme='your-id'] { … }` block in `src/styles/themes.css`.
3. Set `themeId: your-id` on jukebox Markdown entries.
4. Run `npm run check && npm run build`.

Full contract: [`specs/005-theme-packs/contracts/theme-packs.md`](specs/005-theme-packs/contracts/theme-packs.md).

Unknown or incomplete packs warn at build and fall back to **`default`** at runtime.

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
