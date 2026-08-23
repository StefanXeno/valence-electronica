# Implementation Plan: Artist Change Documentation

**Branch**: `008-artist-docs` | **Date**: 2026-08-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-artist-docs/spec.md`

## Summary

Deliver a single primary **artist-facing guide** (`docs/artist-guide.md`) that is the
authoritative safe-edit map for Valence: what the artist may change, what he must not
touch, GitHub-web-first edit + PR into `pre-release`, optional local clone preview, and
docs-only promotion (`pre-release` → `main` via normal GitHub PR). Slim the README so it
points at the guide instead of maintaining a second full inventory. Link existing topic
guides (e.g. `docs/stage-schedule.md`). No application code, CMS, or promote automation.

## Technical Context

**Language/Version**: Markdown (English); no new runtime languages. Existing Node.js 22+ /
Astro toolchain only for optional local-preview steps documented in the guide.

**Primary Dependencies**: None new. Documentation only. Existing GitHub + GitHub Pages /
Actions remain the publish path described in prose.

**Storage**: Repository Markdown under `docs/` (+ README pointer). Content surfaces remain
existing `src/content/**`, `src/data/**`, `public/**` — documented, not redesigned.

**Testing**: Manual validation via [quickstart.md](./quickstart.md) (checklist against
spec SC-001–SC-005). No automated doc tests in v1 (YAGNI). `npm run check` / `build`
unchanged except when validating secondary local-preview instructions still match README
commands.

**Target Platform**: Humans reading docs on GitHub (primary) or locally; site remains
static GitHub Pages.

**Project Type**: Static website documentation (single Astro project at repository root)

**Performance Goals**: N/A for site runtime. Guide must be scannable: non-developer can
complete SC-001–SC-003 timing targets from the doc alone.

**Constraints**: Constitution I–VII; no promote bots (FR-005b); no CMS; English only for
repo docs; artist guide authoritative over README for edit boundaries; must not teach full
Git curriculum.

**Scale/Scope**: One hub guide + README trim + links to existing topic guides. Inventory
covers all artist-editable surfaces present at ship time (~site.json, jukebox, about,
releases, shows, ui/chrome, legal, stage-schedule, media under `public/`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Static-First Delivery | Docs-only; no runtime backend or site behavior change | PASS |
| II. Zero-Cost, Zero-Ops Publishing | No paid services; deploy still GitHub Pages from `main`. Guide documents intentional integration on `pre-release` then promote to `main` — does not add infra ops | PASS (see note) |
| III. Content-Code Separation | Guide reinforces one-place content edits; does not move content into components | PASS |
| IV. Lightweight by Default | No new client JS; optional local preview reuses existing npm scripts | PASS |
| V. Privacy & Legal Compliance | Guide notes legal pages must be filled before public promotion; no tracking added | PASS |
| VI. Simplicity & Spec-Driven Change | Single Markdown hub + README pointer; no CMS, no auto-gen, no promote pipeline | PASS |
| VII. Artist-Facing Change Documentation | This feature is the implementation of Principle VII (inventory, forbidden surfaces, preview/go-live, maintenance note) | PASS |

**Note (II)**: Principle II’s “merge to `main`” remains the **release (go live)** trigger.
The guide documents a prior **integration** step (content PR → `pre-release`) that does
not deploy publicly. Terminology is defined in spec Assumptions (“Integration vs release”).
Live site still updates only when `main` advances; failed builds still leave the last good
version online.

**Post-design re-check (after Phase 1)**: PASS — contract defines required guide sections
and inventory completeness rules; no code paths introduced; README/authority rules prevent
dual inventories.

## Project Structure

### Documentation (this feature)

```text
specs/008-artist-docs/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── artist-guide.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks — not created by plan)
```

### Source Code (repository root)

```text
docs/
├── artist-guide.md          # NEW — primary artist-facing hub (authoritative)
├── stage-schedule.md        # EXISTING — linked from hub; deep schedule how-to
└── ideas.md                 # Unchanged (not artist-facing inventory)

README.md                    # UPDATE — link to artist-guide; shorten/remove duplicate
                             # full “Editing content” inventory

# Surfaces documented (not moved) by the guide:
src/data/site.json
src/data/stage-schedule.json
src/content/jukebox/
src/content/about/
src/content/releases/
src/content/shows/
src/content/ui/chrome.md
src/content/legal/
public/images/
public/videos/

# Developer-owned (documented as do-not-touch), examples:
src/components/
src/layouts/
src/styles/
src/lib/theme-packs.ts
astro.config.mjs
.github/workflows/
```

**Structure Decision**: Keep documentation in `docs/` beside the existing stage-schedule
operator guide. Do not put the artist guide under `specs/` (specs are developer workflow).
README becomes a thin entry point, not a second inventory.

## Complexity Tracking

> No constitution violations requiring justification. Empty by design.
