# Feature Specification: Glitch & Motion Language

**Feature Branch**: `031-glitch-motion`

**Created**: 2026-10-05

**Status**: As-built (consolidated living spec)

**Consolidates**: `003-ui-glitch`, motion/label parts of `009-desktop-stage-ui`, `011`,
`018`, `019`

**Input**: Consolidation of the site's motion language: a pack-gated glitch treatment that
makes interactive controls feel alive on the Nightmare stage, calm motion everywhere else,
hover/focus labels on laptop controls, and a hard reduced-motion opt-out.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Controls glitch on the Nightmare stage (Priority: P1)

While the Nightmare entry is on stage, clickable controls react with short glitch bursts
(RGB split, jitter, scanlines, clipping) on hover, keyboard focus, and press — and a few
glitch on their own at irregular intervals, so the whole interface feels haunted. On every
other stage, controls stay calm.

**Why this priority**: The glitch is a signature of the Nightmare world and of the brand.

**Independent Test**: With Nightmare active, hover, tab to, and click several controls;
watch idle controls for ambient glitches; switch to another entry and confirm all glitch
stops.

**Acceptance Scenarios**:

1. **Given** the active pack enables HUD glitch, **When** the visitor hovers, keyboard
   focuses, or presses a clickable control, **Then** it plays a short one-shot glitch and
   still performs its action.
2. **Given** HUD glitch is enabled, **When** the page is idle, **Then** visible clickable
   controls glitch on a staggered schedule with at most two at once.
3. **Given** the active pack does not enable HUD glitch, **When** the visitor interacts,
   **Then** no glitch plays.

---

### User Story 2 - Glitch never breaks a click (Priority: P1)

Even mid-glitch, the full control area stays clickable and returns to a stable state
afterwards.

**Why this priority**: Visual flair must never cost usability.

**Independent Test**: Rapidly click controls during ambient and hover glitches; confirm
every click registers and no control stays stuck glitching.

**Acceptance Scenarios**:

1. **Given** a glitch is playing, **When** the visitor activates the control anywhere in
   its box, **Then** the action happens.
2. **Given** several triggers overlap, **When** they resolve, **Then** press beats
   hover/focus, which beats ambient, and one-shots never stack.

---

### User Story 3 - Reduced-motion visitors get a calm site (Priority: P1)

With reduced motion preferred, no glitch, no ambient motion, no morph flavor, and no
travel animations play anywhere.

**Why this priority**: Accessibility is mandatory (constitution IV).

**Independent Test**: Enable reduced motion and repeat Story 1 tests; confirm no glitch or
animated transitions.

**Acceptance Scenarios**:

1. **Given** reduced motion, **When** any control is hovered, focused, or pressed, **Then**
   no glitch plays and focus outlines remain visible.

---

### User Story 4 - Laptop controls explain themselves (Priority: P2)

On laptops, icon controls (shuffle, play/pause, mute, listen icons, socials) show their
label in a small floating tag on hover or keyboard focus, anchored to the control.

**Why this priority**: Icon-first chrome stays minimal without being cryptic.

**Independent Test**: At 1280×800, hover and tab through player and listen icons; confirm
a label appears next to each; at 390px confirm no hover labels appear.

**Acceptance Scenarios**:

1. **Given** a laptop-width viewport, **When** a labeled control is hovered or keyboard
   focused, **Then** its label appears adjacent to it, inside the viewport.
2. **Given** a phone-width viewport, **When** a control is touched, **Then** no floating
   label appears.

---

### Edge Cases

- Mute while muted and shuffle while on MAY glitch continuously (Nightmare only); mute
  stops when audio plays.
- Chrome transitions (panel/sheet morphs) on Nightmare get a glitch overlay for their
  duration; other packs use smooth easing.
- Static copy, wordmark, tagline, cards, volume slider, and placeholder channel chips
  never glitch.
- Laptop chrome renders at 80% site scale; labels are positioned with that zoom in mind.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Glitch MUST be enabled only when the active theme pack has `hudGlitch`
  (exposed as `data-hud-glitch='true'`); today only `nightmare-crimson`.
- **FR-002**: With glitch enabled, clickable controls (nav and menu items, player buttons,
  listen icons, ticket/link pills, social links, legal links, overlay exit controls) MUST
  glitch on hover, keyboard-visible focus (not mouse focus), and press.
- **FR-003**: With glitch enabled, an ambient field MUST fire live-safe one-shots on
  visible clickable controls at irregular 520–1280 ms intervals, max two concurrent.
- **FR-004**: Glitch effects MUST NOT shrink or remove the hit area and MUST end in a
  stable resting state.
- **FR-005**: Glitch MUST stay within ~3 visible flashes per second and MUST NOT use
  full-viewport flashes.
- **FR-006**: Stage handoffs involving a glitch pack MUST use the glitch crossfade (see
  `026`); other handoffs and panel motion MUST use smooth easing.
- **FR-007**: Reduced motion MUST disable all glitch, ambient, continuous, morph flavor,
  and travel animations site-wide.
- **FR-008**: Laptop widths MUST show anchored hover/focus labels for controls carrying a
  label (`data-hud-label`); phone widths MUST NOT show hover labels.
- **FR-009**: Motion MUST be first-party CSS/JS without tracking or storage.

### Key Entities

- **Glitch hit target**: a clickable control opted into glitch (`.glitch-hit`).
- **Glitch preset**: a reusable visual family (RGB split, jitter, scan, clip).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 0 missed clicks during glitch animations in a 50-click stress test.
- **SC-002**: With reduced motion, 0 glitch frames are observed.
- **SC-003**: Switching away from Nightmare stops all glitch within one handoff.

## Assumptions

- Final intensity is owner-approved by eye; no automated photosensitivity tooling.

## Known Gaps *(as of 2026-10-05)*

- `src/styles/glitch.css` is ~1,300 lines in one file (IDEA-018).
