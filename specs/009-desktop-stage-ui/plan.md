# Implementation Plan: Desktop Stage UI Redesign

**Branch**: `009-desktop-stage-ui` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-desktop-stage-ui/spec.md`

## Summary

Redesign the **desktop laptop HUD** for a symmetric, minimal stage: icon-first dock controls
with floating label reveal (anchored above dock / below socials), bottom-center legal footer,
live-safe glitch on dock morph targets, and smooth two-phase panel motion on default theme.
All `004` stage behaviors (jukebox, panels, exclusive-open, content model) stay; only
composition and presentation change. Mobile HUD remains IDEA-013.

**Technical approach** (from [research.md](./research.md)):

- Three-band layout: top identity/socials, bottom horizontal icon dock, centered footer.
- Left dock cluster: jukebox + mute side by side; right segment: horizontal on-demand icons.
- Inline SVG icon tokens + optional emoji overrides in `chrome.md`.
- Shared `#hud-label-reveal` floater + `label-reveal.ts` (justified JS).
- `panel-motion.ts` for default-theme two-phase open/close; glitch morph unchanged on Nightmare.
- Live-safe glitch CSS on panel shell morph; `GlitchPress` one-shot hover on closed summaries.
- Amend `004` `stage-ui.md` with pointer to `009/contracts/desktop-hud-ui.md`.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 22+ (LTS) for build tooling only

**Primary Dependencies**: Astro 7 (static output); existing Fontsource Unbounded; existing
`002` atmosphere/mute/legal, `003` glitch, `004` stage content/switch, `005` theme packs,
`006` intro, `007` schedule. **No new npm UI/icon libraries.**

**Storage**: Unchanged flat files — extend `src/content/ui/chrome.md` frontmatter with
optional `*Icon` fields; all other collections unchanged.

**Testing**: `astro check` + `astro build` in CI; manual acceptance in [quickstart.md](./quickstart.md).
Optional vitest for pure helpers in `label-reveal.ts` (YAGNI unless extracted).

**Target Platform**: Static GitHub Pages (`https://<owner>.github.io/valence-electronica/`)

**Project Type**: Static Astro site (single repo root)

**Performance Goals**: No regression vs `004` — HUD usable within 2s on average mobile
connection (constitution IV). Label reveal MUST NOT block interaction or layout thrash.
Icon dock reduces rest-state DOM text vs vertical stack.

**Constraints**: Static-only (I); free tier (II); labels/icons editable in chrome (III);
justified JS for label reveal + existing stage-switch/exclusive-open (IV); no tracking (V);
spec-driven; amend `004` contract for desktop layout (VI); update artist guide if icon
fields ship (VII)

**Scale/Scope**: Landing HUD CSS/components only; one new small lib module; glitch CSS
amendment; `004` contract cross-link; no IDEA-021 track catalog.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Static-First Delivery | Astro static output; label reveal is client enhancement only | PASS |
| II. Zero-Cost, Zero-Ops Publishing | Unchanged Pages + Actions | PASS |
| III. Content-Code Separation | Titles + optional icon tokens in `chrome.md`; components map tokens to SVG | PASS |
| IV. Lightweight by Default | **Justified** new JS for label reveal (per-control anchor positioning); `panel-motion.ts` for default-theme phased open/close; reuse existing jukebox/exclusive-open JS; no Font Awesome; responsive 320px load | PASS (with justified exception) |
| V. Privacy & Legal Compliance | Footer still exposes Impressum/privacy; legal overlay unchanged; no embeds | PASS |
| VI. Simplicity & Spec-Driven Change | Desktop layout authority in `009/contracts/desktop-hud-ui.md`; `004` amended by reference; no scope creep to IDEA-021/013 | PASS |
| VII. Artist-Facing Change Documentation | Plan includes artist-guide update for `*Icon` fields in implementation tasks | PASS |

**Post-design re-check (after Phase 1)**: PASS — [data-model.md](./data-model.md) and
[contracts/desktop-hud-ui.md](./contracts/desktop-hud-ui.md) keep content in chrome;
one floater module; glitch fix reuses live-safe pattern; no new collections.

## Project Structure

### Documentation (this feature)

```text
specs/009-desktop-stage-ui/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── desktop-hud-ui.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks — not created by plan)
```

### Source Code (repository root)

```text
src/
├── content/
│   └── ui/chrome.md              # ADD optional *Icon fields
├── lib/
│   ├── label-reveal.ts           # NEW — floater positioning + lifecycle
│   ├── panel-motion.ts           # NEW — default-theme two-phase panel open/close
│   ├── stage.ts                  # READ chrome icons if schema extended
│   └── glitch.ts                 # unchanged API; dock hooks via DOM attrs
├── components/
│   ├── HudIcon.astro             # NEW — icon token / emoji renderer
│   ├── StageDock.astro           # NEW — bottom horizontal dock shell
│   ├── StagePanels.astro         # REFACTOR — icon summaries, horizontal triggers
│   ├── Jukebox.astro             # REFACTOR — icon-first trigger in dock
│   ├── Hero.astro                # minor — compact top band
│   ├── Channels.astro            # minor — label reveal hook on socials
│   ├── Footer.astro              # REFACTOR — bottom center cluster
│   └── …                         # Mute, intro, atmosphere unchanged logic
├── styles/
│   ├── global.css                # REFACTOR — stage grid, dock, footer vars
│   ├── glitch.css                # AMEND — live-safe selectors for dock summaries
│   └── intro.css                 # UPDATE selectors if stage slot class names change
├── pages/
│   └── index.astro               # REFACTOR — compose dock + footer layout
└── layouts/
    └── Base.astro                # ADD #hud-label-reveal mount if not in index

docs/
└── artist-guide.md               # UPDATE chrome *Icon fields (implementation phase)

specs/004-landing-content-layout/contracts/
└── stage-ui.md                   # ADD header note: desktop layout → 009 contract
```

**Structure Decision**: Stay single Astro project. Introduce `StageDock` + `HudIcon` rather
than one monolithic CSS patch. Keep jukebox switch and exclusive-open in existing modules.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Client JS for label reveal (`label-reveal.ts`) | FR-003/FR-004 require per-control anchored labels with open-panel suppression; anchor differs for dock vs socials | CSS-only tooltips cannot suppress on open panels or share one floater cleanly |
| Client JS for panel motion (`panel-motion.ts`) | FR-004b requires two-phase open (reverse of close) on default theme while glitch theme keeps morph | Pure CSS on native `<details>` cannot sequence shell-then-body both directions |
| Layout refactor touching `004` components | Spec FR-001/FR-006 require new composition (dock + centered footer), not tweak | Shrinking font sizes on vertical stack preserves right-side asymmetry |
| Glitch CSS amendment | FR-008 — clip-path glitch on panel summaries creates dead click zones | Disabling panel glitch regresses `004`/`005`; invisible overlay proxies hurt a11y |

## Phase 0 & Phase 1 Outputs

| Artifact | Path | Status |
|----------|------|--------|
| Research | [research.md](./research.md) | Complete |
| Data model | [data-model.md](./data-model.md) | Complete |
| UI contract | [contracts/desktop-hud-ui.md](./contracts/desktop-hud-ui.md) | Complete |
| Quickstart | [quickstart.md](./quickstart.md) | Complete |

## Implementation Notes (for `/speckit-tasks`)

1. **Layout first**: `global.css` grid + `StageDock` + centered `Footer` before label reveal.
2. **Icon summaries**: Replace text `<summary>` with `HudIcon` + visually hidden label text.
3. **Label reveal**: Mount `#hud-label-reveal` once; wire `[data-hud-label]` + `[data-hud-label-anchor]` on dock + socials; suppress when parent `<details>` is open.
4. **Panel motion**: `panel-motion.ts` for default-theme phased open/close; glitch morph on `[data-stage-panel]` / `[data-jukebox]`.
5. **Glitch fix**: `glitch-hit` on summaries; live-safe morph on panel shell; `GlitchPress` one-shot hover when closed.
6. **Contract sync**: Add supersession note to `004/contracts/stage-ui.md` in same PR.
7. **Artist guide**: Document optional `*Icon` in chrome when schema lands.
8. **Intro CSS**: Update `[data-intro-pending]` selectors if stage class names change.

## Governance: Future layout changes

When the owner requests further HUD/layout changes, **stop and update specs first**:

1. Amend or supersede `specs/009-desktop-stage-ui/` (or create `010-*` successor).
2. Update [contracts/desktop-hud-ui.md](./contracts/desktop-hud-ui.md).
3. Cross-link from `004/contracts/stage-ui.md` if desktop authority moves again.
4. Then implement.

Drive-by CSS layout edits without spec updates violate constitution VI.

## Next Step

Run **`/speckit-tasks`** to generate dependency-ordered `tasks.md`.
