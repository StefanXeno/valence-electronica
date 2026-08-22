# Implementation Plan: Landing Intro — “Hi, I’m Valence”

**Branch**: `006-landing-intro` | **Date**: 2026-08-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-landing-intro/spec.md`

## Summary

Add a **landing-only, first-visit intro overlay**: a two-line greeting (**“Hi I'm”** then
**“Valence”** on its own line). The name renders **transparent** so the site shows through;
a **zoom-into-Valence** motion plays, then the stage HUD becomes fully interactive. A
first-party `localStorage` playback flag prevents replay; skip via Escape or click/tap;
`prefers-reduced-motion` and no-JS paths show the landing immediately. Lead and name strings
live in `src/content/ui/chrome.md`.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 22+ (LTS) for build tooling only

**Primary Dependencies**: Astro 7 (static output); existing Base layout, atmosphere, stage
HUD from `002`–`004`. No new npm packages.

**Storage**: Intro lead + name in `src/content/ui/chrome.md` (content collection). Playback
flag in browser `localStorage` key `valence-intro-seen` (client-only, UX preference).

**Testing**: `astro check` + `astro build`; manual walks in `quickstart.md`. No Playwright
(YAGNI).

**Target Platform**: Static GitHub Pages site

**Project Type**: Static Astro site at repository root

**Performance Goals**: Intro auto path ≤4 s; skip perceived ≤300 ms; no extra network
requests. Landing usable within constitution IV targets after reveal.

**Constraints**: Landing route only; justified **new** minimal client script (constitution
IV exception — impossible without JS for once-only + motion sequence). No cookies, tracking,
or intro audio.

**Scale/Scope**: One overlay component (two-line markup + transparent name), one small intro
module, chrome schema extension (`introLead`, `introName`), CSS animation on `.landing-intro__name`, mount on landing only.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Static-First Delivery | Intro HTML/CSS prerendered; sequence driven by first-party client script on landing only | PASS |
| II. Zero-Cost, Zero-Ops Publishing | No new infra; storage failure degrades to replayable intro | PASS |
| III. Content-Code Separation | Lead + name in `chrome.md`; playback flag is client UX state, not site content | PASS |
| IV. Lightweight by Default | **Exception**: new client JS required for once-only animated intro — smallest surface: one module + one component script; reduced-motion and no-JS skip entirely | PASS (justified) |
| V. Privacy & Legal Compliance | `localStorage` flag only, no cookies/analytics; documentable for privacy policy (IDEA-009) | PASS |
| VI. Simplicity & Spec-Driven Change | No intro on legal routes; no Seravek/loader/mobile HUD scope creep | PASS |

**Post-design re-check**: PASS — contract documents storage key, demo query, and chrome
fields; data model keeps copy in existing UI collection.

## Project Structure

### Documentation (this feature)

```text
specs/006-landing-intro/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── intro-ui.md
├── checklists/
│   └── requirements.md
├── tasks.md
└── spec.md
```

### Source Code (repository root)

```text
src/
├── components/
│   └── LandingIntro.astro      # two-line overlay; transparent name; client script
├── lib/
│   └── intro.ts                # playback flag, reduced motion, demo query helpers
├── content/ui/
│   └── chrome.md               # + introLead, introName
├── pages/
│   └── index.astro             # mount LandingIntro (landing only)
└── styles/
    └── intro.css               # name-only zoom; transparent name; stage reveal
```

**Structure Decision**: Landing-only mount in `index.astro` keeps legal routes untouched.
Shared helpers in `src/lib/intro.ts` keep the Astro component script thin.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New client JS (Principle IV) | Once-only playback + timed reveal + skip require runtime state | CSS-only `@keyframes` cannot read `localStorage` or honor per-browser seen state; SSR-only intro would replay every load (violates FR-004) |

**Next command**: `/speckit-tasks` then `/speckit-implement`.
