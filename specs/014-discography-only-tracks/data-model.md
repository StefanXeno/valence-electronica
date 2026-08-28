# Data Model: Discography-Only Tracks

**Date**: 2026-08-28 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

Completes `010` CatalogTrack model for songs **without** a jukebox/stage file. Discography
presentation merges jukebox-derived and tracks-only rows.

## Entity: TrackEntry (catalog-only content)

Source: `src/content/tracks/<id>.md`

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `id` | string | yes | Filename slug (stable) |
| `label` | string | yes | Trimmed, non-empty → discography title |
| `sortDate` | Date | yes | ISO date; omit entry + warn if missing/invalid |
| `kind` | string | no | e.g. `single`, `ep`, `album` |
| `listenLinks` | ListenLink[] | no | Same tokens/URL rules as jukebox (`010`) |
| `blurb` | string | no | Stored; not shown in Discography row v1 |
| `credits` | Credit[] | no | Stored; not shown in Discography row v1 |
| `mentions` | string | no | Stored; not shown in Discography row v1 |

**Excluded** (vs. jukebox): `poster`, `sources`, `themeId`, `hasAudio`, `default`,
`inDiscography`.

**Body**: Ignored (frontmatter-only collection).

## Entity: JukeboxEntry (unchanged stage + optional discography)

See `specs/010-track-catalog/data-model.md` and `004` stage model. Contributes discography
row when `sortDate` present and `inDiscography !== false`.

## Entity: DiscographyEntry (presentation row)

Merged view consumed by `Discography.astro`.

| Field | Type | Required | Source |
|-------|------|----------|--------|
| `id` | string | yes | Jukebox or track slug |
| `title` | string | yes | `label` |
| `year` | number | yes | UTC year from `sortDate` |
| `sortDate` | Date | yes (internal) | Used for merge sort; not rendered directly |
| `kind` | string | no | Optional `kind` |
| `url` | string | no | `pickPrimaryListenUrl(listenLinks)` — retained for helpers; UI uses `listenLinks` |
| `listenLinks` | ListenLink[] | yes | Parsed via `parseListenLinks`; may be empty |
| `jukeboxId` | string | no | Set when id ∈ valid stage catalog; omitted for tracks-only |

## Entity: Discography row UI (runtime)

Rendered per `DiscographyEntry` in `Discography.astro`:

| Element | Jukebox-backed | Catalog-only |
|---------|----------------|--------------|
| Card container | yes | yes |
| Title (plain text) | yes | yes |
| Year · kind | yes | yes |
| Play on V-Flip button | when not active | no |
| Currently playing badge | when active on stage | no |
| Listen On icon links | when `listenLinks.length > 0` | when `listenLinks.length > 0` |

Active-row sync: `syncStageUi(activeId)` in `stage-switch.ts` toggles `[data-stage-button]`,
`[data-discog-playing]`, and `[data-discog-active]` on discography rows.

Panel width: `stage-panel--discography` opens at `22rem` (HUD-scaled) vs `18rem` default.

## Entity: ListenLink / Credit

Unchanged from `010` — see `src/lib/catalog-tracks.ts` types.

## Relationships

```text
TrackEntry (tracks/) ──► DiscographyEntry (no jukeboxId)
JukeboxEntry (jukebox/) ──► DiscographyEntry (optional jukeboxId when stage-valid)

Same id in both:
  jukebox ──wins──► single DiscographyEntry (+ jukeboxId when stage-valid)
  tracks file ──ignored for row──► (optional build info log)
```

```text
JukeboxEntry ──► BackgroundVideo / stage catalog JSON (unchanged)
TrackEntry ──X──► stage (never)
```

## Merge algorithm (`getMergedDiscography`)

1. `jukeboxIds = Set(all jukebox collection ids)`
2. `rows = []`
3. For each jukebox entry (existing discography rules) → push `DiscographyEntry`
4. For each tracks entry:
   - If `entry.id ∈ jukeboxIds` → skip (jukebox wins)
   - Else if valid `label` + `sortDate` → push row without `jukeboxId`
   - Else → warn + omit
5. Sort all rows: `sortDate` desc (UTC day), `title` asc
6. Return rows (strip internal `sortDate` from template props if not needed — component uses
   `year` only)

## Sort order

1. `sortDate` descending (UTC calendar day) — same as `sortCatalogTracks`
2. `title` ascending (`localeCompare`)

**Note**: Replaces year-only sort in pre-feature `getDiscographyFromJukebox` for consistent
ordering when multiple releases share a year.

## Validation & omission

| Condition | Behavior |
|-----------|----------|
| Track missing `label` | Omit + `[catalog] omitted track "{id}" (missing label)` |
| Track missing `sortDate` | Omit + warn |
| Track id matches jukebox id | Skip track row (jukebox row used) |
| Jukebox `inDiscography: false` | No jukebox row (unchanged) |
| Invalid listen link row | Omit row + warn (entry still lists) |

## Future reuse

`getValidCatalogTracks()` (removed in `013`) may be reintroduced as:

```text
merge(jukebox catalog fields, tracks collection) → CatalogTrack[]
```

for a future chronological Tracks panel — **out of scope** for `014`; merge helper should
keep row mapping reusable.
