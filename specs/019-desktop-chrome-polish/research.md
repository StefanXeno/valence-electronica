# Research: Desktop Chrome Polish

**Date**: 2026-09-08 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

All Technical Context items are resolved. No `[NEEDS CLARIFICATION]`
markers remain. Locked operator decisions from the spec (always-open
player, control row, Info, grow-in-place) are inputs, not open research.

As-built start point is the shipped laptop HUD (`009` / `011`) plus the
phone HUD (`015` / `018`) in the **same DOM**, split by
`max-width: 1023px` vs `min-width: 1024px`.

## R1: One DOM, desktop media queries — not a second HUD

- **Decision**: Keep the existing landing HUD tree (`StageDock` /
  `Jukebox` / `StagePanels` / `Channels` / `Footer`). Apply 019 only
  when viewport width is **≥ 1024px**. Do not mount a second player or
  bar. Do not enable the phone stacked-dock layout on laptop.
- **Rationale**: Spec FR-001 / FR-012. Constitution VI (YAGNI). 015
  already proved one-DOM + CSS split.
- **Alternatives considered**:
  - Separate desktop-only components — rejected; duplicates chrome
    strings and exclusive-open.
  - Lift the full phone stack (player under a full-width bar) —
    rejected; spec keeps a left/right floor split.

## R2: Always-open player is a rest-state, not a vinyl details toggle

- **Decision**: At ≥1024px, hide `data-jukebox-toggle` (vinyl / V-Flip
  button). The boxed player + **currently playing** label + toolbar
  paint without a click. Playlist (`data-playlist-toggle`) is the only
  player expand. Ungate the existing playlist click handler that today
  returns early unless `max-width: 1023px`.
- **Rationale**: Spec FR-004. Desktop has space; the old closed vinyl
  cluster is gone.
- **Alternatives considered**:
  - Keep vinyl as a no-op icon — rejected; spec removes the button.
  - Force phone `data-player-dock-expanded` on desktop — rejected;
    that flag drives phone exclusive-open and handle CSS. Prefer a
    desktop rest class / media-query chrome so phone collapse stays
    intact.

## R3: Toolbar order and control set

- **Decision**: Desktop toolbar, left → right: **Playlist**, **Shuffle**,
  **Play/pause** (`data-bg-play-toggle`), **Mute**. Hide Loop and vinyl
  at ≥1024px. Prefer **DOM order** in `Jukebox.astro` so tab order
  matches the spec; phone CSS already hides vinyl/loop and shows
  playlist/play — keep those phone rules after the reorder.
- **Rationale**: Spec FR-004a. Play/pause already exists (phone
  transport). Shuffle and mute already exist.
- **Alternatives considered**:
  - CSS `order` only — possible fallback if DOM reorder breaks phone
    measure; prefer real DOM order for a11y.
  - Keep Loop hidden but enabled via keyboard — rejected; spec says
    no Loop control; loop stays off.

## R4: Currently playing on desktop

- **Decision**: Show the existing phone **theme-track card** (Discography
  `themeTracksOnly` / `015`–`018` solo card) in the always-open desktop
  player. Do not use a name-only `data-now-playing` row as the rest
  face. Laptop `TrackInfoPanel` is **not** the desktop now-playing face.
- **Rationale**: T028 review — full card, same logic as mobile.
- **Alternatives considered**:
  - Name-only row — rejected after visual review.
  - A new desktop-only card — rejected; reuse the phone card.

## R5: Playlist surface is a view-switch (height-up only)

- **Decision**: Desktop playlist on = **switch the view** to the phone
  **theme-track card window** (`jukebox__section--theme-tracks`, same
  cards as the solo now-playing card; background-available set only).
  **No** width grow. **No** two-stage right-then-up. Height MAY grow
  **up only** so the list is not clipped. Close switches back to the
  currently-playing card (height MAY shrink down). Do **not** use the
  `011` `TrackInfoPanel` list. Three-row-tall viewport + scroll; do
  not run phone `player-dock` on laptop. Bar two-stage stays in
  `panel-motion.ts`.
- **Rationale**: Operator 2026-09-09 — remove the playlist
  grow/extend; just switch the view.
- **Alternatives considered**:
  - Two-stage width-then-height (019 first pass) — rejected after
    visual review.
  - `011` TrackInfoPanel list — rejected after visual review.
  - Vinyl-era “open V-Flip = list” without a Playlist button —
    superseded.

## R6: Two-stage timing reuses 280ms per stage

- **Decision**: Each stage is **280ms**,
  `cubic-bezier(0.4, 0, 0.2, 1)` — `SMOOTH_PANEL_PHASE_MS` in
  `panel-motion.ts`. Sequential (stage 2 starts after stage 1).
  Reduced motion: both stages instant. Glitch theme MAY keep morph
  glitch **flavor**; direction order still width-then-height (open)
  and height-then-width (close). Extend `panel-motion.ts` (or a small
  sibling helper) so StagePanels owns the **bar** sequencer. Desktop
  playlist MUST NOT share that sequencer. Do not invent leftover-jank
  springs.
- **Rationale**: Spec Q2 + plan-time duration still apply to the bar.
  009 already used 280ms desktop motion. Phone content-pill stays
  320ms (`PHONE_PANEL_PHASE_MS`). Playlist FR-006 is now view-switch.
- **Alternatives considered**:
  - Keep today’s simultaneous width+height (current
    `runSmoothPanelOpen` is a no-op) — fails sequential **bar** FR-007.
  - 320ms to match phone — extra feel change not asked on desktop.
  - New animation library — rejected (constitution IV).

## R7: Mute is a toggle; slider hidden on desktop too

- **Decision**: At ≥1024px, restore `011` unmute-to-slider. Size the
  box once with `--jukebox-slider-extra` reserved whenever mute is
  showing. Muted: hide the slider in that space. Unmuted: show the
  **full** slider there. **No** width change on mute toggle. Unmute
  level stays **0.7**. Phone still hides the slider.
- **Rationale**: T028 review restored the slider.
- **Alternatives considered**:
  - Toggle-only / device volume — superseded by T028.

## R8: Info on desktop; footer gone everywhere on landing

- **Decision**: Unhide `.stage-panel--info` at ≥1024px. Keep
  `.stage-panel--socials` hidden (socials stay `.stage__socials` top-
  right). Hide landing `Footer.astro` at **all** widths (today only
  `max-width: 1023px`). Lift phone Info header copyright rules
  (`.stage-panel__sheet-copy` `margin-left: auto`) so they apply when
  Info is open on desktop.
- **Rationale**: Spec FR-003 / FR-003a. Phone already has the copyright
  markup (`© {year} {site.artist.name}`).
- **Alternatives considered**:
  - Keep footer + Info — rejected; same copyright + legal links twice.
  - Copyright-only center line — not asked; spec hid the footer.

## R9: Exclusive-open and independence

- **Decision**: About / Discography / Tour / Info stay exclusive
  (existing StagePanels). Playlist MAY remain open while a panel is
  open (`011` spirit). Click-outside closes content panels as today;
  it MUST NOT hide the always-open player chrome. Legal overlay still
  must not collapse Info behind it (`015` spirit, now also desktop).
- **Rationale**: Spec edge cases / FR-005.
- **Alternatives considered**:
  - Phone-style exclusive between player-extra and content — rejected;
    desktop has space; spec kept 011 independence for playlist.

## R10: Artist guide is in scope

- **Decision**: Update `docs/artist-guide.md` in the same change set:
  laptop legal is **Info**, not the footer; laptop player is always-
  open **Playlist / Shuffle / Play/pause / Mute**; vinyl, loop, and
  volume slider is unmute-only on laptop; `loopDefault` stays unused
  on laptop.
- **Rationale**: Constitution VII / spec FR-014.
- **Alternatives considered**:
  - Skip docs because no new files — rejected; visitor-facing legal
    home and player chrome changed.

## R11: No new packages; visual QA is operator-led

- **Decision**: No `npm install`. No Playwright. Operator
  [quickstart.md](./quickstart.md) at ~1280×800 plus 1023/1024 and
  320px. CI stays `astro check` + `astro build`.
- **Rationale**: Workspace rules + constitution IV.
- **Alternatives considered**: Automated HUD screenshots — out of
  scope for this feature.
