# Quickstart: Desktop Chrome Polish

**Feature**: `019-desktop-chrome-polish` |
**Contract**: [desktop-chrome-polish.md](./contracts/desktop-chrome-polish.md) |
**Model**: [data-model.md](./data-model.md)

Visual review is **operator-led**. Do **not** install Playwright,
Puppeteer, or Chromium for this feature. Do **not** treat
`npm run verify:hud` as 019 authority (that script still describes
phone-era HUD checks).

## Prerequisites

- Node 22+, project dependencies **already** installed (do not
  `npm install` for this feature)
- Branch `019-desktop-chrome-polish`
- Intro skipped or completed (`Escape` / already seen)
- Devtools device mode or a resizable window

## Setup

```bash
npm run dev
# open the local site with the /valence-electronica base path
```

Use **1280×800** as the visual target. Also spot-check **1023 vs 1024**
width and **320** width (no horizontal page scroll; phone HUD at 1023).

Logic/type check (no browser):

```bash
npm test
npm run build
```

(`npm test` / `astro check` are existing scripts. Do not add packages.)

## Scenario 1 — Bar without socials, Info legal (P1, SC-001 / SC-010)

1. Viewport **1280×800**, bar panels closed, motion allowed.
2. **Expect**: boxed bottom-right bar with About (if content exists),
   Discography, Tour, Info. **0** social / platform icons in the bar.
   Top-right socials still list every active channel.
3. **Expect**: **0** bottom-center copyright / Impressum /
   Datenschutzerklärung footer cluster.
4. Open **Info**. **Expect**: `©` + Valence in the **top-right** of the
   Info box; Imprint and Privacy Policy pills; each pill opens the
   existing legal overlay.
5. Open About or Discography. **Expect**: no social icons inside the
   open bar.

## Scenario 2 — Always-open player (P1, SC-002)

1. Same viewport after intro. Do **not** click the player first.
2. **Expect**: bottom-left player already visible; **currently playing**
   track name readable.
3. **Expect** toolbar left → right: **Playlist**, **Shuffle**,
   **Play/pause**, **Mute**.
4. **Expect**: **0** V-Flip/vinyl buttons, **0** Loop buttons, **0**
   volume sliders, **0** ways to collapse the player chrome.
5. Toggle mute, play/pause, shuffle. **Expect**: mute does not reveal a
   slider; play/pause pauses/resumes the atmosphere video.

## Scenario 3 — Playlist grow (P1, SC-003)

1. Motion allowed. Turn **Playlist** on, then off, **3 times**.
2. **Expect (each open)**: list grows **in place** from the player —
   wider **right**, then taller **up**. Track + toolbar stay.
3. **Expect (each close)**: shrink **down**, then **left**. Player
   chrome still visible.
4. **Expect**: **0** slides of the whole player.
5. Prefer reduced motion and repeat once. **Expect**: both faces
   without required travel.

## Scenario 4 — Bar grow (P1, SC-004)

1. Motion allowed. Open and close **Info** (and once Discography)
   **3 times** total.
2. **Expect (open)**: grow in place wider **left**, then taller **up**.
3. **Expect (close)**: shrink **down**, then **right**.
4. **Expect**: **0** slides. Reduced motion still toggles.

## Scenario 5 — Keyboard + independence (P2, SC-006)

1. Keyboard only on 1280×800.
2. **Expect**: can read current track; tab Playlist / Shuffle /
   Play/pause / Mute; open About or Discography; open Info → Imprint;
   follow a top-right social.
3. Open playlist, then open Info. **Expect**: player chrome stays;
   playlist MAY stay open (011 spirit).

## Scenario 6 — Breakpoint (SC-007 / SC-008)

1. Width **1023**. **Expect**: phone HUD (`015` / `018`) — Socials in
   the phone bar; collapsible player pill; footer still hidden.
2. Width **1024** (or 1280×800). **Expect**: this contract. **0** mixed
   leftover phone pill or desktop always-open chrome on the wrong side
   of the line.

## Scenario 7 — Artist guide (FR-014)

1. Open `docs/artist-guide.md`.
2. **Expect**: laptop legal is **Info**, not the footer; laptop player
   is always-open Playlist / Shuffle / Play/pause / Mute (not vinyl /
   loop / slider).

## Out of this quickstart

- Phone playlist three-slot polish (`018`)
- Changing legal markdown
- Automated browser screenshots
