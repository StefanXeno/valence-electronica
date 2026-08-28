# Implementation Plan: Track Catalog & Song Identity

**Branch**: `010-track-catalog` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-track-catalog/spec.md`

## Summary

Add a **chronological track catalog** to the desktop stage HUD and a **now-playing info**
control beside the jukebox. Canonical track metadata (sort date, blurb, outbound listen
links, credits, mentions) lives in **extended jukebox frontmatter** — same stable id as stage
clips. A new **Tracks** on-demand panel lists every catalog entry; an **info** icon opens a
compact popover for the active track with listen links. Minimal client JS syncs popover
content on jukebox switches. Discography stays release-oriented; no embeds or tracking.

**Technical approach** (from [research.md](./research.md)):

- Extend jukebox Zod schema + `getValidCatalogTracks()` in `src/lib/catalog-tracks.ts`.
- `TrackCatalog.astro` panel in `StagePanels`; chrome fields `catalogTitle`, `catalogIcon`.
- `NowPlayingControl.astro` in left dock cluster; `now-playing.ts` + SSR JSON catalog map.
- Vitest for sort/validation helpers; artist-guide update for new fields.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 22+ (build tooling only)

**Primary Dependencies**: Astro 7 static output; existing `004` stage/jukebox, `005` themes,
`007` schedule, `009` dock/HUD icons/label-reveal/panel-motion. **No new npm packages.**

**Storage**: Extended `src/content/jukebox/*.md` frontmatter; `src/content/ui/chrome.md`
labels/icons. No database.

**Testing**: `astro check` + `astro build` in CI; vitest for `catalog-tracks.ts`; manual
[quickstart.md](./quickstart.md).

**Target Platform**: Static GitHub Pages (`/valence-electronica` base path)

**Project Type**: Single-repo Astro static site

**Performance Goals**: No regression vs `009` — catalog list is small (4–20 rows); JSON
catalog map embedded once on landing; popover is DOM-only updates.

**Constraints**: Static-first (I); free tier (II); metadata in content (III); justified JS
for now-playing sync only (IV); outbound links only (V); spec-driven (VI); artist guide
update (VII)

**Scale/Scope**: ~8–12 source files touched; one new lib module; two new components; extend
`content.config.ts`, `stage.ts` chrome, `hud-icons.ts`, jukebox content files.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Static-First Delivery | Catalog SSR; popover reads embedded JSON | PASS |
| II. Zero-Cost, Zero-Ops Publishing | Unchanged Pages + Actions | PASS |
| III. Content-Code Separation | Track fields in jukebox + chrome labels | PASS |
| IV. Lightweight by Default | **Justified** `now-playing.ts` for active-track popover after jukebox switch; no embeds | PASS (with justified exception) |
| V. Privacy & Legal Compliance | Outbound links only; no analytics on clicks | PASS |
| VI. Simplicity & Spec-Driven Change | Extend jukebox schema vs. new collection; no IDEA-013 mobile scope | PASS |
| VII. Artist-Facing Change Documentation | Artist guide + content contract in implementation tasks | PASS |

**Post-design re-check (after Phase 1)**: PASS — [data-model.md](./data-model.md) keeps one
file per stage track; [contracts/](./contracts/) document edit surfaces; popover is peripheral.

## Project Structure

### Documentation (this feature)

```text
specs/010-track-catalog/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── track-catalog-content.md
│   └── track-catalog-ui.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks — not created by plan)
```

### Source Code (repository root)

```text
src/
├── content/
│   ├── jukebox/*.md           # EXTEND frontmatter (sortDate, links, credits, …)
│   └── ui/chrome.md           # ADD catalogTitle, nowPlayingLabel, icons
├── content.config.ts          # EXTEND jukebox schema + ui chrome schema
├── lib/
│   ├── catalog-tracks.ts      # NEW — parse, validate, sort catalog rows
│   ├── now-playing.ts         # NEW — popover sync on active id
│   ├── stage.ts               # EXTEND UiChrome + getChrome()
│   └── hud-icons.ts           # ADD catalog, info tokens
├── components/
│   ├── TrackCatalog.astro     # NEW — catalog panel body
│   ├── NowPlayingControl.astro# NEW — info button + popover
│   ├── StagePanels.astro      # ADD catalog panel to row
│   └── StageDock.astro        # SLOT for now-playing (or index composes left cluster)
├── pages/index.astro          # Mount NowPlayingControl in dock
└── layouts/Base.astro         # optional: catalog JSON script tag

tests/ or src/lib/catalog-tracks.test.ts
docs/artist-guide.md           # UPDATE jukebox fields + chrome keys
```

**Structure decision**: Reuse jukebox collection as catalog source (YAGNI). Left dock order:
jukebox → now-playing info → mute.

## Complexity Tracking

No constitution violations requiring owner override.

| Topic | Choice | Simpler alternative rejected because |
|-------|--------|--------------------------------------|
| Data location | Jukebox frontmatter extension | Separate `tracks` collection duplicates ids and forces two files per stage song |
| Now-playing UI | Popover beside jukebox | Full panel adds sixth on-demand icon and hides links behind extra open step |
| Catalog browsing | Read-only list panel | Jukebox list is atmosphere switcher, not chronological catalog |

## Phase 0 Output

See [research.md](./research.md) — all Technical Context items resolved.

## Phase 1 Output

| Artifact | Path |
|----------|------|
| Data model | [data-model.md](./data-model.md) |
| Content contract | [contracts/track-catalog-content.md](./contracts/track-catalog-content.md) |
| UI contract | [contracts/track-catalog-ui.md](./contracts/track-catalog-ui.md) |
| Validation guide | [quickstart.md](./quickstart.md) |

## Implementation Notes (for `/speckit-tasks`)

1. **Schema** — Add `sortDate`, `blurb`, `listenLinks`, `credits`, `mentions` to jukebox
   Zod schema; warn-and-omit invalid nested rows.
2. **Catalog helper** — `getValidCatalogTracks()` filters entries with valid `sortDate`;
   sort per data model.
3. **HUD** — Register `catalog` + `info` SVG paths in `HudIcon.astro`; extend chrome.md.
4. **Panels** — Insert Tracks panel in `StagePanels` (icon order per UI contract).
5. **Now playing** — Embed `data-track-catalog` JSON on index; wire `NowPlayingControl` +
   `now-playing.ts` to `bg-state-change` and jukebox option clicks.
6. **Content** — Add `sortDate` + placeholders to all four jukebox files; sample listen
   links on at least one track for quickstart scenario 3.
7. **Docs** — Artist guide section for new jukebox fields; cross-link `004` stage-content
   contract amendment.
8. **Tests** — Vitest for sort + URL/platform validation.
9. **009 contract** — Optional one-line amendment in `desktop-hud-ui.md` pointing to
   `010/contracts/track-catalog-ui.md` (can be same PR or follow-up).

## Next Step

Run `/speckit-tasks` to generate dependency-ordered `tasks.md`, then `/speckit-implement`.
