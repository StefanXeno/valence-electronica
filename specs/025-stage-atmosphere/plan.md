# Implementation Plan: Stage Atmosphere, Audio & Theme Packs

**Branch**: `025-stage-atmosphere` | **Date**: 2026-10-05 | **Spec**: [spec.md](./spec.md)

**Input**: As-built consolidation — documents the shipped implementation; no new work.

## Summary

Two stacked `<video>` elements (current + next) plus a poster image form the atmosphere.
The default entry is rendered server-side; client code applies the scheduled entry on boot
and crossfades on switches. Theme packs are a TS registry plus CSS token blocks keyed by
`data-theme`.

## Technical Context

**Client JS justification (constitution IV)**: video play/fallback, mute/volume, schedule
evaluation in Europe/Berlin, and entry switching cannot be done statically.

## Source Map

| Concern | Files |
| ------- | ----- |
| Atmosphere layer, autoplay/fallback | `src/components/BackgroundAtmosphere.astro` |
| Default entry, valid entries | `src/lib/background.ts` |
| Theme registry + capability helpers | `src/lib/theme-packs.ts` (+ tests) |
| Theme tokens | `src/styles/themes.css` |
| Schedule data | `src/data/stage-schedule.json` |
| Schedule resolution (Berlin calendar) | `src/lib/stage-schedule.ts` (+ tests) |
| Mute / volume / phone 50% | `src/components/MuteControl.astro`, `src/lib/mute-slot.ts` (+ tests) |
| Pause / resume, paused flag | `initBgVideoToggle` in `src/lib/stage-player.ts`, `src/lib/playback.ts` |
| Entry switching + crossfade | `src/lib/stage-switch.ts` (see `026`) |
| Artist docs | `docs/stage-schedule.md`, `docs/artist-guide.md` (Theme packs, Media assets) |

## Adding a theme pack (developer checklist)

1. Add the id and capabilities to `src/lib/theme-packs.ts` and `PACK_CSS_THEME_IDS`.
2. Add a `[data-theme='id'] { … }` token block in `src/styles/themes.css`.
3. Check contrast of chrome text over the atmosphere and reduced-motion behavior.
4. Add the id to the artist guide's theme table if artists may select it.
5. `npm run check && npm test && npm run build`.
