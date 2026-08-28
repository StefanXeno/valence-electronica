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
2. **Expect**: left dock is **one** V-Flip box — bottom toolbar: vinyl, shuffle, loop,
   mute (if audio-eligible). No separate mute circle. Right dock has **no** Lyrics
   icon and **no** Track info icon.
3. Open V-Flip.
4. **Expect**: drawer shows **panel title** (`jukeboxPanelTitle`), not the active
   track name as a header.
5. **Expect**: active track row shows label + **inline info** (date and/or Listen On).
   **No lyrics block.** Song list still works.

## Scenario 2 — Mute in the same collapsed box (P1)

1. On an audio-eligible looping clip, leave V-Flip collapsed.
2. Hover / focus the mute **button** — **Expect**: tooltip hints unmute (or mute if
   already unmuted). Copy matches chrome (`unmuteTooltip` / `muteTooltip`).
3. Unmute from the control **in that box**.
4. **Expect**: slider expands **inside** the same shell to the right; vinyl and shuffle
   do not jump horizontally.
5. Hover / focus the **volume slider** — **Expect**: tooltip at same vertical height as
   mute button hint (`volumeSliderTooltip`).
6. Open V-Flip — **Expect**: same mute/volume instance in toolbar; tooltips still work.
7. Switch to a no-audio track — **Expect**: mute slot hides entirely; vinyl + transport remain.

## Scenario 3 — Shuffle off does nothing (P1)

1. Confirm shuffle shows **on** (load default) in toolbar (collapsed or open).
2. Turn **shuffle off**. Turn **loop off**.
3. Wait **60 seconds**.
4. **Expect**: theme/track unchanged (SC-010). Atmosphere bed may keep looping.

## Scenario 4 — Loop pins the track (P1)

1. Shuffle on, turn **loop on** (toolbar).
2. Wait past one atmosphere video file duration.
3. **Expect**: same track still current (SC-011).
4. Pick another song in the list — **Expect**: new song plays; loop **stays on**.

## Scenario 5 — Shuffle hop crossfade (P1)

1. Loop off, shuffle on, ≥2 entries. Stay **muted** for full-pool hops.
2. Note active mp4 duration. Reload, skip intro, wait that long (+ buffer).
3. **Expect**: hops to a **different** track; picture/theme crossfade — ~**1000ms** ease
   between non-glitch themes, ~**720ms** stepped when Nightmare involved; inline info
   and list selection match new id; mute stays muted if it was muted.
4. Repeat — **Expect**: never same id twice in a row (within eligible pool).

## Scenario 5b — Unmuted shuffle audio filter (P1)

1. Unmute on an audio track. Shuffle on, loop off.
2. Wait for hop(s).
3. **Expect**: each hop lands on an audio-eligible track only (not silent entries like
   `show-me-how` if `hasAudio: false`).

## Scenario 6 — Manual pick resets the clock, not the toggles

1. Shuffle on, loop off.
2. Toggle shuffle/loop to a non-default combo (e.g. shuffle off).
3. Pick another track in the list.
4. **Expect**: atmosphere updates with appropriate crossfade; shuffle remains **off**.

## Scenario 7 — Intro gate

1. Force intro (`?replay-intro` in dev or clear intro seen flag).
2. Do not dismiss yet. Wait 20s.
3. **Expect**: no shuffle hop during intro.
4. Dismiss intro. With shuffle on / loop off, hop may run after dwell from dismiss.

## Scenario 8 — Reduced motion

1. Enable `prefers-reduced-motion: reduce`.
2. Trigger a hop (wait for file duration with shuffle on, or manual pick).
3. **Expect**: new theme/poster applies without required crossfade animation.
4. Mute remains hidden while fallback (existing `002` rule).

## Scenario 9 — Keyboard

Tab: identity → socials → vinyl → shuffle → loop → mute (if any) → (open: list links)
→ About/Discography/Tour → footer.

Toggle shuffle and loop with Enter/Space; `aria-pressed` updates.

## Scenario 10 — Content-only labels

1. Change `shuffleLabel` or `jukeboxPanelTitle` in `src/content/ui/chrome.md`, rebuild/refresh.
2. **Expect**: accessible name updates without component edits.

## Scenario 11 — Regression

1. About, Discography (stage button), Tour, socials, legal overlay still work.
2. Open About — **Expect**: panel title label glows like the icon (accent + shadow).
3. Panel exclusive-open among on-demand panels; V-Flip **may** stay open.
4. Center third of 1280×800 with V-Flip closed: no persistent player text.

## Scenario 12 — Nightmare toggle glitch (polish)

1. Select Nightmare. Turn shuffle **on**.
2. **Expect**: shuffle button runs continuous glitch while pressed.
3. Turn shuffle off — glitch stops on that button.

## Scenario 13 — 45s no-audio dwell (SC-008)

1. **Local-only**: set `hasAudio: false` on one entry. Shuffle on, loop off.
2. Select that entry. Dismiss intro. Wait **45+ seconds**.
3. **Expect**: hop to a different entry.
4. Revert local edit before commit.

## Scenario 14 — Build

```bash
npm run check
npm run build
npm test
```

**Expect**: clean check/build; vitest covers dwell classifier + pickOtherId filter.

## Scenario 15 — Artist guide

Confirm `docs/artist-guide.md` documents: inline track info in V-Flip; no in-drawer
lyrics; toolbar shuffle/loop; shuffle timing follows stage video file length (45s
no-audio); chrome keys; Track info is not a separate HUD button.
