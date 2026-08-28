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
- **Tagline pool:** `src/data/tagline-pool.json` — rotating subtext under the wordmark (60 s cycle); see [`specs/012-rotating-tagline/contracts/tagline-pool.md`](specs/012-rotating-tagline/contracts/tagline-pool.md)
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
updated. If the build fails, the previous version stays live.

Two URLs are published from one Pages site:

| URL                                | Branch        | Indexable       |
| ---------------------------------- | ------------- | --------------- |
| `/valence-electronica/`            | `main`        | per `site.json` |
| `/valence-electronica/pre-release/` | `pre-release` | never           |

GitHub Pages allows only one atomic deployment per repository, so
`.github/workflows/deploy.yml` builds **both** branches in a single run and uploads one
combined artifact. A push to either branch refreshes both paths. A pre-release push never
changes the live site: the root is always rebuilt from `main`.

The preview build sets `PAGES_BASE=/valence-electronica/pre-release`, which flows through
`import.meta.env.BASE_URL`, and is forced to `noindex` regardless of `seo.indexable`.

If `pre-release` fails to build, that step is skipped rather than failing the run — the
live deploy still goes out and the `/pre-release/` path is simply absent until it builds
again.

To deploy an integration branch to the **live root** without merging to `main`:
Actions → **Deploy to GitHub Pages** → **Run workflow** → choose the target branch.
That overwrites the live URL, so prefer the `/pre-release/` preview above.

## One-time GitHub setup

1. Create the GitHub repository (name `valence-electronica` matches the configured base
   path) and push this repo.
2. Settings → Pages → Build and deployment → Source: **GitHub Actions**.
3. Settings → Environments → **`github-pages`** → *Deployment branches and tags* →
   **Add deployment branch or tag rule** → ref type **Branch**, pattern `pre-release`.

   GitHub restricts this environment to the default branch, so without the rule a
   `pre-release` push fails with *"Branch 'pre-release' is not allowed to deploy to
   github-pages due to environment protection rules"*.

   ⚠️ This grants `pre-release` publish rights to the **whole** Pages site, not just the
   `/pre-release/` subpath — GitHub scopes the rule per branch, not per path. The live
   root stays safe because `deploy.yml` always rebuilds it from `main`, but that is now
   enforced by the workflow rather than by the environment. Review changes to
   `deploy.yml` on `pre-release` with that in mind.

The site is then served at `https://<owner>.github.io/valence-electronica/`. The owner is
resolved from `GITHUB_REPOSITORY_OWNER` in CI, so no source edit is needed; only local
builds fall back to the hardcoded default in `astro.config.mjs`.

## Project workflow

This project uses [spec-kit](https://github.com/github/spec-kit): features are specified
in `specs/` before implementation, governed by the project constitution in
`.specify/memory/constitution.md`.
