# Feature Specification: Artist Content Editing

**Feature Branch**: `024-artist-content-editing`

**Created**: 2026-10-05

**Status**: As-built (consolidated living spec)

**Consolidates**: `008-artist-docs`, content-editing parts of `001`, `004`, `014`

**Input**: Consolidation of how the artist (a non-programmer) changes everything visitors
see — through plain content files, a single authoritative guide, and a two-stage
pre-release → main publish path — without touching layout or code.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Artist changes any visible text in one place (Priority: P1)

The artist wants to change a tagline, a bio sentence, a show, a release, or a button label.
They open the one content file that owns that text, edit it in the GitHub web editor, and
the change shows up after publishing. They never open a component, style, or script.

**Why this priority**: Content-code separation (constitution III) only pays off if every
visitor-facing string really lives in content.

**Independent Test**: Using only `docs/artist-guide.md`, change one About sentence, one
release title, one show city, one UI label, and one tagline; confirm each appears on the
preview and no file outside the allowed surfaces changed.

**Acceptance Scenarios**:

1. **Given** the artist guide, **When** the artist looks up any visible text, **Then** the
   guide names exactly one file that owns it.
2. **Given** a text change in that file, **When** it is published, **Then** only that text
   changes on the site.
3. **Given** region titles, button labels, tooltips, and empty-state sentences, **When**
   the artist edits them in UI chrome content, **Then** the site shows the new words.

---

### User Story 2 - Artist publishes to preview, then goes live (Priority: P1)

The artist opens a pull request into `pre-release`, merges it once checks pass, reviews the
preview address, and then (alone or with the developer) merges `pre-release` into `main` to
go live.

**Why this priority**: Self-serve publishing without a developer for routine updates.

**Independent Test**: Follow the guide's "How to publish" and "How to go live" sections
end to end with a trivial text change.

**Acceptance Scenarios**:

1. **Given** a content PR into `pre-release`, **When** it is merged, **Then** the preview
   updates and the live site does not.
2. **Given** a PR from `pre-release` into `main`, **When** it is merged, **Then** the live
   site updates.
3. **Given** a content mistake that fails validation, **When** CI runs on the PR, **Then**
   the check fails and names the file before anything is merged.

---

### User Story 3 - Artist knows the safe boundary (Priority: P2)

The guide lists what the artist may change (content, data, media, picking an existing
theme id) and what they must not change (components, styles, scripts, build config, theme
pack registry), plus ids that must not be renamed.

**Why this priority**: Prevents accidental breakage and unnecessary developer round-trips
(constitution VII).

**Independent Test**: Ask someone unfamiliar with the code to classify ten files as
"may edit" or "developer only" using the guide; all ten are classified correctly.

**Acceptance Scenarios**:

1. **Given** the guide, **When** the artist wants a new visual mood, **Then** the guide
   says picking an existing `themeId` is allowed and creating packs is developer work.
2. **Given** stable ids (jukebox slugs, legal slugs, channel ids, theme ids), **When** the
   artist considers renaming one, **Then** the guide tells them to ask the developer.

---

### Edge Cases

- A content file is valid but a list item misses a display-required field → the item is
  omitted with a build warning (see `023` FR-010).
- A Markdown template file starts with `_` (e.g. `shows/_example.md`) → it is ignored by
  the site and serves as a copy-paste template.
- A jukebox entry and a catalog-only track share an id → the jukebox entry wins; the track
  file produces no second row (see `028`).
- Media files must live under `public/` and be referenced with a leading `/`; a path
  without it fails the build.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every visitor-facing string (identity, bio, releases, shows, taglines, region
  titles, button labels, tooltips, empty states, intro copy, legal text) MUST live in a
  content or data file, editable in exactly one place.
- **FR-002**: The artist-editable surfaces MUST be:
  - `src/data/site.json` — identity, SEO switch, channels, shop URL, contact
  - `src/data/stage-schedule.json` — landing default by date (see `025`)
  - `src/data/tagline-pool.json` — rotating subtext (see `030`)
  - `src/content/jukebox/` — stage entries (see `026`) that also feed the catalog
  - `src/content/tracks/` — catalog-only releases (see `028`)
  - `src/content/shows/` — tour dates (see `029`)
  - `src/content/about/me.md` — bio
  - `src/content/ui/chrome.md` — all UI labels, tooltips, empty states, intro copy,
    shuffle/loop defaults
  - `src/content/legal/` — Impressum and privacy text
  - `public/videos/`, `public/images/` — media referenced from content
- **FR-003**: Selecting an existing, complete `themeId` on a jukebox entry MUST be
  artist-allowed; creating or editing theme packs MUST be developer-only.
- **FR-004**: `docs/artist-guide.md` MUST be the single authoritative artist guide; it MUST
  list every editable surface with what it controls, where it lives, and do-not-break
  rules, plus the developer-only surfaces and stable ids.
- **FR-005**: The guide MUST document the GitHub web editor as the primary edit path and a
  local clone with `npm run dev` / `npm run check` as the optional secondary path.
- **FR-006**: The guide MUST document the two-stage publish path: content PR into
  `pre-release` (preview at `/pre-release/`), then a PR from `pre-release` into `main` to go
  live; it MUST state that a failed build leaves the last good version online.
- **FR-007**: Any feature that adds, removes, or changes an artist-editable surface MUST
  update the artist guide in the same change set (constitution VII).
- **FR-008**: The README MUST link to the artist guide as the entry point for content
  edits; topic guides (e.g. `docs/stage-schedule.md`) MUST be linked from it.

### Key Entities

- **Content surface**: a file or folder the artist may edit, with its schema and
  do-not-break rules.
- **Stable id**: filename slug or JSON id other content references (jukebox slug,
  `jukeboxId` in the schedule, legal slug, channel `id`, `themeId`).
- **UI chrome**: the single content file that owns every interface label and default.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A non-programmer can change a chosen visible text and see it on the preview
  in under 15 minutes on the first try, using only the guide.
- **SC-002**: 100% of visitor-facing strings are owned by content/data files (no
  hard-coded copy in components, except accessible fallback strings).
- **SC-003**: Every merged feature that changes an edit surface also changes
  `docs/artist-guide.md`.

## Assumptions

- No CMS or login is introduced; GitHub is the editing UI (constitution I, II).
- The artist and the developer agree who performs the `pre-release` → `main` promotion.

## Known Gaps *(as of 2026-10-05)*

- The artist guide lags behind the code: it still describes the V-Flip drawer / Track info
  and lyrics surfaces, references the removed `releases/` folder, and does not document
  `rubbable`, `trackOrder`, or EP/compilation grouping via `kind`.
- `docs/stage-schedule.md` uses `example-cyan` in its examples, but that jukebox entry no
  longer exists.
- The `contact` block in `site.json` is empty and the Contact route is not linked from the
  navigation (see `027`).
