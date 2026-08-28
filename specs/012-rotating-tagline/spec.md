# Feature Specification: Rotating Identity Subtext

**Feature Branch**: `012-rotating-tagline`

**Created**: 2026-08-28

**Status**: Draft

**Input**: User description: "Change the subtext under Valence to different text over time,
with easter-egg messages that only appear on certain days or times of day."

## Clarifications

### Session 2026-08-28

- Q: How often should the subtext change? → A: **Every 60 seconds** while the visitor keeps
  the page open (continuous rotation, not once per day).
- Q: What happens when the line changes? → A: **Sequential fade** — the current line fades
  to fully transparent, **then** the next line fades in at the same position (not a
  crossfade overlap).
- Q: Which lines participate in rotation? → A: Build an **eligible set** for the current
  Berlin moment: if any easter-egg lines match, **all** matching easter eggs rotate (file
  order); otherwise the **normal** pool rotates. When the eligible set has only one line,
  the timer still runs but no visible change occurs until eligibility or index advances.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitors see rotating identity subtext (Priority: P1)

A visitor opens a page with the identity chrome. Instead of a fixed hook under the artist
name, they see short lines from a curated pool that **advance every 60 seconds** while they
stay on the page. Each change uses a calm transition: the outgoing line fades out completely,
then the incoming line fades in at the same spot.

**Why this priority**: Rotating copy with a deliberate transition is the core product intent.

**Independent Test**: Configure at least two normal pool lines, load the page, wait ≥60 seconds
twice, confirm two transitions with fade-out then fade-in.

**Acceptance Scenarios**:

1. **Given** the tagline pool contains multiple normal lines and no easter egg matches now,
   **When** a visitor stays on the page with scripting enabled, **Then** the subtext advances
   to the next eligible line **every 60 seconds** in pool file order (weighted lines consume
   proportionally more steps — see FR-007).
2. **Given** the subtext is about to change, **When** the 60-second interval elapses,
   **Then** the current line fades to **fully transparent**, **then** the next line fades
   in from transparent to opaque at the same layout position (sequential, not crossfade).
3. **Given** the next line equals the current line (only one eligible line), **When** the
   interval elapses, **Then** no fade animation runs and the text stays visible unchanged.
4. **Given** the chosen line contains the phrase ` for ` (e.g. “coming for you”), **When** it
   is displayed, **Then** the layout keeps “for” and the following word on one line (same
   readability rule as today’s fixed tagline).
5. **Given** the subtext is shown, **When** the visitor views the identity chrome, **Then** it
   remains a single short line without horizontal scroll at 320px viewport width.

---

### User Story 2 - Scheduled easter eggs appear at the right time (Priority: P1)

On special days or times, **matching easter-egg lines** join (or replace) the rotation set —
for example Halloween lines on 31 October, holiday copy during a date range, Friday-only
quips, or late-night messages between 22:00 and 04:00 Berlin time. When no easter egg
matches, rotation uses the normal pool only.

**Why this priority**: Scheduled surprises were an explicit owner request and differentiate
this from a generic rotator.

**Independent Test**: Add two easter-egg lines matching “now”, load the site, confirm rotation
cycles through those eggs and not the normal pool until rules stop matching.

**Acceptance Scenarios**:

1. **Given** one or more easter-egg lines match the current Berlin calendar and clock,
   **When** rotation runs, **Then** only **matching** easter-egg lines are eligible (normal
   pool is excluded until no easter egg matches).
2. **Given** an easter-egg line has a calendar **date** rule matching today in
   Europe/Berlin, **When** rotation is eligible, **Then** that line is included in the
   easter-egg rotation set.
3. **Given** an easter-egg line has an inclusive **date range** rule covering today,
   **When** rotation runs on any day within the range, **Then** that line remains eligible.
4. **Given** an easter-egg line has a **weekday** rule matching today’s ISO weekday
   (Monday=1 … Sunday=7), **When** rotation runs on that weekday, **Then** that line is
   eligible.
5. **Given** an easter-egg line has a **time-of-day** window (including windows that cross
   midnight, e.g. 22:00–04:00), **When** the Berlin clock is inside the window, **Then** that
   line is eligible; outside the window it is not.
6. **Given** an easter-egg line lists multiple rules on one entry, **When** eligibility is
   evaluated, **Then** **all** rules on that entry MUST match (combined AND logic).
7. **Given** multiple easter-egg lines match at the same moment, **When** rotation runs,
   **Then** **all** matching lines rotate in **file order** (not only the first match).
8. **Given** a time or calendar rule stops matching (e.g. leaving the 22:00–04:00 window),
   **When** the next rotation tick re-evaluates eligibility, **Then** the eligible set
   updates to the current normal pool or fallback without requiring a reload.

---

### User Story 3 - Artist maintains lines in one place (Priority: P2)

The artist or editor adds, edits, or removes subtext lines and schedule rules in a single
structured data file. They do not edit layout components to change hooks, timing, or easter
eggs.

**Why this priority**: Constitution Principle III requires one-place content updates.

**Independent Test**: Change only the tagline pool file, publish or refresh dev preview,
confirm new or updated copy appears in rotation without component edits.

**Acceptance Scenarios**:

1. **Given** a new normal pool line is added to the tagline pool file, **When** the site is
   published, **Then** that line appears in the normal rotation cycle.
2. **Given** an easter-egg line’s schedule rules are updated, **When** the site is published,
   **Then** the new eligibility window applies without code changes.
3. **Given** the publish/build validation runs, **When** the pool file contains invalid dates,
   times, empty text, or malformed rules, **Then** the build fails with a clear error before
   the site ships.
4. **Given** the tagline pool file is empty or contains no usable normal lines and no easter
   egg matches, **When** a page loads, **Then** the site shows the safe default tagline from
   `artist.tagline` in `site.json` (unchanged fallback role for that field).

---

### User Story 4 - Site stays usable without scripting and with reduced motion (Priority: P2)

Visitors without scripting still see readable identity chrome. Visitors who prefer reduced
motion still get rotating copy on the same 60-second cadence but **without** fade animations.

**Why this priority**: The identity subtext is always visible chrome; accessibility paths must
hold.

**Independent Test**: Disable scripting → static fallback tagline. Enable reduced motion →
60s rotation with instant text swap, no opacity transition.

**Acceptance Scenarios**:

1. **Given** scripting is unavailable, **When** a page with identity chrome loads, **Then**
   the visitor sees the default tagline from `site.json`, rotation does not run, and the page
   remains fully usable.
2. **Given** scripting is available and motion is allowed, **When** the first pool line is
   applied after load, **Then** the update completes promptly without leaving the subtext
   indefinitely blank (SSR may show fallback until the first client line appears).
3. **Given** `prefers-reduced-motion: reduce` is active, **When** the subtext advances every
   60 seconds, **Then** copy changes with an **instant** swap (no opacity fade-out or fade-in).
4. **Given** any displayed subtext line, **When** a visitor reads the identity chrome, **Then**
   no legally required or safety-critical information is conveyed **only** through easter-egg
   lines.

---

### Edge Cases

- Pool file missing or unparsable at build time: build MUST fail; live site MUST NOT ship with
  a broken pool.
- Easter-egg rule matches but text is whitespace-only: treat as invalid at build time.
- Very long pool line: MUST wrap or truncate gracefully without breaking the stage layout or
  causing horizontal scroll at 320px; editor guidance SHOULD recommend short hooks.
- Clock changes at midnight Berlin or DST transitions: eligibility MUST re-evaluate using
  Europe/Berlin consistently (feature `007` convention).
- Visitor loads exactly at a time-window boundary (e.g. 22:00:00): inclusive start/end
  behavior MUST be documented and consistent.
- Only easter-egg lines exist, none match now: fall back to `artist.tagline` default (no
  rotation until pool has eligible lines).
- Normal pool has weighted entries: higher weight → more steps per full rotation cycle (see
  FR-007).
- Tab backgrounded / timer throttling: rotation MAY drift while hidden; MUST catch up or
  fire at next visible tick without stacking multiple fades (implementation chooses, but MUST
  NOT queue overlapping fade sequences).
- Visitor navigates away before fade completes: timer and animations MUST clean up (no leaks).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The identity subtext under the artist name MUST be chosen from a structured
  **tagline pool** data file, not hard-coded in components.
- **FR-002**: The pool MUST support two line classes: **normal** lines (no rules) and
  **easter-egg** lines (one or more schedule rules — all must match when present).
- **FR-003**: Schedule evaluation MUST use **Europe/Berlin** as the calendar and clock
  timezone, consistent with feature `007`.
- **FR-004**: Easter-egg rule types MUST include: **date** (`MM-DD` yearly or `YYYY-MM-DD`
  one-off), **range** (inclusive `from` / `to` full dates), **weekday** (ISO weekday
  integers 1–7), and **time** (inclusive `HH:MM` windows, including cross-midnight ranges).
- **FR-005**: At each rotation tick, the site MUST build an **eligible set**: all easter-egg
  lines whose rules all match now, in file order; if that set is empty, all **normal** lines
  expanded per **FR-007** weight rules, in file order.
- **FR-006**: While scripting is available and the eligible set has at least one line, the
  site MUST advance the displayed subtext **every 60 seconds** to the next entry in the
  eligible rotation sequence (wrap after the last entry).
- **FR-007**: Normal lines MAY specify optional positive integer **weight** (default `1`);
  the rotation sequence MUST expand each normal line to `weight` consecutive steps before
  advancing to the next line. **Weight applies to normal lines only**; ignore `weight` on
  easter-egg lines in v1.
- **FR-008**: When the eligible set is empty, the site MUST display `artist.tagline` from
  `site.json` and MUST NOT run rotation until at least one pool line becomes eligible.
- **FR-009**: Without scripting, pages MUST show `artist.tagline` from `site.json` only (no
  rotation, no pool resolution).
- **FR-010**: Publish/build validation MUST reject invalid pool entries: empty text, bad date
  or time formats, inverted date ranges, non-positive weights, and empty `rules` arrays on
  easter-egg entries.
- **FR-011**: The feature MUST apply wherever the identity chrome (name + subtext) is shown
  today, including the landing and legal overlay routes that reuse the same hero chrome.
- **FR-012**: Subtext selection MUST NOT persist visitor identity, MUST NOT use cookies, and
  MUST NOT add analytics or tracking.
- **FR-013**: Subtext rotation MUST NOT alter jukebox selection, intro playback, theme packs,
  or other stage behavior from features `002`–`011`.
- **FR-014**: Artist-facing documentation MUST be updated when this feature ships to describe
  the tagline pool file, 60-second rotation, fade behavior, rule types, and fallback
  (constitution VII).
- **FR-015**: When motion is allowed and the displayed text changes, the outgoing line MUST
  animate opacity to **0**, then the incoming line MUST animate opacity from **0** to **1** at
  the same layout position. The two phases MUST NOT overlap (no crossfade).
- **FR-016**: When `prefers-reduced-motion: reduce` is active, FR-015 MUST be skipped;
  subtext changes MUST use an instant swap while preserving the 60-second cadence (FR-006).
- **FR-017**: When the next line equals the current line, the site MUST skip FR-015 and leave
  the subtext visible unchanged.
- **FR-018**: Total fade-out plus fade-in duration SHOULD stay short (target roughly 0.6–1.2 s
  combined) so rotation feels responsive. The next 60-second rotation step MUST be scheduled
  **after** the previous transition completes (fade included), so fades never compress the
  minute cadence.

### Key Entities

- **Tagline pool**: Structured list of subtext lines plus timezone (`Europe/Berlin`); the
  single editor-maintained source for rotating copy.
- **Normal line**: Short hook text; optional weight; joins the rotation when no easter egg
  matches.
- **Easter-egg line**: Short hook text; required non-empty `rules` array; joins rotation when
  every rule on that entry matches the current Berlin calendar and clock.
- **Eligible set**: Derived list of pool lines that may rotate at the current moment.
- **Schedule rule**: Typed constraint (`date`, `range`, `weekday`, `time`) on easter-egg
  lines; semantics aligned with feature `007` where types overlap, plus **time** windows.
- **Default tagline**: `artist.tagline` in `site.json`; SSR/no-JS fallback when nothing is
  eligible.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With at least two eligible normal lines and motion allowed, testers who stay on
  the page observe a subtext change at least every 60 seconds with fade-out then fade-in on
  100% of observed transitions (excluding same-line skips).
- **SC-002**: With at least two easter-egg lines matching “now”, 100% of 60-second rotation
  cycles include only those easter eggs (normal pool excluded) until rules stop matching.
- **SC-003**: With scripting disabled, 100% of page loads show the `site.json` default
  tagline with no blank subtext and no rotation.
- **SC-004**: With `prefers-reduced-motion: reduce`, 100% of subtext advances use instant swap
  with no opacity animation.
- **SC-005**: Editors can add or change a pool line in one data file and see it in rotation
  after publish without editing components.
- **SC-006**: Invalid pool data causes 100% of publish/build checks to fail before release,
  with an error message identifying the offending line or rule.
- **SC-007**: Identity subtext remains readable without horizontal scroll at 320px width for
  all shipped pool lines and the default fallback.

## Assumptions

- The identity chrome remains the compact top-left HUD from feature `009` (wordmark + single
  subtext line); this feature adds **rotation timing and fade motion** to copy selection, not
  a layout redesign.
- `artist.tagline` in `site.json` remains the canonical default and no-JS fallback.
- Calendar and weekday rule shapes mirror feature `007` so editors learn one scheduling
  vocabulary.
- Rotation and eligibility require **client-side** evaluation (Berlin clock, 60 s timer,
  fade). SSR shows the fallback until the client controller starts.
- The 60-second cadence applies per open page; reload resets the rotation index and timer.
- Easter-egg lines are marketing flavor, not sole carriers of legal or safety-critical info.
- Optional dev-only interval override (e.g. faster rotation in dev) MAY be added in planning
  but is not required for v1 visitor behavior.

## Dependencies

- **001-website-skeleton** — `site.json` artist profile and Hero identity chrome.
- **004-landing-content-layout** — stage identity region and tagline placement.
- **007-scheduled-stage-default** — shared Europe/Berlin schedule conventions.
- **009-desktop-stage-ui** — identity HUD placement and single-line subtext styling.

## Out of Scope

- Crossfade or simultaneous overlap of old and new subtext (sequential fade only).
- Persisting rotation index across reloads, tabs, or devices.
- Rotating the artist **name** or wordmark; only the subtext hook changes.
- Subtext on pages that do not render the identity chrome today.
- Visitor-facing UI to browse the full pool or reset easter eggs.
- Replacing `artist.tagline` in SEO/meta description logic unless separately specified.
- Reusing jukebox schedule file for taglines (separate pool file; may share rule **shapes**).
- Typewriter or glitch-specific transition effects on subtext change (generic opacity fade
  only in v1).
