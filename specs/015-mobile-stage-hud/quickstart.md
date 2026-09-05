# Quickstart: Mobile Stage HUD

**Feature**: `015-mobile-stage-hud` | **Contract**: [mobile-hud-ui.md](./contracts/mobile-hud-ui.md)

**As-built**: 2026-09-05. Scenarios match the shipping HUD, not the 2026-09-01
mock.

## Prerequisites

- Node 22+, project dependencies already installed
- Branch `015-mobile-stage-hud`
- Intro skipped or completed (`Escape` / already seen)
- Devtools device mode or a narrow window

## Setup

```bash
npm run dev
# open the local site with the /valence-electronica base path
```

Use **390×844** as the visual target. Also spot-check **320** width and
**1023 vs 1024** width.

## Scenario 1 — Phone stage is two boxed docks (P1)

1. Viewport **390×844**, all sheets closed, player **collapsed**.
2. **Expect**: center is atmosphere. Bottom: player pill (`wave | title |
   mute`) with a **small wide up-arrow** on top (≥44×24px hit strip).
   Above it: one pill with **five** icons — About (if content),
   Discography, Tour, Socials, Info (circled i).
3. **Expect**: no permanent socials row at the top-right. One channel list
   in the DOM (inside the content sheet when Socials is open; never a
   second copy). **No** phone footer legal strip.
4. Viewport **320** wide.
5. **Expect**: no horizontal page scroll; dock buttons not clipped
   off-screen.

## Scenario 2 — Expand / collapse player (P1)

1. Collapsed at 390px.
2. Tap the **handle arrow** (or drag it **up**).
3. **Expect**: pill **grows** from `bottom: 0` (does not lift off the
   floor); arrow now points **down**; V-Flip is open (no separate vinyl
   tap). Header: **Currently playing**. Current theme-track card visible.
   Transport: **shuffle**, **play/pause**, **playlist**. **No loop.**
4. Drag the handle up past the open height.
5. **Expect**: rubber-band, then snap to the **same** height a tap uses.
6. Tap mute.
7. **Expect**: mute toggles at **50%** unmuted; **no slider**; pill does
   **not** collapse. Mute is still in the floor row on a no-audio track.
8. Tap play/pause.
9. **Expect**: background video pauses; soundwave **flattens**; shuffle
   does **not** hop.
10. Tap handle (or drag **down**).
11. **Expect**: collapsed now-playing face; arrow points **up**; V-Flip
    closed.
12. Enable reduced motion, repeat handle tap.
13. **Expect**: still toggles; **0** idle arrow nods.

## Scenario 3 — Handle hint (P1)

1. Motion allowed, intro gone, 390px.
2. Watch the handle without touching (~2s, then wait ~60s) while
   **collapsed**, then again while **expanded**.
3. **Expect**: arrow smoothly nods **3** times after ready; nods again
   within **60 ± 5 seconds** in **both** states.
4. Enable reduced motion.
5. **Expect**: **0** nods.

## Scenario 4 — Playlist is theme tracks inside the player (P1)

1. Expand the pill. Confirm one current card (solo).
2. Tap **playlist**.
3. **Expect**: current card **stays**; other **theme / stage** cards add
   in (not the full discography catalog); header switches to **V-Flip
   aka. Jukebox**; list **scrolls** if long.
4. Pick another card.
5. **Expect**: stage switches; collapsed now-playing label updates.
6. Open About while V-Flip is open (scripting on).
7. **Expect**: player collapses / V-Flip closes; About is the only extra
   surface.

## Scenario 5 — Content pill + Socials + Info (P1 / P2)

1. Collapsed rest. Tap Discography.
2. **Expect**: the **same content pill grows** (~320ms); icons stay on
   the **bottom**; list readable and **scrolls inside the sheet**; docks
   stay. Not a laptop side panel. Not a detached sheet above a static bar.
3. Tap Socials.
4. **Expect**: Discography closes; channels appear **inside the same
   pill**; Bandcamp etc. match `site.json`; no dead coming-soon links.
5. Tap Socials again (or tap outside the content pill).
6. **Expect**: sheet closes; still on the landing.
7. Tap Info.
8. **Expect**: © top-right; English **Imprint** + **Privacy Policy**
   pills. Tap one → existing Legal overlay. Overlay Exit does **not**
   collapse Info behind it.

## Scenario 6 — Identity + intro (P2)

1. 390px, collapsed.
2. **Expect**: wordmark still at the **top**. **No** footer legal above
   the docks.
3. Replay intro if needed (`?replay-intro`).
4. **Expect**: docks hidden until intro finishes.

## Scenario 7 — Breakpoint (P2)

1. Width **1023**.
2. **Expect**: phone HUD (collapsed pill + five-icon content dock).
3. Width **1024** (or 1280×800).
4. **Expect**: `009` / `011` laptop HUD. Unmute on an audio track **may**
   show the volume **slider**. Top socials row is back. Footer legal is
   back. No phone handle nod. Hover labels work again.

## Scenario 8 — Keyboard (P2)

1. Narrow viewport, keyboard only.
2. **Expect**: tab to handle → expand/collapse (V-Flip); read now-playing
   name; toggle mute / shuffle / play-pause / playlist when shown; open
   About or Discography; open/close Socials and Info; reach Imprint /
   Privacy Policy from Info. No drag required. **No** hover floaters.

## Scenario 9 — Reduced motion / no drag (P2)

1. `prefers-reduced-motion: reduce`.
2. Complete Scenario 2, 4, and 5 **without** dragging.
3. **Expect**: soundwave static (until pause flatten); **0** handle nods;
   sheets may appear without travel animation.
