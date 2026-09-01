# Quickstart: Mobile Stage HUD

**Feature**: `015-mobile-stage-hud` | **Contract**: [mobile-hud-ui.md](./contracts/mobile-hud-ui.md)

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

**US1 checkpoint** (before the player pill is restyled): stacked docks, no
top-right socials bar, no sideways scroll. The player may still look like
today’s jukebox.

**Feature-complete expect** (after US2):

1. Viewport **390×844**, all sheets closed, player **collapsed**.
2. **Expect**: center is atmosphere. Bottom: player pill (soundwave + V-Flip
   list label + mute if eligible) with a **small wide up-arrow** on top
   (≥44×24px hit strip). Above it: one box with About (if content),
   Discography, Tour, socials trigger.
3. **Expect**: no permanent socials row at the top-right. One channel list
   in the DOM (tray when opened; never a second copy).
4. Viewport **320** wide.
5. **Expect**: no horizontal page scroll; dock buttons not clipped off-screen.

## Scenario 2 — Expand / collapse player (P1)

1. Collapsed at 390px.
2. Tap the **handle arrow** (or swipe **up** on the pill).
3. **Expect**: pill moves **up**; arrow now points **down** and is still on
   the **top** of the bar; **V-Flip, shuffle, loop** visible.
4. Tap mute (if shown).
5. **Expect**: mute toggles; **no slider**; pill does **not** collapse.
6. Tap handle (or swipe **down**).
7. **Expect**: collapsed now-playing face; arrow points **up**.
8. Enable reduced motion, repeat handle tap.
9. **Expect**: still toggles; **0** idle arrow nods.

## Scenario 3 — Handle hint (P1)

1. Motion allowed, collapsed, intro gone, 390px.
2. Watch the handle without touching (~2s, then wait ~60s).
3. **Expect**: arrow smoothly nods **3** times after ready; nods again within
   **60 ± 5 seconds** while still collapsed.
4. Expand during a wait.
5. **Expect**: nodding **stops** until collapsed again.

## Scenario 4 — V-Flip list is a player sheet (P1)

1. Expand the pill. Tap vinyl.
2. **Expect**: track list sheet from the **player dock** (not a laptop side
   panel). Pick another track — name in the now-playing row updates.
3. Open About while the list is open (scripting on).
4. **Expect**: list closes; About sheet is the only extra surface.

## Scenario 5 — Content dock sheets + socials (P1 / P2)

1. Collapsed rest. Tap Discography.
2. **Expect**: sheet rises from the **content dock**; list readable; docks
   stay. Long content scrolls inside the sheet.
3. Tap socials trigger.
4. **Expect**: Discography closes; boxed channel row **above** the content
   dock; Bandcamp etc. match `site.json`; no dead coming-soon links.
5. Tap socials again.
6. **Expect**: tray closes; still on the landing.

## Scenario 6 — Legal + identity + intro (P2)

1. 390px, collapsed.
2. **Expect**: wordmark still at the **top**. Footer (©, Impressum,
   Datenschutzerklärung) visible **above** the docks, not covered.
3. Open Impressum — overlay still works (`002`).
4. Replay intro if needed (`?replay-intro`).
5. **Expect**: docks hidden until intro finishes.

## Scenario 7 — Breakpoint (P2)

1. Width **1023**.
2. **Expect**: phone HUD (collapsed pill + content dock).
3. Width **1024** (or 1280×800).
4. **Expect**: `009` / `011` laptop HUD. Unmute on an audio track **may**
   show the volume **slider**. Top socials row is back. No phone handle nod.

## Scenario 8 — Keyboard (P2)

1. Narrow viewport, keyboard only.
2. **Expect**: tab to handle → expand/collapse; tab to vinyl → open list;
   read now-playing name; toggle mute/shuffle/loop when shown; open About or
   Discography; open/close socials; reach legal links. No swipe required.

## Scenario 9 — Reduced motion / no swipe (P2)

1. `prefers-reduced-motion: reduce`.
2. Complete Scenario 2, 4, and 5 **without** swiping.
3. **Expect**: soundwave static; **0** handle nods; sheets may appear
   without travel animation.
