# Implementation Plan: Scheduled Stage Default

**Branch**: `007-scheduled-stage-default` | **Date**: 2026-08-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-scheduled-stage-default/spec.md`

## Summary

Add a single schedule data file (`src/data/stage-schedule.json`) that maps calendar
conditions (specific date, date range, day-of-week) to jukebox entry ids. At **publish**,
validate every referenced id against usable jukebox entries. At **page load**, resolve
“today” in **Europe/Berlin** in the browser and set the landing default atmosphere +
theme before jukebox interaction. SSR continues to prerender the **static fallback**
(entry with `default: true`) so no-JS and progressive enhancement stay intact; when the
scheduled id differs from the fallback, existing stage-switch code applies the match
immediately on boot (minimal flash risk — see research R4). Manual jukebox picks still
override for the visit; reload re-applies the schedule.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 22+ (LTS) for build tooling only

**Primary Dependencies**: Astro 7 (static output); existing jukebox/stage-switch stack from
`004-landing-content-layout`; `Intl` API for Europe/Berlin calendar (no date library)

**Storage**: New `src/data/stage-schedule.json` (schedule rules + timezone). Jukebox
catalog remains `src/content/jukebox/*.md`. Identity/channels unchanged in
`src/data/site.json`.

**Testing**: `astro check` + `astro build` as CI gates; pure resolver unit tests optional
(YAGNI — manual quickstart scenarios first). No Playwright suite.

**Target Platform**: Static hosting on GitHub Pages

**Project Type**: Static website (single Astro project at repository root)

**Performance Goals**: Schedule resolution adds negligible work (small JSON, O(rules) scan).
No extra network requests. Landing still meets constitution IV load-time bar.

**Constraints**: No runtime backend (I); free tier only (II); schedule editable in one data
file (III); extends existing justified stage-switch JS — no new npm deps, no cookies/storage
(IV/V); YAGNI — no week-of-year, no CMS, no daily CI cron requirement (VI)

**Scale/Scope**: One schedule file; expect tens of rules, not thousands. Landing page only.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Static-First Delivery | Schedule embedded in static HTML; resolver runs in browser; no server/API | PASS |
| II. Zero-Cost, Zero-Ops Publishing | Unchanged GitHub Pages + Actions; invalid schedule ids fail `astro check`/build | PASS |
| III. Content-Code Separation | Timed defaults edited only in `stage-schedule.json`; jukebox media/labels stay in Markdown | PASS |
| IV. Lightweight by Default | Extends existing stage-switch JS (004 exception); no new libraries; SSR fallback for no-JS | PASS (extends prior exception) |
| V. Privacy & Legal Compliance | No cookies, storage, or tracking for schedule; jukebox override not persisted | PASS |
| VI. Simplicity & Spec-Driven Change | JSON file + one resolver module; no CMS, no cron, no recurrence beyond spec v1 | PASS |

**Post-design re-check (after Phase 1)**: PASS — contracts document file shape and resolver
priority; build validation fails on bad ids; runtime skips bad matches and falls back.

## Project Structure

### Documentation (this feature)

```text
specs/007-scheduled-stage-default/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── stage-schedule.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks — not created by plan)
```

### Source Code (repository root)

```text
src/
├── data/
│   ├── site.json                  # Unchanged
│   └── stage-schedule.json        # NEW — calendar rules → jukeboxId
├── lib/
│   ├── background.ts              # Embed schedule; export staticFallbackId + schedule payload
│   ├── stage-schedule.ts          # NEW — parse, validate (build), resolve (client + build test)
│   └── stage-switch.ts            # Call resolver on init; apply scheduled default when ≠ SSR
├── components/
│   ├── Jukebox.astro              # data-stage-schedule + data-stage-fallback attrs
│   ├── LyricsPanel.astro          # SSR lyrics for static fallback (unchanged role)
│   └── BackgroundAtmosphere.astro # SSR atmosphere for static fallback (unchanged role)
├── layouts/
│   └── Base.astro                 # data-theme from static fallback at SSR (no-JS path)
└── content/jukebox/               # Unchanged; default flag = static fallback
```

**Structure Decision**: Single Astro project. Add one JSON data file and one lib module.
Hook into existing `getBackgroundConfig()` and `initStageSwitch()` rather than a parallel
switcher.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Client JS calendar evaluation (extends 004 stage-switch) | FR-004 requires the default to change at Europe/Berlin midnight **without redeploy**. Build-time-only resolution cannot satisfy that on a static host | Daily scheduled CI rebuild adds ops, still wrong for visitors before the cron runs, and violates spec out-of-scope |
| Possible brief theme/atmosphere correction after SSR when scheduled ≠ static fallback | SSR must prerender static fallback for no-JS (FR-014). Scheduled id is unknown at build time for future calendar days | Baking “today at build” into SSR goes stale at midnight; hiding SSR content until JS runs would break no-JS and slow first meaningful paint |
