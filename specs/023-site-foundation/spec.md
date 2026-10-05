# Feature Specification: Site Foundation & Publishing

**Feature Branch**: `023-site-foundation`

**Created**: 2026-10-05

**Status**: As-built (consolidated living spec)

**Consolidates**: `001-website-skeleton`, publishing/legal/SEO parts of `002`, `004`,
`008`, `013`

**Input**: Consolidation of the shipped site foundation: a static artist website for
Valence that publishes itself from the repository, keeps a live and a preview channel,
validates content at build time, and stays legally compliant without tracking.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor reaches the artist's site anywhere (Priority: P1)

A fan, promoter, or curious listener opens the public link on a phone or a laptop and
immediately lands on Valence's stage: the brand mark, the atmosphere, and the way to the
music. Sharing the link in a messenger shows a proper preview card.

**Why this priority**: Without a reachable, recognizable page there is no product.

**Independent Test**: Open the live URL at 320px, 390px, and 1280px widths; confirm the
artist is identifiable, nothing scrolls sideways, and a shared link renders title,
description, and the share image.

**Acceptance Scenarios**:

1. **Given** the site is published, **When** a visitor opens the live URL, **Then** they
   see the Valence brand and the stage without scrolling.
2. **Given** a 320px-wide viewport, **When** the page loads, **Then** there is no
   horizontal scrolling.
3. **Given** the link is shared, **When** a preview is generated, **Then** it shows the
   page title, description, and the dedicated brand share image.

---

### User Story 2 - Changes publish themselves, with a safe preview (Priority: P1)

The operator (developer or artist) merges a change. A push to `pre-release` refreshes a
non-indexed preview under `/pre-release/`; a push to `main` refreshes the live site. Nobody
uploads files or runs servers, and a broken build never takes the live site down.

**Why this priority**: Zero-ops publishing is the reason for the chosen architecture
(constitution I and II).

**Independent Test**: Push a visible text change to `pre-release`; confirm it appears under
`/pre-release/` and not on the live root. Promote to `main`; confirm it appears live.

**Acceptance Scenarios**:

1. **Given** a change lands on `main`, **When** the deploy finishes, **Then** the change is
   visible on the live URL within about 10 minutes without manual steps.
2. **Given** a change lands on `pre-release`, **When** the deploy finishes, **Then** it is
   visible under `/pre-release/` and the live root is still built from `main`.
3. **Given** the preview branch fails to build, **When** the deploy runs, **Then** the live
   site still deploys and only the `/pre-release/` path is missing.
4. **Given** the live branch fails to build, **When** a visitor opens the site, **Then**
   they see the last successfully deployed version.

---

### User Story 3 - Visitor finds the legally required pages (Priority: P2)

A visitor (or anyone checking compliance) can reach the Impressum and the
Datenschutzerklärung from every view of the site, and each also has a shareable URL.

**Why this priority**: Legal requirement for a German artist (constitution V); must hold
before the site is promoted.

**Independent Test**: From the landing on phone and laptop, open Imprint and Privacy from
the navigation; also load `/legal/imprint` and `/legal/privacy` directly.

**Acceptance Scenarios**:

1. **Given** any view of the site, **When** the visitor looks for legal information,
   **Then** Imprint and Privacy Policy entries are reachable from the navigation.
2. **Given** a direct visit to `/legal/{slug}`, **When** the page loads, **Then** the legal
   text opens in the same panel over the stage, and closing it returns to the landing.

---

### User Story 4 - Broken content never blanks the site (Priority: P2)

Someone edits a content file and makes a mistake. Structural mistakes (wrong field type,
invalid URL, unknown schedule id) fail the build with a message naming the file, so the
last good version stays live. Missing optional pieces simply hide that piece.

**Why this priority**: The artist edits content without programming knowledge; the site
must be forgiving where possible and loud where necessary.

**Independent Test**: Introduce an invalid URL in a content file and run the build;
confirm it fails naming the file. Remove an optional field; confirm the item renders
without it.

**Acceptance Scenarios**:

1. **Given** a content file violates its schema, **When** the build runs, **Then** it
   fails and names the offending file.
2. **Given** a list item lacks a required field that the page logic checks (e.g. a show
   without a venue), **When** the site builds, **Then** that item is omitted with a build
   warning and the rest of the page renders.
3. **Given** a content folder is empty, **When** the site builds, **Then** the matching
   section shows its empty state and the build emits no collection error.

---

### Edge Cases

- Preview and live share one origin → the preview MUST always be `noindex`, regardless of
  the indexing switch.
- The indexing switch (`seo.indexable`) is off until launch → every page carries
  `noindex`.
- A fork builds the site → the site origin resolves from the repository owner in CI; an
  unresolved owner fails the build instead of shipping broken canonical URLs.
- JavaScript disabled → pages still render statically; legal pages remain reachable via
  their own URLs.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Every deployable artifact MUST be prerendered static files served from a free
  static host (GitHub Pages); no server, database, or runtime backend.
- **FR-002**: A push to `main` MUST rebuild and deploy the live site root; a push to
  `pre-release` MUST rebuild a preview under `/pre-release/` in the same deployment while
  the root is always rebuilt from `main`.
- **FR-003**: A failed preview build MUST NOT block the live deployment; a failed live
  build MUST leave the previous deployment online.
- **FR-004**: The preview MUST always be marked `noindex`; the live site MUST follow the
  single `seo.indexable` switch.
- **FR-005**: Every page MUST provide title, description, canonical URL, Open Graph and
  Twitter card metadata, favicons, and a dedicated brand share image that does not depend
  on the active stage entry.
- **FR-006**: The site MUST be usable from 320px width without horizontal scrolling and
  MUST provide a dedicated phone composition below 1024px and a laptop composition from
  1024px.
- **FR-007**: Impressum and Datenschutzerklärung MUST be reachable from every view and MUST
  have stable direct URLs (`/legal/imprint`, `/legal/privacy`) that open the same in-page
  panel; legal text stays in German, all other visitor copy is English.
- **FR-008**: The site MUST NOT use tracking, analytics, cookies, or third-party embeds.
  First-party `localStorage` MAY hold UX flags only (intro seen, achievements unlocked).
- **FR-009**: All visitor-facing content MUST be validated against typed schemas at build
  time; schema violations MUST fail the build naming the file.
- **FR-010**: Items that pass the schema but miss fields required for display MUST be
  omitted with a build warning instead of failing the whole page; empty content folders
  MUST be valid empty states.
- **FR-011**: Pull requests and pushes to `pre-release` MUST run type/content checks, the
  production build, and unit tests in CI before changes are promoted.
- **FR-012**: External links MUST open in a new tab with `noopener`.

### Key Entities

- **Site settings** (`site.json`): artist name, fallback tagline, description, location,
  SEO title and indexing switch, optional shop URL, contact block, channel list.
- **Publishing channel**: `main` → live root; `pre-release` → `/pre-release/` preview
  (always `noindex`).
- **Legal page**: titled Markdown page addressed by slug (`imprint`, `privacy`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Running costs stay at EUR 0; no server is operated.
- **SC-002**: A merged change is visible on its channel within 10 minutes with no manual
  step.
- **SC-003**: The landing is usable within 2 seconds on an average mobile connection
  (constitution IV) — see Known Gaps for current media weight.
- **SC-004**: 100% of navigation and legal links resolve; no 404 from in-site links.
- **SC-005**: A schema error in any content file fails CI and names the file.

## Assumptions

- The live URL is `https://<owner>.github.io/valence-electronica/`; a custom domain is not
  part of this spec.
- The site is pre-launch: `seo.indexable` is `false` until legal texts are final
  (see `docs/ideas.md` IDEA-009 / IDEA-016).
- GitHub's `github-pages` environment allows `pre-release` to deploy; the workflow, not the
  environment rule, protects the live root.

## Known Gaps *(as of 2026-10-05)*

- Impressum and Datenschutzerklärung are still placeholders (IDEA-009); launch is blocked
  on them.
- No `robots.txt` or sitemap yet (IDEA-016).
- `public/` ships ~26 MB of media (two stage videos are 6.7 MB and 9.5 MB); SC-003 is not
  reliably met on mobile (IDEA-015).
- Artist location is inconsistent across content (`site.json` and About say Berlin; a
  tagline line and the README say Augsburg).
