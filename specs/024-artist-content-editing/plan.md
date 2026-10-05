# Implementation Plan: Artist Content Editing

**Branch**: `024-artist-content-editing` | **Date**: 2026-10-05 | **Spec**: [spec.md](./spec.md)

**Input**: As-built consolidation — documents the shipped implementation; no new work.

## Summary

Astro content collections (`legal`, `jukebox`, `tracks`, `about`, `shows`, `ui`) plus three
JSON data files hold all visitor copy. Schemas in `src/content.config.ts` validate them at
build time. The artist guide documents the boundary and the publish path.

## Technical Context

**Storage**: Markdown frontmatter + JSON in the repo

**Validation**: Zod schemas (`astro check` / `astro build`), plus build-time warnings for
display-incomplete items (`src/lib/stage.ts`, `src/lib/catalog-tracks.ts`)

## Source Map

| Concern | Files |
| ------- | ----- |
| Schemas for every collection | `src/content.config.ts` |
| UI chrome loader + defaults | `getChrome()` in `src/lib/stage.ts` |
| Site settings parsing (shop, contact) | `getSiteNavData()` in `src/lib/stage.ts` |
| Artist guide | `docs/artist-guide.md` |
| Topic guide: schedule | `docs/stage-schedule.md` |
| README pointer | `README.md` → "Editing content (artist)" |

## Constitution Check

Principles III and VII are the core of this spec. Pass, with the documentation drift
listed under spec Known Gaps.
