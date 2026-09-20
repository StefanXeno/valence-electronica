# Implementation Plan: Easter Eggs & Achievements

**Branch**: `032-easter-eggs` | **Date**: 2026-10-06 | **Spec**: [spec.md](./spec.md)

**Input**: As-built consolidation — documents the shipped implementation; no new work.

## Source Map

| Concern | Files |
| ------- | ----- |
| Rub gesture + reveal panel control | `src/lib/track-rub.ts` |
| Reveal panels + toast shell | `src/components/TrackRubOverlay.astro` |
| Spin gesture | `src/lib/infinite-spin.ts` |
| Achievement storage + toast | `src/lib/achievement-toast.ts` |
| Demonic combo (666) + wild glitch | `src/lib/demonic-combo.ts` (+ test), `src/lib/glitch.ts` (`amplifyForWild`), `src/lib/glitch-ambient.ts` (wild field) |
| Shared gesture-ignore selectors | `src/lib/gesture-ignore.ts` (+ test) |
| Player-found achievement | `src/lib/stage-player.ts` (copy from `StagePlayer.astro` data attributes) |
| Tagline pin | `applyRubSuccessTagline` in `src/lib/tagline-rotator.ts` |
| Boot | inline script in `src/layouts/Base.astro` |
| Content flag | `rubbable` in `src/content.config.ts` |
