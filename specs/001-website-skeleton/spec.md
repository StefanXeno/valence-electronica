# Feature Specification: Website Skeleton for Valence

**Feature Branch**: `001-website-skeleton`

**Created**: 2026-08-07

**Status**: Draft

**Input**: User description: "Set up the skeleton of a static artist website for Valence, an electronic music artist from Augsburg, Germany (bandcamp: https://valenceelectronica.bandcamp.com/). The site must be publicly reachable without running own infrastructure and must publish automatically whenever content changes. Real assets (photos, logo, final copy) are not available yet, so the skeleton starts with placeholders that can be swapped later without structural changes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor gets to know the artist (Priority: P1)

A visitor (fan, promoter, or curious listener) opens the website and immediately understands
whose site this is: the artist name "Valence", a short tagline/description, and a visual
style that fits electronic music. The page works equally well on a phone and on a desktop.

**Why this priority**: Without a reachable page with a recognizable identity there is no
product. This story is the minimum shareable result ("the site is live, send the link").

**Independent Test**: Open the public URL on a smartphone and a desktop browser and verify
that the artist name, tagline, and styling are visible and readable.

**Acceptance Scenarios**:

1. **Given** the site is published, **When** a visitor opens the public URL, **Then** they
   see the artist name and a short description without scrolling.
2. **Given** a visitor uses a smartphone, **When** they open the page, **Then** content is
   displayed without horizontal scrolling and in a readable font size.
3. **Given** the link is shared on social media or in a messenger, **When** the link preview
   is generated, **Then** it shows the page title and description.

---

### User Story 2 - Visitor finds music and social channels (Priority: P2)

A visitor wants to listen to Valence's music or follow him. The page shows clearly
recognizable links to his music platforms (Bandcamp is known:
https://valenceelectronica.bandcamp.com/; others like Spotify or SoundCloud to be confirmed)
and social media profiles. Entries whose real links are not yet known exist as placeholders
and are recognizable as such.

**Why this priority**: The main purpose of the site is to lead visitors to the music.
Without these links the page is a dead end.

**Independent Test**: On the published page, click each channel link and verify that it
opens the target (or the defined placeholder behavior) in a new tab.

**Acceptance Scenarios**:

1. **Given** the page is open, **When** the visitor navigates to the channels section,
   **Then** they see a list of music platforms and social channels with recognizable labels
   and matching brand marks (icons) where a mark is mapped for that channel.
2. **Given** a real platform link is configured (e.g. Bandcamp), **When** the visitor clicks
   it, **Then** the artist's profile opens in a new tab.

---

### User Story 3 - Operator publishes changes without infrastructure work (Priority: P2)

The operator (the developer, later the artist himself) changes a piece of content — e.g.
the tagline or a platform link. After the change lands in the project's main line, it
becomes visible on the public site shortly afterwards, without anyone operating a server,
uploading files manually, or paying running costs.

**Why this priority**: "No infrastructure effort" is the core reason for the chosen
approach. Without automated publishing every change would require manual deployment.

**Independent Test**: Change a visible text in the project, merge the change, and verify it
appears on the public URL without any further manual steps.

**Acceptance Scenarios**:

1. **Given** automated publishing is set up, **When** a content change is merged into the
   project's main line, **Then** the change is visible on the public URL within 10 minutes.
2. **Given** a broken change fails to publish, **When** a visitor opens the site, **Then**
   they still see the last working version.

---

### User Story 4 - Visitor finds legally required information (Priority: P3)

A visitor (or a third party looking for grounds to send a cease-and-desist) looks for the
legally required information. Since the site publicly represents an artist based in
Germany, an Impressum and a Datenschutzerklärung are reachable from every page. Until the
real details are provided, both pages exist as clearly marked placeholders.

**Why this priority**: Legally relevant in Germany, but not blocking for the first internal
preview. Must be filled in before the site is actively promoted.

**Independent Test**: From the landing page, click the links to Impressum and
Datenschutzerklärung and verify both pages are reachable.

**Acceptance Scenarios**:

1. **Given** the page is open, **When** the visitor looks for legal information in the
   footer, **Then** they find links to Impressum and Datenschutzerklärung.

---

### Edge Cases

- No real assets (photos, logo) available yet → the page uses deliberately designed
  placeholders that do not look broken and can be swapped without structural changes.
- A platform link does not exist yet → the entry is hidden or visibly marked as "coming
  soon" instead of leading nowhere.
- Slow mobile connection → the page stays quickly usable due to its low weight (see
  Success Criteria).
- A publish attempt fails → the last successfully published version stays online; the
  operator can inspect the failure.
- Search engines and link previews → page title and description are maintained; the
  placeholder version may be excluded from search indexing until real content exists.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The website MUST be reachable under a stable public URL without operating own
  server infrastructure and without recurring hosting costs.
- **FR-002**: The landing page MUST show the artist name "Valence", a short
  tagline/description, and a visual design that fits electronic music.
- **FR-003**: The landing page MUST contain a section for music platform links and social
  channels; entries MUST be individually maintainable (add, change, hide). Each entry MUST
  have a stable `id`, visitor-facing `label`, and `status`; active entries MUST have a URL.
  Known platforms SHOULD show a first-party brand mark keyed by `id` (inline SVG; no
  third-party icon host).
- **FR-004**: External links MUST open in a new tab.
- **FR-005**: The page MUST be usable on common screen sizes (smartphone, tablet, desktop)
  without horizontal scrolling.
- **FR-006**: Content that currently exists only as a placeholder (texts, images, links)
  MUST be replaceable without changing the page structure.
- **FR-007**: Changes merged into the project's main line MUST be published automatically;
  manual deployment steps MUST NOT be required.
- **FR-008**: If publishing fails, the last working version of the site MUST stay online.
- **FR-009**: The site MUST provide Impressum and Datenschutzerklärung as separate pages
  linked from the landing page (initially as marked placeholders).
- **FR-010**: The site MUST provide a maintained title and description for search engines
  and link previews (social sharing).
- **FR-011**: The project MUST include a short guide describing how to change content and
  preview the site locally (for the operator, eventually for the artist).

### Key Entities

- **Artist profile**: name, tagline, short description; the site's central identity,
  maintainable in exactly one place.
- **Channel link**: stable platform `id`, label, target URL, visibility state
  (active/placeholder), and optional brand mark keyed by `id`; the list is extensible.
  Known active platforms: Bandcamp, SoundCloud, YouTube, Instagram, TikTok, Spotify.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The site is reachable under a public URL from any device; running costs: EUR 0.
- **SC-002**: A first-time visitor can name the artist and tell that it is about electronic
  music within 5 seconds.
- **SC-003**: A content change is publicly visible within 10 minutes after being merged
  into the main line, without manual publishing steps.
- **SC-004**: The landing page is usable within 2 seconds on an average mobile connection.
- **SC-005**: All visible links lead to a defined target; no link ends in a 404.
- **SC-006**: Replacing a placeholder (e.g. tagline or a platform link) requires changing
  exactly one place in the project and no structural changes.

## Assumptions

- The artist name is "Valence" (stage name; the project name "valence-electronica" follows
  his platform handle). Bandcamp profile: https://valenceelectronica.bandcamp.com/, based in
  Augsburg, Germany.
- Site content language is English, matching the constitution and the artist's existing
  international platform presence; Impressum and Datenschutzerklärung are in German as
  legally required.
- The site starts as a single landing page plus legal subpages; further sections (release
  detail pages, gigs, bio, presskit) follow as separate features.
- Photos/logo/final copy may still be placeholders; platform channel URLs and brand marks
  for Bandcamp, SoundCloud, YouTube, Instagram, TikTok, and Spotify are configured as
  active content in `site.json` (icons via first-party `ChannelIcon.astro`).
- Publishing uses a free static hosting service driven by the existing git repository; a
  custom domain is optional and not part of this feature.
- No visitor data is collected (no tracking, no forms); the privacy policy stays minimal
  accordingly.
