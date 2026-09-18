# Quickstart: Site Nav & Fan-First Chrome

**Date**: 2026-09-18 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

Manual validation guide for implementers and operators. No new packages.
Browser automation is optional and **not** required by this feature’s
workspace rules — operator local checks are preferred.

## Prerequisites

- Node.js 22+ (see repo toolchain / mise)
- Dependencies already installed in the workspace
- Feature artifacts: [spec.md](./spec.md), [plan.md](./plan.md),
  [contracts/site-nav-chrome-ui.md](./contracts/site-nav-chrome-ui.md),
  [data-model.md](./data-model.md)

## Setup

```bash
cd /home/stefan/code/private/valence-electronica
npm run dev
```

Open the printed local URL. Use DevTools responsive mode for widths:
**320**, **390**, **1023**, **1024**, **1280**.

CI sanity (no browser):

```bash
npm run check
npm run build
```

## Scenario 1 — Shop & Tour in one glance (US1 / SC-001)

**Widths**: 390 and 1280.

1. Cold load the landing (dismiss intro if present).
2. Without opening player or old circular docks, locate **Shop** and
   **Tour** in the **top** chrome within ~5 seconds.
3. Activate **Tour** → upcoming shows (or `emptyShows` empty state).
4. Activate **Shop**:
   - With `shopUrl` set → outbound store opens.
   - With `shopUrl` unset → Coming soon panel; nav item still present.

**Pass**: Four labels (or clear phone equivalent) visible; Shop/Tour
reachable without jukebox or circular dock.

## Scenario 2 — Brand calling card (US2)

1. Cover menu text — brand/logo still identifies the artist.
2. Cover brand — menu still reads as artist-site destinations.
3. Activate **Home** while already on stage → remain on / return to stage.
4. Activate **Contact** → clear contact path or honest incomplete state.

## Scenario 3 — Side socials + mobile Links (US3)

1. **1280px**: At rest, platform socials appear on a **side** edge (not
   only inside a circular dock). One Channels tree only.
2. **390px**: Open **Links** (or retained Links pattern) and open one
   platform URL successfully on first try.

## Scenario 4 — No circular side column (US4 / SC-003)

1. Screenshot rest state at **1280px**.
2. Confirm **no** primary vertical stack of circular on-demand buttons.
3. Reach **About** and **Discography** via quieter secondary entries.
4. Reach Impressum / Privacy in ≤2 actions (SC-005).

## Scenario 5 — Narrow + no-JS

1. **320px**: Top nav usable; no horizontal page scroll from nav.
2. Disable JavaScript: Home / Shop / Tour / Contact still reach their
   destinations (links/anchors/native disclosure).

## Scenario 6 — Sibling non-regression (smoke)

1. Floor player still present (do not require `021`/`022` complete).
2. Top nav remains usable with player sheet open.
3. Confirm this feature did **not** invent V-Flip menu items in the top
   band (`021` ownership).

## Expected outcomes checklist

| Check | OK |
| ----- | -- |
| Top band: logo + Home/Shop/Tour/Contact | |
| Shop Coming soon when URL unset | |
| Tour empty state when no shows | |
| Laptop side socials | |
| Phone Links retained | |
| No primary circular side stack | |
| Legal ≤2 actions | |
| 320px no sideways scroll | |
| `npm run check` / `build` pass | |
