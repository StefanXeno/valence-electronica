# Feature Specification: Theme Pack System

**Feature Branch**: `005-theme-packs`

**Created**: 2026-08-22

**Status**: Draft

**Input**: User description: "Start work on IDEA-002 (per-video theme packs). The
Nightmare theme already exists; establish a logical structure so future themes are
easier to add and change when necessary."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor feels a coherent mood per jukebox theme (Priority: P1)

A visitor switches jukebox entries on the landing stage. Each entry’s bound theme changes
the presentation as one mood — colors, surfaces, and any motion or type treatment that
pack defines — instead of feeling like unrelated tweaks. The Nightmare theme keeps its
current intense look (crimson palette, glitch motion on HUD chrome, looping atmosphere
video with optional unmute). Other themes (for example the existing cyan still) change
presentation consistently within their own pack rules and stay visually calm where their
pack does not define motion.

**Why this priority**: Theme packs exist so each song/atmosphere feels like its own world.
Without a coherent per-pack presentation, the jukebox switcher only swaps colors.

**Independent Test**: With at least two jukebox entries on different themes, switch between
them and confirm each theme’s defined presentation applies together (not a mix of two
packs). Nightmare must still glitch on HUD chrome; non-glitch packs must stay still on
those same controls.

**Acceptance Scenarios**:

1. **Given** two or more jukebox entries with different bound themes, **When** the visitor
   selects each entry, **Then** the active theme’s full defined presentation applies
   (color/surface at minimum; motion/type only where that pack declares them).
2. **Given** the Nightmare theme is active, **When** the visitor hovers or uses in-scope
   HUD controls, **Then** glitch motion behaves as today (only on Nightmare).
3. **Given** a non-Nightmare theme is active, **When** the visitor uses the same HUD
   controls, **Then** no glitch motion runs and the pack’s color/surface tokens still
   apply.
4. **Given** any active theme, **When** the visitor reads identity, on-demand panels, and
   legal overlay text, **Then** contrast remains sufficient over the atmosphere for that
   pack.

---

### User Story 2 - Maintainer adds or changes a theme through one pack contract (Priority: P1)

A developer (or future maintainer) needs to add a new mood or adjust an existing one. They
follow a single, documented theme-pack contract: stable id, required presentation tokens,
and declared capabilities (atmosphere mode, audio eligibility, motion profile). They do
not hunt scattered hard-coded theme id checks across components. Existing packs (`default`,
`nightmare-crimson`, `cyan-pulse`) are migrated into this structure without changing
visitor-visible Nightmare behavior.

**Why this priority**: The user’s core ask is logical structure for future themes. A pack
contract that centralizes “what this theme is and what it can do” is the deliverable even
before new artistic packs ship.

**Independent Test**: Read the pack contract documentation and add a hypothetical fourth
pack on paper (or in a branch): list its id, tokens, capabilities, and which jukebox
entry would reference it — without naming individual source files in the spec test, verify
the steps are complete and unambiguous.

**Acceptance Scenarios**:

1. **Given** the theme pack contract exists, **When** a maintainer defines a new pack id,
   **Then** they can list required vs optional fields (colors/surfaces required; typography
   and motion optional with safe inherit from default).
2. **Given** an existing jukebox entry references a pack id, **When** that id is unknown
   at publish time, **Then** the site falls back to the default pack (never a broken or
   blank theme).
3. **Given** Nightmare is migrated into the new structure, **When** compared to the
   pre-migration live behavior, **Then** palette, glitch-on-HUD, looping video, and
   unmute rules are unchanged for visitors.
4. **Given** a maintainer updates one pack’s color tokens, **When** the site is published,
   **Then** every jukebox entry bound to that pack picks up the change without editing
   layout components.

---

### User Story 3 - Reduced motion and accessibility hold for every pack (Priority: P2)

A visitor with reduced-motion preference (or on a path where atmosphere video does not
play) still gets a valid, readable presentation for whichever theme is active. Motion
defined by a pack (glitch, ambient, transitions) is suppressed or replaced with static
presentation per existing site rules. Theme switching does not introduce flashing or
unreadable text for any pack.

**Why this priority**: Deep packs add more motion surfaces; the system must not regress
accessibility or constitution constraints when new themes are added.

**Independent Test**: Enable reduced motion, switch jukebox themes, and confirm no pack
forces glitch or other disallowed motion; text stays readable on poster/static fallback.

**Acceptance Scenarios**:

1. **Given** reduced motion is preferred, **When** any theme is active, **Then** pack-defined
   motion (including Nightmare glitch) does not run.
2. **Given** atmosphere video is not playing but a theme is active, **When** the visitor
   reads the stage, **Then** that theme’s color/surface (and static poster if applicable)
   still apply.
3. **Given** any theme pack, **When** evaluated against readable text over atmosphere,
   **Then** it meets the same minimum contrast expectation as today’s default and
   Nightmare packs.

---

### Edge Cases

- A **complete pack** = registry entry in the theme pack registry **and** a matching CSS
  token block in `themes.css` (`default` uses `:root` / `[data-theme='default']`).
- Jukebox entry references a pack id that was removed or renamed → build warns; runtime
  uses the full **default** pack (capabilities, colors, and `data-theme="default"`); entry
  remains usable if otherwise valid.
- Jukebox `themeId` not in the registry (unknown id) → build warns
  `[theme] unknown themeId "…"; using default`; runtime uses the full **default** pack
  (never a split or blank theme).
- Registry entry exists but CSS token block is missing → build warns
  `[theme] pack "…" incomplete (missing CSS); using default`; runtime uses the full
  **default** pack (no mixed capabilities-from-one-pack / colors-from-default).
- CSS token block exists but registry entry is missing → build warns; runtime uses the
  full **default** pack.
- Jukebox references a `themeId` before the pack is **complete** (registry only, CSS only,
  or neither) → same as incomplete: warn + full **default** until both parts exist.
- Pack declares looping video but entry has no video sources → static poster + pack colors;
  mute hidden (same as today’s non-video entries).
- Pack declares audio eligibility but entry has no audio → mute hidden.
- Pack declares no glitch motion → HUD controls stay still even if global glitch styles
  exist in the codebase.
- Two entries share one pack id → identical presentation tokens; switching between them
  changes song/lyrics/atmosphere asset only.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST treat a **theme pack** as the single unit of visual/motion
  identity bound to a jukebox entry via `themeId` (existing content field).
- **FR-002**: Every theme pack MUST define at minimum: stable **id**, **color/surface
  tokens** (background, surface, border, text, muted text, accent, scrim/overlay strength).
- **FR-003**: Every theme pack MUST declare **capabilities** in one place, at least:
  - atmosphere mode: looping video allowed vs poster-only static
  - audio eligibility: whether unmute may appear when a video with audio is playing
  - motion profile: whether HUD glitch (and any future pack-scoped motion) is enabled
- **FR-004**: Optional pack layers MUST be supported without requiring every pack to
  implement them on day one: typography profile (display/body treatment), link/hover
  treatment, ambient/entrance motion beyond glitch. In v1 this means documented extension
  points and CSS inherit from `:root` — no new per-pack typography values are required.
- **FR-005**: When the active jukebox entry changes, the active pack MUST apply as a
  whole — no mixed tokens from two packs at once.
- **FR-006**: Unknown, invalid, or **incomplete** `themeId` values MUST resolve to the
  full **default** pack (capabilities, presentation tokens, and `data-theme="default"`);
  the landing MUST remain usable. Incomplete means the id lacks a registry entry, lacks a
  CSS token block, or both.
- **FR-007**: Existing packs **`default`**, **`nightmare-crimson`**, and **`cyan-pulse`**
  MUST be migrated into the new structure preserving current visitor-visible behavior for
  Nightmare (colors, glitch on HUD chrome, looping video + unmute rules) and current
  calm behavior for non-Nightmare packs.
- **FR-008**: Nightmare (`nightmare-crimson`) MUST remain the only pack with HUD glitch
  motion enabled in this feature; other packs MUST stay still on those controls unless a
  future spec explicitly adds motion to another pack.
- **FR-009**: Pack-defined motion MUST honor **`prefers-reduced-motion`** (no glitch or
  other pack motion when reduced motion is requested).
- **FR-010**: All packs MUST keep primary stage copy readable over atmosphere (same bar as
  today: identity, on-demand panels, legal overlay).
- **FR-011**: Theme pack definitions MUST NOT require editing layout components to add or
  adjust tokens for an existing pack id; jukebox entries continue to select packs by id
  only (content/code separation preserved for entry labels, lyrics, and media paths).
- **FR-012**: The project MUST document the theme pack contract for maintainers: required
  fields, optional fields, capability flags, how to bind an entry, fallback rules, and a
  short checklist for adding a new pack (including “define pack → reference in jukebox →
  verify contrast and reduced motion”).
- **FR-013**: This feature MUST NOT add scheduled default themes (IDEA-004), new site
  pages, third-party embeds, tracking, or completed legal texts.
- **FR-014**: This feature MUST NOT adopt Seravek or a new primary typeface (IDEA-007);
  typography slots in the pack contract may exist but v1 MAY leave non-Nightmare packs on
  the current site type until a later feature fills them.
- **FR-015**: This feature MUST NOT redesign the landing HUD layout (004) or phone
  composition (IDEA-013); it only structures and applies theme presentation.
- **FR-016**: Adding a **new** artistic pack beyond the three existing ids MUST be
  possible after this feature without refactoring the pack system again — only defining
  the new pack and pointing a jukebox entry at it.

### Key Entities

- **Theme pack**: Named visual/motion identity (id + tokens + capabilities). One pack
  can be shared by many jukebox entries.
- **Pack tokens**: Required color/surface variables and optional typography/motion/link
  treatments that apply when the pack is active.
- **Pack capabilities**: Declared behaviors — looping video atmosphere, audio/unmute
  eligibility, HUD glitch motion — that drive which stage features activate for entries
  bound to this pack.
- **Active theme**: The pack currently applied to the landing stage, driven by the active
  jukebox entry (or default entry on fresh load).
- **Default pack**: Fallback pack used when an entry’s `themeId` is missing or unknown;
  also the baseline inherit target for optional layers other packs omit.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A maintainer can describe the full steps to add a new theme pack in under
  5 minutes using only the pack contract documentation (no code archaeology).
- **SC-002**: 100% of jukebox entries with valid `themeId` values apply a single coherent
  pack when selected — verified by switching between all shipped entries.
- **SC-003**: Nightmare behavior parity: in side-by-side review against pre-feature
  `pre-release`, Nightmare palette, HUD glitch, looping video, and unmute/mute rules are
  unchanged.
- **SC-004**: With `prefers-reduced-motion` enabled, 0 pack-defined motion treatments
  run across all shipped themes during a full jukebox switch test.
- **SC-005**: Informal review on a typical laptop agrees text in identity and open
  on-demand panels stays readable for default, Nightmare, and cyan packs over their
  atmospheres.
- **SC-006**: Zero scattered theme-id string checks remain for capability decisions
  (video vs poster, glitch on/off, audio eligibility) outside the pack contract layer —
  verified by maintainer audit checklist in the feature plan.

## Assumptions

- Jukebox entry `themeId` in Markdown remains the operator-facing binding; pack
  definitions stay developer-maintained (like today’s CSS packs), but organized under one
  contract instead of ad hoc files and inline checks.
- A pack is **complete** only when both registry and CSS exist; unknown or incomplete ids
  resolve to the full **`default`** pack (Option A — warn at build, no split fallback).
- v1 migrates the three existing ids only; new artistic packs (beyond cyan/default) are
  welcome after the structure lands but are not required for feature completion.
- Nightmare remains the reference “full” pack (color + glitch + video + audio); cyan and
  default are valid minimal packs (color/surface, static atmosphere, no glitch).
- Glitch scope stays limited to HUD chrome already defined in feature 003/004; this
  feature does not expand which elements glitch — only which pack enables the existing
  glitch language.
- Typography changes for non-Nightmare packs are deferred; the contract reserves optional
  typography slots without requiring new font files in v1.
- Fresh page load still resets to the default jukebox entry (no session memory from 004).

## Dependencies

- **001-website-skeleton** — base landing and content model.
- **002-themed-background-video** — atmosphere video, mute, basic `[data-theme]` color
  packs (starting point to refactor).
- **003-ui-glitch** — glitch motion language; Nightmare-only rule carried forward via
  pack capability.
- **004-landing-content-layout** — jukebox switcher, active entry drives theme; lyrics and
  HUD regions that must stay readable per pack.

## Out of Scope

- Scheduled or calendar-driven default theme (IDEA-004).
- Seravek licensing and primary typeface rollout (IDEA-007).
- Per-track info / credits panel (IDEA-006).
- Mobile-specific HUD redesign (IDEA-013).
- New looping video assets or new songs — only structure and migration of existing themes.
- Enabling glitch on non-Nightmare packs in v1.
- Visitor-facing theme editor or CMS; pack ids in jukebox Markdown remain the content
  hook.
