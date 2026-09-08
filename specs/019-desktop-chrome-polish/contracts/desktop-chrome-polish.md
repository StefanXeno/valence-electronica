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
| Track | **Phone now-playing card** (theme-track card: title, year/kind, listen-on — same as `015` / `018`). Not a name-only row. |
| Header | `currentlyPlayingLabel` while the atmosphere plays; `currentlyPausingLabel` (**Currently pausing**) while paused. Soundwave on the **right** of this row only (not on the solo card). **No** HUD tooltip on the title. |
| Toolbar L→R | **Playlist** (soundwave while jukebox is open — exclusive, never stacked), **Shuffle**, **Play/pause**, **Mute** (if mute is mounted). Box width is static (slider reserved). Unmute shows the slider in that space. |

**Forbidden in this chrome:** vinyl / V-Flip toggle, Loop. Slider is **hidden while muted**.

### Playlist on

The box **switches** to the **phone theme-track card window**
(background-available tracks only; same cards as the rest-state
now-playing card). Not the `011` TrackInfoPanel list.

| Motion | Behavior |
|--------|----------|
| Open | **018 row morph**: now-playing card merges into the list, stays selected and in view. **No** width grow. Height MAY grow **up only**. |
| Close | Reverse morph back to the solo card. Player chrome (track + toolbar) stays. |

Header at rest: **Currently playing** or **Currently pausing** +
soundwave **vertically centered** with that text, on the right (not
on the solo card). Playlist view: first toolbar control is the
**soundwave only**; **no** header wave on the jukebox / V-Flip
title; the **active** card shows the now-playing EQ.
**No** HUD tooltips on those header titles.

Whole player MUST NOT slide or two-stage-widen. Reduced motion: both
faces without required travel.

## Content bar

Matching circular / icon-first controls. Hover/focus labels **above**
closed icons (`009`). Opening grows **the same bar**.

| Control | Open body |
|---------|-----------|
| About | Existing bio (hidden if no content) |
| Discography | Existing catalog in a **2.5-row** well (two full cards + peek of the third). Scrolls for the rest. **Not** the player playlist window (that stays **3** rows). |
| Tour | Existing upcoming **cards** (`004`: title or venue, date · city, Tickets / Information pills) |
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
| Top-right of the open box | `© {year} {artist}` (Valence) — **same row height** as the Info heading |
| Body | English **Imprint** / **Privacy Policy** pills (`imprintButton` / `privacyButton`) |
| Pills | Open the existing fullscreen legal overlay (`002`) |

German legal markdown titles stay on the overlay. While the overlay is
open, that interaction MUST NOT collapse Info behind it.

## Mute / play/pause / shuffle

| Control | Meaning |
|---------|---------|
| Mute | On/off in the right-hand slot. Box width is **static** from first paint (slider space reserved). **Muted:** no slider. **Unmuted:** full `011` slider in that space. No-sound tracks keep mute (disabled OK) and the same width. Unmute level default 0.7. |
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

Crossing **1023px / 1024px** MUST tear down in-flight desktop **bar**
two-stage motion and MUST NOT leave an always-open desktop player on
the phone HUD (or a phone pill mid-morph on laptop).

## Out of this contract

- Phone docks, handle drag, 018 three-slot **player** window
- Applying the Discography 2.5-row well to the player playlist
- New routes, embeds, cookies
- Changing shuffle hop timing or legal overlay copy
