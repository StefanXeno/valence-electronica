# Contract: Discography Merge (Build-Time)

**Date**: 2026-08-28 | **Plan**: [plan.md](./plan.md) | **Data model**: [../data-model.md](../data-model.md)

Build-time contract for how jukebox and tracks content combine into the Discography panel.
No visitor-facing API — documents `src/lib/catalog-tracks.ts` behavior implementers must
preserve.

## Entry point

```text
getMergedDiscography(validStageIds: ReadonlySet<string>): Promise<DiscographyEntry[]>
```

- **`validStageIds`**: Same set passed today from `getValidJukeboxEntries()` ids in
  `Discography.astro`.
- Replaces direct use of `getDiscographyFromJukebox()` (may remain as private helper or be
  inlined).

## Inputs

| Source | Inclusion rule |
|--------|----------------|
| `jukebox` collection | Row when `label` + `sortDate` present and `inDiscography !== false` |
| `tracks` collection | Row when `label` + `sortDate` present and **id ∉ jukebox ids** |

## Output row (`DiscographyEntry`)

| Field | Jukebox-backed | Tracks-only |
|-------|----------------|-------------|
| `title` | `label` | `label` |
| `year` | `sortDate` UTC year | `sortDate` UTC year |
| `kind` | optional | optional |
| `url` | `pickPrimaryListenUrl(...)` | `pickPrimaryListenUrl(...)` |
| `listenLinks` | parsed array (may be empty) | parsed array (may be empty) |
| `jukeboxId` | id when `validStageIds.has(id)` | **always omitted** |

## Sort

Descending `sortDate` (UTC day), ascending `title` — same as `sortCatalogTracks`.

## Stage isolation

`getMergedDiscography` MUST NOT mutate or expose track ids to:

- `getBackgroundConfig()` / `data-stage-catalog`
- `validateStageSchedule()`
- `TrackInfoPanel` jukebox list

Tracks collection is read only inside catalog/discography helpers.

## Warnings (console)

| Event | Message pattern |
|-------|-----------------|
| Invalid track row | `[catalog] omitted track "{id}" (...)` |
| Duplicate id (tracks + jukebox) | Info: `[catalog] track "{id}" skipped (jukebox entry wins)` — includes jukebox files with `inDiscography: false` (no row from either source) |

## UI consumer

See [discography-ui.md](./discography-ui.md) for row markup, Listen On icons, Currently playing
badge, and `syncStageUi` behavior.

Summary:

- Card rows; plain title; optional Listen On icon links when links exist
- Stage button when `jukeboxId` set and not active; Currently playing when active
- No stage affordance for tracks-only rows

## Regression guard

After implementation, jukebox-only discography (no tracks files except example) MUST match
pre-feature row count and stage buttons for existing entries.
