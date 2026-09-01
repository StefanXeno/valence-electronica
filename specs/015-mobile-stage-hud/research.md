# Research: Mobile Stage HUD

**Date**: 2026-09-02 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

All Technical Context items for this feature were resolved as follows.

## R1: Breakpoint is CSS `max-width: 1023px`

- **Decision**: Phone HUD applies at viewport width **≤ 1023px**
  (`@media (max-width: 1023px)`). Laptop HUD (`009` / `011`) applies at
  **≥ 1024px**. Layout is **CSS-first** so the first paint is not a laptop
  HUD flash. Script that must not run on laptop (swipe, handle hint,
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
    nodes (one tree in `index.astro`) sit in the **socials tray** via CSS.
    Do not render `Channels` twice.
  - Bottom stack: **content dock** (StagePanels + socials trigger) above
    **player dock** (Jukebox).
  - Footer sits **above** the dock stack so it is not covered (FR-014).
- **Rationale**: YAGNI on a second HUD tree. Playback JS in Jukebox must
  keep a single mute/shuffle/loop instance (011).
- **Alternatives considered**:
  - Parallel phone-only components — doubles exclusive-open and glitch
    wiring (rejected).
  - Shrink `--hud-scale` on the laptop grid — spec forbids a scaled-down
    corner HUD (FR-001).

## R3: `--hud-scale: 1` below 1024px

- **Decision**: Phone HUD uses `--hud-scale: 1` (desktop stays `1.5`).
  Control circles stay tappable (~3.1rem) without clipping four content-dock
  buttons at 320px.
- **Rationale**: SC-004 / FR-019. Current 1.5 scale was a laptop visual
  target (`004` / `009`).
- **Alternatives considered**: Keep 1.5 and wrap docks — wraps look like a
  second row of chrome and steal stage (rejected).

## R4: Player pill = always-visible now-playing + expandable transport

- **Decision**: Structure:

  ```text
  .player-dock
    handle button (arrow; aria-expanded)
    .player-dock__now-playing   soundwave | name | mute
    .player-dock__transport     vinyl | shuffle | loop   [hidden when collapsed]
  ```

  Expand/collapse is `aria-expanded` on the handle (and swipe). **Mute is
  not inside the handle** so activating mute does not toggle the pill.
  No-JS: CSS shows **transport always expanded** (spec degradation).
- **Rationale**: Native `<details>` with mute inside `<summary>` would make
  mute toggle the pill (fails FR-003). Handle-as-only-summary is the
  non-swipe path (FR-006).
- **Alternatives considered**:
  - Entire now-playing row as `<summary>` — mute/name clicks expand
    (rejected).
  - Transport as the default rest (mockup) — owner locked collapsed
    now-playing as rest.

## R5: Mute is toggle-only below 1024px

- **Decision**: Keep one `MuteControl` instance. Below 1024px, **do not
  show the volume slider** (CSS + skip the unmute-expand-shell behavior).
  Laptop unmute-to-slider unchanged.
- **Rationale**: FR-003. Reuse 011 eligibility hide rules.
- **Alternatives considered**: Separate phone mute button — duplicates
  glitch/sync (rejected).

## R6: Now-playing copy is the V-Flip list label

- **Decision**: Center text is the active jukebox **`label`** (same string
  as the V-Flip list row). If a future visitor-facing **theme display
  name** differs from `label`, join with ` / `. **Never** show `themeId`
  (`electric-cyan`, `nightmare-crimson`). v1: one string; “same name →
  show once” is automatic. Sync via existing stage-switch / catalog
  (`[data-now-playing]` text). Long names: ellipsis; full name on
  `title` / accessible text.
- **Rationale**: Theme pack registry has ids, not visitor names. Spec
  forbids internal ids.
- **Alternatives considered**:
  - `label / themeId` — leaks internals (rejected).
  - New `themeLabel` on every pack in this feature — extra artist surface
    not requested (YAGNI; can extend later).

## R7: Soundwave is decorative CSS, not Web Audio

- **Decision**: Five vertical bars, CSS animation when motion is allowed;
  static under `prefers-reduced-motion`. `aria-hidden="true"`. Not tied
  to actual audio samples.
- **Rationale**: Constitution V (no extra media APIs / tracking). Spec
  only asks for the look.
- **Alternatives considered**: AnalyserNode visualizer — needs unmuted
  audio, extra JS, privacy smell (rejected).

## R8: Handle idle hint is a justified 60s timer

- **Decision**: Small module (`player-dock.ts`): after intro is gone, while
  collapsed, while `max-width: 1023px`, while motion is allowed — play a
  **3-cycle** CSS nod on the arrow, then wait **60s** and repeat. Stop on
  expand, intro, reduced motion, or laptop breakpoint. Do **not** persist
  anything.
- **Rationale**: Spec FR-006b cannot be a single infinite CSS loop (3
  nods then 60s pause). Timer is the justified exception (IV).
- **Alternatives considered**:
  - Infinite CSS bounce — does not match 3× / 60s (rejected).
  - Hint only once per visit — spec says every 60s.

## R9: Swipe on the player dock only

- **Decision**: Pointer/touch listeners on the player dock shell. Vertical
  delta past a small threshold (~40px) expands (up) or collapses (down).
  Ignore if the gesture starts on a scrolling sheet. Handle click still
  toggles. Laptop: listeners not attached (or no-op).
- **Rationale**: FR-004 / FR-006. Swipe is enhancement; handle is the
  accessible path.
- **Alternatives considered**: Viewport-wide swipe — fights scroll and
  intro (rejected).

## R10: Phone exclusive-open includes V-Flip list + socials

- **Decision**: Below 1024px, at most one of: About, Discography, Tour,
  V-Flip **list** (`<details data-jukebox>` open), socials tray. Expand/
  collapse of the pill does **not** close sheets. At ≥ 1024px keep 011:
  on-demand panels exclusive among themselves; V-Flip may stay open with
  a panel.
- **Rationale**: FR-011. Extend the existing `StagePanels` close-others
  script rather than a new event bus.
- **Alternatives considered**: Close the pill when About opens — extra
  motion, spec says pill is not a sheet (rejected).

## R11: Content sheets reuse StagePanels `<details>`

- **Decision**: Same About / Discography / Tour bodies. Below 1024px, CSS
  turns the open panel body into a **bottom sheet** attached above the
  content dock (full width minus insets, max-height ~50svh, internal
  scroll). V-Flip open drawer becomes a sheet attached above the player
  dock. Reduced motion: instant open, no travel.
- **Rationale**: FR-012. Do not fork Discography/Tour markup.
- **Alternatives considered**:
  - New sheet components — duplication (rejected).
  - Near-fullscreen overlay — owner chose dock-anchored sheets.

## R12: Socials trigger token `socials`

- **Decision**: New `HudIconToken` **`socials`**: connected-nodes / share
  glyph (not a chevron). Chrome `socialsIcon` optional override. Tray
  reuses `Channels.astro` + existing `site.json` channels. Trigger
  `aria-label` from existing `socialsLabel`.
- **Rationale**: FR-008 / FR-010. Plan-time glyph pick.
- **Alternatives considered**: Emoji-only — weaker match to other SVG
  HUD icons (rejected as default).

## R13: Footer above the dock stack

- **Decision**: Below 1024px, footer is still the landing legal cluster
  but `bottom` is offset by the collapsed dock stack (+ safe-area) so
  links are not covered. Compact wrap allowed. Overlay behavior unchanged
  (`002`).
- **Rationale**: FR-014 / constitution V. Spec left exact slot to plan.
- **Alternatives considered**: Legal only inside a sheet — extra tap for
  Impressum (rejected). Hide footer until expand — covered by docks
  (illegal).

## R14: No new npm packages; playback rules untouched

- **Decision**: Zero new dependencies. `011` shuffle/loop/dwell/crossfade
  stay in `playback.ts` / `stage-switch.ts`. This feature only **moves
  chrome**.
- **Rationale**: FR-016, constitution II/IV/VI.
- **Alternatives considered**: Gesture library (hammer.js etc.) — rejected.

## R15: Contract supersession

- **Decision**: New [contracts/mobile-hud-ui.md](./contracts/mobile-hud-ui.md)
  is authority **below 1024px**. Amend `009` desktop contract: phone polish
  is `015`, not IDEA-013. `011` “mobile remains IDEA-013” notes become
  pointers to `015`.
- **Rationale**: Constitution VI.
