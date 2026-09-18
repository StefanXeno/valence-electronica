# Quickstart: Jukebox Easter Egg & Song-Select First

**Date**: 2026-09-18 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

Manual validation. No new packages. Prefer operator local browser checks.

## Prerequisites

- Prefer `020` chrome landed (or mocked) so vinyl is not under circular docks
- `npm run dev` from repo root
- Widths: **390**, **1023**, **1024**, **1280**

```bash
npm run check
npm run build
```

## Scenario 1 — Selection-first song change (US1 / SC-001)

1. Cold load; dismiss intro.
2. **1280px**: At rest, player body shows **song selection**, not Currently
   playing card as the default body.
3. Activate a non-default catalog track in **≤2** intentional activations
   (excluding mute).
4. Repeat at **390px** with player in its default useful-open state —
   selection is the default body; change track without obligatory
   “leave currently playing” step.
5. Complete a full browse/play path **without** touching vinyl / V-Flip.

**Pass**: SC-001 / SC-002 / SC-005 screenshot check.

## Scenario 2 — Vinyl easter egg (US2 / SC-003)

1. Confirm `020` top menu has **no** V-Flip item.
2. Locate vinyl control (quiet brand object).
3. Click/tap vinyl → V-Flip easter egg opens.
4. Confirm discovery is not unmarked-corner / konami / long-press-only.
5. Close / leave easter egg → song selection still available.
6. Confirm vinyl not covered by top nav.

## Scenario 3 — Optional now-playing (US3)

1. From selection, open now-playing in one action.
2. See active track identity.
3. Close now-playing or reload → default surface is selection again.

## Scenario 4 — Edge / a11y smoke

1. Shuffle on → explicit track pick still wins.
2. `prefers-reduced-motion`: selection + vinyl open remain usable.
3. Single-track catalog (if testable): selection still shows that track.
4. Smoke: player does not assume dual-video resolution (no hard failure if
   `022` not shipped yet — single `sources` still plays).

## Expected outcomes checklist

| Check | OK |
| ----- | -- |
| Default body = selection (phone + laptop) | |
| ≤2 actions to other track | |
| Casual path without V-Flip | |
| Vinyl opens easter egg | |
| No V-Flip in top menu | |
| Now-playing optional, not default | |
| `npm run check` / `build` | |
