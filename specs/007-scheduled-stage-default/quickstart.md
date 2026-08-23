# Quickstart & Validation: Scheduled Stage Default

**Date**: 2026-08-23 | **Plan**: [plan.md](./plan.md)

## Prerequisites

- Node.js 22+ (LTS) and npm
- Branch `007-scheduled-stage-default` with implementation complete
- At least two usable jukebox entries (e.g. `nightmare`, `example-cyan`)
- [contracts/stage-schedule.md](./contracts/stage-schedule.md) for rule syntax

## Local development

```bash
npm install
npm run dev       # http://localhost:4321/valence-electronica/
```

## Quality gates (same as CI)

```bash
npm run check
npm run build
npm run preview
```

## Validation scenarios (map to spec)

### Setup helper

Temporarily edit `src/data/stage-schedule.json` for each scenario, then rebuild or rely on
dev server reload. To simulate Berlin “today” without waiting for calendar dates, add a
**date rule for today’s Berlin date** (`YYYY-MM-DD`) pointing at a non-fallback entry.

Berlin date in browser devtools (console):

```javascript
Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Berlin',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
}).format(new Date());
```

1. **US1 — scheduled default on load**: Add a `date` rule for **today (Berlin)** with
   `jukeboxId: "example-cyan"` while `nightmare` remains `default: true`. Hard reload `/`.
   Expect: cyan poster/theme active, jukebox shows Cyan pressed, lyrics match Cyan. Mute
   hidden if Cyan has no audio.
2. **US1 — midnight behavior (manual)**: Document that changing Berlin calendar day without
   redeploy updates the default on next reload (SC-002). Optional: adjust system clock or
   wait for date boundary; reload and confirm new rule applies.
3. **US2 — editor workflow**: Change only `stage-schedule.json` to point today at
   `nightmare`; publish. Expect default returns to Nightmare without touching jukebox
   Markdown or components.
4. **US3 — manual override**: With a scheduled non-default active, open jukebox, pick
   another entry. Expect atmosphere/theme/lyrics follow manual pick for the visit. Reload →
   scheduled default returns (FR-011).
5. **US4 — no matching rule**: Empty `rules: []`. Expect same as pre-feature: `default:
   true` entry (Nightmare).
6. **US4 — invalid id at build**: Add `"jukeboxId": "does-not-exist"`. Expect `npm run
   check` or `npm run build` **fails** with a clear error naming the id (SC-004).
7. **US4 — invalid calendar date**: Rule `"on": "02-30"`. Expect build fails.
8. **Priority — date beats weekday**: On a Friday, add weekday → cyan and date (today) →
   nightmare. Expect nightmare when both could match.
9. **Priority — range beats weekday**: Overlap a Friday with a range rule; range listed in
   tier wins per data model.
10. **Yearly recurrence**: Rule `"on": "10-31"` only; test on Oct 31 Berlin (or temporarily
    set `on` to today’s `MM-DD`). Expect match every year.
11. **No-JS / scripting off**: Disable JS in browser; reload with a schedule that differs
    from static fallback. Expect static fallback atmosphere (Nightmare) still usable; legal
    links work (FR-014 edge case).
12. **Reduced motion**: Scheduled entry with video still respects poster fallback when
    `prefers-reduced-motion: reduce` (inherits 002/004 behavior).

## Reference

- Data shape: [data-model.md](./data-model.md)
- Schedule file: [contracts/stage-schedule.md](./contracts/stage-schedule.md)
- Jukebox entries: [../004-landing-content-layout/contracts/stage-content.md](../004-landing-content-layout/contracts/stage-content.md)
