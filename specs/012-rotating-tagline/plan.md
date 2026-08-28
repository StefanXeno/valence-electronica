# Implementation Plan: Rotating Identity Subtext

**Branch**: `012-rotating-tagline` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-rotating-tagline/spec.md`

## Summary

Add `src/data/tagline-pool.json` with **normal** and **easter-egg** lines (schedule rules:
date, range, weekday, time-of-day). At **publish**, validate every line and rule. In the
browser, a small **tagline rotator** in `Hero.astro` builds the **eligible set** for the
current Berlin moment, advances subtext **every 60 seconds** through that set, and plays a
**sequential fade** (outgoing line → fully transparent, then incoming line → opaque).
`prefers-reduced-motion` keeps the 60 s cadence but uses instant swap. SSR prerenders
`artist.tagline` from `site.json` for no-JS; client replaces it when the rotator starts.
`site.json` tagline remains fallback when nothing is eligible.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 22+ (LTS) for build tooling only

**Primary Dependencies**: Astro 7 (static output); existing `Hero.astro`; CSS opacity
transitions; `Intl` for Europe/Berlin calendar/clock. Reuse `berlinCalendarParts()` from
`src/lib/stage-schedule.ts`.

**Storage**: New `src/data/tagline-pool.json`. Default/no-JS fallback: `artist.tagline` in
`src/data/site.json`.

**Testing**: `astro check` + `astro build`; `vitest` for eligibility + rotation sequence;
manual quickstart for fade timing and reduced motion.

**Target Platform**: Static hosting on GitHub Pages

**Project Type**: Static website (single Astro project at repository root)

**Performance Goals**: Eligibility scan is O(lines); one `setInterval` (60 s) per page with
Hero. Fade total ~0.6–1.2 s (FR-018). No extra network requests.

**Constraints**: No runtime backend (I); free tier (II); pool in one data file (III); client
JS + CSS for timer, eligibility, and fade — justified (IV); no cookies/storage (V); YAGNI
(VI). Artist guide update (VII).

**Scale/Scope**: One pool file; tens of lines. Hero on landing + legal overlay.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Static-First Delivery | Pool in static build; rotator + fade in browser; no server | PASS |
| II. Zero-Cost, Zero-Ops Publishing | Invalid pool fails build | PASS |
| III. Content-Code Separation | Copy + rules in `tagline-pool.json` only | PASS |
| IV. Lightweight by Default | **Exception**: client timer + Berlin eligibility + fade (FR-003/006/015); SSR fallback for no-JS | PASS (justified) |
| V. Privacy & Legal Compliance | No cookies, storage, tracking | PASS |
| VI. Simplicity & Spec-Driven Change | One JSON + one lib module + Hero script/CSS | PASS |
| VII. Artist-Facing Change Documentation | `docs/artist-guide.md` update in implementation | PASS |

**Post-design re-check**: PASS — contracts document 60 s rotation, eligible set, sequential
fade, and reduced-motion instant swap.

## Project Structure

### Documentation (this feature)

```text
specs/012-rotating-tagline/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── tagline-pool.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── data/
│   ├── site.json
│   └── tagline-pool.json          # NEW
├── lib/
│   ├── stage-schedule.ts          # Reuse berlinCalendarParts
│   └── tagline-pool.ts            # NEW — load, validate, eligibility, rotation index
├── components/
│   └── Hero.astro                 # SSR fallback; mount rotator script
├── styles/
│   └── tagline-rotate.css         # NEW — fade-out / fade-in classes, reduced-motion kill
docs/
└── artist-guide.md                # UPDATE

src/lib/tagline-pool.test.ts       # NEW — vitest
```

**Structure Decision**: Rotator logic in `tagline-pool.ts` (pure functions testable in
vitest); Hero owns DOM + `setInterval` + applying CSS phases. Separate CSS file keeps fade
timings in one place (FR-018).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Client JS timer + eligibility (IV) | FR-006 requires 60 s rotation; FR-004 time eggs need Berlin clock at runtime | Build-time-only lines cannot rotate every minute or honor time windows |
| Opacity fade animation (IV) | FR-015/owner direction — sequential fade out then in | Instant swap alone fails spec when motion allowed |
| Brief correction after SSR | FR-009 no-JS must show `site.json` tagline in HTML | Hiding subtext until JS blanks identity chrome |

**Cadence note (FR-018)**: 60 s interval starts **after** each transition completes (fade
included) so fades never compress the minute rhythm.

**Next command**: `/speckit-tasks` then `/speckit-implement`.
