# Feature Specification: Site Navigation & Content Overlays

**Feature Branch**: `027-site-navigation`

**Created**: 2026-10-05

**Status**: As-built (consolidated living spec)

**Consolidates**: `020-site-nav-chrome`, navigation/legal parts of `002`, `004`, `009`,
`015`, `019`, plus post-spec mobile menu work (2026-09-18 → 09-20)

**Input**: Consolidation of how visitors reach content: a fan-first top navigation with
the Valence wordmark, content opened as panels over the stage (with real URLs), a
fullscreen menu on phones, and social links placed where they do not compete with the
stage.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fan finds Shop and Tour at a glance (Priority: P1)

A fan arrives from a social link wanting merch or tickets. The top bar shows the Valence
wordmark and plain text destinations — Shop, Tour, About, Discography — plus Imprint and
Privacy. One click opens the destination.

**Why this priority**: Fan infrastructure (merch, tickets) is the primary goal of the
navigation; the stage is secondary.

**Independent Test**: At 1280×800, open Shop, Tour, About, and Discography from the top
bar; confirm each opens in one action without leaving the landing.

**Acceptance Scenarios**:

1. **Given** a laptop-width viewport, **When** the page loads, **Then** the top bar shows
   the wordmark and text items Shop, Tour, About (only if bio content exists),
   Discography, Imprint, Privacy Policy — no circled icon buttons.
2. **Given** a shop URL is configured, **When** the fan activates Shop, **Then** the
   external store opens in a new tab; **When** none is configured, **Then** an honest
   "Coming soon" panel opens.
3. **Given** the fan activates the wordmark, **When** a panel is open, **Then** they return
   to the stage.

---

### User Story 2 - Content opens over the stage with a shareable URL (Priority: P1)

Opening a destination shows its content in a near-fullscreen panel over the atmosphere,
with an exit control. The address bar changes to `/tour`, `/about`, `/discography`,
`/shop`, `/contact`, or `/legal/{slug}`, so the link can be shared and reloaded.

**Why this priority**: Keeps the single-stage experience while giving every section a real
URL.

**Independent Test**: Open Tour from the nav, copy the URL, load it in a new tab; confirm
the same panel opens over the stage. Use Back and Escape to close.

**Acceptance Scenarios**:

1. **Given** a destination is activated with scripting, **When** the panel opens, **Then**
   the URL updates without a full reload and Back closes the panel.
2. **Given** a direct visit to a destination URL, **When** the page loads, **Then** the
   landing renders with that panel already open.
3. **Given** a panel is open, **When** the visitor presses Escape or the exit control,
   **Then** the panel closes and the URL returns to the landing.

---

### User Story 3 - Phone visitor uses a fullscreen menu (Priority: P1)

On a phone, the top bar shows the wordmark and a hamburger. The menu slides in from the
right as a fullscreen layer: primary destinations as large rows, a quiet Imprint / Privacy
pair, and social icons at the bottom. Choosing a destination dissolves the list into that
content inside the menu; a back control (or swipe right) returns to the list.

**Why this priority**: Phones are where fans arrive; one clear menu replaces the earlier
dock of circular icons.

**Independent Test**: At 390×844, open the menu, open Tour, go back via the corner
control and via swipe right, open Privacy, close the menu with Escape / X.

**Acceptance Scenarios**:

1. **Given** a phone-width viewport, **When** the visitor taps the hamburger, **Then** a
   fullscreen menu opens with Shop, Tour, About (if present), Discography, the legal pair,
   and social icons.
2. **Given** the menu is open, **When** a destination is chosen, **Then** its content
   appears inside the menu and the corner control becomes "back".
3. **Given** reduced motion, **When** the menu opens or changes view, **Then** it snaps
   without slide or dissolve animation.

---

### User Story 4 - Visitor finds the artist's channels (Priority: P2)

Social and streaming links are visible without opening anything on laptops (icon row at
the top-right) and live in the menu footer on phones. Placeholder channels show as
non-link "coming soon" icons.

**Why this priority**: Following and listening elsewhere is a core job of an artist site.

**Independent Test**: On laptop, use each top-right icon; on phone, open the menu and use
each footer icon; all open in a new tab.

**Acceptance Scenarios**:

1. **Given** a laptop-width viewport, **When** the landing loads, **Then** active channels
   show as equal-sized icons top-right with accessible names.
2. **Given** a phone-width viewport, **When** the landing loads, **Then** no social icons
   sit on the stage; they appear in the menu footer.

---

### Edge Cases

- No bio content → About disappears from nav, menu, and routes.
- Shop URL configured → no `/shop` route is generated; Shop links out.
- Contact has a route and panel (`/contact`) but is intentionally not in the nav.
- Scripting disabled → nav links are plain links to static routes that render the landing
  with the panel open.
- Crossing the 1024px breakpoint with the menu open → the menu closes cleanly.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every page MUST show a top bar with the Valence wordmark (links home) and
  text destinations; labels come from UI chrome.
- **FR-002**: Laptop widths (≥1024px) MUST show the destinations inline; phone widths MUST
  show a hamburger that opens a fullscreen menu.
- **FR-003**: Destinations MUST be: Shop, Tour, About (when bio exists), Discography,
  Imprint, Privacy Policy. Shop MUST always be present.
- **FR-004**: Content destinations (`about`, `discography`, `tour`, `contact`, `shop`) MUST
  have top-level routes; legal pages MUST live under `/legal/{slug}`. All open the same
  overlay panel over the stage, with history integration, Escape, and an exit control.
  On laptops the panel mirrors the phone menu: a full-viewport dark layer that opens as a
  circle growing out of the clicked nav item and collapses back into it on exit (shared
  `--morph-dur` / `--morph-ease` with the phone menu); content sits in one centered column.
- **FR-005**: The phone menu MUST render destination content inside the menu (fade
  portal), offer back via the corner control and swipe right, and close via X or Escape.
- **FR-006**: Active channels from `site.json` MUST appear as icons top-right on laptops
  and in the menu footer on phones; placeholder channels MUST render as non-links with a
  "coming soon" accessible name. Icons are first-party inline SVG.
- **FR-007**: Resting chrome MUST NOT use stacks of circular side buttons for content
  navigation.
- **FR-008**: Imprint and Privacy MUST be reachable from every view (constitution V).
- **FR-009**: Nav and menu MUST NOT cover the stage center at rest.

### Key Entities

- **Destination**: slug, chrome label, route, panel content.
- **Channel**: id, label, URL, status (`active` / `placeholder`).
- **Shop setting**: optional absolute `shopUrl` in `site.json`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From a fresh landing, Shop and Tour are each reachable in one action on
  laptop and two actions on phone.
- **SC-002**: 100% of destination URLs open the correct panel on direct load.
- **SC-003**: No horizontal scrolling at 320px with the menu open or closed.

## Assumptions

- The nav was inspired by a Nasaya-style top bar (2026-09-18 feedback from Gosha and
  Hendrik): text-forward, no circled icons.

## Known Gaps *(as of 2026-10-05)*

- Tour, About, Discography, and legal content are rendered twice per page (overlay panels
  and phone menu portals), with two separate discography implementations.
- Contact has a route and copy but no data in `site.json` and no nav entry.
