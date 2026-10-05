# Feature Specification: Brand Identity, Rotating Tagline & Landing Intro

**Feature Branch**: `030-brand-identity`

**Created**: 2026-10-05

**Status**: As-built (consolidated living spec)

**Consolidates**: `006-landing-intro`, `012-rotating-tagline`, identity parts of `001`,
`004`, `013`, `020`

**Input**: Consolidation of how visitors recognize Valence: the wordmark, a rotating
subtext line with time-based easter-egg lines, and a one-time "Hi I'm Valence" portal
intro on the first visit.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor knows whose stage this is (Priority: P1)

The Valence wordmark sits in the top bar on every page. Under it, a short subtext line
gives the stage a voice and changes every 15 seconds.

**Why this priority**: Identity within seconds is the minimum promise of an artist site.

**Independent Test**: Load the landing; confirm the wordmark is visible without scrolling,
and the subtext changes every ~15 s with a fade out, then fade in.

**Acceptance Scenarios**:

1. **Given** any page, **When** it loads, **Then** the wordmark is visible in the top bar
   and has the artist name as accessible text.
2. **Given** scripting and an eligible pool, **When** 15 seconds pass after the previous
   change finished, **Then** the next line in sequence fades in after the previous one
   faded out (no crossfade, no random pick).
3. **Given** reduced motion, **When** the line changes, **Then** it swaps instantly at the
   same cadence.
4. **Given** no scripting, **When** the page renders, **Then** the fallback tagline from
   `site.json` shows.

---

### User Story 2 - Night owls and holidays get special lines (Priority: P2)

Some lines only appear at certain times: Halloween, Christmas, Friday nights, late at
night, 04:20. When one such line matches, it is mixed into the normal rotation; when
several match, only those rotate.

**Why this priority**: Small surprises reward repeat visits and fit the brand.

**Independent Test**: Add an egg line with a `time` rule covering now; confirm it appears
in rotation alongside normal lines. Add a second matching egg; confirm only the eggs
rotate.

**Acceptance Scenarios**:

1. **Given** exactly one egg matches now (Europe/Berlin), **When** the rotation runs,
   **Then** the egg is shown first, followed by the normal pool.
2. **Given** two or more eggs match, **When** the rotation runs, **Then** only matching
   eggs rotate.
3. **Given** an egg has several rules, **When** evaluated, **Then** all rules must match.

---

### User Story 3 - First visit opens with a portal intro (Priority: P2)

On a first visit to the landing, a white sheet covers the screen with "Hi I'm" and the
name "Valence" cut out of it, so the stage shows through the letters. The camera zooms into
the name and the stage takes over. It plays once per browser and can be skipped.

**Why this priority**: A memorable, branded first impression — but never a barrier.

**Independent Test**: Clear site data and load `/`; confirm the intro plays in 2–4 s and
then never again on reload. Click during the intro; confirm it ends immediately.

**Acceptance Scenarios**:

1. **Given** a first visit with motion allowed and scripting, **When** `/` loads, **Then**
   the portal intro plays and ends with the fully interactive stage.
2. **Given** the intro is playing, **When** the visitor clicks, taps, or presses Escape,
   **Then** it ends immediately.
3. **Given** the intro completed or was skipped, **When** the visitor returns, **Then** it
   does not replay.
4. **Given** reduced motion, no scripting, or a deep link to a panel or legal URL, **When**
   the page loads, **Then** no intro plays.

---

### Edge Cases

- Empty intro name in content → no intro.
- Rub easter egg succeeds → the subtext is pinned to a special line for the rest of the
  page session (see `032`).
- Next line equals current line → no transition.
- Development builds only: `?replay-intro` forces one playback, `/dev/intro` clears the
  flag; production ignores both.
- Shuffle/advance clocks are held while the intro runs (see `026`).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The wordmark MUST appear in the top bar on every page (see `027`).
- **FR-002**: The subtext MUST come from `src/data/tagline-pool.json`: normal lines (no
  rules, optional positive `weight` = consecutive steps) and egg lines (rules `date`,
  `range`, `weekday`, `time` incl. cross-midnight; all must match), evaluated in
  Europe/Berlin.
- **FR-003**: The eligible set MUST follow: ≥2 matching eggs → eggs only; exactly 1 → that
  egg then the weighted normal pool; none → weighted normal pool; empty → `site.json`
  tagline with no rotation.
- **FR-004**: Rotation MUST advance every 15 s in production (dev may be faster), in file
  order, scheduling the next step after the previous transition completes; fade out then
  fade in with combined duration ~0.6–1.2 s.
- **FR-005**: The build MUST reject invalid pool entries (empty text, bad date/time, inverted
  ranges, non-positive weights, empty rule arrays on eggs).
- **FR-006**: The intro MUST play only on `/`, only on the first visit per browser
  (`localStorage` flag), only with motion allowed and scripting; skip via click/tap/Escape
  MUST set the same flag.
- **FR-007**: The intro MUST use a full-viewport white sheet with the name as a portal
  cut-out, zoom into the name from its center, and finish within ~2–4 s; lead and name
  copy (`introLead`, `introName`) come from UI chrome; viewport-specific timing lives in
  one config.
- **FR-008**: The intro MUST NOT play audio, trap focus, or remove the stage from the DOM.
- **FR-009**: Taglines and intro MUST NOT use cookies, tracking, or analytics.

### Key Entities

- **Tagline line**: text, optional weight (normal), optional rules (egg).
- **Intro flag**: first-party `localStorage` key marking the intro as seen.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A first-time visitor names the artist within 5 seconds.
- **SC-002**: The intro never plays twice in the same browser (unless site data is
  cleared).
- **SC-003**: Subtext never causes horizontal scrolling at 320px.

## Assumptions

- The flag is a UX preference, not personal data; the privacy text should still mention it
  once legal texts are finalized.

## Known Gaps *(as of 2026-10-05)*

- A normal pool line says "Electronic moods from Augsburg." while `site.json` and About say
  Berlin.
