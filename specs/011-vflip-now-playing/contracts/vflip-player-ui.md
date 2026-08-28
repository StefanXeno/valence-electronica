# Contract: V-Flip player UI (visitor-facing)

**Date**: 2026-08-28 (updated 2026-08-28) | **Plan**: [../plan.md](../plan.md) | **Spec**: [../spec.md](../spec.md)

**Amends (desktop)**: left cluster and on-demand row in
[`specs/009-desktop-stage-ui/contracts/desktop-hud-ui.md`](../../009-desktop-stage-ui/contracts/desktop-hud-ui.md).

**Supersedes (desktop)**: Track info as a separate dock icon / now-playing popover
placement in [`specs/010-track-catalog/contracts/track-catalog-ui.md`](../../010-track-catalog/contracts/track-catalog-ui.md)
— metadata is shown **inside the selected track row** in open V-Flip. Discography
and any Tracks **browse list** panel (if shipped) are unchanged except that Track
info is not a right-dock icon.

Mute **behavior** (show/hide, volume, glitch) stays
[`002`](../../002-themed-background-video/) + existing `MuteControl`. Only **placement**
changes.

Visual target: typical laptop (~1280px+). Phone polish is IDEA-013.

## Left dock cluster

| State | Contract |
| ----- | -------- |
| Collapsed | **One** `[data-jukebox]` shell. Bottom **toolbar**: vinyl → shuffle → loop → mute (when eligible). No sibling mute in `StageDock`. |
| Collapsed + unmuted | Volume slider expands **inside** the same shell to the right of the mute icon; vinyl and shuffle/loop positions stay fixed (explicit widths, no `max-content` jump). |
| Collapsed + mute hidden | Toolbar is vinyl + shuffle + loop only; mute slot and its width are removed (`[data-jukebox-mute-slot][hidden]`). |
| Open | Shell grows upward. **Same toolbar** at the bottom. Drawer above: panel title + scrollable track list. |

`StageDock` left cluster contains **only** the jukebox slot (mute is inside it).

## Open player (peripheral)

Width: `min(22rem × --hud-scale, 100vw − 2 × --hud-inset)`.

Max body height: `min(44svh, 19rem × --hud-scale)`.

| Region | Content |
| ------ | ------- |
| Drawer header | `jukeboxPanelTitle` (chrome); optional hover tooltip `jukeboxPanelTooltip` |
| Drawer body (scroll) | Track list — each row: **select button** (label) + **inline track info** (date, Listen On) visible only on the **selected** row |
| Toolbar (always) | Vinyl toggle → shuffle → loop → mute (when eligible) |

**No lyrics block** in the open drawer (v1).

## Track info (inline)

On the active/selected row only (`[data-track-info-for]` visible, others `hidden`):

- Release date line when `sortDate` present (`releasedLabel`)
- Listen On: label + platform icon links on **one horizontal line** (`listenOnLabel`)
- Empty links: `emptyTrackLinks` copy

Listen links: new tab, `noopener` (unchanged `010`).

Song list: option buttons with `data-jukebox-option`; current id `aria-pressed="true"`.

## Mute / volume tooltips

| Control | When | Tooltip |
| ------- | ---- | ------- |
| Mute/volume **button** | Hover or keyboard-visible focus while control is visible | Chrome string for current action: unmute when muted, mute when sound is on |
| Volume **slider** | Hover or keyboard-visible focus while slider is visible (sound on) | Chrome string hinting **drag to adjust volume** |

Implementation reuses HUD label-reveal (`data-hud-label` / `data-hud-label-anchor`).
Volume-slider tooltip uses the **mute button’s vertical anchor** so it aligns with
the mute/unmute label height.

Vinyl (closed): `data-hud-label` = `jukeboxLabel`, anchor `above`. When drawer open,
vinyl floating label is suppressed while drawer is open (same as prior jukebox rule).

Shuffle/loop: `data-hud-label` + `data-hud-label-anchor="above"` on toolbar buttons.

## Right dock

Order: About (if content) → Discography → Tour.

**Must not** include Lyrics or Track info icon buttons.

Open on-demand panel summary: icon + **title label** share accent color and glow
(`--color-accent-alt` + matching text-shadow / icon drop-shadow).

## Keyboard / a11y

Tab order (left cluster, collapsed): vinyl → shuffle → loop → mute (if visible) → right dock.

Tab order (open): same toolbar, then track list links, then right dock.

Shuffle/loop announce pressed state. Mute unchanged.

## Motion

Open/close V-Flip drawer: same two-phase smooth open as on-demand panels (`009` /
`panel-motion.ts`); glitch morph on Nightmare when applicable.

Theme/atmosphere handoff: see [vflip-playback.md](./vflip-playback.md) (`smooth` vs
`glitch` crossfade modes).

## Glitch

Vinyl (`data-glitch-live`), mute, list options, shuffle, loop: existing families.

When HUD glitch is active **and** shuffle and/or loop is `aria-pressed="true"`,
those toggles run **continuous** glitch (`createContinuousGlitch`) until toggled
off or theme leaves glitch pack.

Hop crossfade is **not** the panel morph smash.

## Amendments operators must apply in `009` contract (implementation)

Replace left cluster “jukebox + mute side by side” with “jukebox shell contains
mute + transport toolbar.” Replace on-demand row “Lyrics, Track info” with About,
Discography, Tour only. Point here for V-Flip open anatomy.
