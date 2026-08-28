# Feature Specification: Discography-Only Tracks

**Feature Branch**: `014-discography-only-tracks`

**Created**: 2026-08-28

**Status**: Ready for implementation

**Input**: User description: "I want to be able to add songs to the discography without
adding them to the jukebox."

**Promoted from**: `010-track-catalog` research R1 (deferred catalog-only tracks). Completes
the song-identity model started in `010` without reviving the separate Tracks HUD panel
(superseded by `011` V-Flip + `013` inline track detail).

## Clarifications

### Session 2026-08-28

- Q: Separate discography-only folder vs. `010` track catalog model? → A: **Use `010`
  logic** — introduce `src/content/tracks/` for catalog-only song metadata, merged via
  existing `catalog-tracks.ts` helpers (`parseListenLinks`, `sortCatalogTracks`,
  `pickPrimaryListenUrl`). Supersedes the initial `014` draft’s generic “discography-only
  edit surface” wording.
- Q: Separate Tracks HUD panel from `010` US2? → A: **No.** `011`/`013` superseded the
  `TrackCatalog` panel and `NowPlayingControl`; catalog-only tracks surface in the
  **Discography panel** only, not the jukebox/V-Flip picker.
- Q: Same fields as jukebox catalog metadata? → A: **Yes** — reuse `010` field vocabulary
  (`label`, `sortDate`, optional `kind`, `listenLinks`, optional `blurb`/`credits`/`mentions`).
  Credits/blurb/mentions are stored for consistency but are **not** shown in the Discography
  row in v1 (same as jukebox-backed discography rows today); they remain available if a
  track is later promoted to stage or a future detail surface reads them.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Artist lists a release in discography without a stage clip (Priority: P1)

The artist has older singles, album tracks, or guest features that belong in the public
discography but do not have (and may never have) a V-Flip stage clip, poster, theme, or
looping atmosphere. They add a **track content file** (per `010` catalog model) with title,
release date, optional kind, and optional outbound listen links. They do **not** create a
jukebox entry. After publish, the release appears in the Discography panel in chronological
order alongside jukebox-backed releases.

**Why this priority**: Completes `010` R1 deferred work and satisfies the core request —
decouple catalog visibility from stage playback without forcing fake stage assets.

**Independent Test**: Add one track file with `label` + `sortDate` only; build and confirm
it appears in Discography, is absent from the jukebox/V-Flip picker, and has no stage button.

**Acceptance Scenarios**:

1. **Given** a valid track content entry with no matching jukebox file, **When** the site
   builds and a visitor opens Discography, **Then** the entry appears exactly once with
   title and year derived from `sortDate`.
2. **Given** a catalog-only track entry, **When** the visitor opens the jukebox (V-Flip
   drawer), **Then** that title does not appear in the selectable track list or shuffle pool.
3. **Given** a catalog-only entry with `listenLinks` configured, **When** the visitor views
   the row, **Then** the title links to the primary outbound URL using the same platform
   priority as jukebox-derived discography rows (`pickPrimaryListenUrl` rules).
4. **Given** a catalog-only entry without listen links, **When** the visitor views the row,
   **Then** the title is plain text (not a dead link).
5. **Given** a catalog-only entry, **When** the visitor views its row, **Then** no
   stage/play button is shown.

---

### User Story 2 - Artist keeps jukebox-backed discography behavior unchanged (Priority: P1)

Existing jukebox entries that already appear in discography (via `sortDate`, unless
`inDiscography: false`) continue to work as today. When the same stable id exists in both
jukebox and tracks content, **jukebox is authoritative** for discography presentation and
stage binding (one id, many views — `010` FR-002).

**Why this priority**: Preserves the single-file workflow for stage-backed releases and
avoids duplicate rows when a song later gains a stage clip.

**Independent Test**: With jukebox-backed and catalog-only track files loaded, confirm stage
buttons, sort order, and `inDiscography: false` behavior unchanged.

**Acceptance Scenarios**:

1. **Given** a jukebox entry with `sortDate` and valid stage assets, **When** Discography
   opens, **Then** it appears with a stage/play affordance unchanged from pre-feature
   behavior.
2. **Given** a jukebox entry with `inDiscography: false`, **When** Discography opens,
   **Then** it remains hidden even if a catalog-only track file shares the same title.
3. **Given** jukebox-backed and catalog-only entries with different sort dates, **When** the
   visitor views Discography, **Then** all rows appear in one list sorted by `sortDate`
   descending (UTC calendar day), with stable tie-breaking by title ascending (`010` sort
   rules).
4. **Given** a jukebox entry missing `sortDate`, **When** Discography opens, **Then** it
   remains excluded (unchanged rule).
5. **Given** matching ids in jukebox and tracks content, **When** Discography builds,
   **Then** exactly one row is shown, sourced from jukebox (no duplicate).

---

### User Story 3 - Artist understands jukebox vs. tracks content (Priority: P2)

The artist-facing guide explains the `010`-aligned split: **jukebox** = stage/V-Flip
playback + optional discography row; **tracks** = catalog-only songs (discography without
stage). The guide lists shared field vocabulary, warns against duplicating the same song in
both places with different ids, and documents promotion (add jukebox file with same id,
optionally remove redundant tracks-only file).

**Why this priority**: Constitution Principle VII — completes the artist edit map `010`
started.

**Independent Test**: A non-developer reading only the updated guide correctly chooses
jukebox vs. tracks for three scenarios (stage single, back-catalog single, hidden WIP).

**Acceptance Scenarios**:

1. **Given** the artist wants stage + discography, **When** they read the guide, **Then**
   they are directed to jukebox content with `sortDate` (existing flow).
2. **Given** the artist wants discography only, **When** they read the guide, **Then** they
   are directed to `src/content/tracks/` and told not to add a jukebox file.
3. **Given** the artist used poster-only jukebox files as a catalog-only workaround,
   **When** they read the guide, **Then** they find guidance to prefer tracks content for
   new catalog-only releases.

---

### Edge Cases

- **Catalog-only track id later gains jukebox file** → single merged row; stage button
  appears; tracks-only duplicate fields ignored when ids match (jukebox wins).
- **Same id in jukebox and tracks, jukebox hidden from discography** (`inDiscography:
  false`) → jukebox row omitted; tracks file **also skipped** (id exists in jukebox
  collection). **No Discography row** for that slug. Use a different tracks filename or
  remove/rename the jukebox file if a catalog-only row is intended.
- **Duplicate titles, different ids** → both may appear; guide discourages intentional
  duplicates; no automatic deduplication in v1.
- **Same calendar year, multiple entries** → `sortCatalogTracks` tie-break by title
  ascending.
- **Invalid track entry** (missing `label` or `sortDate`) → omitted at build with warning;
  other entries publish.
- **Malformed listen URL** → link omitted with warning (`parseListenLinks` rules).
- **Empty discography** → existing empty-state chrome copy; control remains available.
- **Schedule / shuffle / loop** → track ids MUST NOT enter stage catalog JSON; schedule
  validation references jukebox ids only.
- **Track detail in V-Flip drawer** → lists jukebox stage entries only; catalog-only tracks
  are not selectable there (`010` edge case, amended for current UI).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST support **catalog-only tracks** as structured content in a
  dedicated **tracks** edit surface, separate from jukebox/stage files (`010` R1).
- **FR-002**: Each catalog-only track MUST use the same **stable id** rules as `010` — filename
  slug is the id; when a jukebox entry later shares that id, one logical song identity
  applies across discography and stage.
- **FR-003**: Each catalog-only track MUST require **`label`** and **`sortDate`** (ISO calendar
  date). Invalid entries MUST be omitted at build with a logged warning (`010` FR-003
  spirit).
- **FR-004**: Catalog-only tracks MAY include optional **`kind`**, **`listenLinks`**, **`blurb`**,
  **`credits`**, and **`mentions`** using the same validation rules as jukebox catalog
  fields (`010` content contract).
- **FR-005**: Discography MUST merge **jukebox-derived rows** (existing rules) and
  **catalog-only track rows** (no matching jukebox id) into one list sorted by
  `sortCatalogTracks` rules.
- **FR-006**: Catalog-only tracks MUST NOT appear in the jukebox/V-Flip picker, stage catalog
  JSON, shuffle/loop rotation, or scheduled default resolution.
- **FR-007**: Catalog-only discography rows MUST NOT show a stage/play button; jukebox-backed
  rows MUST retain stage buttons when stage-valid (unchanged).
- **FR-008**: Discography title links for catalog-only rows MUST use **`pickPrimaryListenUrl`**
  (shared helper from `catalog-tracks.ts`).
- **FR-009**: `inDiscography: false` on jukebox entries MUST continue to hide those entries
  from the merged discography list.
- **FR-010**: When jukebox and tracks content share an id, **jukebox MUST win** for
  discography row fields and stage binding; the tracks file MUST NOT produce a second row.
- **FR-011**: Catalog-only tracks MUST NOT require stage-only fields (poster, theme, video
  sources, audio flags, default flag).
- **FR-012**: Implementation MUST **extend** `catalog-tracks.ts` (not duplicate parsers) for
  merge, sort, and link validation.
- **FR-013**: Artist-facing documentation MUST be updated for the tracks edit surface and
  jukebox vs. tracks decision tree (constitution VII).
- **FR-014**: Initial ship SHOULD include at least one example catalog-only track file
  (clearly marked) for demonstration.
- **FR-015**: The separate **Tracks HUD panel** from `010` US2 MUST NOT be reintroduced;
  `011`/`013` V-Flip track detail remains the stage metadata surface.

### Key Entities

- **CatalogTrack** (`010`, extended): Canonical song metadata — id, title (`label`),
  `sortDate`, optional kind, listen links, optional blurb/credits/mentions; may or may not
  have a stage clip.
- **Jukebox / stage entry** (unchanged): Playable track with atmosphere assets; when
  `sortDate` is set and `inDiscography` is not false, contributes a discography row.
- **Discography row** (presentation): Merged view — title, year, optional kind, optional
  outbound title link, optional stage button (jukebox-backed only).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An operator can add a catalog-only track file and see it in Discography after
  a normal content publish, with zero jukebox/stage side effects in the same session.
- **SC-002**: 100% of pre-feature jukebox discography rows retain prior behavior with no
  jukebox file changes.
- **SC-003**: A non-developer chooses jukebox vs. tracks edit surface correctly for **3 of 3**
  scenarios after reading the updated artist guide once.
- **SC-004**: Combined discography with jukebox-backed and catalog-only entries sorts per
  `010` date/title rules and remains readable without horizontal scroll at 320px width.
- **SC-005**: Adding or editing catalog-only metadata requires **content file changes only**.
- **SC-006**: No new third-party embeds, tracking, or runtime backends (constitution I & V).

## Assumptions

- **`src/content/tracks/`** is the tracks edit surface name (`010` research R1); not a
  separate “discography-only” schema or folder.
- **Discography is the v1 visitor surface** for catalog-only tracks because the `010` Tracks
  panel was superseded; a future read-only chronological list could reuse the same merged
  `CatalogTrack` list without new content.
- **Promotion path**: add jukebox file with matching id; optionally delete redundant tracks
  file; guide documents manual deduplication.
- **Vitest** extends existing `catalog-tracks.test.ts` for merge/dedup/sort cases.

## Out of Scope

- Reviving `TrackCatalog.astro` or a sixth on-demand HUD panel (`010` US2 — superseded).
- Showing catalog-only tracks in the V-Flip selectable list or track-detail panel for
  non-active ids.
- Automatic migration of poster-only jukebox workaround files.
- Automatic deduplication by title (id-based dedup only when jukebox + tracks share id).
- Third-party embeds, streaming API import, mobile HUD redesign (IDEA-013).

## Dependencies

- `010-track-catalog` — song identity fields, `catalog-tracks.ts`, content contract (partial
  ship; this feature completes deferred catalog-only tracks).
- `004-landing-content-layout` — Discography panel, stage button, exclusive-open.
- `008-artist-docs` — artist guide update path.
- `011-vflip-now-playing` — jukebox drawer is stage picker; must exclude catalog-only ids.
- `013-codebase-hardening` — removed orphan `releases` collection and unused
  `getValidCatalogTracks()`; tracks collection replaces that dead path intentionally.

## Supersedes / Amends

| Prior decision | Location | New ruling |
|----------------|----------|------------|
| Catalog-only tracks deferred | `010` research R1 | **In scope** for `014` via `src/content/tracks/` |
| Separate Tracks HUD panel | `010` US2 (Tracks panel) | **Still out of scope** — use Discography panel |
| Generic “discography-only surface” | `014` draft v1 | **Superseded** by `010` tracks collection + merge |
| Discography jukebox-only source | `013` as-built | **Amended** — merged jukebox + tracks |
| `releases/` collection | `013` removal | **Not revived** — use `tracks/` per `010` R1 |
