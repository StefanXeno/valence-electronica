# Feature Specification: Artist Change Documentation

**Feature Branch**: `008-artist-docs`

**Created**: 2026-08-23

**Status**: Ready

**Input**: User description: "Add documentation for the artist so he knows what he can
change and what he can adjust — a durable artist-facing guide covering editable surfaces,
forbidden surfaces, local preview, and how changes reach the live site, aligned with
constitution Principle VII (Artist-Facing Change Documentation)."

## Clarifications

### Session 2026-08-23

- Q: Who is expected to get the artist’s content edits onto the live site? → A: Artist
  self-serve — merge content PRs into `pre-release`, then promote `pre-release` → `main`
  (supersedes initial “merge to main alone” wording)
- Q: Where should the guide assume the artist mainly edits files? → A: GitHub web editor
  primary; local clone secondary
- Q: When the artist opens a pull request to publish content, which branch should the guide
  tell him to merge into? → A: PRs primarily merge into `pre-release`; `main` is the
  secondary promotion target — artist and/or developer can merge `pre-release` into `main`
- Q: May the artist change a jukebox entry’s themeId to another already existing complete
  theme pack, or is any theme field developer-only? → A: Artist may select an existing
  complete themeId; creating/editing packs is developer-only
- Q: For promoting pre-release to main, what must this feature actually deliver? → A: Docs
  only — explain GitHub PR from `pre-release` → `main` (artist and/or developer)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Artist finds what he may safely edit (Priority: P1)

The artist opens the artist-facing guide and sees a clear inventory of things he may change
himself (site info, channels, bio, releases, shows, jukebox entries/lyrics/media, UI chrome
copy, legal texts, stage schedule, and similar approved surfaces). Each item points to the
file or folder to touch and briefly states what it controls on the public site.

**Why this priority**: Without a single safe-edit map, content-code separation fails in
practice and every update needs a developer.

**Independent Test**: Give only the guide to someone unfamiliar with the codebase; they can
name the correct file for five of five routine updates (tagline, channel link, show date,
release row, schedule default) without opening layout or component files (matches SC-001 at
feature completion; MVP checkpoint may validate a subset during Phase 3).

**Acceptance Scenarios**:

1. **Given** the artist needs to update routine public content, **When** he opens the
   artist-facing guide, **Then** he finds an entry for that content type with the path to
   edit and a short description of the effect on the site.
2. **Given** the artist wants to change the scheduled landing atmosphere, **When** he
   consults the guide, **Then** he is directed to the schedule edit surface (and any
   existing schedule operator guide) rather than to jukebox or theme code.
3. **Given** the artist reads the guide’s editable inventory, **When** he compares it to
   the live site’s content areas, **Then** every visitor-facing content area that is meant
   to be artist-maintained appears in the inventory.
4. **Given** the artist wants a different existing visual mood on a jukebox entry, **When**
   he consults the guide, **Then** he is told he may set `themeId` only to a listed
   complete existing pack and must not create or edit theme-pack code or CSS.

---

### User Story 2 - Artist knows what he must not touch (Priority: P1)

The guide states, in plain language, which surfaces are developer-owned (layout,
components, styles, build configuration, theme-pack registry and CSS packs, and similar).
It warns against renaming stable ids unless a developer updates matching references.

**Why this priority**: Accidental edits to developer surfaces break builds or the live
experience; the boundary must be explicit.

**Independent Test**: From the guide alone, a non-developer correctly classifies at least
five listed paths as “artist OK” or “developer only.”

**Acceptance Scenarios**:

1. **Given** the artist is unsure whether to edit a styles or theme-pack file, **When** he
   reads the forbidden / developer-owned section, **Then** those surfaces are listed as
   developer-only with a short reason.
2. **Given** the guide’s do-not-change rules, **When** the artist considers renaming a
   jukebox filename slug, theme id, or legal slug, **Then** the guide tells him not to
   rename ids without a developer updating related references.
3. **Given** the artist follows only the allowed surfaces, **When** he makes a routine
   content update, **Then** he never needs to open layout, component, or build files.

---

### User Story 3 - Artist edits on GitHub and publishes himself (Priority: P2)

The guide’s primary path is editing allowed files in the GitHub web editor, opening a
pull request into `pre-release`, and completing that merge without a developer doing it for
him. A second documented step covers promoting `pre-release` to `main` (live), which the
artist and/or the developer may perform. Local clone + local preview is a secondary,
optional path. The guide states that a failed publish must not take the live site down.
Developer help remains available for blocked or broken publishes, but is not the default
path for routine content PRs into `pre-release`.

**Why this priority**: Knowing what to edit is incomplete without knowing how to verify and
ship without breaking production.

**Independent Test**: Following only the guide’s primary path, a reader can edit on GitHub,
open/merge a PR into `pre-release`, and locate the secondary promote-to-`main` steps; they
can also locate optional local-clone preview steps.

**Acceptance Scenarios**:

1. **Given** the artist wants to change content without installing tooling, **When** he
   follows the primary path, **Then** he can edit the correct files in the GitHub web
   editor and open a PR targeting `pre-release`.
2. **Given** the artist wants a local preview, **When** he follows the secondary path,
   **Then** he finds local clone and preview steps without those being required for the
   primary publish flow.
3. **Given** the artist is ready to land content for integration, **When** he reads the
   go-live section, **Then** he can follow documented self-serve steps to merge his PR into
   `pre-release` without requiring a developer to perform that merge.
4. **Given** content on `pre-release` should become public, **When** he reads the
   promotion section, **Then** he finds documented steps to open/merge a normal GitHub PR
   from `pre-release` into `main` that either the artist or the developer may perform (no
   new promote automation required by this feature).
5. **Given** a publish/build fails, **When** the artist reads the guide, **Then** he
   understands that the previous successful live version stays online and when to ask the
   developer for help.

---

### User Story 4 - Future features keep the guide accurate (Priority: P2)

When a later feature adds or removes an artist-editable surface, that feature’s delivery
updates the artist-facing guide in the same change set so the inventory never silently
drifts.

**Why this priority**: Constitution Principle VII requires same-change-set doc updates;
otherwise the guide rots and trust collapses.

**Independent Test**: Review a hypothetical feature that adds a new content folder; the
acceptance checklist for that feature would fail if the artist guide were not updated.

**Acceptance Scenarios**:

1. **Given** a new artist-editable surface is introduced, **When** that feature is
   completed, **Then** the artist-facing guide lists the new surface under allowed edits.
2. **Given** an artist-editable surface is removed or moved, **When** that change ships,
   **Then** the guide no longer points at the old path as the place to edit.
3. **Given** a topic-specific operator guide already exists (e.g. stage schedule), **When**
   the hub guide covers that area, **Then** it links to the detailed guide instead of
   duplicating conflicting instructions.

---

### Edge Cases

- Artist cannot or will not use a local clone: the primary GitHub web path remains
  complete; secondary local preview is skippable, with a note that publishing without
  local preview relies on CI/build feedback and developer help if the build fails.
- Artist gets stuck on git/PR or GitHub UI steps (including `pre-release` PR or
  `pre-release` → `main` promotion): the guide points to asking the developer for help
  without making developer merge the default path for routine content PRs into
  `pre-release`.
- Conflicting instructions between README and the artist guide: the artist guide is
  authoritative for artist edit boundaries; README points to it rather than maintaining a
  second full inventory.
- Topic-specific guides (e.g. stage schedule) go out of date relative to the hub: the hub
  remains the inventory of surfaces; topic guides own deep how-to detail and must stay
  linked and consistent when either is updated.
- Legal texts: the guide marks Impressum and privacy as legally required and notes that
  placeholder legal content must be replaced with real information before public promotion,
  without giving legal advice.
- Media assets: the guide covers where to place images/videos and how content files
  reference them, and warns that oversized or wrong-format media can hurt load time.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The project MUST provide a single primary artist-facing guide that a
  non-programmer can use as the starting point for all routine site updates.
- **FR-002**: The guide MUST list every currently approved artist-editable surface with:
  what it controls, where to edit it, and any critical do-not-break rules for that surface
  (e.g. do not rename stable ids). Selecting an existing complete jukebox `themeId` MUST be
  listed as artist-allowed; inventing new theme ids or editing theme-pack registry/CSS MUST
  NOT be listed as artist-allowed.
- **FR-003**: The guide MUST list developer-owned surfaces the artist MUST NOT change,
  including layout, components, styles, build configuration, and theme-pack registry/CSS
  (creating or modifying packs).
- **FR-004**: The guide MUST document a primary edit path using the GitHub web editor for
  allowed files, and MUST document local clone + local preview as a secondary optional
  path (plain-language steps). Local preview MUST NOT be required to complete the primary
  publish flow.
- **FR-005**: The guide MUST teach a two-stage self-serve publish path: (1) primary —
  plain-language GitHub UI and/or minimal git/PR steps to open and merge a content PR into
  `pre-release`; (2) secondary — plain-language steps to open/merge a normal GitHub PR from
  `pre-release` into `main` so the change can go live, performable by the artist and/or the
  developer. The guide MUST state that a failed publish leaves the last good live version
  online. Developer assistance is documented as escalation when the artist is blocked, not
  as the required path for routine PRs into `pre-release`.
- **FR-005a**: The guide MUST NOT present merging content PRs directly into `main` as the
  normal primary path; `main` is the promotion target from `pre-release`.
- **FR-005b**: This feature MUST deliver documentation for the `pre-release` → `main`
  promotion path only — it MUST NOT add new promote automation, bots, or one-click
  pipelines.
- **FR-006**: The project README MUST link to the artist-facing guide as the place for
  content and configuration edits by the artist; it MUST NOT remain the only full inventory
  if that inventory lives in the guide.
- **FR-007**: Existing topic-specific operator guides that remain valid MUST be linked from
  the artist-facing guide rather than rewritten incompatibly.
- **FR-008**: The guide MUST be written in English, in plain language, without requiring
  knowledge of the component or styling architecture.
- **FR-009**: Delivery of this feature MUST leave the guide covering all artist-editable
  surfaces that exist at ship time (site data, jukebox, about, releases, shows, UI chrome,
  legal, stage schedule, and media placement as currently supported).
- **FR-010**: Project process for future features MUST treat “update artist-facing guide
  when edit surfaces change” as mandatory acceptance criteria (constitution Principle VII);
  this feature documents that expectation in the guide’s maintenance note.

### Key Entities

- **Artist-facing guide**: The primary document that defines the safe edit boundary for the
  artist (allowed surfaces, forbidden surfaces, preview, go-live).
- **Editable surface**: A content file, data file, media location, or other approved path
  the artist may change without developer help for the content itself — including setting a
  jukebox `themeId` to an existing complete pack.
- **Developer-owned surface**: Code, layout, style, build, or theme-pack definition the
  artist must not edit (including creating or modifying theme packs).
- **Topic-specific operator guide**: A deeper how-to for one surface (e.g. stage schedule)
  linked from the hub guide.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A non-developer following only the artist-facing guide correctly identifies
  the file to edit for 5 of 5 common tasks drawn from the allowed inventory (e.g. tagline,
  channel link, show date, release row, schedule default) on the first attempt.
- **SC-002**: A non-developer following only the guide correctly refuses to edit at least 3
  developer-owned surfaces when asked whether those paths are safe to change.
- **SC-003**: After reading the edit and go-live sections once, a non-developer can
  correctly restate in under 2 minutes: (1) primary GitHub edit → PR/merge into
  `pre-release`, (2) secondary promote `pre-release` → `main` (artist and/or developer),
  including failed-publish behavior, and can point to where optional local preview is
  documented.
- **SC-004**: At feature completion, 100% of artist-editable surfaces that exist in the
  project are listed in the guide’s allowed inventory (no orphan content folders).
- **SC-005**: A reviewer can confirm in under 5 minutes that README points to the guide and
  that topic-specific guides are linked without contradictory “edit here instead” paths.

## Assumptions

### Integration vs release (branch glossary)

- **Integration** — merging a content pull request into `pre-release`. This lands your
  edits on the integration branch for review and CI; it does **not** by itself change the
  public live site.
- **Release (go live)** — merging `pre-release` into `main`. GitHub Actions deploys from
  `main`; this is the manual step that publishes to the public site (constitution
  Principle II). A failed build leaves the last successful live version online.

- The artist is the primary audience and the default opener/merger of content PRs into
  `pre-release`; promoting `pre-release` to `main` may be done by the artist and/or the
  developer. The developer remains available for escalation, theme packs, layout, and
  anything marked developer-owned.
- “Enough git/PR” means a minimal happy-path workflow usable from GitHub’s web UI (edit,
  commit on a branch, open PR into `pre-release`, merge; optionally promote `pre-release`
  to `main`) — not a full Git curriculum. Local clone commands are secondary documentation
  only.
- Documenting the two-stage branch flow uses the existing GitHub PR capability
  (`pre-release` → `main`); this feature does not add promote automation.
- Documentation lives in the repository as readable prose (not an in-site CMS or visual
  editor). Building a content admin UI is out of scope.
- Local preview uses the project’s existing development workflow when the artist chooses
  the secondary path; it is not part of the required primary flow.
- German is not required for this guide (repository language is English); legal pages remain
  German where the law requires.
- The constitution amendment introducing Principle VII is already accepted governance for
  this work; this feature implements the documentation obligation, not a new governance
  vote.
- Existing README “Editing content” material may be shortened or redirected once the guide
  is authoritative, as long as artists are not left with two conflicting full inventories.

## Out of Scope

- Teaching full software development, advanced git, or CI internals beyond the minimal
  self-serve preview and publish path.
- Auto-generating the guide from code or schemas in v1.
- Changing how content is stored (still structured content/data files).
- Creating new theme packs or visual designs as part of this feature.
- New promote automation, bots, or one-click pipelines for `pre-release` → `main`.
- Legal advice content beyond “fill real Impressum/privacy before public promotion.”
