# Implementation Plan: Easter Eggs & Achievements

**Branch**: `032-easter-eggs` | **Date**: 2026-10-05 | **Spec**: [spec.md](./spec.md)

**Input**: As-built consolidation — documents the shipped implementation; no new work.

## Source Map

| Concern | Files |
| ------- | ----- |
| Rub gesture + reveal panel control | `src/lib/track-rub.ts` |
| Reveal panels + toast shell | `src/components/TrackRubOverlay.astro` |
| Spin gesture | `src/lib/infinite-spin.ts` |
| Achievement storage + toast | `src/lib/achievement-toast.ts` |
| Tagline pin | `applyRubSuccessTagline` in `src/lib/tagline-rotator.ts` |
| Boot | inline script in `src/layouts/Base.astro` |
| Content flag | `rubbable` in `src/content.config.ts` |
