# Feature Specification: Music Catalog (Discography)

**Feature Branch**: `028-music-catalog`

**Created**: 2026-10-05

**Status**: As-built (consolidated living spec)

**Updated**: 2026-10-06 — stage-only play buttons (folded in from `035`)

**Consolidates**: `010-track-catalog`, `014-discography-only-tracks`, discography parts of
`004`, `013`, plus post-spec catalog work (2026-09-20: covers, expandable rows, EP /
compilation grouping, `trackOrder`, listen links)

**Input**: Consolidation of the discography: one chronological catalog of every Valence
release — stage songs and back-catalog alike — with cover art, EP/compilation grouping,
release facts, and outbound listen links.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fan browses everything Valence released (Priority: P1)

A fan opens Discography and sees the full catalog grouped by year, newest first. Each
single is a card with cover, type, title, and artist; EPs and compilations appear as one
card with their tracklist in order.

**Why this priority**: The catalog is the artist's body of work — core content for any
artist site.

**Independent Test**: Open Discography on laptop and phone; confirm year groups are newest
first, an EP shows its tracks in `trackOrder`, and a release without cover art shows the
placeholder cover.

**Acceptance Scenarios**:

1. **Given** releases exist, **When** Discography opens, **Then** releases are grouped by
   calendar year, newest year first, and ordered newest to oldest within a year.
2. **Given** several releases share an EP or compilation `kind` (e.g.
   `EP (Show Me How • Remix EP)`), **When** they fall in the same year, **Then** they render
   as one collection card with a shared cover and tracks ordered by `trackOrder` (missing
   orders last).
3. **Given** a release has no cover, **When** its card renders, **Then** a placeholder
   cover is shown.
4. **Given** no releases exist, **When** Discography opens, **Then** a clear "No releases
   yet" message shows.

---

### User Story 2 - Fan jumps to a streaming platform (Priority: P1)

A fan likes a release and wants to hear the full song elsewhere. The card shows "Listen On"
platform icons. The cover is artwork only: clicking it does nothing (it neither opens a
platform nor expands the card).

**Why this priority**: Leading fans to the music is the site's main job.

**Independent Test**: Activate each Listen On icon on one release; confirm each opens the
right platform in a new tab. Click the cover; confirm nothing happens.

**Acceptance Scenarios**:

1. **Given** a release has listen links, **When** its card renders, **Then** one icon per
   valid link appears and opens in a new tab.
2. **Given** a release has no valid links, **When** its card renders, **Then** no Listen
   On row appears.

---

### User Story 3 - Fan expands a release for details (Priority: P2)

Tapping a card expands it to show the release date, full type, artist, listen links, and
a short note (blurb).

**Why this priority**: Context without clutter at rest.

**Independent Test**: Expand and collapse a single and a track inside an EP card; confirm
facts appear and links still work without toggling the card.

**Acceptance Scenarios**:

1. **Given** a collapsed card, **When** the fan activates it, **Then** details expand and
   the toggle reports its expanded state accessibly.
2. **Given** an expanded card, **When** the fan activates a link or play control inside
   it, **Then** the card does not collapse.

---

### User Story 4 - Artist lists releases with or without a stage clip (Priority: P1)

The artist adds a back-catalog single as a small tracks file (title, date, links, optional
cover) without needing a video. Stage songs from the jukebox appear in the catalog
automatically.

**Why this priority**: Most of the catalog has no stage clip; adding it must be cheap.

**Independent Test**: Add a tracks file with only `label` and `sortDate`; confirm it
appears in the right year. Add a jukebox file with the same id; confirm only one card
remains.

**Acceptance Scenarios**:

1. **Given** a jukebox entry with `sortDate`, **When** the catalog builds, **Then** it
   appears unless `inDiscography: false`.
2. **Given** a tracks file and a jukebox entry share an id, **When** the catalog builds,
   **Then** the jukebox entry wins and no duplicate card appears.
3. **Given** a tracks file misses `label` or `sortDate`, **When** the catalog builds,
   **Then** it is omitted with a warning.

---

### Edge Cases

- Credits with role `Artist` override the artist line (remixes, collaborations); otherwise
  the site artist name is used.
- A collection whose members have different covers → the most common cover wins (ties:
  first seen).
- Jukebox entries without `cover` fall back to their stage poster.
- Listen links with unsupported platforms or non-http URLs are dropped.
- A row marked `rubbable` participates in the rub easter egg (see `032`).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The catalog MUST merge jukebox entries (with `sortDate`, not
  `inDiscography: false`) and catalog-only entries from `src/content/tracks/`; on id
  collision the jukebox entry MUST win.
- **FR-002**: Catalog-only tracks MUST require `label` and `sortDate`; they MAY set `kind`,
  `trackOrder`, `listenLinks`, `cover`, `blurb`, `credits`, `mentions`, `rubbable`.
- **FR-003**: Entries MUST be grouped by calendar year (newest first); within a year, EP and
  compilation members with the same `kind` string MUST form one collection card ordered by
  `trackOrder`, singles stay individual, and blocks are ordered newest first.
- **FR-004**: Each card MUST show cover (or placeholder), type chip, title, artist, and
  Listen On icons when valid links exist; activating the card MUST expand release date,
  type, artist, links, and note. On single cards the icons sit under kind / title / artist,
  beside the cover, without a visible "Listen On" label or divider (the label stays as
  the list's accessible name). EP / Compilation / Album cards MAY show whole-release
  links the same way, from `src/content/collections/` (matched by the collection name in
  `kind`).
- **FR-005**: Supported listen platforms MUST be Bandcamp, Spotify, YouTube, SoundCloud,
  and Tidal; the primary link order MUST be Bandcamp → Spotify → first valid.
- **FR-006**: Outbound links MUST open in a new tab; no embeds or autoplay widgets.
- **FR-007**: The catalog MUST be available as the Discography overlay (laptop) and inside
  the phone menu (see `027`), with labels (`discographyTitle`, `listenOnLabel`,
  `releasedLabel`, `emptyReleases`, `stageButtonLabel`) from UI chrome.
- **FR-008**: Rows whose release is a stage song (has a jukebox entry) MUST show a play
  button — or a "currently playing" EQ marker while that song is on stage — in the overlay
  (single cards and nested EP rows) and in the phone menu. Catalog-only tracks MUST NOT
  show one. EP/album covers show one when at least one of their tracks is a stage song;
  it plays the first such track in track order. Pressing play MUST put the song on stage
  (see `026` FR-010) and close the overlay (laptop) or menu (phone); it MUST NOT force the
  player open.
  Placement: on single and EP/album cards it floats over the bottom-right corner of the
  cover; in EP tracklists it sits on the right as the first icon of the listen-link row,
  before the platform links (no leading column, titles start flush left).

### Key Entities

- **Release (discography entry)**: id, title, sort date/year, kind (type + collection
  name), track order, artist, cover, listen links, note, optional stage id, rubbable flag.
- **Collection**: EP or compilation inferred from a shared `kind` string within a year.
- **Listen link**: platform + https URL.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Adding a back-catalog release requires one new file with two required
  fields.
- **SC-002**: 100% of catalog cards with valid links open the correct platform.
- **SC-003**: A fan finds any release by year in under 20 seconds.

## Assumptions

- `src/content/tracks/` currently holds 72 catalog-only releases; covers live in
  `public/images/covers/`.
- Per-track credits and mentions are stored but only the artist credit and blurb are shown.

## Known Gaps *(as of 2026-10-06)*

- The phone menu renders its own copy of the catalog markup separate from the
  `Discography` component (two implementations to keep in sync; the play control is shared
  via `StagePlayButton`).
- Unused helpers remain (`sortDiscographyEntriesAsc`, deprecated
  `getDiscographyFromJukebox`).
