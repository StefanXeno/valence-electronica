# Feature Specification: Tour Dates

**Feature Branch**: `029-tour-dates`

**Created**: 2026-10-05

**Status**: As-built (consolidated living spec)

**Consolidates**: tour parts of `004-landing-content-layout`, plus post-spec tour work
(2026-09-20: year groups, locality line, `eventUrl`, required `country`/`title`/`venue`)

**Input**: Consolidation of the Tour section: every show Valence has played or will play,
grouped by year, with ticket, event, and venue links where they exist.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fan checks where Valence plays (Priority: P1)

A fan opens Tour and sees shows grouped by year, newest first. Each row shows the date,
the place (`City, CC`), the event title, and the venue. Upcoming shows with a ticket link
show a ticket button.

**Why this priority**: Ticket sales are a primary goal of the navigation (see `027`).

**Independent Test**: Add a show dated next month with a ticket URL; open Tour on laptop
and phone; confirm it is first, shows a ticket button, and opens tickets in a new tab.

**Acceptance Scenarios**:

1. **Given** shows exist, **When** Tour opens, **Then** shows are grouped by calendar year
   (newest first) and sorted newest first within a year.
2. **Given** a show has `ticketUrl` and its date is today or later (Europe/Berlin),
   **When** it renders, **Then** a ticket control opens the URL in a new tab.
3. **Given** a show's date has passed, **When** it renders, **Then** it remains listed as
   history but its ticket control is hidden.
4. **Given** `eventUrl` or `venueUrl` is set, **When** the show renders, **Then** the
   event title or venue name links to it in a new tab.

---

### User Story 2 - Artist adds a show from a template (Priority: P2)

The artist copies `shows/_example.md`, renames it without the underscore, and fills date,
city, country, title, and venue, plus optional links.

**Why this priority**: Shows change often; adding one must be trivial.

**Independent Test**: Copy the template, fill required fields, build; confirm the show
appears. Remove `venue`; confirm the show is omitted with a build warning.

**Acceptance Scenarios**:

1. **Given** a file whose slug starts with `_`, **When** the site builds, **Then** it is
   ignored.
2. **Given** a show misses a required field, **When** the site builds, **Then** it is
   omitted with a warning and the other shows render.
3. **Given** the country is a common name (e.g. "Germany"), **When** it renders, **Then**
   it shows as an ISO code (`DE`).

---

### Edge Cases

- No shows at all → Tour shows the empty-state copy (`emptyShows`).
- Empty `shows/` folder → valid empty state, no build error.
- Invalid (non-http) URLs → the link is omitted.
- Dates are compared on the Europe/Berlin calendar day.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Shows MUST come from `src/content/shows/`; required fields: `date`, `city`,
  `country`, `title`, `venue`; optional: `ticketUrl`, `eventUrl`, `venueUrl`.
- **FR-002**: Files whose slug starts with `_` MUST be ignored (templates).
- **FR-003**: All valid shows MUST be listed, grouped by year and sorted newest first.
- **FR-004**: Ticket links MUST be shown only through the show's Berlin calendar day;
  event and venue links MUST render whenever valid.
- **FR-005**: The place line MUST read `City, CC` with common country names mapped to ISO
  3166-1 alpha-2 codes.
- **FR-006**: Tour MUST be reachable from the navigation on all viewports (see `027`), with
  labels (`tourTitle`, `ticketLabel`, `venueInfoLabel`, `emptyShows`) from UI chrome.

### Key Entities

- **Show**: date, city, country, title, venue, optional ticket / event / venue URLs.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A fan reaches a ticket link for the next show in at most two actions on
  laptop and three on phone.
- **SC-002**: Adding a show takes one new file with five required fields.

## Assumptions

- Tour doubles as a performance history; there is no separate "past shows" archive.
- Times of day are not shown.

## Known Gaps *(as of 2026-10-05)*

- The helpers are still named `getUpcomingShows` / `collectUpcomingShows` although they
  return past shows too.
- All eight shipped shows are from 2025, so no ticket controls are visible today.
