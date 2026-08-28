# Contract: V-Flip player UI (visitor-facing)

**Date**: 2026-08-28 | **Plan**: [../plan.md](../plan.md) | **Spec**: [../spec.md](../spec.md)

**Amends (desktop)**: left cluster and on-demand row in
[`specs/009-desktop-stage-ui/contracts/desktop-hud-ui.md`](../../009-desktop-stage-ui/contracts/desktop-hud-ui.md).

**Supersedes (desktop)**: Track info as a separate dock icon / now-playing popover
placement in [`specs/010-track-catalog/contracts/track-catalog-ui.md`](../../010-track-catalog/contracts/track-catalog-ui.md)
— that metadata is shown **inside open V-Flip**. Discography and any Tracks **browse
list** panel (if shipped) are unchanged by this contract except that Track info is
not a right-dock icon.

Mute **behavior** (show/hide, volume, glitch) stays
[`002`](../../002-themed-background-video/) + existing `MuteControl`. Only **placement**
changes.

Visual target: typical laptop (~1280px+). Phone polish is IDEA-013.

## Left dock cluster

| State | Contract |
| ----- | -------- |
| Collapsed | **One** `[data-jukebox]` shell. Vinyl summary + mute (when eligible) in the same box. No sibling mute in `StageDock`. |
| Collapsed + unmuted | Volume slider expands **that** shell to the right; vinyl cell does not jump. |
| Collapsed + mute hidden | Shell is vinyl-only (same as today’s collapsed jukebox). |
| Open | Shell grows to player width (below). Vinyl stays in a fixed `--control-size` anchor cell (existing `009` rule). Mute stays in the **header row**. Shuffle and loop are in the open player, **not** in the collapsed box. |

`StageDock` left cluster contains **only** the jukebox slot (mute is inside it).

## Open player (peripheral)

Width: `min(22rem × --hud-scale, 100vw − 2 × --hud-inset)`.

Max body height: `min(42svh, 18rem × --hud-scale)` (taller than today’s list-only
`11rem` so lyrics fit; still not center-stage).

| Region | Content |
| ------ | ------- |
| Header | Vinyl \| **active track title** (ellipsis) \| mute/volume |
| Transport | Shuffle toggle, loop toggle (`aria-pressed`, chrome labels) |
| Body (scroll) | Track info (active) → lyrics (active) → song list |

## Mute / volume tooltips

| Control | When | Tooltip |
| ------- | ---- | ------- |
| Mute/volume **button** | Hover or keyboard-visible focus while control is visible | Chrome string for current action: unmute when muted, mute when sound is on |
| Volume **slider** | Hover or keyboard-visible focus while slider is visible (sound on) | Chrome string hinting **drag to adjust volume** |

Implementation SHOULD reuse the existing HUD label-reveal floater (`data-hud-label` /
`data-hud-label-anchor`) so mute tooltips match dock discoverability. Anchor
**above** the control (dock family). Open V-Flip does **not** suppress these
tooltips solely because the player is open — they are transport hints, not the
vinyl summary label.

Accessible names (`aria-label`) MUST remain accurate even if the visual tooltip
is missing (no-JS / reduced scripting). Tooltip strings MUST come from
`src/content/ui/chrome.md` (see data-model).

Header title source: jukebox `label` (same as catalog title). Accessible name on
vinyl summary remains `jukeboxLabel` (“V-Flip”).

Track info / lyrics: reuse existing empty states (`emptyTrackLinks`, `emptyLyrics`).
Omit empty date line. Listen links: new tab, `noopener` (unchanged `010`).

Song list: unchanged option buttons; current id `aria-pressed="true"`.

## Right dock

Order: About (if content) → Discography → Tour.

**Must not** include Lyrics or Track info icon buttons.

## Label reveal

Vinyl (closed): `data-hud-label` = `jukeboxLabel`, anchor `above` (unchanged).
Open vinyl: floating label suppressed (inline track title instead).

Shuffle/loop: no floating label required if they only exist while open; `aria-label`
from chrome is enough. If placed on the header next to vinyl while open, still no
floater (open-panel suppression).

## Keyboard / a11y

Tab order (left cluster, collapsed): vinyl summary → mute (if visible) → right dock.

Tab order (open): vinyl summary → mute → shuffle → loop → track-info links → lyrics
(text) → song list → right dock.

Shuffle/loop announce pressed state. Mute unchanged.

## Motion

Open/close V-Flip: existing `009` two-phase / glitch morph. Shuffle **hop** motion
is the playback crossfade contract, not panel morph.

## Glitch

Vinyl, mute, list options, shuffle, loop: existing families (`data-glitch-live` /
`glitch-hit` as appropriate). Full hit box remains clickable (`009` FR-008).
Hop crossfade is **not** a glitch morph.

## Amendments operators must apply in `009` contract (implementation)

Replace left cluster “jukebox + mute side by side” with “jukebox shell contains
mute.” Replace on-demand row “Lyrics, Track info” with About, Discography, Tour
only. Point here for V-Flip open anatomy.
