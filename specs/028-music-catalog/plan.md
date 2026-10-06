# Implementation Plan: Music Catalog (Discography)

**Branch**: `028-music-catalog` | **Date**: 2026-10-06 | **Spec**: [spec.md](./spec.md)

**Input**: As-built consolidation — documents the shipped implementation; no new work.

## Summary

All parsing, merging, grouping, and sorting live in `src/lib/catalog-tracks.ts` (pure,
unit-tested). Rendering happens in the `Discography` component family for the overlay and
separately in `SiteNav.astro` for the phone menu portal.

## Source Map

| Concern | Files |
| ------- | ----- |
| Merge, sort, group, link parsing | `src/lib/catalog-tracks.ts` (+ `catalog-tracks.test.ts`) |
| Overlay catalog | `src/components/Discography.astro`, `DiscographyCollectionCard.astro`, `DiscographyTrackRow.astro` |
| Phone menu catalog | `src/components/SiteNav.astro` (discography portal) |
| Stage play button + EQ marker | `src/components/StagePlayButton.astro`, `src/styles/stage-eq.css` |
| Platform icons | `src/components/ChannelIcon.astro` |
| Placeholder cover helper | `coverOrPlaceholder` in `src/lib/url.ts` |
| Content | `src/content/jukebox/`, `src/content/tracks/`, `public/images/covers/` |
