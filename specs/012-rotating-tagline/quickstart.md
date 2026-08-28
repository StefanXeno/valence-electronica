# Quickstart & Validation: Rotating Identity Subtext

**Date**: 2026-08-28 | **Plan**: [plan.md](./plan.md)

## Prerequisites

- Node.js 22+ and npm
- Branch `012-rotating-tagline` with implementation complete
- [contracts/tagline-pool.md](./contracts/tagline-pool.md)

## Local development

```bash
npm install
npm run dev
```

## Quality gates

```bash
npm run check
npm run build
npm test
npm run preview
```

## Validation scenarios

1. **US1 — 60 s rotation**: ≥2 normal lines, no matching easter eggs. Stay on page ≥2 minutes.
   Expect at least two changes, **~60 s apart** (after fade completes).
2. **US1 — sequential fade**: With motion allowed, watch a change. Expect old line fades to
   **invisible**, **then** new line fades in (no overlap).
3. **US1 — same-line skip**: Pool with one eligible line. Wait 60 s. Expect **no** fade flash.
4. **US1 — typography / 320px**: ` for ` nbsp rule; no horizontal scroll at 320px.
5. **US2 — easter-egg set**: Two eggs matching today. Expect rotation **only** between those
   lines (normal pool excluded).
6. **US2 — rule boundary**: Late-night egg `22:00–04:00`. Test inside vs outside window;
   eligibility switches on next tick without reload.
7. **US2 — AND rules**: Weekday + time on one line; both required.
8. **US3 — editor / build**: Edit pool only; invalid `02-30` fails build with line index.
9. **US4 — no-JS**: Scripting off → `site.json` tagline, no rotation.
10. **US4 — reduced motion**: OS reduced motion on → 60 s changes with **instant** swap, no opacity animation.
11. **Legal route**: Same rotator behavior on legal overlay with identity chrome.

## Timing note

Production interval is **60 seconds** (FR-006). In dev, the default is **10 seconds** for faster
QA. Override with a query param (dev only, ignored in production builds):

```
http://localhost:4321/?tagline-interval=5
```

Valid range: **1–3600** seconds. Invalid or missing values fall back to the dev default.

## Reference

- [data-model.md](./data-model.md)
- [contracts/tagline-pool.md](./contracts/tagline-pool.md)
