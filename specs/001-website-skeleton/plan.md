# Implementation Plan: Website Skeleton for Valence

**Branch**: `001-website-skeleton` | **Date**: 2026-08-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-website-skeleton/spec.md`

## Summary

Set up a statically generated single-page artist website for Valence with placeholder
content (hero/identity, channel links, legal pages), published automatically to GitHub
Pages via GitHub Actions on every merge to `main`. All user-facing content lives in
structured data/content files so placeholders can be replaced without touching layout code.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 22+ (LTS) for build tooling only

**Primary Dependencies**: Astro 7 (static site generator, zero client JS by default);
one self-hosted variable font via Fontsource (no external font CDN)

**Storage**: Flat files in the repository — `src/data/site.json` (artist profile, channel
links, site flags) and Markdown files for legal pages. No database.

**Testing**: `astro build` + `astro check` as CI gates (broken changes never deploy);
manual validation of the spec's acceptance scenarios via `quickstart.md`. No automated
browser tests for the skeleton (YAGNI).

**Target Platform**: Static hosting on GitHub Pages; site served at
`https://<owner>.github.io/valence-electronica/` until a custom domain is added

**Project Type**: Static website (single Astro project at repository root)

**Performance Goals**: Usable in < 2 s on an average mobile connection; zero client-side
JavaScript shipped; landing page transfer size < 300 KB including fonts

**Constraints**: No runtime backend (constitution I); free tier only (constitution II);
no tracking/cookies/external requests at runtime (constitution V); responsive from 320px
(constitution IV)

**Scale/Scope**: 1 landing page + 2 legal pages; low traffic (artist promo site);
content updated a few times per month

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Static-First Delivery | Astro in default static output mode; no SSR adapter, no serverless functions | PASS |
| II. Zero-Cost, Zero-Ops Publishing | GitHub Pages + GitHub Actions free tier; deploy runs on push to `main`; a failed build keeps the previous deployment live | PASS |
| III. Content-Code Separation | All copy, links, and flags in `src/data/site.json`; legal texts as Markdown in `src/content/legal/`; components only render data | PASS |
| IV. Lightweight by Default | No client JS shipped; self-hosted font subset; responsive layout; semantic HTML with landmarks | PASS |
| V. Privacy & Legal Compliance | No tracking/analytics; fonts self-hosted (no Google Fonts CDN — GDPR); Impressum + Datenschutz linked from footer on every page; no third-party embeds in this feature | PASS |
| VI. Simplicity & Spec-Driven Change | Two runtime-relevant dependencies (astro, one fontsource package); no CSS framework, no UI library | PASS |

**Post-design re-check (after Phase 1)**: PASS — the data model and contracts introduce no
additional dependencies or runtime services.

## Project Structure

### Documentation (this feature)

```text
specs/001-website-skeleton/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── content-schema.md# Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks — not created by plan)
```

### Source Code (repository root)

```text
.github/
└── workflows/
    └── deploy.yml       # Build + deploy to GitHub Pages on push to main

public/
├── favicon.svg          # Placeholder favicon
└── og-image.png         # Placeholder social sharing image

src/
├── data/
│   └── site.json        # Artist profile, channel links, site flags (single source of truth)
├── content/
│   ├── config.ts        # Content collection schema (legal pages)
│   └── legal/
│       ├── imprint.md   # Impressum (placeholder, marked as such)
│       └── privacy.md   # Datenschutzerklärung (placeholder, marked as such)
├── layouts/
│   └── Base.astro       # HTML shell: head/meta/OG tags, header, footer
├── components/
│   ├── Hero.astro       # Artist name, tagline, visual
│   ├── Channels.astro   # Music platform + social links
│   └── Footer.astro     # Legal links
├── pages/
│   ├── index.astro      # Landing page
│   └── legal/
│       └── [slug].astro # Renders legal collection entries
└── styles/
    └── global.css       # Design tokens (dark theme), base styles

astro.config.mjs         # site + base for GitHub Pages project URL
package.json
tsconfig.json
README.md                # Extended with content editing + local preview guide (FR-011)
```

**Structure Decision**: Single Astro project at the repository root (no monorepo, no
`frontend/` split — there is no backend by constitution). Content lives under `src/data/`
and `src/content/`, presentation under `src/layouts/`, `src/components/`, `src/pages/`.

## Complexity Tracking

No constitution violations — table intentionally left empty.
