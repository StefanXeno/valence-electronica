# Quickstart: Stage Artist Polish

**Date**: 2026-09-18 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

Manual validation. No new packages. Prefer operator local checks.
Prefer `020` + `021` landed so tap targets hit selection-first player.

## Prerequisites

```bash
cd /home/stefan/code/private/valence-electronica
npm run check
npm run build
npm run dev
```

Widths: **390**, **1023**, **1024**, **1280**. Unmute path as needed.

## Scenario 1 — Show me How music (US1 / SC-001)

1. Select **Show me How**.
2. Unmute if site starts muted.
3. Confirm audible music for that entry.

## Scenario 2 — Taking Over brighter (US2 / SC-002)

1. Select **Taking Over**.
2. Side-by-side vs prior treatment or Nightmare: HUD/theme reads brighter.
3. Confirm text/controls still readable (contrast).

## Scenario 3 — Dual videos (US3 / SC-007)

For **each** V-Flip-available track (including Taking Over):

1. At **390px**, note which video file/path is active (DevTools network /
   `currentSrc` / content config).
2. At **1280px**, confirm a **different** configured desktop asset plays.
3. Confirm no silent cross-viewport reuse when one side is missing
   (incomplete beds omitted or build warns).

## Scenario 4 — NCS center logo (US4 / SC-006)

1. Activate NCS-configured entry → center logo visible within ~3s.
2. Activate non-configured entry → logo absent.
3. Confirm nav/player still clickable.

## Scenario 5 — Sprites + shuffle (US5 / SC-003 / SC-005)

1. Rest and several themes: **zero** Minecraft-style sprites.
2. Compare shuffle control to old screenshot — looks new/different.
3. Toggle shuffle — pressed/unpressed clear.

## Scenario 6 — Tap-only phone player (US6 / SC-004)

1. Phone width; do **not** swipe.
2. Tap to open player useful state → select another track with taps only.
3. Confirm hints (if any) do not say swipe is required.

## Expected outcomes checklist

| Check | OK |
| ----- | -- |
| Show me How audible | |
| Taking Over brighter + contrast OK | |
| Dual videos distinct per viewport for all beds | |
| NCS center logo when configured | |
| Zero Minecraft sprites | |
| New shuffle look + toggle works | |
| Phone tap-only open→select | |
| `npm run check` / `build` | |
| Artist guide updated | |
