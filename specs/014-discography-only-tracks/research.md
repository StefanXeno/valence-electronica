# Research: Discography-Only Tracks

**Date**: 2026-08-28 | **Plan**: [plan.md](./plan.md)

All Technical Context items resolved below.

## R1: Content location — `tracks` collection vs. jukebox flag

- **Decision**: Add **`src/content/tracks/`** Astro content collection (`010` R1). Catalog-only
  songs live here; jukebox files remain stage-only + optional discography rows.
- **Rationale**: Jukebox schema requires `poster` (and typically theme/video fields). Forcing
  catalog-only releases into jukebox creates fake stage assets and pollutes V-Flip unless
  filtered. A slim tracks schema matches FR-011 (no stage-only fields).
- **Alternatives considered**:
  - `inJukebox: false` on jukebox files — still requires poster; hacky (rejected).
  - Revive `releases/` collection — removed in `013` as orphan; `tracks/` aligns with `010`
    song-identity naming (rejected).
  - Single jukebox file with optional poster — breaks current Zod required `poster` without
    schema churn on jukebox (rejected for v1).

## R2: Merge and deduplication rules

- **Decision**: **`getMergedDiscography(validStageIds)`** in `catalog-tracks.ts`:
  1. Build rows from jukebox (`inDiscography !== false`, has `sortDate` + `label`) — unchanged
     field mapping.
  2. Load `tracks` collection; **skip any id present in jukebox** (jukebox wins, FR-010).
  3. Map valid track entries to `DiscographyEntry` with no `jukeboxId`.
  4. Sort merged list by **UTC calendar `sortDate` descending**, title ascending — reuse
     `dateKey` / `sortCatalogTracks` logic (fixes year-only sort drift in current
     `getDiscographyFromJukebox`).
- **Rationale**: One merge helper; Discography panel unchanged; id collision handled at build.
- **Alternatives considered**:
  - Two separate lists in UI — violates FR-005 single merged list (rejected).
  - Tracks win on id collision — contradicts spec FR-010 (rejected).

## R3: Shared field validation

- **Decision**: Reuse existing **`parseListenLinks`**, **`parseCredits`**, **`pickPrimaryListenUrl`**
  from `catalog-tracks.ts`. Tracks collection Zod schema mirrors jukebox **catalog subset**:
  `label`, `sortDate`, optional `kind`, `listenLinks`, `blurb`, `credits`, `mentions`. No
  `inDiscography` on tracks (always listed when valid).
- **Rationale**: `010` content contract already defines platform tokens and omission rules;
  DRY parsers avoid drift.
- **Alternatives considered**:
  - Shared Zod `.pick()` from jukebox schema — nice but jukebox bundles stage fields; extract
    `catalogFields` object in `content.config.ts` if implementer prefers (optional refactor).

## R4: Stage isolation (jukebox / schedule / shuffle)

- **Decision**: **No code changes** to `background.ts`, `Jukebox.astro` stage catalog JSON,
  or `stage-schedule.ts` validation — tracks ids never enter jukebox collection, so they
  cannot appear in stage surfaces by construction.
- **Rationale**: FR-006 satisfied by collection boundary; zero client JS delta.
- **Alternatives considered**:
  - Explicit filter in `getValidJukeboxEntries()` — redundant if tracks are separate
    collection (rejected).

## R5: Discography UI surface

- **Decision**: **Discography panel only** — no revival of `010` Tracks HUD panel (`011`/`013`
  superseded). `Discography.astro` uses `getMergedDiscography`; rows are **card-style** with
  plain title, optional **Listen On** platform icons, and **Play on V-Flip** / **Currently
  playing** for jukebox-backed entries. See [contracts/discography-ui.md](./contracts/discography-ui.md).
- **Rationale**: Spec FR-015; smallest diff; artist asked for discography without jukebox.
- **Alternatives considered**:
  - V-Flip track list includes catalog-only — out of scope (rejected).
  - New sixth HUD icon — superseded (rejected).

## R6: Tracks file body

- **Decision**: Tracks collection uses **empty schema for body** (frontmatter-only), same
  pattern as `shows`. Optional one-line comment in body for artist notes is ignored by build.
- **Rationale**: No lyrics/stage copy for catalog-only songs; keeps editor simple.
- **Alternatives considered**:
  - Require markdown blurb in body — duplicates `blurb` frontmatter (rejected).

## R7: Empty tracks folder

- **Decision**: Use standard **`glob` loader**; ship **one example** track file (FR-014) so
  folder is non-empty at merge. No `globAllowEmpty` needed at ship time.
- **Rationale**: Example demonstrates workflow; avoids Astro empty-folder warnings.
- **Alternatives considered**:
  - `globAllowEmpty` — unnecessary if example ships (deferred unless operator deletes all tracks).

## R8: Artist guide migration note

- **Decision**: Replace “poster-only jukebox workaround” guidance with **tracks folder**
  decision tree; keep jukebox section for stage-backed releases; note promotion path (add
  jukebox file with same id, remove redundant tracks file).
- **Rationale**: Constitution VII; removes contradictory `013`-era “no releases folder” wording
  for catalog-only case.

## R9: Testing

- **Decision**: Extend **`src/lib/catalog-tracks.test.ts`** with pure tests for merge/dedup/sort:
  - Catalog-only row appears when no jukebox id.
  - Jukebox row wins when ids match (one row).
  - `inDiscography: false` jukebox still hidden.
  - Combined sort by date then title.
- **Rationale**: Merge logic is pure once collections are mocked or tested via extracted
  `mergeDiscographyEntries(jukeboxRows, trackRows, jukeboxIds)` helper.
- **Alternatives considered**:
  - E2E browser tests — out of scope per operator workflow rules (rejected).

## R10: Example content

- **Decision**: Ship **`src/content/tracks/example-catalog-only.md`** — clearly labeled EXAMPLE,
  back-catalog single with `sortDate` older than current jukebox entries, one `listenLinks`
  row if placeholder URL available.
- **Rationale**: FR-014; quickstart scenario 1 validation.
