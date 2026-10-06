# Implementation Plan: Stage Player & Song Switching

**Branch**: `026-stage-player` | **Date**: 2026-10-06 | **Spec**: [spec.md](./spec.md)

**Input**: As-built consolidation — documents the shipped implementation; no new work.

## Summary

`StagePlayer.astro` renders the player (vinyl, keyboard reveal, panel with song list and
controls) and embeds the stage catalog + schedule as data attributes. `stage-player.ts`
boots `stage-switch.ts`, the background play/pause toggle, and the player state machine;
CSS reads only `data-player-state`. `stage-switch.ts` boots the scheduled entry, handles
picks (`stage-select` event and `data-stage-button` / `data-jukebox-option` clicks),
crossfades, and drives the shuffle clock via `playback.ts`.

## Technical Context

**Client JS justification (constitution IV)**: entry switching, timers, media control,
and the tap-hint gesture require scripting; without JS the static default entry renders
and no player is shown.

## Source Map

| Concern | Files |
| ------- | ----- |
| Player markup + state CSS | `src/components/StagePlayer.astro` |
| Player wiring (boot, tap hint, focus, overlay collapse, bg play/pause, now playing) | `src/lib/stage-player.ts` |
| State machine (pure) | `src/lib/player-state.ts` (+ test) |
| Tap counter (pure) | `src/lib/tap-hint.ts` (+ test) |
| Discovery flag | `src/lib/player-discovery.ts` (+ test) |
| Shared gesture-ignore selectors (hint, rub, spin) | `src/lib/gesture-ignore.ts` (+ test) |
| Viewport helpers | `src/lib/viewport.ts` |
| Switching, crossfade, shuffle wiring | `src/lib/stage-switch.ts` |
| Playback mode, dwell timing | `src/lib/playback.ts` (+ tests) |
| Mute + volume | `src/components/MuteControl.astro`, `src/lib/mute-slot.ts` (+ test) |
| EQ marker + flatten on pause | `src/styles/stage-eq.css`, `src/lib/eq-flatten.ts` |
| Overlay close after discography play | `stage-overlay-close` event → `LegalOverlay.astro`, `SiteNav.astro` |
| Agent check | `scripts/verify-hud.mjs` (operator-run) |

## Constitution Check

All principles pass. Persistence is one first-party `localStorage` UX flag (V).
