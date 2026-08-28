# Feature Specification: Desktop Stage UI Redesign

**Feature Branch**: `009-desktop-stage-ui`

**Created**: 2026-08-28

**Status**: Implemented (as-built sync 2026-08-28)

**Input**: User description: "Redesign the desktop landing HUD for a more minimal,
symmetric stage. Use compact icon-first controls with hover label reveal. Move copyright
and legal links to bottom center. Fix glitch split animations so the full control hit area
stays clickable. Per-track streaming links and a chronological track catalog are out of
scope (IDEA-021). Mobile composition stays on IDEA-013."

## Design Direction *(owner review before plan)*

The current laptop HUD (`004`) spreads chrome across four corners with unequal weight:
identity and jukebox on the left, a tall on-demand stack plus mute on the right, and legal
text bottom-left. That makes the center stage feel pulled off-axis even when nothing is
open.

**Recommended composition for this feature** (subject to owner approval in `/speckit-plan`
visual review):


| Zone                | Proposed treatment                                                                                                                                                                                                                                          |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Top edge            | Symmetric band: compact identity mark left-of-center axis, social icons mirrored on the opposite side with matched spacing and visual mass                                                                                                                  |
| Side / bottom rails | Icon-only triggers for jukebox and on-demand content (About, Lyrics, Discography, Tour), distributed so left and right peripheral weight is balanced at rest                                                                                                |
| Label reveal        | At rest, controls show only an icon. On hover or keyboard-visible focus on **closed** controls, the readable label appears in a floating layer **above** dock icons or **below** social icons (anchored to the control, not viewport center). Suppressed while a panel is open (inline title shown instead). |
| Open panels         | Summary row shows icon + inline title (`18px` scaled, beside icon). Panel bodies attach to the periphery and scroll internally; they do not occupy the center stage                                                                                                                                                       |
| Bottom center       | Single footer cluster: copyright, Impressum, Datenschutzerklärung                                                                                                                                                                                           |
| Mute                | Beside jukebox in the **left dock cluster** when visible; does not dominate the right edge                                                                                                                                                                   |


Icons SHOULD be recognizable at a glance (music note for jukebox, document for lyrics,
calendar for tour, etc.). Exact glyphs are a plan-time design choice; labels remain editable
via existing chrome content files.

## Clarifications



### Session 2026-08-28

- Q: Desktop only or mobile too? → A: **Desktop / typical laptop only.** Mobile and
small-screen composition remain IDEA-013; the page must still load on small viewports but
this feature does not target phone polish.
- Q: Show currently playing track links (YouTube, Spotify, etc.)? → A: **Out of scope.**
Capture as IDEA-021 (track catalog + song identity model). This feature may improve
jukebox presentation but does not add a track-info panel or streaming links.
- Q: Glitch split click bug? → A: **In scope.** Visual fragmentation must not create dead
click zones; the control’s full pre-animation hit box stays active for pointer and
keyboard activation throughout glitch animations.
- Q: Label reveal direction? → A: **Anchored above/below the control** (dock above, socials
below), not slide toward viewport center. Inline title beside icon when panel is open;
floating label suppressed while open.
- Q: Panel open animation on default theme? → A: **Smooth two-phase ease** (shell then body;
open reverses close). Glitch theme keeps morph glitch on open/close.



## User Scenarios & Testing *(mandatory)*



### User Story 1 - Center stage feels balanced and undisturbed (Priority: P1)

A visitor opens the landing page on a typical laptop. The atmosphere fills the view and
the center reads as open and symmetrically framed. Peripheral chrome at rest is compact
and left/right visual weight is comparable, so the stage no longer feels pulled toward one
side.

**Why this priority**: Fixing asymmetry and reclaiming center focus is the main layout
motivation; everything else hangs off a calmer stage.

**Independent Test**: On a laptop viewport (roughly 1280×800 or wider), load the landing
with all on-demand regions closed and jukebox collapsed. Compare left vs. right chrome
footprint; confirm the center third of the viewport has no persistent text blocks or panel
summaries.

**Acceptance Scenarios**:

1. **Given** the landing loads on a typical laptop with all panels closed, **When** the
  visitor scans the layout, **Then** no on-demand panel shows a full text title at rest
   (icons or equally compact marks only).
2. **Given** the landing loads with default content, **When** the visitor views the page
  without opening any panel, **Then** left and right peripheral chrome occupy broadly
   similar visual weight (no single corner dominated by a tall stack of labeled boxes).
3. **Given** any on-demand panel or jukebox list is open, **When** the visitor looks at the
  center, **Then** panel bodies remain on the periphery and the center stays visually
   free.

---



### User Story 2 - Icon-first controls reveal labels on demand (Priority: P1)

A visitor explores the HUD. Each menu item is a small icon at rest. When they hover or
keyboard-focus a **closed** control, its human-readable label appears adjacent to the icon
(above dock controls, below socials) so they immediately understand what the icon means —
without permanent labels consuming space. When a panel is open, the title appears inline
beside the icon instead of a floating label.

**Why this priority**: Minimalism plus discoverability is the core interaction model for
this redesign.

**Independent Test**: With motion allowed, hover each HUD icon (jukebox, About, Lyrics,
Discography, Tour, socials where applicable). Confirm icon-only rest state, label appears
above (dock) or below (socials), and no floating label while a panel is open.

**Acceptance Scenarios**:

1. **Given** motion is allowed and a **closed** HUD control is visible, **When** the visitor
  hovers it, **Then** a readable label appears anchored above (dock) or below (socials) the
   control.
2. **Given** a HUD control has a label, **When** the visitor moves keyboard-visible focus
  onto it while closed, **Then** the same label reveal occurs (not hover-only).
3. **Given** an on-demand panel or jukebox is open, **When** the visitor hovers its summary,
  **Then** no floating label appears (inline title beside icon is shown instead).
4. **Given** reduced motion is preferred, **When** the visitor focuses or hovers a
  control, **Then** the label appears at the anchored position without travel animation.
5. **Given** a control’s label text is changed in chrome content, **When** the site is
  rebuilt, **Then** the revealed label reflects the new text without layout edits.

---



### User Story 3 - Legal and copyright sit bottom center (Priority: P2)

A visitor needs legal information or wants to see copyright. At the bottom center of the
viewport they find copyright, Impressum, and Datenschutzerklärung together — easy to
locate and visually separated from corner HUD controls.

**Why this priority**: Explicit owner request; also removes bottom-left legal cluster that
currently adds to left-side heaviness.

**Independent Test**: Load the landing; confirm footer content is horizontally centered at
the bottom and legal links still open the existing in-page overlay behavior from `002`.

**Acceptance Scenarios**:

1. **Given** the landing page on a typical laptop, **When** the visitor looks at the bottom
  edge, **Then** copyright and both legal links appear as one centered cluster.
2. **Given** the visitor activates Impressum or Datenschutzerklärung, **When** the overlay
  opens, **Then** behavior matches the existing legal overlay contract (dismissible,
   no full reload from landing when scripting is available).
3. **Given** reduced motion is preferred, **When** legal overlay opens, **Then** existing
  reduced-motion rules from `002` still apply.

---



### User Story 4 - Glitch animations never steal clicks (Priority: P2)

A visitor on a glitch-enabled theme (pack `hudGlitch`) interacts with HUD controls. When a
glitch animation visually splits or fragments a control box, the entire original control
area remains clickable and keyboard-activatable — no dead zones inside the box bounds.

**Why this priority**: Known bug breaks trust on primary navigation; fixing it is required
for the new minimal controls to feel reliable.

**Independent Test**: On Nightmare (or any pack with `hudGlitch`), hover and click
on-demand panel summaries and jukebox controls during active glitch animation; click every
region of the control bounding box.

**Acceptance Scenarios**:

1. **Given** glitch is enabled and a control is glitching on hover or press, **When** the
  visitor clicks anywhere within the control’s layout bounds, **Then** the control
   activates (open, close, navigate, or toggle as appropriate).
2. **Given** a glitch animation visually separates fragments of a box, **When** the visitor
  clicks a gap between visual fragments but inside the original box bounds, **Then** the
   click still registers on the control.
3. **Given** keyboard focus on a glitching control, **When** the visitor presses Enter or
  Space, **Then** activation succeeds regardless of visual fragment state.

---



### User Story 5 - All existing content remains reachable in less space (Priority: P3)

A visitor still opens About, Lyrics, Discography, Tour, jukebox, socials, and mute with
the same information as today — but the closed/rest HUD uses noticeably less space than
the current labeled `<details>` stack.

**Why this priority**: Validates that minimalism is a presentation change, not a feature
cut.

**Independent Test**: Walk through quickstart scenarios from `004` (jukebox switch, About,
lyrics follow active entry, discography stage button, tour list, social links, mute) on
desktop; all behaviors still work.

**Acceptance Scenarios**:

1. **Given** valid jukebox entries, **When** the visitor opens the jukebox and selects
  another entry, **Then** atmosphere, theme, lyrics, and mute visibility update without
   full page reload (same as `004` / `007`).
2. **Given** About content exists, **When** the visitor opens About from its icon, **Then**
  the bio content appears in a peripheral panel.
3. **Given** no About content, **When** the page loads, **Then** the About icon/control is
  hidden (same rule as `004`).
4. **Given** exclusive-open scripting is available, **When** the visitor opens one on-demand
  panel and then another, **Then** at most one panel stays open at a time on all
   breakpoints (existing rule preserved).

---



### Edge Cases

- **Very wide monitors**: Long custom labels truncate with ellipsis in open inline headers;
floating labels stay centered on their control.
- **Long chrome labels**: German legal titles or long custom labels must truncate or wrap
gracefully during reveal without breaking layout.
- **Single jukebox entry**: Jukebox icon still present; list may show one item.
- **Empty discography / tour**: Empty-state copy still reachable from icon; controls remain.
- **Intro overlay (**`006`**)**: New HUD chrome hidden during intro the same way as today;
after intro, redesigned chrome appears.
- **Glitch disabled pack**: Label reveal and layout still work; no glitch on packs without
`hudGlitch`.
- **No scripting**: Icons still visible; panels open via native disclosure; label reveal
degrades to visually hidden / `aria-label` only (documented degradation).
- **320px viewport**: Page loads and content is reachable; visual success is not judged here
(IDEA-013).



## Requirements *(mandatory)*



### Functional Requirements

- **FR-001**: On typical laptop viewports, the landing HUD MUST present a symmetrically
balanced peripheral layout at rest so the center stage is not visually dominated by one
side (especially the previous bottom-right panel stack).
- **FR-002**: At rest, on-demand controls (About, Lyrics, Discography, Tour) and the
jukebox MUST use compact icon-first presentation; full text titles MUST NOT be permanently
visible on closed controls.
- **FR-003**: Each icon-first control MUST expose its human-readable label on pointer hover
and keyboard-visible focus.
- **FR-004**: When motion is allowed, label reveal MUST show the label anchored adjacent
to the control (above dock icons, below social icons). It MUST NOT require travel toward
viewport center.
- **FR-004a**: When a jukebox or on-demand panel is open, floating label reveal MUST be
suppressed; the chrome title MUST appear inline beside the icon in the summary row.
- **FR-004b**: On packs without `hudGlitch`, panel open/close MUST use smooth two-phase
motion (shell then body on open; reverse on close). On glitch packs, morph glitch on
open/close is preserved.
- **FR-005**: When reduced motion is preferred, label reveal MUST NOT require travel
animation.
- **FR-006**: Copyright, Impressum, and Datenschutzerklärung MUST appear together in a
bottom-center footer cluster on the landing page.
- **FR-007**: Legal link behavior MUST remain compatible with the existing in-page legal
overlay contract from feature `002`.
- **FR-008**: During any glitch animation on HUD controls, the full layout bounding box of
the control MUST remain the active hit target for pointer and keyboard activation (no
dead zones caused by visual fragmentation).
- **FR-009**: All content and behaviors from feature `004` MUST remain available on desktop:
jukebox switching, lyrics following active entry, discography stage button, tour list,
social links, About empty-hide rule, exclusive-open panels, mute visibility rules.
- **FR-010**: Visitor-facing labels for icons and chrome strings MUST remain editable via
existing content/chrome files without changing layout code (constitution III).
- **FR-011**: Icon choice per control SHOULD be configurable or documented in artist-facing
docs if new edit surfaces are introduced (constitution VII).
- **FR-012**: This feature MUST NOT add per-track streaming links, credits panels, or a
chronological track catalog (deferred to IDEA-021).
- **FR-013**: This feature MUST NOT redesign mobile/small-screen HUD composition (IDEA-013);
the landing MUST still load on viewports from 320px without horizontal scroll.
- **FR-014**: This feature MUST NOT add third-party analytics, cookies, or embeds.
- **FR-015**: New client-side behavior (label animation, layout listeners) MUST be
justified in the plan under constitution IV; prefer CSS-first where possible.



### Key Entities

- **HUD control**: A persistent or on-demand landing control with `icon`, `label` (from
chrome content), and an `action` (open panel, toggle jukebox, external link, etc.).
- **Label reveal**: Transient UI state showing a control’s label, anchored above (dock) or
below (socials) the control when motion is allowed.
- **Footer cluster**: Bottom-center grouping of copyright line plus legal navigation links.
- **Stage catalog entry** (unchanged from `004`): Active jukebox item driving atmosphere;
no new fields for streaming links in this feature.



## Success Criteria *(mandatory)*



### Measurable Outcomes

- **SC-001**: On a 1280×800 laptop viewport with all panels closed, at least 60% of the
horizontal center third of the viewport contains no persistent text chrome (visual review
or screenshot checklist).
- **SC-002**: 100% of HUD icon controls (jukebox + four on-demand + active socials) show
a readable label on hover and keyboard focus in manual testing.
- **SC-003**: Copyright and both legal links appear in the bottom-center cluster on desktop
without overlapping mute or jukebox hit targets at default scale.
- **SC-004**: In glitch-enabled theme testing, 0 failed click activations when clicking
arbitrary points inside control bounds during active glitch (test each on-demand summary
and jukebox toggle at least 5 times).
- **SC-005**: All `004` quickstart scenarios pass on desktop after the redesign without
regressions in jukebox, lyrics, discography, tour, About, socials, or mute behavior.
- **SC-006**: With reduced motion preferred, label reveal completes without travel
animation and remains readable at the anchored position.



## Assumptions

- “Typical laptop” means roughly 1280px width and up; `--hud-scale` desktop behavior from
`004` remains the visual target.
- Icons may use a bundled icon font, inline SVG, or Unicode emoji; the plan will pick one
approach that avoids extra tracking and stays lightweight (constitution IV).
- Label reveal anchors **above** dock controls and **below** social icons (implementation
decision — avoids collision with open panels and footer).
- Social icons may keep platform brand icons rather than generic emoji where recognition
is higher.
- Feature `003` glitch contracts remain authoritative except for the hit-target amendment
in FR-008.
- Per-track info and streaming links will be specified separately as IDEA-021, which may
supersede or absorb the older IDEA-006 concept.



## Dependencies

- Features `002` (atmosphere, legal overlay, mute), `003` (glitch), `004` (stage content
model), `005` (theme packs / `hudGlitch`), `006` (intro), `007` (scheduled default).
- IDEA-013 (mobile HUD) explicitly not a dependency — parked.
- IDEA-021 (track catalog) is a future consumer of jukebox/stage identity; not required
for this feature.



## Out of Scope

- Mobile / small-screen dedicated HUD (IDEA-013)
- Per-track info panel, streaming links, credits (IDEA-021; related: IDEA-006)
- New site routes or third-party players/embeds
- Seravek / primary typeface change (IDEA-007)
- Deep new theme-pack motion languages (IDEA-002 beyond existing tokens)
- Landing intro changes (`006`)
- Scheduled default logic changes (`007`)

