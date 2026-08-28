# Quickstart: V-Flip Now Playing

**Feature**: `011-vflip-now-playing` | **Contracts**: [vflip-player-ui.md](./contracts/vflip-player-ui.md), [vflip-playback.md](./contracts/vflip-playback.md)

## Prerequisites

- Node 22+, project dependencies already installed
- Branch `011-vflip-now-playing`
- Intro skipped or completed (`Escape` / already seen)
- Laptop viewport (~1280px)

## Setup

```bash
npm run dev
# open the local site with the /valence-electronica base path
```

## Scenario 1 — Open V-Flip is the player (P1)

1. Load landing, all panels closed.
2. **Expect**: left dock is **one** V-Flip box (vinyl + mute if audio-eligible). No
   separate mute circle. Right dock has **no** Lyrics icon and **no** Track info icon.
3. Open V-Flip.
4. **Expect**: header shows the **active track name** (not only “V-Flip”).
5. **Expect**: track info (date and/or links) and lyrics (or empty copy) are inside
   the player. Song list still works.

## Scenario 2 — Mute in the same collapsed box (P1)

1. On an audio-eligible looping clip, leave V-Flip collapsed.
2. Hover / focus the mute **button** — **Expect**: tooltip hints unmute (or mute if
   already unmuted). Copy matches chrome (`unmuteTooltip` / `muteTooltip`).
3. Unmute from the control **in that box**.
4. **Expect**: slider appears by growing the same shell; vinyl does not jump to a
   new circle.
5. Hover / focus the **volume slider** — **Expect**: tooltip hints drag-to-adjust
   (`volumeSliderTooltip`).
6. Open V-Flip — **Expect**: same mute/volume instance still works; tooltips still
   appear on button/slider.
7. Switch to a no-audio or fallback situation — **Expect**: mute hides; vinyl remains.

## Scenario 3 — Shuffle off does nothing (P1)

1. Open V-Flip. Confirm shuffle shows **on** (load default).
2. Turn **shuffle off**. Turn **loop off**.
3. Wait **60 seconds**.
4. **Expect**: theme/track unchanged (SC-010). Atmosphere bed may keep looping.

## Scenario 4 — Loop pins the track (P1)

1. Shuffle on, turn **loop on**.
2. Wait past one atmosphere video file duration (check `duration` in devtools on the
   active `<video>` if needed).
3. **Expect**: same track still current (SC-011).
4. Pick another song in the list — **Expect**: new song plays; loop **stays on**.

## Scenario 5 — Shuffle hop is smooth (P1)

1. Loop off, shuffle on, ≥2 entries.
2. Note the active mp4 file duration (devtools → active atmosphere video). Reload, skip
   intro, wait that long (+ a small buffer).
3. **Expect**: hops to a **different** track; picture/theme ease (~700ms), not a hard
   cut; lyrics/info/header title match the new id; mute stays muted if it was muted.
4. Repeat a few hops — **Expect**: never the same id twice in a row.

## Scenario 6 — Manual pick resets the clock, not the toggles

1. Shuffle on, loop off.
2. Toggle shuffle/loop to a non-default combo (e.g. shuffle off).
3. Pick another track in the list.
4. **Expect**: atmosphere updates immediately; shuffle remains **off**.

## Scenario 7 — Intro gate

1. Force intro (`?replay-intro` in dev or clear intro seen flag).
2. Do not dismiss yet. Wait 20s.
3. **Expect**: no shuffle hop during intro.
4. Dismiss intro. With shuffle on / loop off, hop may run after **one video file
   duration** (or 45s for no-audio) from **dismiss** time.

## Scenario 8 — Reduced motion

1. Enable `prefers-reduced-motion: reduce`.
2. Trigger a hop (wait for file duration with shuffle on, or manual pick).
3. **Expect**: new theme/poster applies without a required 700ms video fade.
4. Mute remains hidden while fallback (existing `002` rule).

## Scenario 9 — Keyboard

Tab: identity → socials → vinyl → mute (if any) → (open player: shuffle, loop, links,
list) → About/Discography/Tour → footer.

Toggle shuffle and loop with Enter/Space; `aria-pressed` updates.

## Scenario 10 — Content-only labels

1. Change `shuffleLabel` in `src/content/ui/chrome.md`, rebuild/refresh.
2. **Expect**: accessible name updates without component edits.

## Scenario 11 — Regression

1. About, Discography (stage button), Tour, socials, legal overlay still work.
2. Panel exclusive-open: opening About closes other on-demand panels; V-Flip **may**
   stay open (no new mutual-close with panels).
3. Center third of 1280×800 with V-Flip closed: no persistent player lyrics/title.

## Scenario 12 — 45s no-audio dwell (SC-008)

1. **Local-only**: set `hasAudio: false` on one jukebox entry (or use a no-audio
   fixture if present). Shuffle on, loop off.
2. Select that entry. Dismiss intro. Wait **45+ seconds**.
3. **Expect**: hop to a different entry.
4. Revert the local content edit before commit.

## Scenario 13 — Build

```bash
npm run check
npm run build
npm test
```

**Expect**: clean check/build; vitest covers dwell classifier + “never pick current
id.”

## Scenario 14 — Artist guide

Confirm `docs/artist-guide.md` documents: lyrics/track info live in V-Flip; shuffle
and loop; shuffle timing follows **stage video file length** (45s for no-audio);
chrome keys `shuffleLabel`, `loopLabel`, defaults; Track info is not a separate HUD
button.
