# Implementation Plan: Discography-Only Tracks

**Branch**: `014-discography-only-tracks` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/014-discography-only-tracks/spec.md`

## Summary

Complete **`010` deferred catalog-only tracks** by adding `src/content/tracks/` for song
metadata without stage assets, merging into the existing **Discography panel** via extended
`catalog-tracks.ts` helpers. Jukebox/V-Flip, schedule, and shuffle stay unchanged. Reuses
`010` field vocabulary and parsers; does **not** revive the separate Tracks HUD panel
(`011`/`013` superseded).

**Technical approach** (from [research.md](./research.md)):

- New `tracks` Astro collection (catalog subset schema, no `poster`/`themeId`).
- `getMergedDiscography()` replaces `getDiscographyFromJukebox()` at Discography call site.
- Pure merge/dedup/sort tests in `catalog-tracks.test.ts`.
- Artist guide + example track file; amend `010` contract cross-link.
- Discography UI contract: [contracts/discography-ui.md](./contracts/discography-ui.md).

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 22+ (build tooling only)

**Primary Dependencies**: Astro 7 static output; existing `004` Discography panel, `010`
`catalog-tracks.ts`, `011` V-Flip jukebox drawer, `013` hardened build. **No new npm
packages.**

**Storage**: New `src/content/tracks/*.md`; existing `src/content/jukebox/*.md` unchanged role.
No database.

**Testing**: `astro check` + `astro build` in CI; vitest for merge helpers in
`catalog-tracks.test.ts`; manual [quickstart.md](./quickstart.md).

**Target Platform**: Static GitHub Pages (`/valence-electronica` base path)

**Project Type**: Single-repo Astro static site

**Performance Goals**: No regression — discography list remains small (≤30 rows); merge runs
once per page build; zero new client JS.

**Constraints**: Static-first (I); free tier (II); metadata in content (III); no new client JS
(IV); outbound links only (V); spec-driven (VI); artist guide update (VII)

**Scale/Scope**: ~6–10 source files touched; one new content collection; extend one lib module;
update `Discography.astro` import; example track + artist guide.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Static-First Delivery | Merge at build/SSR; no runtime backend | PASS |
| II. Zero-Cost, Zero-Ops Publishing | Unchanged Pages + Actions | PASS |
| III. Content-Code Separation | Catalog-only songs in `tracks/` content files | PASS |
| IV. Lightweight by Default | No new client JS; Discography markup unchanged | PASS |
| V. Privacy & Legal Compliance | Outbound listen links only; no embeds | PASS |
| VI. Simplicity & Spec-Driven Change | Extends `010` R1; no Tracks HUD revival; YAGNI | PASS |
| VII. Artist-Facing Change Documentation | Artist guide + tracks contract in tasks | PASS |

**Post-design re-check (after Phase 1)**: PASS — [data-model.md](./data-model.md) keeps
jukebox as stage source; [contracts/](./contracts/) document edit surfaces; stage catalog
boundary explicit in [discography-merge.md](./contracts/discography-merge.md).

## Project Structure

### Documentation (this feature)

```text
specs/014-discography-only-tracks/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1 validation guide
├── contracts/
│   ├── tracks-content.md
│   └── discography-merge.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── content/
│   ├── tracks/                  # NEW — catalog-only song files
│   │   └── example-catalog-only.md
│   └── jukebox/*.md             # UNCHANGED role (stage + optional discography)
├── content.config.ts            # ADD tracks collection schema
├── lib/
│   └── catalog-tracks.ts        # EXTEND — getMergedDiscography, merge helpers
├── components/
│   └── Discography.astro        # UPDATE — call getMergedDiscography
docs/
└── artist-guide.md              # UPDATE — jukebox vs tracks decision tree
src/lib/catalog-tracks.test.ts   # EXTEND — merge/dedup/sort tests
specs/010-track-catalog/
└── contracts/track-catalog-content.md  # OPTIONAL one-line cross-link to 014 tracks contract
```

**Structure decision**: Single-repo Astro site; extend existing catalog lib rather than new
components or HUD slots.

## Complexity Tracking

No constitution violations requiring owner override.

| Topic | Choice | Simpler alternative rejected because |
|-------|--------|--------------------------------------|
| New `tracks` collection | Slim schema without poster | Jukebox-only + flags still requires fake stage assets |
| Merge in `catalog-tracks.ts` | One lib module | Duplicating parsers in component violates FR-012 |
| Full-date discography sort | Align with `sortCatalogTracks` | Year-only sort wrong for same-year releases |
| No V-Flip list changes | Collection boundary | Explicit filters in jukebox redundant and error-prone |

## Phase 0 Output

See [research.md](./research.md) — all Technical Context items resolved.

## Phase 1 Output

| Artifact | Path |
|----------|------|
| Data model | [data-model.md](./data-model.md) |
| Tracks content contract | [contracts/tracks-content.md](./contracts/tracks-content.md) |
| Merge contract | [contracts/discography-merge.md](./contracts/discography-merge.md) |
| Discography UI contract | [contracts/discography-ui.md](./contracts/discography-ui.md) |
| Validation guide | [quickstart.md](./quickstart.md) |

## Implementation Notes (for `/speckit-tasks`)

1. **Schema** — Add `tracks` collection in `content.config.ts`: `label`, `sortDate` required;
   optional `kind`, `listenLinks`, `blurb`, `credits`, `mentions`; reuse `listenLink` /
   `credit` Zod objects from jukebox block.
2. **Merge lib** — Implement `getMergedDiscography(validStageIds)`:
   - Refactor jukebox row builder from current `getDiscographyFromJukebox`.
   - Load `getCollection('tracks')`; skip ids in jukebox set.
   - Sort with shared `dateKey` + title tie-break.
   - Deprecate or alias `getDiscographyFromJukebox` → merged function.
3. **Discography** — `Discography.astro`: swap to `getMergedDiscography`; no template changes
   if `DiscographyEntry` shape preserved.
4. **Stage isolation** — Verify no imports of `tracks` in `background.ts`, `Jukebox.astro`,
   `TrackInfoPanel.astro`, `stage-schedule.ts`.
5. **Example content** — Ship `example-catalog-only.md` per contract.
6. **Tests** — Extract testable `mergeDiscographyEntries()` or mock collections; cover dedup,
   sort, tracks-only, `inDiscography: false`.
7. **Docs** — Update `docs/artist-guide.md` Discography section; remove poster-only workaround
   as recommended path; add promotion steps.
8. **Cross-link** — Optional note at bottom of `010` track-catalog-content.md pointing to
   `014/contracts/tracks-content.md`.

## Next Step

Run `/speckit-tasks` to generate dependency-ordered `tasks.md`, then `/speckit-implement`.
