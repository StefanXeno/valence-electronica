# Feature Specification: Track Catalog & Song Identity

**Feature Branch**: `010-track-catalog`

**Created**: 2026-08-28

**Status**: Draft

**Input**: User description: "Work on IDEA-021 — add a catalog of all existing tracks.
Define song identity, maintain a chronological catalog of stage/jukebox tracks, and expose
per-track context including outbound listen links. Tracks may bind to stage atmosphere and
theme packs."

**Promoted from**: IDEA-021 (absorbs IDEA-006 track-info panel scope)

## Clarifications

### Session 2026-08-28

- Q: Separate catalog panel vs. extend discography? → A: **Separate track catalog**
  surface. Discography stays release-oriented (albums/EPs/singles). The track catalog lists
  **individual songs** in chronological order.
- Q: Canonical id model? → A: **One stable track id** per song. Jukebox/stage entries that
  represent that song use the **same id** (today’s jukebox slug becomes the track id). No
  duplicate parallel ids in v1.
- Q: Embeds vs. outbound links? → A: **Outbound links only** (constitution V). No autoplay
  third-party players unless explicitly approved in a future feature.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Maintainer defines the full track catalog in content (Priority: P1)

The artist (or operator) maintains one content-backed catalog where every published stage
track has a stable identity: title, sort date, and optional metadata (release label, kind,
short blurb). All four current jukebox entries (Nightmare, Taking Over, Show ME How,
Example Cyan) are represented. Adding a new track requires editing content files only, not
components.

**Why this priority**: Without a canonical catalog, listen links and “now playing” context
have no single source of truth.

**Independent Test**: Add a fifth track file with required fields only; build succeeds and
the new track appears in the catalog list without code changes.

**Acceptance Scenarios**:

1. **Given** valid track content for every current jukebox entry, **When** the site builds,
   **Then** each entry is a catalog member with a unique stable id matching its jukebox id.
2. **Given** a track file missing a required field (e.g. title or sort date), **When** the
   site builds, **Then** that entry is omitted with a clear build-time warning (same
   omission pattern as releases/shows today).
3. **Given** the artist edits a track title or blurb in content, **When** the site is
   rebuilt and deployed, **Then** the updated text appears everywhere that track is shown.

---

### User Story 2 - Visitor browses all tracks in chronological order (Priority: P1)

A visitor opens the landing stage and opens the **track catalog** from the peripheral HUD
(icon control, same family as Lyrics / Discography). They see every published track in
**chronological order** (newest first by default sort date). Each row shows at least the
track title and year (or equivalent date label). The list scrolls inside the panel without
occupying the center stage.

**Why this priority**: This is the core “catalog of all existing tracks” outcome.

**Independent Test**: Open the track catalog with four tracks loaded; confirm four rows,
correct chronological order, and panel behavior matches other on-demand panels (exclusive
open, keyboard reachable, reduced-motion safe).

**Acceptance Scenarios**:

1. **Given** the landing loads with a valid catalog, **When** the visitor opens the track
   catalog, **Then** every published track appears exactly once.
2. **Given** multiple tracks with different sort dates, **When** the visitor views the
   catalog, **Then** rows appear in descending chronological order (newest sort date first).
3. **Given** another on-demand panel is open, **When** the visitor opens the track catalog,
   **Then** the previous panel closes (exclusive-open rule from `004`).
4. **Given** the catalog panel is open, **When** the visitor uses keyboard navigation,
   **Then** they can open, scroll, and close the panel without a pointer.

---

### User Story 3 - Visitor sees what is playing and can open listen links (Priority: P2)

While a stage track is active (jukebox selection or scheduled default), the visitor can
see **which track is playing** and open **listen links** on supported platforms (e.g.
Bandcamp, Spotify, YouTube — only when URLs are provided). Links open in a new tab. No
audio starts from those links without a deliberate click.

**Why this priority**: Connects the catalog to the live stage experience and streaming
discovery — the main motivation behind IDEA-021.

**Independent Test**: Select Taking Over in the jukebox; confirm active-track affordance
shows the correct title and at least one outbound link when configured; mute/unmute and
atmosphere behavior unchanged.

**Acceptance Scenarios**:

1. **Given** the active jukebox entry maps to a catalog track, **When** the visitor views
   the now-playing affordance, **Then** the displayed title matches the catalog entry.
2. **Given** a track has one or more listen URLs in content, **When** the visitor activates
   a platform link, **Then** the correct outbound URL opens in a new tab with
   `noopener` semantics.
3. **Given** a track has no listen URLs, **When** the visitor views now-playing context,
   **Then** listen links are hidden (no dead or placeholder platform buttons).
4. **Given** the visitor switches jukebox entries, **When** the new entry loads, **Then**
   now-playing context updates to the new track within one interaction beat (no stale title
   from the previous track).

---

### User Story 4 - Visitor reads credits and mentions for a track (Priority: P3)

A visitor who wants depth can open per-track **credits** (roles and names) and optional
**honorable mentions** (short thanks or shout-outs). All fields are optional; sparse tracks
still list cleanly in the catalog.

**Why this priority**: Completes IDEA-006-style context without a separate feature.

**Independent Test**: Populate credits on one track only; confirm they appear in the
now-playing info popover for that track and not for tracks without credits.

**Acceptance Scenarios**:

1. **Given** a track has credits in content, **When** the visitor opens the now-playing info
   popover for that active track, **Then** credits are readable and do not break the popover layout.
2. **Given** a track has honorable mentions, **When** the visitor views that track,
   **Then** mentions appear as short prose or a short list (operator’s choice in content).
3. **Given** a track has no credits or mentions, **When** the visitor views it,
   **Then** those sections are omitted (not “empty” placeholder blocks).

---

### Edge Cases

- Track id referenced by jukebox but missing from catalog → jukebox entry still works for
  atmosphere; now-playing shows jukebox label as fallback; build warns.
- Catalog track id with no jukebox entry → appears in catalog only (song without a stage
  clip yet); discography `jukeboxId` may still point at a jukebox id when a clip exists.
- Duplicate sort dates → secondary sort by title ascending for stable ordering.
- Very long credits or many platform links → panel scrolls; no horizontal overflow on 320px
  width (usable, not polished — mobile HUD remains IDEA-013).
- Invalid or malformed outbound URL in content → entry omitted at build with warning (same
  spirit as invalid release URLs).
- Reduced motion → no new looping motion; static panel content only.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST maintain a **track catalog** as structured, visitor-facing
  content separate from layout code (constitution III).
- **FR-002**: Each catalog entry MUST have a **stable id** that matches the jukebox entry
  id when that song has a stage clip (one id, many views).
- **FR-003**: Each catalog entry MUST include at least **title** and **sort date** (calendar
  date or year used for chronological ordering). Build MUST omit invalid entries with a
  logged warning.
- **FR-004**: The catalog MUST list **all valid entries** in descending sort-date order
  (newest first), with deterministic tie-breaking by title.
- **FR-005**: The landing MUST expose a **track catalog panel** in the on-demand HUD row
  (icon + inline title when open), consistent with `004` / `009` panel behavior (exclusive
  open, peripheral attachment, internal scroll).
- **FR-006**: Panel chrome labels (title, empty states, control accessible names) MUST be
  editable via existing UI chrome content (`src/content/ui/chrome.md`), not hard-coded in
  components.
- **FR-007**: While a jukebox entry is active, the site MUST surface **now-playing identity**
  (title from catalog when linked, else jukebox label) via a dedicated affordance (e.g. info
  control near jukebox or inside expanded jukebox header — plan-time UX choice).
- **FR-008**: Per-track **listen links** MUST be optional outbound URLs only; only configured
  platforms MUST appear; links MUST open in a new tab without autoplay embeds (constitution V).
- **FR-009**: Per-track **credits** and **honorable mentions** MUST be optional content
  fields; omitted fields MUST not render empty chrome.
- **FR-010**: Switching jukebox entries MUST update lyrics, theme, atmosphere, mute rules,
  and now-playing context without regressions from `004` / `005` / `007`.
- **FR-011**: **Discography** MUST remain release-oriented; it MUST NOT be replaced by the
  track catalog. Releases MAY continue to reference a jukebox id for the stage button.
- **FR-012**: Initial catalog content MUST include all **currently shipped jukebox tracks**
  (Nightmare, Taking Over, Show ME How, Example Cyan) with placeholder or real metadata as
  available.
- **FR-013**: Artist-guide documentation MUST be updated when new content surfaces and
  fields are introduced (constitution VII).

### Key Entities

- **Track (song)**: Canonical musical identity — stable id, title, sort date, optional blurb,
  optional credits, optional mentions, optional listen links (platform label + URL pairs).
- **Jukebox entry**: Stage/atmosphere binding for a track — shares id with Track when a clip
  exists; carries poster, sources, theme, audio flags, lyrics body (existing `004` model).
- **Release**: Discography row — title, year, kind, optional store URL, optional `jukeboxId`
  link to stage a bound clip (existing model; unchanged role).
- **Listen link**: Named outbound URL to a streaming or store platform; display label is
  content-defined or drawn from a small fixed platform vocabulary (plan-time).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of valid jukebox entries at ship time appear as catalog rows with
  matching ids (four tracks today).
- **SC-002**: A visitor can open the track catalog and identify every published track within
  **30 seconds** without horizontal scrolling on a typical laptop viewport.
- **SC-003**: After selecting a track in the jukebox, the visitor can reach an outbound
  listen link in **two interactions or fewer** when links are configured.
- **SC-004**: Adding or editing a track’s title, sort date, or listen URL requires changes
  in **content files only** — no component edits for routine updates.
- **SC-005**: Catalog and now-playing surfaces remain usable with keyboard-only navigation
  (open panel, traverse links, close panel).
- **SC-006**: No new third-party embeds or tracking scripts are introduced (privacy baseline
  unchanged).

## Assumptions

- **Sort date** defaults to release year or first-public date; operator supplies one explicit
  field per track (not inferred from filename).
- **Now-playing affordance** is a compact control (not a full-screen modal); exact placement
  is a plan-time HUD decision within `009` dock constraints.
- **Platform list** for listen links starts with Bandcamp, Spotify, YouTube, SoundCloud,
  Tidal — only platforms with URLs in content are shown.
- **Mobile polish** for the new panel follows IDEA-013; v1 must not crash or trap focus at
  320px width.
- **Theme packs** remain separate from track identity; binding is via jukebox `themeId` as
  today.
- Lyrics body stays on the jukebox entry file unless a later refactor consolidates track
  body copy (out of scope for v1 migration).

## Out of Scope

- Third-party audio/video embeds or autoplay widgets.
- Runtime database or visitor-specific “my library” features.
- Chronological **release** catalog changes (discography sort rules stay as-is).
- Per-track streaming analytics or click tracking.
- Mobile-first HUD redesign (IDEA-013).
- Renaming existing jukebox ids (ids are stable contracts across catalog, schedule, releases).

## Dependencies

- `004-landing-content-layout` — jukebox, on-demand panels, discography, lyrics.
- `005-theme-packs` — theme binding on jukebox entries.
- `007-scheduled-stage-default` — active entry resolution.
- `009-desktop-stage-ui` — icon HUD and dock layout for new panel slot.
- `008-artist-docs` — artist guide update path.
