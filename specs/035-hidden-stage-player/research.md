# Research: Hidden Stage Player with Song Selection

**Feature**: `035-hidden-stage-player` | **Date**: 2026-10-06

## R1 — Rebuild the player instead of patching `Jukebox.astro` / `player-dock.ts`

- **Decision**: Replace `Jukebox.astro` (2,182 lines) and `player-dock.ts` (2,188 lines)
  with a new `StagePlayer.astro` component plus small modules
  (`player-state.ts`, `tap-hint.ts`, `stage-player.ts`). Delete the dormant phone sheet
  stack (`player-sheet.ts`, `playlist-window.ts`, `player-handle-tap.ts` and their tests,
  `TrackInfoPanel.astro`).
- **Rationale**: The existing code is built around three superseded models (V-Flip
  drawer, phone floor sheet with drag/three-slot window, desktop compact bar) and is
  partly hidden by CSS. The new four-state model shares almost nothing with them. Spec
  FR-016 requires a single implementation; the review flagged `initPlayerDock` as the
  top maintainability risk.
- **Alternatives considered**: (a) Re-enable the phone sheet and add discovery on top —
  keeps 1,600 lines of drag/morph logic that the new design doesn't use. (b) Incrementally
  split `initPlayerDock` — large effort on code that would then be deleted anyway.

## R2 — Keep the playback engine untouched

- **Decision**: Reuse `stage-switch.ts` (picks, crossfade, shuffle clock), `playback.ts`,
  `MuteControl.astro` (in-player variant), and the background play/pause toggle
  (moved from `player-dock.ts` into `stage-player.ts`).
- **Rationale**: These are tested, behave as `026` specifies, and are independent of the
  chrome. `syncStageUi` already updates `[data-jukebox-option]`, `[data-stage-button]`,
  and `[data-discog-playing]` markers, so the new song list and discography play buttons
  get "current" state for free.
- **Alternatives considered**: New engine — no benefit, high regression risk.

## R3 — Song list content

- **Decision**: Render the list directly from `getBackgroundConfig().videos` (valid
  jukebox entries) in `StagePlayer.astro`: cover (`cover` → poster fallback), title,
  `data-jukebox-option` button, playing EQ marker. Order: jukebox release order
  (`sortDate` newest first, then label), same as today's theme-track list.
- **Rationale**: Spec FR-005 lists only stage songs; jukebox entries are exactly that.
  Drops the `themeTracksOnly` branch of `Discography.astro`.

## R4 — Hint detection ("tap the stage three times")

- **Decision**: Pure `tap-hint.ts` counter: 3 qualifying `pointerup` events within
  1,500 ms, each moved < 10 px from its `pointerdown`. A document-level listener filters
  targets through a shared ignore selector (`gesture-ignore.ts`) and ignores taps while
  the intro runs, an overlay/menu is open, or a rub/spin session is active.
- **Rationale**: Pointer events unify mouse and touch; movement threshold separates taps
  from scroll, rub, and spin. Testable without a DOM.
- **Alternatives considered**: `click` events (fire on interactive elements and after
  drags; harder to filter), `dblclick` (no touch support, only two taps).

## R5 — Shared gesture-ignore selector

- **Decision**: New `src/lib/gesture-ignore.ts` exporting one base selector (links,
  buttons, inputs, nav, overlays, player, discography controls) plus per-module extras;
  used by `track-rub.ts`, `infinite-spin.ts`, and the hint.
- **Rationale**: The two existing lists have already drifted (review finding 3); a third
  gesture would make it worse. Small, contained refactor needed for spec edge cases.

## R6 — Discovery persistence vs. blocked storage

- **Decision**: Separate key `ve-player-discovered` read through a helper that returns
  **false** when storage throws (start hidden), plus the achievement via the existing
  `maybeUnlockAchievement` with key `ve-achievement-player-found`.
- **Rationale**: `hasAchievement()` returns `true` on blocked storage (to suppress
  toasts); reusing it for discovery would wrongly start private-mode visitors in the
  minimal state. Spec edge case: blocked storage → discovery for the current page load
  only.

## R7 — Closing overlays after a discography play

- **Decision**: Play buttons are plain `[data-stage-button]` controls (handled by
  `stage-switch.ts`). `stage-player.ts` additionally dispatches a document event
  `stage-overlay-close` when the click came from inside an overlay panel or the phone
  menu; `LegalOverlay.astro` and `SiteNav.astro` listen and close (overlay: same as
  Exit; menu: same as X).
- **Rationale**: Keeps overlay/menu ownership in their components; one event, no
  cross-imports.

## R8 — Placement and sizing

- **Decision**: Bottom-left on all viewports. Minimal vinyl: 44px hit target (≥ 44px
  touch guideline), ~40px visual. Hint: the same vinyl translated half below the bottom
  edge with a nudge. Full player: desktop panel ~20rem wide above the vinyl corner; phone
  bottom panel with side insets, max-height 60vh, list scrolls inside.
- **Rationale**: One structure for both viewports (FR-009); bottom-left matches today's
  desktop player and leaves the center free.
- **Open for operator review**: exact visuals, nudge animation, vinyl spin speed — needs
  browser review by the operator (agent rules forbid browser automation without
  approval).

## R9 — Accessibility path

- **Decision**: A "Show player" button inside the stage, visually hidden until
  `:focus-visible` (skip-link pattern), present only in the hidden state. In minimal
  state the vinyl button is the focus target. Full player: `role="dialog"` is **not**
  used (non-modal); it is a labelled region; Escape and the close button collapse to
  minimal and return focus to the vinyl.
- **Rationale**: Constitution IV (keyboard navigation) and FR-013.

## R10 — Verification approach

- **Decision**: Unit tests for `player-state.ts`, `tap-hint.ts`, `gesture-ignore.ts`
  (matching logic), and discovery storage helper. `npm run check`, `npm test`,
  `npm run build` by the agent. Visual/interaction checks via `quickstart.md` by the
  operator. `scripts/verify-hud.mjs` flows are rewritten for the new states but run only
  with operator approval.
