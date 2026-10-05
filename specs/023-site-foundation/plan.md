# Implementation Plan: Site Foundation & Publishing

**Branch**: `023-site-foundation` | **Date**: 2026-10-05 | **Spec**: [spec.md](./spec.md)

**Input**: As-built consolidation — documents the shipped implementation; no new work.

## Summary

Astro static site deployed to GitHub Pages. One workflow builds `main` (root) and
`pre-release` (`/pre-release/` subpath) into a single Pages artifact. Content collections
with Zod schemas gate the build.

## Technical Context

**Language/Version**: TypeScript, Astro 7, Node 24 (`.nvmrc`; `engines` allows ≥22)

**Primary Dependencies**: `astro`, `@astrojs/check`, `@fontsource-variable/unbounded`

**Storage**: Markdown/JSON content in the repo; no runtime storage

**Testing**: `vitest` unit tests, `astro check`

**Target Platform**: GitHub Pages (static)

**Constraints**: Zero cost, zero ops, no tracking (constitution I, II, V)

## Constitution Check

| Principle | Status |
| --------- | ------ |
| I Static-first | Pass — `astro build` output only |
| II Zero-cost publishing | Pass — Actions + Pages free tier |
| III Content-code separation | Pass — `src/content/`, `src/data/` |
| IV Lightweight | **Gap** — media weight (see spec Known Gaps) |
| V Privacy & legal | **Gap** — legal texts are placeholders |
| VI / VII | Pass |

## Source Map

| Concern | Files |
| ------- | ----- |
| Build config, base path, site origin | `astro.config.mjs` (`PAGES_BASE`, `GITHUB_REPOSITORY_OWNER`) |
| Deploy (root + preview in one artifact) | `.github/workflows/deploy.yml` |
| CI checks (build + tests) | `.github/workflows/check.yml` |
| Head metadata, noindex, share image | `src/layouts/Base.astro` |
| Content schemas | `src/content.config.ts` |
| Site settings | `src/data/site.json` |
| Legal pages | `src/content/legal/*.md`, `src/pages/legal/[slug].astro`, `src/components/LegalOverlay.astro`, `LegalPanel.astro` |
| Base-path helpers | `src/lib/url.ts` |
| Empty-folder tolerant loader | `globAllowEmpty` in `src/content.config.ts` |
