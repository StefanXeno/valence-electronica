# Contract: Mobile HUD UI (visitor-facing)

**Date**: 2026-09-02 | **Plan**: [../plan.md](../plan.md) | **Spec**: [../spec.md](../spec.md)

**Authority below 1024px** (viewport width ≤ 1023px). Laptop HUD remains
[`009/contracts/desktop-hud-ui.md`](../../009-desktop-stage-ui/contracts/desktop-hud-ui.md)
as amended by [`011/contracts/vflip-player-ui.md`](../../011-vflip-now-playing/contracts/vflip-player-ui.md).

Visual annex: [`docs/mockups/mobile-stage-hud.jpg`](../../../docs/mockups/mobile-stage-hud.jpg)
(expanded transport + boxed clusters). The oversized standalone chevron in
that sketch is **not** the socials trigger.

**Visual review target**: ~390×844. Must also pass 320px width with no
horizontal page scroll.

**Chrome scale**: `--hud-scale: 1` in this range.

## Layout (≤ 1023px)

| Zone | Contract |
|------|----------|
| Center | Atmosphere only. Sheets attach to docks, not viewport center. |
| Top | Compact identity (wordmark + tagline if it still fits). Not in the bottom stack. |
| Top-right socials row | **Hidden as a corner bar.** Exactly **one** `Channels` tree in the page; CSS moves those same nodes into the socials tray. Do not mount a second channel list. |
| Bottom stack (from bottom) | **Player dock** (pill). **Content dock** (boxed) immediately above it. **Footer** immediately above the content dock (not covered). |
| Safe area | Insets honor `env(safe-area-inset-bottom)` so home-indicator devices still hit controls. |

Laptop (≥ 1024px): this contract does not apply; no volume-slider change.

## Player dock

### Collapsed (default)

| Slot | Content |
|------|---------|
| Top of pill | Handle: small **wide** arrow, points **up**. Same slot always. Hit target ≥ **44×24px**. |
| Left | Five-line soundwave (`aria-hidden`). Animated if motion allowed; static if reduced motion. |
| Center | Now-playing label (jukebox `label` only in v1; ellipsis if long). |
| Right | Mute **toggle** when audio-eligible. **No slider.** |

Shuffle and loop MUST NOT show in this row.

### Expanded

| Slot | Content |
|------|---------|
| Top of pill | Same handle slot; arrow points **down**. Handle travels with the bar as it moves **up**. |
| Transport | V-Flip (vinyl), shuffle, loop — circular buttons, same family as `011` toolbar. |
| Now-playing row | MAY remain the bottom of the same pill (soundwave / name / mute). |

Activating vinyl opens the V-Flip **list** as a sheet from this dock.

### Handle

| Input | Behavior |
|-------|----------|
| Activate handle (click / keyboard) | Toggle expanded |
| Swipe up on dock (touch, collapsed) | Expand |
| Swipe down on dock (touch, expanded) | Collapse |
| Mute activate | Mute/unmute only; MUST NOT toggle expanded |
| Idle (collapsed, motion, intro gone) | Arrow nods **3** times, repeats every **60s** |
| `prefers-reduced-motion: reduce` | No idle nod; toggle still works |
| No scripting | Transport visible (always expanded); no swipe; no nod |
| Scripting ready | `initPlayerDock()` sets `html[data-player-dock-js]` so collapsed CSS may hide transport. Without that attribute, transport stays visible. |

Accessible name from `playerExpandLabel` / `playerCollapseLabel`. Hit
target: at least **44px** wide and **24px** tall along the top of the pill.

### Mute

Same eligibility as `011`. Below 1024px: button only. ≥ 1024px: unmute may
reveal slider inside the V-Flip box.

## Content dock

One box, matching circular buttons:

| Control | Show when |
|---------|-----------|
| About | About content exists (`004` hide rule) |
| Discography | Always (empty state inside sheet) |
| Tour | Always (empty state inside sheet) |
| Socials trigger | Always; icon token `socials` (not a chevron) |

Buttons share size and chrome. Open About / Discography / Tour → **sheet
rises from this dock**.

## Socials tray

| State | Contract |
|-------|----------|
| Rest | Hidden. No permanent platform bar. |
| Open | Boxed row of existing channels **above** the content dock. |
| Close | Same trigger again (or exclusive-open). Still on the landing. |
| Links | Active URLs open in a new tab (`004`). Coming-soon not a dead link. |
| Overflow | Wrap or scroll **inside the box**; no page sideways scroll. |

## Sheets (exclusive-open, scripting available)

At most **one**:

`about` | `discography` | `tour` | `vflip-list` | `socials`

| Sheet | Anchors to |
|-------|------------|
| About, Discography, Tour | Content dock |
| V-Flip list | Player dock |
| Socials | Content dock (tray) |

Player pill expand/collapse is **not** a sheet.

Open sheet: docks stay on screen; body scrolls inside; max height ~50svh;
not a new route. Reduced motion: no travel animation required.

≥ 1024px: `011` exclusive-open (panels among themselves; V-Flip independent).

## Identity and legal

- Identity stays top, compact.
- Footer: copyright + Impressum + Datenschutzerklärung, **not covered** by
  docks. Overlay contract from `002` unchanged.

## Intro

`data-intro-pending` / `data-intro-active`: hide player dock, content dock,
and socials tray the same way today’s stage chrome hides. Handle hint does
not run until intro is gone.

## Glitch

Dock buttons keep `003` / `009` hit-target rules. Full layout box stays
clickable during glitch.

## Playback

Shuffle / loop / dwell / crossfade: `011` contracts unchanged. This file
only relocates controls below 1024px.

## Out of contract

- New routes, embeds, cookies
- Phone volume slider
- Third tablet layout
- Desktop HUD restyle
