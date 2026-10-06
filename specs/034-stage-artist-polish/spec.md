# Feature Specification: Stage Artist Polish

**Feature Branch**: `034-stage-artist-polish`

**Created**: 2026-10-05 (carried over from `022-stage-artist-polish`, 2026-09-18)

**Status**: Draft — not implemented; needs `/speckit-clarify` before `/speckit-plan`

**Input**: Artist and friend feedback (Gosha, Hendrik, 2026-09-18) on the stage itself:
Show Me How needs music, Taking Over should feel brighter, every stage song needs separate
phone and laptop videos, an NCS logo may own the stage center, and shuffle needs a new
look. Re-checked against the code on 2026-10-05; items that no longer apply are listed
under Assumptions.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Show Me How plays music (Priority: P1)

A visitor lands on (or shuffles to) Show Me How, unmutes, and hears the song — like every
other stage entry.

**Why this priority**: A silent entry feels broken (direct artist feedback).

**Independent Test**: Put Show Me How on stage, unmute; music plays.

**Acceptance Scenarios**:

1. **Given** Show Me How is on stage and the visitor unmutes, **When** the atmosphere
   plays, **Then** its music is audible.
2. **Given** shuffle with sound on, **When** the next entry is chosen, **Then** Show Me How
   is in the audio-eligible pool.

---

### User Story 2 - Taking Over reads brighter (Priority: P1)

When Taking Over is on stage, the interface (surfaces, accents, scrim) is clearly brighter
than today's dark treatment while staying readable.

**Why this priority**: Direct artist feedback on the track's mood.

**Independent Test**: Compare Taking Over before/after side by side; brightness change is
obvious; text contrast still passes.

**Acceptance Scenarios**:

1. **Given** Taking Over is active, **When** compared with the previous treatment, **Then**
   primary chrome and surfaces read clearly brighter.
2. **Given** the brighter treatment, **When** text and controls are checked, **Then** they
   keep sufficient contrast (constitution IV).

---

### User Story 3 - Each stage song has a phone and a laptop video (Priority: P1)

Every stage entry ships two atmosphere videos — one framed for phones, one for laptops —
and the site picks the right one for the viewport.

**Why this priority**: Portrait phones and landscape laptops need different framing; this
also lets phones get lighter files.

**Independent Test**: Load each stage entry at 390px and 1280px; confirm the
viewport-specific file is requested and the other is not.

**Acceptance Scenarios**:

1. **Given** a phone-width viewport, **When** an entry plays, **Then** its mobile video is
   used.
2. **Given** a laptop-width viewport, **When** an entry plays, **Then** its desktop video
   is used.
3. **Given** an entry lacks one of the two videos, **When** content is validated, **Then**
   the maintainer is warned [NEEDS CLARIFICATION: fail the build, warn, or fall back to the
   other video?].

---

### User Story 4 - NCS mark in the stage center (Priority: P2)

For entries associated with NCS, an NCS logo can sit in the center of the stage as a
deliberate focal element without blocking navigation or the player.

**Why this priority**: Partner/release identity requested by the artist.

**Independent Test**: Activate an NCS entry; the logo is centered; other entries do not
show it.

**Acceptance Scenarios**:

1. **Given** an entry configured for the NCS logo, **When** it is on stage, **Then** the
   logo shows centered.
2. **Given** any other entry, **When** it is on stage, **Then** no NCS logo shows.

---

### User Story 5 - Shuffle gets a new look (Priority: P3)

The shuffle control gets a visibly new icon/treatment while keeping its toggle behavior.

**Why this priority**: Cosmetic artist feedback.

**Independent Test**: Compare old/new shuffle; silhouette or metaphor changed; toggle still
works with a clear pressed state.

**Acceptance Scenarios**:

1. **Given** the player, **When** shuffle renders, **Then** it uses the new treatment and
   still exposes its pressed state.

---

### Edge Cases

- NCS logo asset not yet supplied → do not ship a placeholder mark without owner approval.
- Viewport exactly at the 1024px split → exactly one of the two videos is chosen.
- Reduced motion → poster fallback still uses the viewport-appropriate poster.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Show Me How entry MUST be audio-eligible with a real music bed.
- **FR-002**: Taking Over's theme pack MUST be noticeably brighter while preserving
  contrast.
- **FR-003**: Stage entries MUST be able to bind separate mobile and desktop video sources;
  the atmosphere MUST choose by the site's 1024px breakpoint.
- **FR-004**: Content MUST be able to mark entries that show a centered NCS logo; the logo
  MUST NOT block navigation or player chrome.
- **FR-005**: The shuffle control MUST get a new visual while keeping toggle semantics.
- **FR-006**: Bindings for audio, dual videos, and NCS logo MUST be content-editable and
  documented in the artist guide (constitution III, VII).
- **FR-007**: Trimming or editing media in-product is out of scope; swapping the Taking
  Over media version is content work.

### Key Entities

- **Stage entry** (extends `026`): adds viewport-specific video sources and an optional
  center-logo flag.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of stage entries play audible music after unmute.
- **SC-002**: Phones download only mobile videos for the active entry.
- **SC-003**: The artist confirms Taking Over "feels brighter" in review.

## Assumptions

- **Dropped from `022`**: "Kill Minecraft sprites" — no sprite assets or code exist on
  `pre-release` as of 2026-10-05; nothing to remove.
- **Parked from `022`**: "Mobile bottom player prefers tap" — resolved by the hidden stage
  player (`026`): phone and laptop share one tap-driven player.
- Which entries are "NCS-associated" and the logo asset must come from the artist.
- Depends on `025` (atmosphere/theme packs) and `026` (stage entries).
