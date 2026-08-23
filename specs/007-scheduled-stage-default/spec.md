# Feature Specification: Scheduled Stage Default

**Feature Branch**: `007-scheduled-stage-default`

**Created**: 2026-08-23

**Status**: Ready

**Input**: User description: "Schedule which jukebox entry (background atmosphere and bound
theme) is the landing default for given dates, date ranges, and recurring day-of-week rules.
Maintain the schedule in a single structured data file. Use Europe/Berlin as the calendar
timezone. The scheduled default MUST change on the correct calendar day without requiring a
new deploy. Manual jukebox selection MUST still override the scheduled default for that page
visit. Invalid schedule entries MUST fall back safely and never leave the landing blank."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor sees the right atmosphere for today (Priority: P1)

A visitor opens the landing page on a day that has a scheduled default. The site loads with
that jukebox entry as the active atmosphere and matching visual theme — the same experience
as if an editor had manually set that entry as today’s default. Lyrics, discography binding,
and mute behavior follow the active entry’s existing rules.

**Why this priority**: The calendar schedule is worthless unless visitors actually see the
intended seasonal or campaign atmosphere on the correct day.

**Independent Test**: Configure a rule for “today” pointing at a non-default jukebox entry,
publish, open the landing in a fresh session, confirm that entry is active on first load.

**Acceptance Scenarios**:

1. **Given** a schedule rule matches today’s date in Europe/Berlin and scripting is available,
   **When** a visitor loads the landing, **Then** that rule’s jukebox entry is the active
   atmosphere and theme before the first manual jukebox interaction (SSR may briefly show
   the static fallback until client resolution applies; see Assumptions).
2. **Given** a schedule rule matches today and references an entry with audio, **When** the
   landing loads, **Then** mute behavior matches existing rules for that entry (muted until
   the visitor unmutes).
3. **Given** a schedule rule matches today and references an entry with no looping video,
   **When** the landing loads, **Then** the poster/static fallback for that entry is shown
   without breaking layout or leaving a blank stage.
4. **Given** the calendar day changes at midnight Europe/Berlin, **When** a visitor loads
   the landing on the new day without a new deploy, **Then** the default atmosphere reflects
   the new day’s matching rule (or fallback when no rule matches).

---

### User Story 2 - Artist edits the schedule in one place (Priority: P1)

The artist or editor updates a single structured schedule file to time campaigns, holidays,
or recurring moods. They do not edit layout, program logic, or individual jukebox entry files
to change which clip is “today’s default.”

**Why this priority**: Constitution Principle III requires one-place content maintenance;
without it the feature adds developer overhead instead of artist autonomy.

**Independent Test**: Add or change a date rule in the schedule file, publish, confirm the
landing default follows the update.

**Acceptance Scenarios**:

1. **Given** the schedule file lists a jukebox entry id for a specific calendar date,
   **When** the site is published, **Then** that entry becomes the scheduled default on
   that date.
2. **Given** the schedule file defines a date range (inclusive start and end), **When** a
   visitor loads the landing on any day within the range, **Then** the range’s jukebox entry
   is the scheduled default.
3. **Given** the schedule file defines a recurring day-of-week rule (e.g. every Friday),
   **When** a visitor loads the landing on a matching weekday, **Then** that rule’s jukebox
   entry is the scheduled default.
4. **Given** the schedule file is updated to point at a different jukebox entry for an
   upcoming date, **When** the site is published before that date, **Then** the new entry
   applies on that date without further code changes.

---

### User Story 3 - Manual jukebox choice still wins (Priority: P2)

A visitor who uses the jukebox to pick a different track keeps that choice for the rest of
the current page visit. The scheduled default does not fight or reset their selection while
they stay on the landing.

**Why this priority**: Scheduled defaults set the mood; the jukebox is the visitor’s
explicit override. Both must coexist without confusion.

**Independent Test**: On a day with a scheduled default, open the jukebox, select another
entry, confirm atmosphere and UI sync to the selection and stay there until reload.

**Acceptance Scenarios**:

1. **Given** a scheduled default is active, **When** the visitor selects a different jukebox
   entry, **Then** atmosphere, theme, lyrics panel, and related UI update to the chosen
   entry.
2. **Given** the visitor changed away from the scheduled default, **When** they continue
   using panels, mute, and other stage controls on the same page load, **Then** the manually
   selected entry remains active (no automatic snap-back to the schedule).
3. **Given** the visitor reloads the landing, **When** the page loads again, **Then** the
   scheduled default for today applies again (manual selection is not persisted across
   reloads; same as current jukebox behavior).

---

### User Story 4 - Safe fallbacks when the schedule is incomplete or wrong (Priority: P2)

When no rule matches today, the schedule file is empty, or a rule references an unknown or
unusable jukebox entry, the landing still loads with a valid default atmosphere. Editors
receive clear feedback at publish time when schedule data is invalid.

**Why this priority**: A broken schedule must never take down the artist’s public landing
page.

**Independent Test**: Publish with an empty schedule, with a bad jukebox id in a rule, and
with no rule for today; confirm a usable default each time.

**Acceptance Scenarios**:

1. **Given** no schedule rule matches today, **When** the landing loads, **Then** the site
   uses the configured static fallback (the jukebox entry marked as default, or another
   documented last-resort if none is marked).
2. **Given** a schedule rule references a jukebox id that does not exist or is unusable,
   **When** the site is published, **Then** maintainers see a clear **build validation
   failure** (the change MUST NOT go live), and **When** a previously valid deploy loads for
   visitors after an entry became unusable, **Then** that rule is skipped at runtime and a
   safe fallback default is used (page never blank).
3. **Given** two rules could match today, **When** the scheduled default is resolved,
   **Then** the more specific rule wins according to the documented priority order.
4. **Given** the schedule file is missing or contains no rules, **When** the landing loads,
   **Then** behavior matches the pre-feature static default (existing default flag on a
   jukebox entry).

---

### Edge Cases

- **Timezone boundary**: A visitor whose local clock differs from Europe/Berlin still gets
  the default for “today” in Europe/Berlin, not their local timezone.
- **Overlapping rules**: Specific calendar date beats date range; date range beats
  day-of-week; day-of-week beats global fallback.
- **Yearly recurring dates**: A rule for “October 31” applies every year unless a more
  specific dated rule overrides that year.
- **Inclusive date ranges**: First and last day of a range both match.
- **Invalid dates in schedule** (e.g. February 30): Rejected at publish validation with a
  clear message; do not silently match.
- **Scripting unavailable**: Landing still shows a usable default atmosphere (the static
  fallback entry baked into the published page), consistent with existing progressive
  enhancement expectations.
- **Reduced motion**: Scheduled entry selection does not force motion; existing
  poster/fallback rules for reduced motion still apply.
- **Empty jukebox collection**: Same fatal misconfiguration as today — out of scope to
  invent content; schedule must not make this worse.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST support a single structured schedule data file that maps calendar
  conditions to jukebox entry identifiers.
- **FR-002**: Schedule rules MUST support at minimum: a specific calendar date (including
  yearly recurrence), an inclusive date range, and a recurring day-of-week pattern.
- **FR-003**: All schedule evaluation MUST use the **Europe/Berlin** timezone for determining
  “today” and whether a date range or day-of-week rule applies.
- **FR-004**: The scheduled default MUST update on the correct calendar day in Europe/Berlin
  **without requiring a new deploy** solely for the date change.
- **FR-005**: When a schedule rule matches and scripting is available, the referenced jukebox
  entry MUST become the landing default atmosphere and bound theme before the first manual
  jukebox interaction (SSR may prerender the static fallback first; client resolution applies
  the scheduled entry without requiring redeploy).
- **FR-006**: Rule resolution MUST follow explicit priority: **specific date → date range →
  day-of-week → static fallback** (most specific wins within the same tier: first listed
  rule in the schedule file wins unless documented otherwise in the operator guide).
- **FR-007**: The static fallback MUST be the jukebox entry marked as default in content; if
  none is marked, the site MUST use the same last-resort selection behavior as today (first
  usable entry).
- **FR-008**: Publishing MUST validate that every jukebox id referenced in the schedule
  exists and is usable; invalid references MUST NOT ship silently.
- **FR-009**: At runtime, if a matched rule points at an entry that became unusable after
  publish, the site MUST skip that rule and fall back safely without a blank landing.
- **FR-010**: Manual jukebox selection during a page visit MUST override the scheduled default
  until the page is reloaded.
- **FR-011**: Reloading the landing MUST re-apply the scheduled default for the current
  Europe/Berlin calendar day (manual selection MUST NOT persist across reloads).
- **FR-012**: The schedule file MUST be the only place editors change timed defaults; they
  MUST NOT need to edit jukebox entry files or layout to retime a campaign.
- **FR-013**: The feature MUST NOT introduce cookies, analytics, or cross-visit tracking to
  remember schedule overrides.
- **FR-014**: When no schedule file or no rules exist, behavior MUST match the current static
  default (no regression for sites that omit scheduling).
- **FR-015**: Scheduled default selection MUST NOT block legal footer links, keyboard
  navigation, or other existing landing usability requirements.

### Key Entities

- **Stage schedule**: The single data artifact listing timezone, ordered rules, and fallback
  behavior. Edited by the artist/editor; validated at publish.
- **Schedule rule**: One mapping from a calendar condition (date, range, or weekday) to a
  jukebox entry id. Carries implicit theme binding via that entry.
- **Jukebox entry**: Existing stage catalog item (label, theme, poster/video, lyrics). Schedule
  only references its stable id; does not duplicate media fields.
- **Scheduled default**: The jukebox entry id chosen for “today” in Europe/Berlin before any
  visitor manual override.
- **Static fallback**: The jukebox entry used when no schedule rule matches or a matched rule
  is invalid — typically the entry flagged as default in jukebox content.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: For 100% of test days with a configured matching rule, first-time landing loads
  **with scripting available** show the scheduled jukebox entry as active before the first
  manual jukebox interaction, within the same perceived load time as the current static
  default (no extra full-page wait state).
- **SC-001b**: With scripting unavailable, 100% of landing loads show the static fallback
  entry with a usable atmosphere (same progressive-enhancement bar as pre-feature).
- **SC-002**: When the Europe/Berlin calendar date changes, 100% of test loads on the new day
  (without redeploy) show the new day’s scheduled default or fallback.
- **SC-003**: A non-programmer can add or change a date rule in the schedule file and see the
  updated default on the correct day after one publish cycle.
- **SC-004**: In 100% of publish attempts with an invalid jukebox id in the schedule,
  maintainers receive clear validation feedback before the change goes live.
- **SC-005**: In 100% of tested fallback scenarios (no match, bad id, empty schedule), the
  landing remains usable with a visible atmosphere — never a blank stage.
- **SC-006**: After manual jukebox selection, 100% of same-visit interactions keep the chosen
  entry until reload; after reload, 100% of visits return to the scheduled default for today.

## Assumptions

- Jukebox entries and theme packs from `004-landing-content-layout` and `005-theme-packs`
  remain the source of atmosphere and theme binding; the schedule only picks which entry is
  default.
- Europe/Berlin is fixed for v1; per-visitor local timezone is out of scope.
- Calendar accuracy without redeploy requires evaluating the schedule when the landing page
  loads in the visitor’s browser, using schedule data embedded in the published static site.
  Publish-time validation still runs so broken schedules never ship quietly.
- When the scheduled default differs from the static fallback, SSR HTML may show the fallback
  for one paint; client resolution applies the scheduled entry before interaction. This is
  acceptable for v1 and does not apply when scripting is unavailable (static fallback only).
- Optional daily scheduled rebuilds in CI are not required for v1 because client-side
  calendar evaluation satisfies FR-004; they may be added later for other reasons.
- Week-of-year rules, complex recurrence (e.g. “first Monday of month”), and remembering
  manual selection across reloads are out of scope for v1.
- The existing `default: true` flag on a jukebox entry remains the static fallback and
  backward-compatible behavior when scheduling is unused.

## Dependencies

- **002-themed-background-video** — atmosphere layer, mute model, poster/video playback.
- **004-landing-content-layout** — jukebox catalog, stage switcher, lyrics sync, default
  entry flag.
- **005-theme-packs** — theme binding per jukebox entry (schedule inherits via entry id).

## Out of Scope

- Week-of-year or advanced recurrence patterns beyond date, range, and day-of-week.
- Per-visitor timezone selection or geo-based scheduling.
- Persisting manual jukebox selection across page reloads or browser sessions.
- Admin UI, CMS, or visual calendar editor (data file only for v1).
- Scheduled changes to copy, tour dates, or non-atmosphere content.
- Server-side scheduling, databases, or paid cron services.
- Requiring daily deploys as the only way to flip the default (explicitly excluded).
