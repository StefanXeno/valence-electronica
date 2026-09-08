# Contract: Phone Player Animation Polish (visitor-facing)

**Date**: 2026-09-06 | **Plan**: [../plan.md](../plan.md) | **Spec**: [../spec.md](../spec.md)

**Authority**: the three 018 surfaces on the **phone player pill**
(viewport width **≤ 1023px**):

1. Open / close to the **solo current card**
2. Handle **drag**
3. Currently Playing ↔ V-Flip **three-slot** morph

**Does not supersede**
[`015/contracts/mobile-hud-ui.md`](../../015-mobile-stage-hud/contracts/mobile-hud-ui.md)
for: docks, exclusive-open, mute, handle **placement**, content pill,
click-outside, intro hide, laptop at ≥ 1024px.

**Where 015 conflicts on the open playlist sheet** (“current card stays;
others add in”; full-list height; stretchier rubber-band), **this file
wins**.

Laptop floor chrome is
[`019/contracts/desktop-chrome-polish.md`](../../019-desktop-chrome-polish/contracts/desktop-chrome-polish.md).
This feature makes **0** intentional player-motion or layout changes
at ≥ 1024px.

Visual review is **operator-led**. Agents do not install browser
automation or add packages for this feature.

## Unchanged chrome (015)

| Slot | Contract |
|------|----------|
| Handle | Top edge of the pill. Up when collapsed, down when open. Always-visible floor/transport MUST NOT remove it. Hit ≥ 44×24px. |
| Floor (open or dragging) | Soundwave, playing name, mute — bottom, visible. No slider. |
| Transport (settled open) | Shuffle, play/pause, playlist — **above** the floor row. No vinyl. No loop. |
| Labels | Existing chrome strings. No new artist-editable fields. |
| Header | Currently playing / V-Flip title. **No soundwave on this line.** Floor wave + card EQ stay. |
| Expand | Still **is** V-Flip. Collapse turns playlist off. |

## Solo open face

| Rule | Contract |
|------|----------|
| Body | Current theme-track card **without** a play button. |
| Height | Same tap open height as today (chrome + that card). Drag-open MUST match. |
| Easing | Reuse as-built 320ms travel. Not a leftover-jank defect list. |
| Reduced motion / keyboard / SR | Still reach open and collapsed without drag and without required travel. |
| Drag-open | Solo card, **not** the three-row playlist. |

## Handle drag

| Input | Behavior |
|-------|----------|
| In-range (collapsed ↔ open cap) | 1:1 with the finger |
| Past open cap | Tighter / more mechanical than 015: rubber coefficient **0.78**, overshoot budget **40px** (was 0.32 / 18px). Easier to overshoot the cap. |
| Release | Settle to tap open height or collapsed height. No leftover bounce. |
| Tiny slip (`< 8px`) | Still a tap |
| Drag-close from playlist | **Shrink the three-row sheet.** MUST NOT morph to solo mid-drag. Playlist off after collapse settles. Next open is solo. |
| Not the only path | Handle activate / keyboard still toggles |

## Three-slot playlist face

Always **three** visual rows. List order = release order, **newest
first**. Shuffle MUST NOT reorder the list; it only hops which track
plays next.

### Initial window (FR-005)

Index real theme tracks `0 … n-1`, `i` = current. Missing indices are
placeholders.

| Current | Slot | Window |
|---------|------|--------|
| First (`i === 0`, including `n === 1`) | TOP | `[i, i+1, i+2]` |
| Last and not first | BOTTOM | `[i-2, i-1, i]` |
| Neither | MIDDLE | `[i-1, i, i+1]` |

Fresh live catalog (newest → oldest: Show Me How, Nightmare, Taking
Over, Infinite; default stage Nightmare) SHOULD open as **middle**:
`[Show Me How, Nightmare, Taking Over]`.

### Morph

When motion is allowed, playlist on/off is **one** shared-element /
cross-fade:

- Current card morphs into **whichever slot** it occupies at
  playlist-open time (dynamic path; no hardcoded TOP/MIDDLE/BOTTOM).
- The other two visible rows enter/leave with the sheet height
  grow/shrink.
- Headers cross-fade **Currently playing** ↔ **V-Flip aka. Jukebox**.
- MUST NOT flash dest-height rows for a frame.
- MUST NOT fly the current card over a neighbor.

Settled height fits three rows + unchanged chrome. If that stack
exceeds the existing sheet cap, the **viewport** scrolls inside the
cap; floor chrome stays visible.

Reduced motion: both faces reachable with no required travel.

### Scroll (FR-012)

The three-row viewport MAY scroll through the full real list. Current
MAY leave the window. Floor chrome still shows the playing name.
Opening MUST leave remaining list reachable in the direction(s) the
slot allows (first → later; last → earlier; else both). Placeholders
do not add scrollable catalog.

### Row chrome (FR-014)

| Row | Soundwave | Play button | Activate |
|-----|-----------|-------------|----------|
| Current real | Moving | No | — |
| Other real | No | Yes | Tap row or play → play that track |
| Placeholder | No | No | MUST NOT start a track; MUST NOT look startable |

### Hop while playlist is on (FR-016)

- New current **already visible** → keep window; move selection chrome
  only.
- New current **outside** the visible three-row window → re-apply the
  FR-005 window so it is visible in its slot.

### Placeholders (FR-015)

When `n < 3`, pad to **exactly three** rows. Inert. No duplicate real
tracks.

## Overlapping input (FR-008)

| Situation | End state |
|-----------|-----------|
| Playlist requested during open/close | Apply **after** that motion **settles** (last committed action). MUST NOT drop the request. |
| Second tap / drag during settle | Coherent open or collapsed; solo or playlist. No stuck half-height. No mixed header. |
| Exclusive-open / click-outside | Same close as the handle. Playlist off with collapse. Legal overlay still does not collapse the player. |

## Breakpoint (FR-009)

Crossing **1023px / 1024px** MUST cancel in-flight phone player motion
and drop height locks. Laptop MUST NOT inherit a mid-morph phone pill.
Playlist turns off when the viewport becomes laptop (as-built).

## Out of contract

- Desktop / laptop HUD restyle (IDEA-024 / `019`)
- Phone player **header-line** soundwave (floor + card EQ stay)
- Spec shrink of 015 / 009 / 011 (IDEA-025)
- Content-dock morph, handle idle nod, vinyl, loop, mute slider
- New routes, embeds, cookies, artist-guide surfaces
- Playback-rule changes (what shuffle **does** to pick next)
- Invented leftover-jank / double-settle open/close defects
- Placeholder **art** beyond “inert / not startable”
