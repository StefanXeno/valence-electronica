# Quickstart: Stage Artist Polish

**Date**: 2026-09-18 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

Manual validation. No new packages. Prefer operator local checks.
**Requires `020` + `021` landed** before Scenario 6 (US6 tap) QA.

## Operator asset checklist (before US1 / US3 / US4 content tasks)

Drop files under `public/` then un-gate the matching tasks. Until then:
mark those tasks skipped with a note — **do not block** brightness,
shuffle, sprite-verify, schema/loader, or other non-asset 022 work.

| Asset | Path / notes | Gates |
| ----- | ------------ | ----- |
| Show me How music bed | Video (or audio-bearing bed) under `public/videos/` with audible music | T007–T009 |
| Dual videos per V-Flip bed | Distinct `*-mobile.*` + `*-desktop.*` (or equivalent) per selectable jukebox entry | T013–T017 |
| Taking Over dual pair | Included in dual-video set | T014 |
| ⚠️ NCS / center logo | Owner-approved image under `public/images/` — **no merge to main without T035** | T018–T022, T035 |

## Prerequisites

```bash
cd /home/stefan/code/private/valence-electronica
npm run check
npm run build
npm run dev
```

Widths: **390**, **1023**, **1024**, **1280**. Unmute path as needed.

## Scenario 1 — Show me How music (US1 / SC-001)

*Skip if Show me How audio asset missing — note in tasks.*

1. Select **Show me How**.
2. Unmute if site starts muted.
3. Confirm audible music for that entry.

## Scenario 2 — Taking Over brighter (US2 / SC-002)

1. Select **Taking Over**.
2. Side-by-side vs prior treatment or Nightmare: HUD/theme reads brighter.
3. Confirm text/controls still readable (contrast).

## Scenario 3 — Dual videos (US3 / SC-007)

*Skip per-track if that track’s dual assets are missing — note in tasks.
Schema/resolver work may still land.*

For **each** V-Flip-available track (including Taking Over):

1. At **390px**, note which video file/path is active (DevTools network /
   `currentSrc` / content config — expect `sourcesMobile`).
2. At **1280px**, confirm a **different** configured desktop asset plays
   (`sourcesDesktop`).
3. Confirm no silent cross-viewport reuse when one side is missing
   (incomplete beds omitted or build warns).

## Scenario 4 — NCS center logo (US4 / SC-006)

*⚠️ Skip content wiring until owner-approved asset (T035).*

1. Activate NCS-configured entry → center logo visible within ~3s.
2. Activate non-configured entry → logo absent.
3. Confirm nav/player still clickable.

## Scenario 5 — Sprites + shuffle (US5 / SC-003 / SC-005)

1. Rest and several themes: **zero** Minecraft-style sprites (verify
   absent — do not invent file deletion).
2. Compare shuffle control to old screenshot — looks new/different.
3. Toggle shuffle — pressed/unpressed clear.

## Scenario 6 — Tap-only phone player (US6 / SC-004)

**Depends on `021` selection-first.** Do not treat as done until 021 US1 landed.

1. Phone width; do **not** swipe.
2. Tap to open player useful state → select another track with taps only.
3. Confirm hints (if any) do not say swipe is required.

## Expected outcomes checklist

| Check | OK |
| ----- | -- |
| Show me How audible (or task skipped + note) | |
| Taking Over brighter + contrast OK | |
| Dual videos distinct per viewport for all beds (or gated) | |
| NCS center logo when configured (⚠️ owner approval) | |
| Zero Minecraft sprites (verify) | |
| New shuffle look + toggle works | |
| Phone tap-only open→select (after 021) | |
| `npm run check` / `build` | |
| Artist guide updated | |
