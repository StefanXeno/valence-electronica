# Implementation Plan: Theme Pack System

**Branch**: `005-theme-packs` | **Date**: 2026-08-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-theme-packs/spec.md`

## Summary

Introduce a **theme pack registry** as the single source of truth for each mood’s
**capabilities** (looping video atmosphere, audio/unmute eligibility, HUD glitch motion)
while keeping **color/surface tokens** in CSS `[data-theme]` blocks. A pack is **complete**
only with registry + CSS; unknown or incomplete ids resolve to the full **`default`** pack
(Option A). Migrate the three existing packs without changing visitor-visible Nightmare
behavior.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 22+ (LTS) for build tooling only

**Primary Dependencies**: Astro 7 (static output); existing Fontsource Unbounded; existing
first-party atmosphere, jukebox switch, and glitch modules from `002`–`004`. No new npm
packages.

**Storage**: Flat files — jukebox entries keep `themeId` in `src/content/jukebox/*.md`
(unchanged operator binding). Pack **registry** lives in `src/lib/theme-packs.ts`; pack
**color tokens** stay in `src/styles/themes.css`. Optional typography token slots reserved
in CSS with site-wide defaults (no new font files in v1).

**Testing**: `astro check` + `astro build` as CI gates; manual acceptance walks in
`quickstart.md`. Maintainer audit checklist for SC-006 (grep for stray theme-id capability
checks). No Playwright suite (YAGNI).

**Target Platform**: Static hosting on GitHub Pages
(`https://<owner>.github.io/valence-electronica/`)

**Project Type**: Static website (single Astro project at repository root)

**Performance Goals**: No regression vs `pre-release` — theme switch remains in-session
DOM swap; no extra network requests per pack (all CSS prerendered). Identity + chrome usable
within 2 s on an average mobile connection (inherited constitution IV target).

**Constraints**: No runtime backend (I); free tier only (II); jukebox `themeId` remains the
content hook — pack registry is developer-maintained (III); **no new client JS** — refactor
existing switch/atmosphere/glitch paths only (IV); no tracking/embeds (V); YAGNI — three
packs migrated, no Seravek, no new artistic packs required for completion (VI)

**Scale/Scope**: Refactor theme application across landing + legal overlay; update README
and 002/004 contract cross-links; ship maintainer contract under `specs/005-theme-packs/contracts/`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Static-First Delivery | Registry evaluated at build/prerender; capabilities applied via existing static HTML + CSS + first-party JS already shipped in 002/004 | PASS |
| II. Zero-Cost, Zero-Ops Publishing | Unchanged GitHub Pages + Actions; unknown `themeId` warns and falls back (no blank site) | PASS |
| III. Content-Code Separation | Operators still bind packs via jukebox `themeId` only; defining a **new** pack remains a developer task (registry + CSS), same as today’s “add a CSS block” | PASS |
| IV. Lightweight by Default | No new JS bundle surface; capability attribute replaces string compares; reduced-motion rules unchanged | PASS |
| V. Privacy & Legal Compliance | No cookies/tracking; no third-party assets | PASS |
| VI. Simplicity & Spec-Driven Change | One registry module + CSS tokens; no pack CMS, no per-pack JS files, no typography/fonts in v1 | PASS |

**Post-design re-check (after Phase 1)**: PASS — contracts document registry + CSS split;
data model keeps jukebox binding unchanged; capability decisions centralized in
`theme-packs.ts` + `data-hud-glitch` on `<html>` for CSS.

## Project Structure

### Documentation (this feature)

```text
specs/005-theme-packs/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── theme-packs.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks — not created by plan)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── theme-packs.ts           # NEW — registry, resolveThemeId, capability helpers
│   ├── background.ts            # Import resolveThemeId from theme-packs (drop local list)
│   ├── stage-switch.ts          # Use pack capabilities for video/audio decisions
│   └── glitch.ts                # Use pack capabilities instead of GLITCH_THEME_ID
├── styles/
│   ├── themes.css               # Color/surface tokens per pack (unchanged role, clearer comments)
│   └── glitch.css               # Gate motion on html[data-hud-glitch='true'] not theme id string
├── components/
│   └── BackgroundAtmosphere.astro  # SSR: use pack capabilities for initial video/poster
├── layouts/
│   └── Base.astro               # Set data-theme + data-hud-glitch from resolved default pack
└── content/jukebox/*.md         # themeId unchanged (operator binding)

README.md                        # Add “Theme packs” maintainer section (FR-012)
```

**Structure Decision**: Single Astro project; feature is a refactor + registry module, not
a new package or route.

## Complexity Tracking

> No constitution violations requiring justification. This feature **reduces** complexity
> by removing ad hoc theme-id string checks; it does not add new client JS exceptions.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |

## Phase 0 / Phase 1 outputs

- [research.md](./research.md) — registry vs JSON, capability attribute, validation, docs
- [data-model.md](./data-model.md) — ThemePack entity, relationships, migration table
- [contracts/theme-packs.md](./contracts/theme-packs.md) — maintainer contract
- [quickstart.md](./quickstart.md) — validation scenarios + audit checklist

**Next command**: `/speckit-tasks` to generate `tasks.md`, then `/speckit-implement`.
