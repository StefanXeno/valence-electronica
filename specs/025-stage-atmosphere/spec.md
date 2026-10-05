# Feature Specification: Stage Atmosphere, Audio & Theme Packs

**Feature Branch**: `025-stage-atmosphere`

**Created**: 2026-10-05

**Status**: As-built (consolidated living spec)

**Consolidates**: `002-themed-background-video`, `005-theme-packs`,
`007-scheduled-stage-default`, audio parts of `011`, `015`, `019`

**Input**: Consolidation of the landing "stage": a full-bleed atmosphere (looping video or
poster) whose bound theme pack sets the whole look of the site, first-party audio that only
plays after the visitor opts in, and a date-driven default for which entry is on stage.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor lands on a living stage (Priority: P1)

A visitor opens the site and the whole viewport is atmosphere: a short looping video (or a
poster still) behind the chrome. The colors and surfaces of every control match the clip.
The center of the screen belongs to the atmosphere.

**Why this priority**: The stage is the brand; everything else sits at its edges.

**Independent Test**: Load the landing with motion allowed; confirm the looping video
plays muted, the theme matches the active entry, and no content block occupies the center.

**Acceptance Scenarios**:

1. **Given** motion is allowed and the active entry has video sources and a pack that
   allows looping video, **When** the landing loads, **Then** the video plays muted, looped,
   full-bleed.
2. **Given** the active entry, **When** the page renders, **Then** the theme pack bound to
   that entry styles the whole site, including when only the poster shows.
3. **Given** reduced motion is preferred, autoplay is blocked, or the video fails, **When**
   the landing loads, **Then** the poster is shown as a static fallback and the page stays
   readable.

---

### User Story 2 - Visitor opts into sound (Priority: P1)

Sound never starts by itself. When the active entry has audio and its video is playing, a
mute control lets the visitor unmute. On laptops a volume slider appears; on phones unmute
sets a fixed 50% volume (hardware buttons handle loudness). The visitor can also pause and
resume the atmosphere.

**Why this priority**: Music is the point of the site, but surprise audio drives visitors
away.

**Independent Test**: On a laptop, unmute, drag the slider, switch entries, and pause;
confirm sound only starts after unmute, survives a switch to another audio entry, and
pausing freezes the video.

**Acceptance Scenarios**:

1. **Given** a fresh load, **When** the atmosphere plays, **Then** it is muted.
2. **Given** an audio-eligible entry is playing, **When** the visitor activates unmute,
   **Then** audio plays; on laptop widths a volume slider is shown in reserved space
   without resizing the player.
3. **Given** the visitor unmuted, **When** the stage switches to another audio entry,
   **Then** it stays unmuted; when it switches to an entry without audio, the mute control
   is disabled (laptop) and audio is silent.
4. **Given** the atmosphere is playing, **When** the visitor activates pause, **Then** the
   video pauses, any auto-advance is held, and resume continues playback.

---

### User Story 3 - The stage follows the calendar (Priority: P2)

The artist schedules which entry opens the site on given days — Halloween, a date range
around a release, every Friday. Visitors on that day (Europe/Berlin) land on that entry
without a redeploy. Without scripting, the static default shows.

**Why this priority**: Makes the site feel alive and campaign-ready without code changes.

**Independent Test**: Add a `date` rule for today at the top of the schedule and hard
reload; confirm the scheduled entry and its theme are active.

**Acceptance Scenarios**:

1. **Given** rules for today exist, **When** the landing loads with scripting, **Then**
   the winner is chosen by priority: specific date → date range → weekday → static
   default (`default: true`), first match in file order within a tier.
2. **Given** a rule references a missing or unusable entry, **When** the site builds,
   **Then** the build fails naming the bad id.
3. **Given** the visitor switched entries, **When** they reload, **Then** the scheduled
   default for today applies again (picks are not remembered).

---

### User Story 4 - Developer adds a new mood as a theme pack (Priority: P2)

A developer defines a new pack once — id, color/surface tokens, capabilities — and the
artist can then bind any jukebox entry to it by `themeId`.

**Why this priority**: Keeps visual variety cheap without refactoring.

**Independent Test**: Add a pack to the registry and its token block; point an entry at
it; confirm it applies as a whole and an unknown id falls back to `default`.

**Acceptance Scenarios**:

1. **Given** a complete pack, **When** an entry uses its id, **Then** all of its tokens
   and capabilities apply together (no mixing with the previous pack).
2. **Given** an unknown or incomplete `themeId`, **When** the entry is active, **Then** the
   full `default` pack applies and the page stays usable.

---

### Edge Cases

- Entry without video sources, or pack without looping video → poster only; the mute
  control is not offered for that entry.
- Pack allows audio but the entry is `hasAudio: false` → muted bed; laptop keeps the mute
  control visible but disabled so the player width never jumps.
- The muted video is pre-buffered so the first unmute starts promptly.
- Reduced motion turns on mid-visit → video pauses to the poster.
- No schedule rules (`"rules": []`) → static default only.
- Schedule evaluation always uses Europe/Berlin, never the visitor's clock zone.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The landing MUST render a full-bleed atmosphere layer behind all chrome:
  looping muted video when allowed, otherwise the entry's poster.
- **FR-002**: Looping video MUST play only when motion is allowed, the entry has sources,
  and its theme pack has `loopingVideo`; playback failure or blocked autoplay MUST fall
  back to the poster.
- **FR-003**: Audio MUST NOT start without an explicit visitor action. Unmute MUST be
  offered only when the pack is `audioEligible`, the entry has `hasAudio`, and video is
  playing.
- **FR-004**: Laptop widths MUST offer a volume slider beside mute in space reserved from
  first paint; phone widths MUST offer mute/unmute only at 50% volume.
- **FR-005**: Mute state MUST survive switching between entries for the visit and MUST NOT
  persist across reloads.
- **FR-006**: Visitors MUST be able to pause and resume the atmosphere video; while
  paused, the stage MUST NOT auto-advance.
- **FR-007**: A theme pack MUST define a stable id, color/surface tokens (background,
  surface, border, text, muted text, accent, scrim) and capabilities (`loopingVideo`,
  `audioEligible`, `hudGlitch`) in one registry; the active pack MUST apply as a whole via
  `data-theme` / `data-hud-glitch` on the document.
- **FR-008**: Unknown or incomplete theme ids MUST resolve to the full `default` pack.
- **FR-009**: Shipped packs: `default`, `nightmare-crimson` (only pack with HUD glitch),
  `cyan-pulse`, `electric-cyan`, `steel-slate`, `acid-lime`.
- **FR-010**: The stage schedule MUST live in one data file with `date` (`MM-DD` yearly or
  `YYYY-MM-DD`), `range` (inclusive), and `weekday` (ISO 1–7) rules mapping to jukebox ids,
  evaluated client-side in Europe/Berlin with priority date → range → weekday → static
  default.
- **FR-011**: The build MUST fail on schedule rules that reference unknown jukebox ids or
  invalid dates; at runtime an unusable match MUST fall back without blanking the stage.
- **FR-012**: Server render and no-JS MUST show the static default (`default: true`, else
  the first usable entry with a build warning).
- **FR-013**: All atmosphere and audio behavior MUST be first-party media from `public/`;
  no third-party players or embeds.

### Key Entities

- **Stage entry**: a jukebox item (see `026`) providing poster, optional video sources,
  `hasAudio`, and `themeId`.
- **Theme pack**: id + tokens + capabilities; selected by `themeId`.
- **Stage schedule**: timezone + ordered rules → jukebox id.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 page loads start audible audio without a visitor action.
- **SC-002**: With reduced motion preferred, 0 looping videos play.
- **SC-003**: On a scheduled day, 100% of fresh loads with scripting land on the scheduled
  entry without a redeploy.
- **SC-004**: Adding a new pack requires changes only in the registry, the token
  stylesheet, and (optionally) the artist guide's theme table.

## Assumptions

- Clips are short loops; media lives in `public/` and is not processed by the build.
- Theme packs vary color/surface and capabilities only; per-pack typography is a
  documented extension point, not used yet.

## Known Gaps *(as of 2026-10-05)*

- Phone visitors currently have **no way to unmute**: the player (which hosts mute) is
  hidden below 1024px (see `026` Known Gaps).
- Media weight: `taking-over.mp4` 9.5 MB, `infinite.mp4` 6.7 MB, no WebM/AV1 alternatives
  (IDEA-015).
- `Show Me How` ships `hasAudio: false` (see `034`).
