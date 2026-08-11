# Implementation Plan: UI Glitch Interactions

**Branch**: `003-ui-glitch` | **Date**: 2026-08-12 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-ui-glitch/spec.md`

## Summary

Refine the provisional press/hover glitch language on branch `003-ui-glitch` so it matches
the clarified spec: a **closed set** of hit targets (active channel links, legal links,
legal exit, mute button) get short electronic-style glitch treatments on pointer hover,
keyboard-visible focus, and press; mute/unmute uses morph-only on click with optional
**continuous** hover glitch on the mute button only; stacking is capped at one active
treatment per control; reduced motion disables all glitch language; intensity stays within
a soft flash bar with owner taste. No Seravek, no per-video deep motion packs, no slider
or placeholder glitch.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 22+ (LTS) for build tooling only

**Primary Dependencies**: Astro 7 (static output); existing first-party CSS + small client
scripts already on the branch (`GlitchPress.astro`, `src/lib/glitch.ts`,
`src/styles/glitch.css`, mute morph in `MuteControl.astro`). No new npm UI/motion
libraries.

**Storage**: N/A for glitch content — hit targets are a closed markup set (not driven by a
new JSON document). Reuses theme accent/text tokens from `002` (`themes.css` /
`data-theme`) for glitch tint only.

**Testing**: `astro check` + `astro build` as CI gates; manual acceptance walks in
`quickstart.md` (one-shot hover/press, keyboard-visible focus, mute morph, continuous mute
hover, reduced motion, slider/placeholder exclusion, hit-target survival). No Playwright
suite in this feature (YAGNI).

**Target Platform**: Static hosting on GitHub Pages
(`https://<owner>.github.io/valence-electronica/`)

**Project Type**: Static website (single Astro project at repository root)

**Performance Goals**: One-shot treatments complete in under 1 s (SC-004); continuous mute
hover ends immediately on pointer-out; effects must not block hit-testing (SC-003); keep
glitch JS tiny and first-party only (constitution IV). Soft flash bar ~≤3 distinct
flashes/sec, no full-viewport flashes (FR-012 / SC-006).

**Constraints**: No runtime backend (I); free tier only (II); no new content schema for
glitch (III — markers stay in components for this closed set); client JS justified for
trigger orchestration (IV — see Complexity Tracking); no tracking/third-party motion libs
(V); YAGNI — no motion picker, no Seravek, no IDEA-002 theme packs, no open-ended
“mark anything” registry (VI / FR-008 / FR-011)

**Scale/Scope**: Exactly four hit-target kinds + mute shell morph; landing + legal panel
routes already present from `001`/`002`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Static-First Delivery | Astro static output; CSS + small prerendered client scripts; no SSR/backend | PASS |
| II. Zero-Cost, Zero-Ops Publishing | Unchanged GitHub Pages + Actions free-tier deploy | PASS |
| III. Content-Code Separation | No artist-facing glitch content file; closed set is product chrome. Theme tint reuses `002` tokens. Expanding the set requires a spec amendment, not a silent class dump | PASS |
| IV. Lightweight by Default | CSS owns visuals; **justified** minimal client JS for triggers, stacking, focus-visible gating, continuous mute hover, and mute morph coordination (see Complexity Tracking). Reduced-motion CSS kill-switch. Responsive; hit targets stay usable | PASS (with justified exception) |
| V. Privacy & Legal Compliance | No tracking, cookies, or third-party scripts; legal links remain usable mid-glitch | PASS |
| VI. Simplicity & Spec-Driven Change | Refine provisional code against clarified spec; no new motion libraries; no scope beyond FR-011 | PASS |

**Post-design re-check (after Phase 1)**: PASS — data model is behavioral/ephemeral only;
contract is a UI behavior contract (no new JSON schema); JS surface stays first-party and
scoped to glitch orchestration + existing mute control.

## Project Structure

### Documentation (this feature)

```text
specs/003-ui-glitch/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── glitch-ui.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks — not created by plan)
```

### Source Code (repository root)

```text
src/
├── styles/
│   ├── glitch.css              # Shared one-shot / live glitch keyframes + reduced-motion kill
│   └── themes.css              # Existing accent/text tokens tint glitch (from 002)
├── lib/
│   └── glitch.ts               # Preset pool, apply vars, playElementGlitch helper
├── components/
│   ├── GlitchPress.astro       # Document-level pointer/focus/press binding (refine)
│   ├── MuteControl.astro       # Morph glitch + continuous mute hover (refine)
│   ├── Channels.astro          # Active links: glitch-hit; placeholders: never
│   ├── Footer.astro            # Legal links: glitch-hit
│   ├── LegalPanel.astro        # Exit: glitch-hit
│   └── BackgroundAtmosphere.astro  # Unchanged role; mute visibility still from 002
└── layouts/
    └── Base.astro              # Imports glitch.css + mounts GlitchPress
```

**Structure Decision**: Stay on the single Astro root project. Glitch is presentation chrome
layered on existing `001`/`002` components; refine in place rather than introduce a new
package or app split.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Client JS for glitch triggers / stacking / focus-visible / continuous mute hover | Spec requires coordinated one-shot vs continuous mute hover, press-over-hover stacking, keyboard-visible-only focus, and mute morph ownership on click (FR-001–005, FR-010, FR-013–014) | Pure CSS `:hover` / `:active` cannot enforce one-active-treatment stacking, mute-only continuous hover, or mouse-click vs keyboard-visible focus without brittle hacks; third-party motion libs violate V/VI |
