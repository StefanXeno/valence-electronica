# Contract: Desktop Chrome Polish (visitor-facing)

**Date**: 2026-09-08 | **Plan**: [../plan.md](../plan.md) | **Spec**: [../spec.md](../spec.md)

**Authority from 1024px up** (viewport width ≥ 1024px). Phone HUD remains
[`015/contracts/mobile-hud-ui.md`](../../015-mobile-stage-hud/contracts/mobile-hud-ui.md)
as amended by
[`018/contracts/phone-player-polish.md`](../../018-player-animation-polish/contracts/phone-player-polish.md).

**Supersedes for desktop floor chrome**: layout / player / footer rows in
[`009/contracts/desktop-hud-ui.md`](../../009-desktop-stage-ui/contracts/desktop-hud-ui.md)
and the collapsed vinyl toolbar in
[`011/contracts/vflip-player-ui.md`](../../011-vflip-now-playing/contracts/vflip-player-ui.md).
Shuffle **advance**, mute **eligibility**, and legal **overlay** behavior
from those features stay.

**Visual review target**: ~1280×800. Page MUST still load at 320px with
no horizontal scroll (phone visual success is not this contract).

**Chrome scale**: existing `--hud-scale: 1.5` laptop behavior unless a
later task tunes spacing only.

## Layout (≥ 1024px)

| Zone | Contract |
|------|----------|
| Center | Atmosphere only. Open playlist and bar sheets stay peripheral. |
| Top-left | Identity (wordmark + tagline). Unchanged role. |
| Top-right | Social / platform icons. **Only** social-icon home. Labels below on hover/focus (`009`). |
| Bottom-left | **Always-open player** (this file). |
| Bottom-right | **Content bar**: About (if content exists), Discography, Tour, Info. **No Socials.** |
| Bottom-center footer | **Hidden.** Legal is Info. |

Left / right floor split. Not the phone stacked full-width docks.

## Always-open player

No V-Flip / vinyl button. No collapse toggle for the player chrome.

### Rest (playlist off)

| Slot | Content |
|------|---------|
| Face | Boxed player, already visible after intro. |
| Track | **Currently playing** visitor-facing label (same string as the jukebox list row). Always readable. |
| Toolbar L→R | **Playlist**, **Shuffle**, **Play/pause**, **Mute** (if mute is mounted). |

**Forbidden in this chrome:** vinyl / V-Flip toggle, Loop, volume slider.

### Playlist on

The **list** grows from this player (existing laptop theme-track list +
inline track info from `011`). Not the phone `018` three-row window.

| Motion (motion allowed) | Stages |
|-------------------------|--------|
| Open | Grow in place: **wider right**, then **taller up**. |
| Close | Shrink in place: **down**, then **left**. Player chrome (track + toolbar) stays. |

Whole player MUST NOT slide. Reduced motion: both faces without required travel.

## Content bar

Matching circular / icon-first controls. Hover/focus labels **above**
closed icons (`009`). Opening grows **the same bar**.

| Control | Open body |
|---------|-----------|
| About | Existing bio (hidden if no content) |
| Discography | Existing catalog; scrolls inside the sheet if long |
| Tour | Existing dates |
| Info | See below |

| Motion (motion allowed) | Stages |
|-------------------------|--------|
| Open | Grow in place: **wider left**, then **taller up**. |
| Close | Shrink in place: **down**, then **right**. |

Exclusive-open among About / Discography / Tour / Info. Playlist MAY
stay open at the same time.

## Info box

| Slot | Content |
|------|---------|
| Top-right of the open box | `© {year} {artist}` (Valence) — same as phone Info |
| Body | English **Imprint** / **Privacy Policy** pills (`imprintButton` / `privacyButton`) |
| Pills | Open the existing fullscreen legal overlay (`002`) |

German legal markdown titles stay on the overlay. While the overlay is
open, that interaction MUST NOT collapse Info behind it.

## Mute / play/pause / shuffle

| Control | Meaning |
|---------|---------|
| Mute | On/off in the right-hand slot. **No slider.** Unmute uses in-memory level (default 0.7). Device volume is loudness. |
| Play/pause | Atmosphere video play/pause (same as phone `015`). Fallback / missing video MUST NOT count as a visitor pause. |
| Shuffle | Existing `011` toggle. Loop is **off** on desktop (no control). |

## Motion timing

| Token | Value |
|-------|-------|
| Stage duration | **280ms** (`SMOOTH_PANEL_PHASE_MS`) |
| Easing | `cubic-bezier(0.4, 0, 0.2, 1)` |
| Reduced motion | Instant; no required travel |
| Glitch packs | MAY overlay morph flavor; MUST NOT invert or skip stage order |
| Phone motion | Unchanged (`015` / `018`, including 320ms content-pill) |

## Resize

Crossing **1023px / 1024px** MUST tear down in-flight desktop two-stage
motion and MUST NOT leave an always-open desktop player on the phone
HUD (or a phone pill mid-morph on laptop).

## Out of this contract

- Phone docks, handle drag, 018 three-slot window
- New routes, embeds, cookies
- New chrome / legal files
- Changing shuffle hop timing or legal overlay copy
