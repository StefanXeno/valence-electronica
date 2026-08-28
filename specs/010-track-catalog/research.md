# Research: Track Catalog & Song Identity

**Date**: 2026-08-28 | **Plan**: [plan.md](./plan.md)

All Technical Context items resolved below.

## R1: Canonical track data vs. jukebox stage files

- **Decision**: **Extend the existing jukebox collection** (`src/content/jukebox/<id>.md`)
  with catalog fields (`sortDate`, optional `blurb`, `listenLinks`, `credits`, `mentions`).
  The jukebox filename slug remains the **stable track id** (FR-002). `label` is the visitor
  title in jukebox UI; catalog list uses `label` as track title (no duplicate `title` field
  in v1).
- **Rationale**: All four shipped tracks already have jukebox files. One file per stage song
  keeps artist edits simple (constitution III). `getValidCatalogTracks()` sorts valid jukebox
  entries by `sortDate`.
- **Alternatives considered**:
  - Separate `tracks` collection only — two files per stage song (rejected for v1).
  - Separate `tracks` + jukebox link — flexible but heavier operator workflow (deferred).
  - Catalog reads discography — wrong entity (releases vs. songs) (rejected).

**Catalog-only tracks** (no stage clip): deferred — no shipped content needs it. If added
later, introduce `src/content/tracks/` merged into the same sort helper without renaming
jukebox ids.

## R2: Sort date and ordering

- **Decision**: Required frontmatter `sortDate` as **calendar date** (`z.coerce.date()`).
  Catalog sorts **descending** by UTC date key; tie-break **title ascending** (`localeCompare`
  on `label`).
- **Rationale**: Spec requires chronological catalog with deterministic ties. Year-only is
  insufficient for multiple tracks in one year; operators can set `2025-01-01` when only year
  is known.
- **Alternatives considered**:
  - `year` integer only — ambiguous for multiple 2025 singles (rejected).
  - Sort by jukebox filename — not chronological (rejected).

## R3: Listen links (outbound only)

- **Decision**: Optional frontmatter array:

  ```yaml
  listenLinks:
    - platform: bandcamp
      url: https://...
  ```

  Allowed `platform` tokens: `bandcamp`, `spotify`, `youtube`, `soundcloud`, `tidal` (fixed
  vocabulary; unknown token → build warning + omit that row). URLs validated as `http(s)` at
  build time (same spirit as release `url`).
- **Rationale**: Constitution V — outbound links only; fixed tokens give consistent link
  labels without free-form platform spam.
- **Alternatives considered**:
  - Free-form `{ label, url }` — harder for artist guide consistency (rejected for v1).
  - Reuse `site.json` channels — wrong surface (artist links vs. per-track) (rejected).

## R4: Credits and mentions

- **Decision**:
  - `credits`: optional array of `{ role: string, name: string }` (both required per row).
  - `mentions`: optional single string (short prose or one-line thanks); rendered as a
    paragraph when present.
  - `blurb`: optional one-line hook for catalog row / now-playing detail.
- **Rationale**: Structured credits are easy to validate and render as a list; mentions stay
  free-form without a second markdown body section.
- **Alternatives considered**:
  - Credits in markdown body — harder to validate (rejected).
  - Separate info panel page — out of scope (rejected).

## R5: Track catalog panel (HUD)

- **Decision**: Add **fifth on-demand panel** in `StagePanels` row: `TrackCatalog.astro`
  (chronological list). Chrome: `catalogTitle`, `catalogIcon` (+ emoji override). Same
  `<details>` / exclusive-open / glitch / panel-motion behavior as Lyrics / Discography.
- **Rationale**: Spec FR-005 requires separate catalog surface; `009` dock already uses
  horizontal icon row — one more icon is the smallest diff.
- **Alternatives considered**:
  - Extend discography panel — spec says releases stay separate (rejected).
  - Replace jukebox list with catalog — jukebox is atmosphere switcher (rejected).

## R6: Now-playing affordance + listen links

- **Decision**: **Info control** in the **left dock cluster**, immediately after jukebox
  (before mute when visible): icon-only at rest (`data-hud-label` above). Click toggles a
  compact **peripheral popover** (not center modal) showing catalog title, optional blurb,
  listen links, credits, mentions for the **active** jukebox id. Popover closes on Escape,
  outside click, or jukebox switch.
- **Rationale**: Spec FR-007 / SC-003 — reach listen link in ≤2 interactions (info → link).
  Keeps jukebox vinyl compact; does not add a sixth on-demand panel.
- **Alternatives considered**:
  - Inline in open jukebox header — crowded when list open (rejected).
  - Full-width panel like Lyrics — too heavy for links-only (rejected).

## R7: Client sync for active track

- **Decision**: **Justified small client module** `src/lib/now-playing.ts`:
  - SSR embeds `data-track-catalog` JSON on landing (id → metadata subset).
  - Listens to existing `bg-state-change` / jukebox option clicks to refresh popover content.
  - No fetch, no embeds, no tracking.
- **Rationale**: Constitution IV — static HTML cannot know active clip after visitor switch
  without minimal JS (same class of exception as `stage-switch.ts`).
- **Alternatives considered**:
  - SSR-only — cannot update now-playing after jukebox pick (rejected).

## R8: Testing

- **Decision**: Vitest unit tests for `sortCatalogTracks()` and listen-link / credit
  validation helpers in `src/lib/catalog-tracks.ts` (pure functions, same pattern as
  `stage-schedule.test.ts`).
- **Rationale**: Sort tie-breaks and omission rules are easy to regress.
