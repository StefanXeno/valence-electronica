# Implementation Plan: Hidden Stage Player with Song Selection

**Branch**: `035-hidden-stage-player` | **Date**: 2026-10-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/035-hidden-stage-player/spec.md`

## Summary

Replace the current player (`Jukebox.astro` + `player-dock.ts`, ~4,400 lines incl. a
CSS-hidden phone sheet) with one lean `StagePlayer` that has four states — hidden, hint,
minimal (vinyl button), full (song list + controls). Discovery: three taps on empty stage
show a peeking vinyl; tapping it opens the full player, unlocks an achievement, and is
remembered per browser. The playback engine (`stage-switch.ts`, `playback.ts`,
`MuteControl`) stays unchanged. Discography play buttons appear only for stage songs,
use the existing `[data-stage-button]` pick path, and close the overlay/menu.

## Technical Context

**Language/Version**: TypeScript, Astro 7, Node 24

**Primary Dependencies**: none new (Astro, vitest already present)

**Storage**: first-party `localStorage` (two UX keys, see data-model)

**Testing**: vitest unit tests for pure modules; `astro check`; operator browser review
via `quickstart.md`

**Target Platform**: static site on GitHub Pages; evergreen mobile + desktop browsers

**Project Type**: static website (Astro components + small client modules)

**Performance Goals**: net reduction of shipped JS/CSS (≈ −3,000 lines of client code);
hint reacts within one frame of the third tap

**Constraints**: no new dependencies; reduced-motion parity; 320px without horizontal
scroll; no browser automation by the agent without operator approval

**Scale/Scope**: 4 stage songs today; list must handle ~10 without layout changes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
| --------- | ----- | ------ |
| I Static-first | Client-only behavior, no backend | Pass |
| II Zero-cost | No new services | Pass |
| III Content-code separation | All new strings in `chrome.md` (FR-014) | Pass |
| IV Lightweight | JS justified (state, gestures, media); net JS shrinks; keyboard path (FR-013) | Pass |
| V Privacy | Two first-party `localStorage` UX flags; no tracking | Pass |
| VI Simplicity | Removes three superseded player models; no new deps | Pass |
| VII Artist docs | Guide paragraph on player discovery; chrome fields documented | Pass (task) |

Post-design re-check (after research/contracts): unchanged — Pass.

## Project Structure

### Documentation (this feature)

```text
specs/035-hidden-stage-player/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/stage-player-ui.md
├── checklists/requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── StagePlayer.astro          # NEW — replaces Jukebox.astro
│   ├── Jukebox.astro              # DELETE
│   ├── TrackInfoPanel.astro       # DELETE
│   ├── StageDock.astro            # keep as positioning wrapper (or inline)
│   ├── MuteControl.astro          # reuse (import PHONE_MQ from viewport.ts)
│   ├── Discography.astro          # drop themeTracksOnly branch
│   ├── DiscographyTrackRow.astro  # play only for stage songs (+ nested rows)
│   ├── DiscographyCollectionCard.astro  # remove collection-level play
│   ├── SiteNav.astro              # portal play buttons; listen to stage-overlay-close
│   └── LegalOverlay.astro         # listen to stage-overlay-close
├── lib/
│   ├── player-state.ts (+test)    # NEW — pure reducer
│   ├── tap-hint.ts (+test)        # NEW — pure tap counter
│   ├── gesture-ignore.ts (+test)  # NEW — shared ignore selector
│   ├── player-discovery.ts (+test)# NEW — storage helper (blocked → false)
│   ├── stage-player.ts            # NEW — DOM wiring, bg play/pause, now-playing label
│   ├── viewport.ts                # NEW — PHONE_MQ
│   ├── player-dock.ts             # DELETE
│   ├── player-sheet.ts (+test)    # DELETE
│   ├── playlist-window.ts (+test) # DELETE
│   ├── player-handle-tap.ts (+test) # DELETE
│   ├── stage-switch.ts            # import syncNowPlayingLabel from stage-player.ts
│   ├── label-reveal.ts            # import PHONE_MQ from viewport.ts
│   ├── track-rub.ts / infinite-spin.ts  # use gesture-ignore.ts
│   └── catalog-tracks.ts          # drop getThemeTrackDiscography if unused
├── pages/index.astro, pages/[slug].astro  # mount StagePlayer
├── content/ui/chrome.md, content.config.ts # new chrome fields
└── styles/global.css              # remove phone `.stage-dock` hide + dock rules
scripts/verify-hud.mjs             # flows for new states (operator-run)
docs/artist-guide.md               # player discovery + chrome fields
specs/026, 028, 032 (+ README)     # fold back after ship
```

**Structure Decision**: Single Astro project; new behavior split into pure, unit-tested
modules (`player-state`, `tap-hint`, `gesture-ignore`, `player-discovery`) plus one DOM
module (`stage-player.ts`) and one component (`StagePlayer.astro`) with scoped CSS.

## Implementation approach (phases)

1. **Foundation**: chrome fields + schema; `viewport.ts`; pure modules with tests;
   `gesture-ignore.ts` adopted by rub/spin.
2. **US2/US3 core player (MVP)**: `StagePlayer.astro` + `stage-player.ts` with states
   minimal/full, song list, controls, close/Escape/outside; mount on pages; delete old
   player stack; fix imports; global.css cleanup. Temporarily boot in `minimal` until US1
   lands so the MVP is usable.
3. **US1 discovery**: hidden state, tap hint, peek/nudge, vinyl reveal, persistence,
   achievement.
4. **US5 keyboard**: reveal button, focus management.
5. **US4 discography**: stage-only play buttons (overlay + phone menu),
   `stage-overlay-close`.
6. **Polish**: reduced motion, glitch-hit classes, verify-hud flows, artist guide, fold
   back into `026`/`028`/`032` specs, README index.

## Risks

| Risk | Mitigation |
| ---- | ---------- |
| Visual design needs iteration (peek, vinyl, panel) | Operator review checkpoint after phase 2 and 3 |
| Removing `player-dock.ts` breaks hidden dependencies (bg toggle, now-playing, eq-flatten) | Grep-driven import fix list in tasks; `astro check` + tests |
| Hint taps conflict with rub/spin or iOS double-tap zoom | Movement threshold, shared ignore list, `touch-action: manipulation` on stage |
| Desktop `zoom: 0.8` affects fixed positioning | Reuse existing `--site-scale` handling; operator check at 1280×800 |

## Complexity Tracking

No constitution violations.
