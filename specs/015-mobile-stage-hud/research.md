# Research: Mobile Stage HUD

**Date**: 2026-09-02 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

**As-built addendum**: 2026-09-05. Decisions below that conflict with the
addendum are **historical**. The addendum + [spec.md](./spec.md) win.

All Technical Context items for this feature were resolved as follows.

## R1: Breakpoint is CSS `max-width: 1023px`

- **Decision**: Phone HUD applies at viewport width **≤ 1023px**
  (`@media (max-width: 1023px)`). Laptop HUD (`009` / `011`) applies at
  **≥ 1024px**. Layout is **CSS-first** so the first paint is not a laptop
  HUD flash. Script that must not run on laptop (drag, handle hint,
  phone exclusive-open) gates on `matchMedia('(max-width: 1023px)')` and
  re-checks on resize.
- **Rationale**: Spec SC-007: 1023 = phone, 1024 = laptop. Media queries
  match that cut without a layout JS dependency (constitution IV).
- **Alternatives considered**:
  - `1024px` as `max-width` — would put 1024 in the phone HUD (fails SC-007).
  - JS `data-hud="phone"` as the only layout switch — FOUC + extra script
    (rejected).
  - Container queries on `.stage` — overkill; the viewport **is** the
    question.

## R2: One DOM, two CSS compositions

- **Decision**: Do **not** duplicate Jukebox / StagePanels / Channels.
  Reposition existing chrome with a phone stage grid:
  - Identity stays top (compact).
  - Top-right socials **hidden as a corner**; those **same** `Channels`
    nodes (one tree) are **parked inside the content sheet** on phone.
    Do not render `Channels` twice.
  - Bottom stack: **content pill** (StagePanels + Socials + Info) above
    **player dock** (Jukebox).
  - Footer is **hidden** below 1024px (legal lives in Info).
- **Rationale**: YAGNI on a second HUD tree. Playback JS in Jukebox must
  keep a single mute/shuffle instance (011).
- **Alternatives considered**:
  - Parallel phone-only components — doubles exclusive-open and glitch
    wiring (rejected).
  - Shrink `--hud-scale` on the laptop grid — spec forbids a scaled-down
    corner HUD (FR-001).
  - Footer offset above the docks (original R13) — duplicated legal next
    to a five-icon bar; Info sheet won.

## R3: `--hud-scale: 1` below 1024px

- **Decision**: Phone HUD uses `--hud-scale: 1` (desktop stays `1.5`).
  Control circles stay tappable (~3.1rem) without clipping five
  content-dock buttons at 320px.
- **Rationale**: SC-004 / FR-019. Current 1.5 scale was a laptop visual
  target (`004` / `009`).
- **Alternatives considered**: Keep 1.5 and wrap docks — wraps look like a
  second row of chrome and steal stage (rejected).

## R4: Player pill = floor-pinned now-playing + expand-is-V-Flip

- **Decision** *(as-built)*: Structure:

  ```text
  .player-dock          position:absolute; bottom:0; height morph
    handle button (arrow; aria-expanded)
    floor: soundwave | name | mute
    transport (settled open only): shuffle | play/pause | playlist
    drawer: CURRENTLY PLAYING + current theme-track card
            (playlist: V-Flip aka. Jukebox + remaining cards)
  ```

  Expand/collapse **is** V-Flip. **Mute is not inside the handle.** Vinyl
  and loop are **hidden on phone**. No-JS: handle hidden; collapsed floor
  still paints; expand/drag/exclusive-open do not run.
- **Rationale**: A separate vinyl tap plus a translating “move the bar up”
  fought the floor-pinned sheet. Handle-as-V-Flip is one gesture.
- **Historical (superseded)**: Transport was vinyl | shuffle | loop;
  expand translated the pill; no-JS promised always-expanded transport.

## R5: Mute is toggle-only below 1024px

- **Decision**: Keep one `MuteControl` instance. Below 1024px, **do not
  show the volume slider**. Unmuted phone level is **50%** (laptop stays
  0.7 / slider). Keep the speaker in the floor row even when the current
  track has `hasAudio: false` so `wave | title | mute` does not reflow.
  Laptop unmute-to-slider unchanged. If the catalog has **no** audio
  entries, mute may be omitted from the DOM.
- **Rationale**: FR-003. Phone chrome stability > 011 hide-when-ineligible.
- **Alternatives considered**: Separate phone mute button — duplicates
  glitch/sync (rejected). Hide mute on no-audio tracks — collapsed the
  floor row (rejected).

## R6: Now-playing copy is the V-Flip list label

- **Decision**: Collapsed center text is the active jukebox **`label`**.
  Never show `themeId`. Long names: ellipsis; **no** `title` tooltip on
  phone. Expanded header: `currentlyPlayingLabel` until playlist is on,
  then `jukeboxPanelTitle`. Do **not** show `jukeboxPanelTooltip` on
  phone.
- **Rationale**: Theme pack registry has ids, not visitor names. Phone
  has no hover tooltips (FR-023).
- **Historical (superseded)**: Full name on `title` / accessible text
  via native tooltip.

## R7: Soundwave is decorative CSS, not Web Audio

- **Decision**: Five vertical bars, CSS animation when motion is allowed;
  static under `prefers-reduced-motion`. `aria-hidden="true"`. Pause
  bakes a flatten to 4px and holds the shuffle clock via
  `html[data-player-paused]`. Not tied to actual audio samples.
- **Rationale**: Constitution V. Pause must freeze wave + shuffle together.
- **Alternatives considered**: AnalyserNode visualizer — needs unmuted
  audio, extra JS, privacy smell (rejected).

## R8: Handle idle hint is a justified 60s timer

- **Decision**: `player-dock.ts`: after intro is gone, while
  `max-width: 1023px`, while motion is allowed — play a **3-cycle** CSS
  nod on the arrow, then wait **60s** and repeat. Runs **collapsed and
  expanded**. Stop on intro, reduced motion, or laptop breakpoint. Do
  **not** persist anything.
- **Rationale**: FR-006b cannot be a single infinite CSS loop. Hint
  teaches the handle in both states (arrow flips).
- **Historical (superseded)**: Hint only while collapsed; expand stops it.

## R9: Handle drag (not viewport swipe)

- **Decision**: Pointer listeners on the **handle**. Vertical travel
  grows/shrinks `--player-sheet-h` from `bottom: 0`. Cap at the same
  open height a tap would use. Rubber-band a few px past the cap, then
  snap. ~40px / flick velocity decides settle open vs closed. Ignore
  clicks after a real drag. Laptop: listeners no-op.
- **Rationale**: FR-004 / FR-006. Drag is enhancement; handle tap is the
  accessible path.
- **Historical (superseded)**: Swipe on the whole player dock shell;
  pill translated up.

## R10: Phone exclusive-open includes Info + V-Flip

- **Decision**: Below 1024px, at most one of: About, Discography, Tour,
  Socials, Info, V-Flip. Expand of the player pill **is** V-Flip.
  Click-outside closes the content pill; also collapses V-Flip unless
  the tap is on the player. Legal overlay open → do not treat overlay
  Exit / backdrop as click-outside. At ≥ 1024px keep 011: on-demand
  panels exclusive among themselves; V-Flip may stay open with a panel.
- **Rationale**: FR-011 / FR-011a.
- **Historical (superseded)**: Exclusive set omitted Info; pill expand
  did not count as V-Flip; no click-outside rule.

## R11: Content sheets are the growing pill

- **Decision**: Same About / Discography / Tour bodies plus Info /
  LegalSheet. Below 1024px the **content pill** interpolates
  `--phone-sheet-h` (~320ms, `--phone-panel-morph-dur`). Icons stay on
  the floor. Discography list scrolls inside the sheet. V-Flip is the
  player pill growing (`--player-sheet-h`). Reduced motion: instant.
- **Rationale**: FR-012. A detached sheet above a static bar looked like
  two HUD kits.
- **Historical (superseded)**: Dock-anchored sheet attached *above* a
  static four-icon bar; socials was a separate tray.

## R12: Socials trigger token `socials`

- **Decision**: `HudIconToken` **`socials`**: connected-nodes / share
  glyph (not a chevron). Chrome `socialsIcon` optional override. Sheet
  reuses `Channels.astro` + existing `site.json` channels (parked into
  `[data-stage-panels] .stage-panels__sheet`). Trigger `aria-label`
  from existing `socialsLabel`.
- **Rationale**: FR-008 / FR-010.
- **Alternatives considered**: Emoji-only — weaker match to other SVG
  HUD icons (rejected as default). Detached tray above the dock
  (rejected as-built).

## R13: Legal lives in Info; footer hidden

- **Decision**: Below 1024px, `<footer>` is `display: none`. Info sheet
  (circled i) shows © top-right and English **Imprint** / **Privacy
  Policy** pills (`imprintButton` / `privacyButton`) that open the
  existing Legal overlay (`002`). Overlay titles stay the legal
  markdown titles.
- **Rationale**: FR-014 / constitution V. A footer strip above two docks
  stole stage and duplicated legal.
- **Historical (superseded)**: Footer offset above the dock stack.

## R14: No new npm packages; laptop playback rules untouched

- **Decision**: Zero new dependencies. `011` shuffle/loop/dwell/crossfade
  stay in `playback.ts` / `stage-switch.ts`. Phone **omits loop** from
  transport and adds play/pause + playlist chrome. Pause writes
  `data-player-paused` so the shuffle clock holds.
- **Rationale**: FR-016, constitution II/IV/VI.
- **Alternatives considered**: Gesture library (hammer.js etc.) — rejected.

## R15: Contract supersession

- **Decision**: [contracts/mobile-hud-ui.md](./contracts/mobile-hud-ui.md)
  is authority **below 1024px**. `009` desktop contract: phone polish
  is `015`, not IDEA-013. `011` “mobile remains IDEA-013” notes point to
  `015`.
- **Rationale**: Constitution VI.

## As-built 2026-09-05 (supersedes conflicting R4 / R6 / R8 / R9 / R10 / R11 / R13)

| Topic | Shipped |
| ----- | ------- |
| Content dock | One growing pill, **5** icons, 320ms morph, icons on the floor |
| Socials | Channels parked **in** the sheet |
| Info | © + English legal pills → overlay; phone footer hidden |
| Player | Expand === V-Flip; floor-pinned height; tap = drag open height |
| Transport | Shuffle + play/pause + playlist. **No vinyl. No loop.** |
| Playlist | Theme / stage tracks only; solo = current card; others add in |
| Mute | Floor row even if `hasAudio: false`; unmuted **50%** |
| Hint | 3× / 60s **including expanded** |
| Tooltips | No phone HUD hover floaters / “pick a track” title |
| Click-outside | Closes content sheet; skip while Legal overlay is open |
