# Contract: Mobile HUD UI (visitor-facing)

**Date**: 2026-09-02 | **Plan**: [../plan.md](../plan.md) | **Spec**: [../spec.md](../spec.md)

**As-built sync**: 2026-09-05.

**Authority below 1024px** (viewport width ≤ 1023px). Laptop floor chrome is
[`019/contracts/desktop-chrome-polish.md`](../../019-desktop-chrome-polish/contracts/desktop-chrome-polish.md).

> **Supersession (020):** Primary site nav, side socials placement, and removal of
> the five-icon circular content dock as the *primary* path to Shop/Tour/Contact
> are owned by [`020-site-nav-chrome`](../../020-site-nav-chrome/contracts/site-nav-chrome-ui.md).
> Phone **Links** park/reuse of Channels remains. Floor **player** defaults → `021`.

Visual annex `docs/mockups/mobile-stage-hud.jpg` is **historical**. Where it
conflicts with this file (detached socials tray, loop, four icons, always-
visible footer, vinyl-in-pill), **this file wins**.

**Visual review target**: ~390×844. Must also pass 320px width with no
horizontal page scroll.

**Chrome scale**: `--hud-scale: 1` in this range.

**Pad tokens** (equal air):

| Token | Role |
| ----- | ---- |
| `--phone-bar-pad` | Collapsed content-pill top = bottom |
| `--phone-open-pad` | Open content-pill top = bottom |
| `--phone-inline-pad` | Content-pill left = right |
| `--phone-body-gap` / `--phone-tray-gap` | Air between sheet body and the icon row |
| `--phone-panel-morph-dur` | Content-pill morph (**320ms**) |

## Layout (≤ 1023px)

| Zone | Contract |
|------|----------|
| Center | Atmosphere only. Sheets are the docks growing, not viewport-center overlays. |
| Top | Compact identity (wordmark + tagline if it still fits). Not in the bottom stack. |
| Top-right socials row | **Hidden as a corner bar.** Exactly **one** `Channels` tree; phone **parks** those nodes inside the content sheet. Do not mount a second channel list. |
| Bottom stack (from bottom) | **Player dock** (floor-pinned pill). **Content dock** (growing pill) immediately above it. **No footer** (legal is Info). |
| Safe area | Insets honor `env(safe-area-inset-bottom)` so home-indicator devices still hit controls. |
| Hover labels | **None.** `.hud-label-reveal` hidden. No native `title` on now-playing / “pick a track”. |

Laptop (≥ 1024px): this contract does not apply; no volume-slider change.

## Player dock

Floor-pinned: `bottom: 0`. Height grows. The chrome MUST NOT translate off
the floor. Expand === V-Flip.

### Collapsed (default)

| Slot | Content |
|------|---------|
| Top of pill | Handle: small **wide** arrow, points **up**. Same slot always. Hit target ≥ **44×24px**. |
| Left | Five-line soundwave (`aria-hidden`). Animated if motion allowed; static if reduced motion; flattens on pause. |
| Center | Now-playing label (jukebox `label` only; ellipsis if long). **No `title`.** |
| Right | Mute **toggle**. **No slider.** Stays in this column even when the current track has `hasAudio: false` (if mute is mounted). |

Shuffle, play/pause, and playlist MUST NOT show in this row.

### Expanded

| Slot | Content |
|------|---------|
| Top of pill | Same handle slot; arrow points **down**. Pill **grows**; floor stays pinned. |
| Header | `currentlyPlayingLabel` until playlist is on, then `jukeboxPanelTitle` (`V-Flip aka. Jukebox`). Never `jukeboxPanelTooltip`. **No soundwave on this header line** (floor pill wave + playlist **card** EQ stay). |
| Body | Theme / stage track **cards** (not the full discography catalog). Solo = the current card only. Playlist = that card stays; others add in; list **scrolls**. |

**018 playlist sheet:** Below 1024px, the open playlist face is no longer
the 015 full-list unfold. [`018/contracts/phone-player-polish.md`](../../018-player-animation-polish/contracts/phone-player-polish.md)
wins for that sheet (three-slot window, 3-row height, tighter drag
overshoot, pending playlist after settle). Docks, exclusive-open, mute,
handle placement, and content pill stay this file. Laptop floor chrome
is `019`.
| Transport (settled open) | Shuffle, play/pause (background video), playlist. **No vinyl. No loop.** |
| Floor | Same `wave \| title \| mute` row. |

Tap open height and drag open height MUST match. Drag past the cap
rubber-bands, then settles. Activating the handle (or finishing a drag
open) **is** opening V-Flip — there is no separate vinyl control.

### Handle

| Input | Behavior |
|-------|----------|
| Activate handle (click / keyboard) | Toggle expanded === toggle V-Flip |
| Drag handle up | Grow height toward the shared open target |
| Drag handle down | Shrink toward collapsed |
| Mute activate | Mute/unmute only; MUST NOT toggle expanded |
| Idle (motion, intro gone) | Arrow nods **3** times, repeats every **60s**, **collapsed or expanded** |
| `prefers-reduced-motion: reduce` | No idle nod; toggle still works |
| No scripting | Handle hidden; collapsed floor still paints; expand / drag / hint do not run |
| Scripting ready | `initPlayerDock()` sets `html[data-player-dock-js]` |

Accessible name from `playerExpandLabel` / `playerCollapseLabel`. Hit
target: at least **44px** wide and **24px** tall along the top of the pill.

### Mute

Below 1024px: button only; unmuted level **50%**. ≥ 1024px: unmute may
reveal the slider in reserved space (`019`). Phone keeps the floor
speaker when the current track has no audio.

### Play / pause

Toggles the hero / stage `<video>`. Writes `html[data-player-paused]`:
soundwave flattens, shuffle clock **holds** (no hop). Fallback / missing
video disables the control without counting as a visitor pause.

## Content dock

One **growing** pill. Icons stay on the **bottom**. Matching circular
buttons:

| Control | Show when |
|---------|-----------|
| About | About content exists (`004` hide rule) |
| Discography | Always (empty state inside sheet; list **scrolls**) |
| Tour | Always (empty state inside sheet) |
| Socials trigger | Always; icon token `socials` (not a chevron) |
| Info | Always; icon token `info` (circled i) |

Open → **same pill grows** (~320ms). Not a detached sheet above a static
bar. Not a laptop side panel.

## Socials

| State | Contract |
|-------|----------|
| Rest | Hidden. No permanent platform bar. |
| Open | Channels appear **inside the content sheet** (parked `.stage__socials`). |
| Close | Same trigger again, another icon, or click-outside. Still on the landing. |
| Links | Active URLs open in a new tab (`004`). Coming-soon not a dead link. |
| Overflow | Wrap or clip **inside the sheet**; no page sideways scroll. |

## Info / legal

| Slot | Contract |
|------|----------|
| Phone footer | **Hidden.** |
| Info header | © `{year} {artist}` **top-right**. |
| Pills | English **Imprint** + **Privacy Policy** (`imprintButton` / `privacyButton`). |
| Activate pill | Existing Legal overlay (fullscreen). Overlay titles stay legal markdown. |
| Overlay open | Click-outside on the landing MUST NOT close Info / V-Flip behind it. |

## Sheets (exclusive-open, scripting available)

At most **one**:

`about` | `discography` | `tour` | `socials` | `info` | `vflip-list`

| Sheet | Anchors to |
|-------|------------|
| About, Discography, Tour, Socials, Info | Content pill (growing) |
| V-Flip | Player pill (growing). Expand === this sheet. |

Click-outside closes the content pill. Click-outside also collapses
V-Flip unless the tap is on the player pill. Legal overlay: skip.

Open sheet: docks stay on screen; long bodies scroll inside; not a new
route. Reduced motion: no travel animation required.

≥ 1024px: `019` / `011` exclusive-open (bar panels among themselves;
playlist MAY stay independently open).

## Identity and legal

- Identity stays top, compact.
- Phone legal is **Info** + overlay (`002`). Footer is not a third dock.

## Intro

`data-intro-pending` / `data-intro-active`: hide player dock and content
dock the same way today’s stage chrome hides. Handle hint does not run
until intro is gone.

## Glitch

Dock buttons keep `003` / `009` hit-target rules. Full layout box stays
clickable during glitch. Phone content-pill morph stays the 320ms ease
(not desktop `steps()`).

## Playback

Laptop shuffle / dwell / crossfade: `011` meaning. Desktop chrome
(no vinyl / no loop control) is `019`.
Phone omits loop from transport and adds play/pause + theme-track
playlist. Pause holds the shuffle clock.

## Out of contract

- New routes, embeds, cookies
- Phone volume slider
- Phone loop control
- Phone vinyl / separate V-Flip button
- Detached socials tray above a static bar
- Always-visible phone footer legal strip
- Third tablet layout
- Desktop HUD restyle
- Specifying leftover open-overshoot / playlist-jump polish as required
  behavior (intended design is a shared capped open height and a pinned
  current card)
