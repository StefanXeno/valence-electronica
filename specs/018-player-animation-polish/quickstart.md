# Quickstart: Player Animation Polish

**Feature**: `018-player-animation-polish` |
**Contract**: [phone-player-polish.md](./contracts/phone-player-polish.md) |
**Model**: [data-model.md](./data-model.md)

Visual review is **operator-led**. Do **not** install Playwright,
Puppeteer, or Chromium for this feature. Do **not** treat
`npm run verify:hud` as 018 authority (that script still describes the
015 full-list playlist).

## Prerequisites

- Node 22+, project dependencies **already** installed (do not
  `npm install` for this feature)
- Branch `018-player-animation-polish`
- Intro skipped or completed (`Escape` / already seen)
- Devtools device mode or a narrow window
- Live catalog has **four** theme tracks (newest → oldest: Show Me How,
  Nightmare, Taking Over, Infinite). Nightmare is the default stage.

## Setup

```bash
npm run dev
# open the local site with the /valence-electronica base path
```

Use **390×844** as the visual target. Also spot-check **320** width and
**1023 vs 1024** width.

Logic-only check (no browser):

```bash
npx vitest run src/lib/playlist-window.test.ts
```

(`npx vitest run` is the existing `npm test` runner; do not add
packages. The file exists after implement.)

## Scenario 1 — Solo open / close (P1, SC-001)

1. Viewport **390×844**, player collapsed, motion allowed.
2. Tap the **handle** 5 times (open, close, open, close, open).
3. **Expect (each open)**: current song **card without a play button**;
   floor chrome (soundwave, name, mute) visible; transport (shuffle,
   play/pause, playlist) above that row; handle still on the **top
   edge** (down when open). Pill ends at tap open height or collapsed
   height. **Do not** score open/close easing as leftover-jank.
4. Close. **Expect**: collapsed now-playing face; playlist **off** so
   the next open is the solo card.

## Scenario 2 — Playlist waits for open/close settle (P1, FR-008)

1. Collapsed. Tap handle to open, and **during** the open travel tap
   **playlist**.
2. **Expect**: playlist face applies **after** open settles — three-row
   window, not a mixed mid-travel header / dest-height flash.

## Scenario 3 — Drag feel + playlist drag-close (P1, SC-002)

1. Collapsed, motion allowed. Drag the handle **up past** the open
   height and release. Repeat **3** times; also drag closed.
2. **Expect**: end height matches a tap; **0** leftover bounce after
   release; drag-open shows the **solo card**, not the three-row
   playlist; in-drag tracking feels **tighter / more 1:1** with **less
   rubber-band** than the 015 follow (easier to overshoot the cap).
3. Open playlist (three-row face). Drag the handle **down** to close.
4. **Expect**: sheet **shrinks from the three-row face**; **no**
   mid-drag morph to solo. After collapse, next open is the solo card.
5. Tiny slip on the handle. **Expect**: still toggles like a tap.

## Scenario 4 — Three-slot morph (P1, SC-003)

Need current = first, last, and neither. Use playlist rows or stage
hops **while collapsed / solo**, then open playlist (or hop outside
the window so FR-016 re-windows).

1. Open player (solo). Toggle playlist **on then off 3 times**:
   - Current = **first** (Show Me How) → current in **top**, window
     `[Show Me How, Nightmare, Taking Over]`.
   - Current = **last** (Infinite) → current in **bottom**, window
     `[Nightmare, Taking Over, Infinite]`.
   - Current = **neither** (Nightmare, default) → current in
     **middle**, window `[Show Me How, Nightmare, Taking Over]`.
2. **Expect**: sheet grows to **three-song** height; exactly **three**
   visible rows before scroll; current card **shared-element** morphs
   into **that** slot (not one hardcoded path); **0** card jumps,
   overlaps, or one-frame dest-height flashes.
3. Playlist off. **Expect**: reverse morph into the solo card; header
   **Currently playing**.

## Scenario 5 — Scroll, hop, shuffle, tap-to-play (P1, SC-009 / SC-011)

1. Playlist on, more than three tracks. Scroll until the current song
   is **out** of the three-row window.
2. **Expect**: floor chrome still shows the playing name.
3. Look at rows. **Expect**: current row = moving soundwave, **no**
   play button; other **real** rows = play button, **no** soundwave.
4. Tap another **visible** real row.
5. **Expect**: that track plays; soundwave moves; window **does not**
   jump.
6. Turn **shuffle on**. Read the list.
7. **Expect**: visual order still newest-first release order.
8. Let shuffle (or pause/unpause + wait) hop to a track **outside**
   the window.
9. **Expect**: window re-applies FR-005 so the new current is visible
   in its slot.

## Scenario 6 — Reduced motion + keyboard (P2, SC-004 / SC-005)

1. Enable `prefers-reduced-motion: reduce`.
2. Expand, collapse, and toggle playlist **without** dragging.
3. **Expect**: both positions / both faces in under **15 seconds**;
   **0** required travel animations; **0** drag requirement.
4. Keyboard-only, narrow viewport.
5. **Expect**: expand, collapse, read current name, toggle playlist
   when shown. Real rows operable; placeholders (if any) do not start
   playback.

## Scenario 7 — Short catalog fixture (P2, SC-010)

**Test-only.** Do **not** change the live four-track catalog. Append a
query flag so `player-dock.ts` hides extra theme-track rows for this
visit only:

```text
# one real row + two placeholders
?playlist-fixture=1

# two real rows + one placeholder
?playlist-fixture=2
```

Example (dev, with the site base path):

```text
/valence-electronica/?playlist-fixture=2
```

Keeps the current track when possible; never ships as production
content. Omit the flag for the live four-track catalog.

1. Open with `?playlist-fixture=1` or `=2`. Playlist on.
2. **Expect**: **exactly three** rows; activating a placeholder starts
   **0** tracks; placeholders show **0** play buttons and do not read
   as startable theme tracks.

## Scenario 8 — Laptop + 320px (P2, SC-006 / SC-007)

1. Width **1024** (or 1280×800).
2. **Expect**: `009` / `011` laptop player unchanged (vinyl / V-Flip
   box, volume slider rules, no phone three-slot sheet).
3. Width **320**.
4. **Expect**: **0** new horizontal scrolling; **0** newly clipped
   dock buttons. Three-row height fits under the sheet cap or scrolls
   **inside** the capped sheet; floor chrome stays visible.

## Scenario 9 — Exclusive-open / intro (regression)

1. Open V-Flip, then open About.
2. **Expect**: player uses the **same close** as the handle; playlist
   off.
3. Legal overlay from Info. **Expect**: overlay Exit does **not**
   collapse the player.
4. `?replay-intro`. **Expect**: player chrome hidden; no polish motion
   on hidden chrome.
