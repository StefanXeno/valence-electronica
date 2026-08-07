# Research: Website Skeleton for Valence

**Date**: 2026-08-07 | **Plan**: [plan.md](./plan.md)

All NEEDS CLARIFICATION items from the Technical Context were resolved as follows.

## R1: Static site generator

- **Decision**: Astro 7 (latest stable major, static output mode).
- **Rationale**: Prerenders to pure static HTML (satisfies constitution I), ships zero
  client JavaScript by default (constitution IV), and keeps content in structured
  data/Markdown files that a non-developer can eventually edit (constitution III). First
  -class GitHub Pages deployment via the official `withastro/action`.
- **Alternatives considered**:
  - *Plain HTML/CSS*: fewest moving parts, but content and markup are interleaved, which
    violates content-code separation once links/releases need maintenance.
  - *Eleventy*: solid, but templating (Nunjucks/Liquid) adds a second mental model;
    Astro's component syntax is closer to plain HTML.
  - *Next.js/SvelteKit*: designed for app workloads; static export is possible but brings
    unneeded complexity and client JS pressure.

## R2: Hosting & deployment

- **Decision**: GitHub Pages, deployed from GitHub Actions using `withastro/action@v5`
  (build) + `actions/deploy-pages` (deploy), triggered on push to `main`.
- **Rationale**: Free (constitution II), no infrastructure to operate, atomic deployments —
  a failed build never replaces the live site (FR-008). The repo the user is about to
  create on GitHub is the single source of truth.
- **Alternatives considered**: Netlify/Cloudflare Pages (also free, but a second account
  and provider to manage; GitHub was explicitly chosen by the owner); deploy from a
  `gh-pages` branch via `git push` (older pattern, noisier history, no atomicity benefits).

## R3: Site URL and base path

- **Decision**: Configure `site: 'https://<owner>.github.io'` and
  `base: '/valence-electronica'` in `astro.config.mjs`, assuming the GitHub repository is
  named `valence-electronica`. `<owner>` must be filled in once the GitHub repo exists.
- **Rationale**: GitHub Pages project sites are served under a subpath; without `base`,
  asset and internal links break. Astro resolves all internal URLs from this single config.
- **Alternatives considered**: user/organization site (`<owner>.github.io` repo) — rejected
  because it occupies the owner's single root site; custom domain — deferred to a separate
  feature (owner decision, costs money).

## R4: Content storage format

- **Decision**: `src/data/site.json` for structured data (artist profile, channel links,
  site flags such as `indexable`); Astro content collection (`src/content/legal/`) with a
  Zod schema for the legal Markdown pages.
- **Rationale**: JSON is editable in the GitHub web UI by a non-developer; a content
  collection gives schema validation at build time, so a malformed edit fails the build
  instead of deploying a broken page (supports FR-008, SC-006).
- **Alternatives considered**: TypeScript data module (type-safe but scarier to edit for
  non-developers); one big Markdown frontmatter file (mixes concerns); CMS (violates
  simplicity and zero-cost principles for a skeleton).

## R5: Styling approach

- **Decision**: Hand-written CSS — design tokens (custom properties) in
  `src/styles/global.css`, component-scoped styles in `.astro` files. Dark theme as
  default. No CSS framework.
- **Rationale**: A one-page site does not justify a framework dependency (constitution VI);
  scoped styles prevent leakage; custom properties keep the theme swappable when real
  branding assets arrive.
- **Alternatives considered**: Tailwind (adds build dependency and utility-class noise for
  marginal gain at this size); Open Props / Pico.css (still an extra dependency).

## R6: Typography

- **Decision**: One self-hosted variable font via a Fontsource npm package (exact typeface
  chosen during implementation, e.g. an expressive display face), system font stack for
  body text.
- **Rationale**: Loading fonts from Google Fonts CDN transmits visitor IPs to Google —
  a known GDPR problem in Germany (constitution V). Self-hosting via Fontsource keeps all
  requests first-party. Limiting to one webfont protects the performance budget.
- **Alternatives considered**: Google Fonts CDN (rejected: GDPR); system fonts only
  (fallback option if the weight budget is threatened — acceptable but weaker identity).

## R7: SEO / link previews / indexing

- **Decision**: Title, description, and Open Graph tags rendered from `site.json` in the
  base layout; a placeholder OG image in `public/`; an `indexable` flag in `site.json`
  controlling a `robots` meta tag (`noindex` while the site only has placeholder content).
- **Rationale**: Satisfies FR-010 and the spec's edge case that the placeholder version may
  be excluded from search indexing; the flag lives in the same single content file as
  everything else, so launch is a one-line change.
- **Alternatives considered**: robots.txt (blocks crawling but not indexing of the URL);
  leaving the site indexable immediately (risks placeholder content in search results).

## R8: CI quality gates

- **Decision**: The deploy workflow runs `astro check` (type + content schema validation)
  and `astro build`; deployment only happens if both succeed.
- **Rationale**: Cheapest possible gate that still guarantees FR-008 (broken changes never
  go live). Automated browser/link tests are out of scope for the skeleton (YAGNI,
  constitution VI) and can be added when content grows.
- **Alternatives considered**: Playwright smoke tests (deferred); HTML validators / link
  checkers (deferred until real links exist).
