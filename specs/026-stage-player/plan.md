# Implementation Plan: Stage Player & Song Switching

**Branch**: `026-stage-player` | **Date**: 2026-10-05 | **Spec**: [spec.md](./spec.md)

**Input**: As-built consolidation — documents the shipped implementation; no new work.

## Summary

`Jukebox.astro` renders the player and embeds the stage catalog + schedule as data
attributes. `stage-switch.ts` boots the scheduled entry, handles picks (`stage-select`
event and `data-stage-button` / `data-jukebox-option` clicks), crossfades, and drives the
shuffle clock via `playback.ts`. `player-dock.ts` holds the phone player (hidden by CSS)
and the background play/pause toggle.

## Technical Context

**Client JS justification (constitution IV)**: entry switching, timers, and media control
require scripting; without JS the static default entry renders.

## Source Map

| Concern | Files |
| ------- | ----- |
| Player markup + boot | `src/components/Jukebox.astro`, `src/components/StageDock.astro` |
| Switching, crossfade, shuffle wiring | `src/lib/stage-switch.ts` |
| Playback mode, dwell timing | `src/lib/playback.ts` (+ tests) |
| Phone player (dormant), bg play/pause | `src/lib/player-dock.ts`, `player-sheet.ts`, `playlist-window.ts`, `player-handle-tap.ts` (+ tests) |
| Theme-track list (in drawer) | `src/components/Discography.astro` (`themeTracksOnly`), `TrackInfoPanel.astro` |
| Soundwave flatten on pause | `src/lib/eq-flatten.ts` |
| Phone hide rule | `src/styles/global.css` (`.stage-dock { display: none !important }` below 1024px) |
| Agent check | `scripts/verify-hud.mjs` (phone flows outdated) |

## Constitution Check

IV (Lightweight): **Gap** — dormant phone player code ships to every visitor.
Other principles pass.
