# Implementation Plan: Tour Dates

**Branch**: `029-tour-dates` | **Date**: 2026-10-05 | **Spec**: [spec.md](./spec.md)

**Input**: As-built consolidation — documents the shipped implementation; no new work.

## Source Map

| Concern | Files |
| ------- | ----- |
| Validation, ticket window, sorting, country codes, year groups | `src/lib/stage-upcoming.ts` |
| Collection loader + warnings | `getUpcomingShows()` in `src/lib/stage.ts` (+ `stage.test.ts`) |
| Overlay rendering | `src/components/TourDates.astro` |
| Phone menu rendering | `src/components/SiteNav.astro` (tour portal) |
| Content + template | `src/content/shows/`, `src/content/shows/_example.md` |
