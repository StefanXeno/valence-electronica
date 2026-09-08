# Research: Player Animation Polish

**Date**: 2026-09-06 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

All Technical Context items are resolved. No `[NEEDS CLARIFICATION]`
markers remain. Locked operator forks from spec clarifications (2026-09-06)
are treated as inputs, not open research.

As-built start point is the shipped `015` phone player
(`src/lib/player-dock.ts`, `src/components/Jukebox.astro`,
`src/components/Discography.astro` theme-track list).

## R1: Scope is the phone open-player sheet only

- **Decision**: Change motion + open-sheet layout on the **015 phone player
  pill** (viewport width **below 1024px** / `max-width: 1023px`). Surfaces:
  (1) open/close to the solo current card, (2) handle drag, (3) Currently
  Playing ↔ V-Flip three-slot morph. Do **not** fold IDEA-024 (desktop HUD
  lift) or IDEA-025 (spec shrink / overhaul). Do **not** change exclusive-
  open, mute-as-toggle, handle **placement**, control **set**, playlist
  **membership**, chrome label strings, content-dock morph, handle idle nod,
  or the laptop HUD from 1024px up.
- **Rationale**: Spec FR-001 / FR-002 / Out of Scope. Constitution VI
  (YAGNI). 015 already owns the phone HUD composition; 018 is a quality +
  layout raise on one pill, not a second HUD.
- **Alternatives considered**:
  - Motion-only polish without the three-slot window — rejected; operator
    dump locked open-sheet layout (spec iteration 3–4).
  - Shared desktop + phone player rewrite — IDEA-024 / 025; out of scope.

## R2: Open/close easing reuses as-built travel

- **Decision**: Keep tap open/close duration and easing as shipped:
  `PHONE_PANEL_PHASE_MS` (**320ms**) from `src/lib/panel-motion.ts`,
  `SETTLE_MS` on drag release (same 320ms), existing height interpolation
  on `--player-sheet-h`. Do **not** invent leftover-jank, overshoot, or
  double-settle defects. Solo open target stays
  `measureSoloOpenPx` / `fitSheetToSoloCard` (chrome + current card, not
  full-list height).
- **Rationale**: Spec FR-003 / clarifications Q1. Operator locked
  **composition**, not a new feel bar.
- **Alternatives considered**:
  - New spring / overshoot curve — rejected; would invent a defect list.
  - Match content-dock 320ms and also retune playlist morph to 320ms —
    playlist morph timing is a separate surface (R6).

## R3: Drag is tighter 1:1 with less rubber-band

- **Decision**: Keep handle-only pointer drag, tap slop (**8px**), snap
  (**40px**), and flick (`FLICK_PX_MS = 0.45`). In-range travel
  (collapsed ↔ open cap) stays **1:1** (`rawH`). Change only the
  **overshoot** damper in `applyDragHeight`:
  - Today: `RUBBER = 0.32`, `OVERSCROLL_PX_MAX = 18` (stretchy, hard to
    pass the cap).
  - 018: `RUBBER = 0.78`, `OVERSCROLL_PX_MAX = 40` (more mechanical;
    more of the finger past the cap is applied; overshoot is easier).
  Drag-open still shows the **solo current card**, not the playlist.
  Drag-close from the **three-row playlist face** shrinks that sheet
  (`--player-sheet-h` from the **3-row** open height). Do **not** call
  `morphPlaylist(false)` mid-drag. Playlist class stays until collapse
  **settles**; collapse still turns playlist off (as-built `setOpen(false)`).
  Tap open height and drag open height still match (solo vs 3-row
  depending on face).
- **Rationale**: Spec FR-004. As-built in-range follow is already 1:1;
  the rubber lives only past the cap. Raising the coefficient toward 1.0
  and the overshoot budget is the smallest change that matches “tighter /
  less rubber-band / easier to overshoot.”
- **Alternatives considered**:
  - Hard clamp at the cap (no overshoot) — fights “easier to overshoot.”
  - Gesture library — rejected (constitution IV / 015 R14).
  - Viewport swipe — superseded in 015; stay on the handle.

## R4: Three-slot window is a pure function

- **Decision**: Add `src/lib/playlist-window.ts` (no DOM) implementing
  FR-005 / FR-015 / FR-016 helpers. Index the release-order theme-track
  list `0 … n-1` with `i` = current index. Missing indices are
  placeholders.

  | Condition | Slot | Window |
  | --------- | ---- | ------ |
  | `i === 0` (including `n === 1`) | TOP | `[i, i+1, i+2]` |
  | `i === n-1` and not first | BOTTOM | `[i-2, i-1, i]` |
  | otherwise | MIDDLE | `[i-1, i, i+1]` |

  Settled playlist sheet height = unchanged chrome + **exactly three**
  row boxes + two gaps (not `n` rows). The list remains the full
  release-order catalog in the DOM; the **viewport** is three rows and
  can scroll (FR-012). If three-row height exceeds the existing sheet
  cap (`--player-sheet-max` / `sheetCapPx`), keep the cap and scroll
  **inside** the sheet; floor chrome stays visible.
- **Rationale**: Spec FR-005 / FR-012 / short-landscape edge. A pure
  helper is the YAGNI way to lock the algorithm and unit-test it without
  Playwright.
- **Alternatives considered**:
  - CSS `scroll-snap` only, no algorithm — cannot guarantee first /
    last / middle slot on open.
  - Duplicate the current card to fill a slot when `n < 3` — forbidden
    (FR-015).
  - Grow to full-list height (as-built) — this is the 015 behavior 018
    replaces.

## R5: Placeholders are inert padded slots

- **Decision**: When `n < 3`, inject **placeholder** `<li>` nodes
  (`data-playlist-placeholder`) into the theme-track list so the
  viewport always shows three rows. No `data-discog-item`, no play
  button, no soundwave, no startable title. `aria-hidden="true"`.
  Not in the tab order. Not duplicated real tracks. Visual: muted empty
  slot (border / empty rule) — **not** a fake song name. Live catalog
  has four theme tracks; placeholders are the short-catalog / fixture
  rule. Placeholders do not add scrollable catalog (FR-012).
- **Rationale**: Spec FR-015 / SC-010. Art is a plan choice; acceptance
  is behavioral.
- **Alternatives considered**:
  - CSS empty `::after` slots only — weaker for “exactly three rows”
    measurement and a11y.
  - Greyed clone of a real track — looks startable; fails SC-010.

## R6: Playlist morph is a dynamic shared-element into the slot

- **Decision**: Replace the as-built “pin current card at solo Y and
  unfold **all** siblings to full-list height” path. New morph:
  1. Compute FR-005 slot + window at playlist-open time.
  2. Scroll the three-row viewport so that window fills it (first →
     later rows reachable; last → earlier; else both).
  3. Shared-element / FLIP the **current card** from the solo box into
     **that** slot (TOP / MIDDLE / BOTTOM). Path is computed — do **not**
     hardcode one slot.
  4. The **other two visible rows** enter (or leave on close) with the
     sheet height grow/shrink. Off-window real rows stay in the list
     but do not animate in at dest size.
  5. Headers keep the existing cross-fade (`currentlyPlayingLabel` ↔
     `jukeboxPanelTitle`).
  Keep `PLAYLIST_MORPH_MS = 380` (as-built playlist pluck; **not** the
  FR-003 leftover). Reduced motion: apply both faces instantly (existing
  `phone-player-playlist-apply` `instant` phase). Must not flash dest-
  height rows for a frame; must not fly the current card over a neighbor.
  Close reverses into the solo card. Collapse already resets playlist.
- **Rationale**: Spec FR-005 / Q3 / Q5 (dynamic path). As-built pin-under
  siblings is a full-list unfold, not a three-slot shared-element.
- **Alternatives considered**:
  - Keep pin-at-solo-Y for every open — fails middle/bottom slots and
    “not one hardcoded path.”
  - View Transitions API — extra capability + browser variance; WAAPI
    already ships in `player-dock.ts`.
  - Hardcoded middle-only morph — rejected by spec.

## R7: Playlist during open/close waits for settle

- **Decision**: Last-committed-action queue. If the visitor toggles
  playlist while `is-sheet-morphing` and **not** `is-playlist-morphing`,
  **store** the request (last tap wins) and apply it **after**
  `morphPlayerSheet` / drag settle finishes. Do **not** drop the tap
  (as-built `Jukebox.astro` currently `return`s). Do not apply playlist
  mid-travel or flash dest-height rows for a frame.
- **Rationale**: Spec FR-008. As-built drop fails “after settle.”
- **Alternatives considered**:
  - Interrupt open/close and morph playlist immediately — mid-travel
    mixed face (forbidden).
  - Keep dropping the tap — fails the locked fork.

## R8: Re-window only when the new current is outside the visible window

- **Decision**: While playlist is on, a hop (shuffle, natural advance,
  tap-to-play) always moves FR-014 selection chrome (soundwave / play
  button) via existing `syncStageUi`. Re-apply FR-005 **only** if the
  new current row does **not** intersect the three-row scrollport.
  Prefer **intersection with the scrollport** over stale open-window
  indices (the visitor may have scrolled). If already visible, keep
  scroll; do not snap a tapped card to a new slot. Shuffle does **not**
  reorder the DOM (`playback.ts` already hops `pickOtherId`; list order
  stays `sortDiscographyEntries` newest-first).
- **Rationale**: Spec FR-013 / FR-016 (operator-adjacent). Visual order
  is already release order in `getThemeTrackDiscography`.
- **Alternatives considered**:
  - Re-center on every hop — snaps a visible tap to a new slot.
  - Never re-window — current can vanish after a shuffle hop.
  - Shuffle-order list — forbidden (FR-013).

## R9: Selection chrome and tap-to-play stay as-built

- **Decision**: Keep Discography theme-row chrome: current row =
  moving `.discog__eq`, play button `hidden`; other real rows = play
  button only. Row tap still dispatches `STAGE_SELECT_EVENT`. Solo
  open card still has no play button. Floor soundwave / name / mute
  unchanged. Handle stays on the top edge.
- **Rationale**: Spec FR-011 / FR-014. Already shipped; 018 must not
  regress it while adding placeholders (placeholders omit this slot).
- **Alternatives considered**: Play button on the current row — rejected.

## R10: Breakpoint teardown and exclusive-open stay 015

- **Decision**: Reuse `PHONE_MQ`, `phoneMq` change handler, playlist-off
  on laptop resize, exclusive-open, click-outside, Legal overlay skip,
  intro hide. Crossing 1023/1024 must cancel in-flight sheet / playlist
  morph and drop phone height locks so the laptop HUD does not inherit a
  mid-morph pill (existing `endSheetMorphStyles` / `endSheetDragStyles`;
  extend to clear pending playlist + placeholder-only test hooks).
- **Rationale**: Spec FR-009 / edge cases. Do not reopen 015 rules.
- **Alternatives considered**: Persist playlist onto laptop — out of
  scope (IDEA-024).

## R11: No new packages; visual QA is operator-led

- **Decision**: Zero new npm packages. Do **not** run or extend
  `npm run verify:hud` / Playwright / Chromium as a required 018 gate
  (016’s flows still describe the **015** full-list playlist). Logic
  tests: Vitest on `playlist-window.ts`. Type/build: `astro check`.
  Motion, drag feel, morph, and layout: **operator/manual**
  [quickstart.md](./quickstart.md) at 320 / 390 / 1023 / 1024.
- **Rationale**: Feature constraints + constitution IV. 016 verify
  script is not 018 authority until a later amend (not this feature).
- **Alternatives considered**:
  - Update `verify:hud` playlist flow now — would require Playwright
    execution / package work; operator forbade both for this chain.

## R12: Artist-facing docs do not change

- **Decision**: No new chrome fields, routes, or artist-editable
  surfaces. Do **not** update `docs/artist-guide.md` (FR-010,
  constitution VII).
- **Rationale**: Labels stay where 015 left them.
- **Alternatives considered**: Document placeholders in the artist
  guide — they are not an artist edit surface.

## R13: Contract is a 015 open-sheet amend, not a new HUD

- **Decision**: New [contracts/phone-player-polish.md](./contracts/phone-player-polish.md)
  is authority for the **three 018 surfaces** below 1024px. 015
  [mobile-hud-ui.md](../015-mobile-stage-hud/contracts/mobile-hud-ui.md)
  remains authority for docks, exclusive-open, mute, handle **placement**,
  content pill, and “expand === V-Flip.” Where 015 says playlist =
  “current card stays; others add in; full-list height,” **018 wins**.
  Laptop stays `009` / `011`.
- **Rationale**: Constitution VI. One focused contract beats rewriting
  the whole 015 HUD contract.
- **Alternatives considered**: Patch 015 contract in place only —
  workable, but mixes shipped HUD rules with a new layout story.

## R14: Client JS stays one justified module plus a pure helper

- **Decision**: Extend `player-dock.ts` (drag constants, 3-row measure,
  pending playlist, morph rewrite) and `Jukebox.astro` (queue instead of
  drop). Discography gains placeholder markup/CSS only as needed.
  Extract window math to `playlist-window.ts`. No new gesture library.
  No second player component.
- **Rationale**: Constitution IV / VI. 015 already justified this
  module; 018 does not add a new JS surface type.
- **Alternatives considered**: Rewrite the player in a new island —
  rejected (YAGNI, exclusive-open / measure code would fork).
