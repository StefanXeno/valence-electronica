# Contract: Glitch UI Behavior

**Date**: 2026-08-12 (as-built sync 2026-08-24; Nightmare clickable field 2026-09-09) | **Plan**: [../plan.md](../plan.md) | **Data model**: [../data-model.md](../data-model.md)

Visitor- and maintainer-facing behavior contract for UI glitch interactions. Stable so
acceptance tests and implementation refinements share one checklist. There is **no** new
content JSON for this feature.

## Enable gate (as-built)

Glitch runs only while `html[data-hud-glitch='true']` (set from the active theme pack’s
`hudGlitch` capability — see feature `005`). Packs without `hudGlitch` stay still,
including leftover classes cleaned on theme switch.

Feature `003` originally shipped the base language; feature `004` expanded the HUD hit
set. This contract is the **as-built closed set**.

## Closed hit-target set

MUST glitch (when motion allowed **and** `data-hud-glitch='true'` — Nightmare pack):

1. Active channel / social links (real URLs only)
2. Legal footer / Info-sheet legal pills
3. Legal panel Exit
4. Mute button (hover/focus/morph rules below)
5. Player handle; toolbar Playlist/wave, Shuffle, Play/pause (plus vinyl toggle morph)
6. Jukebox option / track-select buttons
7. On-demand stage panel summaries and phone HUD icon triggers (About, Discography, Tour, Info)
8. Discography listen-on icons and stage play buttons
9. Tour Tickets / Information pills

**Ambient idle (2026-09-09):** Visible clickable `.glitch-hit` controls that match
`button, a, [role=button], summary` also receive staggered **live-safe** one-shots
(`is-glitch-ambient`) so the HUD glitches “all over the place.” Cadence is irregular
(~520–1280ms between picks); at most two ambient hits at once. Hover, press, and
continuous treatments supersede ambient. Not a second effect — same `playElementGlitch`
presets.

**Transition flavor (2026-09-09):** Nightmare overlays live-safe `is-glitching` on
the animating chrome for the existing morph window — not a second path:

| Chrome | Duration | Host |
|--------|----------|------|
| Phone content bar open/close/cross | 320ms | `[data-stage-panels]` |
| Phone player floor ↔ sheet | 320ms (settle 320ms) | `[data-jukebox]` / `[data-player-dock]` |
| Playlist Currently Playing ↔ list (phone + desktop) | 380ms height WAAPI | `[data-jukebox]` |
| Desktop bar two-stage | 560ms (width then height) | `[data-stage-panel]` |

Other packs keep smooth 018/019 motion with no overlay. Reduced motion: snap, no flavor.

**Amendment (feature `009`, desktop dock):** Panel **shell** morph (`[data-stage-panel].is-glitching`,
`[data-jukebox].is-glitching`) MUST use the **live-safe** keyframe family (`ui-glitch-live-*`)
so `clip-path` fragmentation does not create dead pointer zones. Closed summary hover uses
`GlitchPress` one-shot on `.glitch-hit` (same pattern as social links). Visual split MAY occur;
the full summary bounding box MUST stay clickable and keyboard-activatable (FR-008 in `009`).

MUST NOT glitch:

- Volume range/slider
- “Coming soon” placeholder channel chips
- Open on-demand panel body hover (no hover glitch while open; click summary still glitches)
- Static copy, non-button cards, identity wordmark, tagline (rotator owns swap glitch), copyright lines
- About / prose links that are not primary HUD actions
- Any other non-clickable chrome unless `spec.md` is amended

## Trigger matrix

| Target | Pointer hover | Keyboard-visible focus | Press / click | Notes |
|--------|---------------|------------------------|---------------|-------|
| Channel / legal / exit | One-shot | One-shot | One-shot | Idle hover does not loop |
| Mute button | Continuous while pointer over button **and muted** | One-shot | Morph only (no stacked press) | Continuous ends on pointer-out or when audio plays |
| Jukebox collapsed vinyl | Continuous while collapsed and pointer over toggle | One-shot | Morph on expand/collapse | Same continuous language as mute; not mute-gated |
| Jukebox options | One-shot | One-shot | One-shot | Only while list open |
| On-demand summary | One-shot while **closed** | One-shot | Morph on shell open/close (glitch theme) | `glitch-hit` on `<summary>`; no hover when open |
| Listen-on / tour pills / discog play | One-shot | One-shot | One-shot | Ambient idle also |
| Volume slider | None | None | None | Out of set |
| Placeholder chip | None | None | None | Out of set |
| Ambient idle (any in-set clickable) | Staggered one-shot while visible | — | — | Live-safe; ≤2 concurrent; yields to hover/press/continuous |

## Stacking & hit-testing

- At most **one** active glitch treatment per control.
- Press supersedes in-flight hover/focus one-shots.
- Hover, press, and continuous supersede ambient idle (`is-glitch-ambient`).
- Mouse-click focus MUST NOT fire a focus glitch.
- Mute/unmute click: **morph wins** over continuous mute hover for that click. Continuous
  hover may resume only if the pointer is still over the mute button, audio is muted, and
  morph has ended.
- Jukebox expand/collapse: **morph wins** over continuous vinyl hover for that click.
- During any glitch (including continuous hover and morph), the control MUST remain
  activatable; the effect MUST NOT remove or meaningfully shrink the hit target.
- At ~320px width, glitch displacement MUST NOT push critical controls permanently
  off-screen or cover primary content.

## Reduced motion

When `prefers-reduced-motion: reduce`:

- No one-shot, continuous, morph, ambient idle, or chrome-transition flavor plays.
- Mute / jukebox may still expand/collapse for clarity without glitch language.
- Focus/activation remain clear without relying on glitch cues.

## Theme tint

- Glitch colors MUST reuse existing theme tokens (e.g. accent / text).
- MUST NOT introduce per-video deep motion packs or a visitor motion picker (FR-008).

## Privacy & weight

- First-party CSS/JS only.
- MUST NOT add tracking, cookies, persistent visitor storage, or third-party motion
  libraries. (Landing intro playback flag is feature `006`, unrelated to glitch.)

## Intensity gate

- Soft bar: roughly ≤3 distinct visual flashes per second; no large full-viewport flashes.
- One-shots complete in under 1 second.
- Final intensity within the bar is **owner-approved by eye** (not automated
  certification).

## Markup convention (implementation hint for maintainers)

In-scope **clickable** controls use class `glitch-hit` on `button`, `a`, `[role=button]`,
or `summary`. Continuous targets also use `data-glitch-live` (mute toggle, jukebox vinyl,
held shuffle/loop). Ambient idle is JS-driven (`createAmbientGlitchField`) — do **not**
add a global CSS blink on `:is(button, a)`. Do not mark slider, placeholders, wordmark,
copyright, or static copy. Enable gate is `data-hud-glitch`, not a hard-coded `data-theme`
string.
