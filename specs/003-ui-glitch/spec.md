# Feature Specification: UI Glitch Interactions

**Feature Branch**: `003-ui-glitch`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "Extract the press/hover glitch motion language from the
themed background video work into its own feature. Interactive controls (channel links,
legal links, legal exit, mute/volume control) get a short electronic-music glitch
treatment on hover and press. Motion must respect reduced-motion preferences and must
never block clicks or keyboard use. Seravek typeface adoption stays out of scope (remains
a separate idea)."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Interactive controls feel alive on hover and press (Priority: P1)

A visitor explores the landing page and legal panel. When they hover or press primary
interactive controls (channel links, legal links, legal exit, mute/volume control), those
controls briefly glitch in a calm, electronic-music style — then settle — so the UI feels
part of the same atmospheric world as the background, without becoming noisy or hard to
use.

**Why this priority**: The glitch language is the core value of this feature. Without a
clear, tasteful hit/press treatment on key controls, there is nothing to ship.

**Independent Test**: With motion allowed, hover and press channel/legal/mute controls;
confirm a short glitch plays and the control remains usable and readable afterward.

**Acceptance Scenarios**:

1. **Given** motion is allowed and a marked interactive control is visible, **When** the
   visitor hovers or focuses it with the keyboard, **Then** a short glitch treatment plays
   once for that interaction (not a continuous loop while idle).
2. **Given** motion is allowed and a marked interactive control is visible, **When** the
   visitor presses/activates it, **Then** a short glitch treatment plays and the control’s
   normal action still occurs (navigate, unmute, etc.).
3. **Given** a glitch is playing on a control, **When** the visitor tries to click or
   activate that same control, **Then** the control remains hittable and activates
   reliably (glitch must not steal or shrink the hit target).

---

### User Story 2 - Mute/volume shell morphs with the same language (Priority: P2)

When the visitor unmutes or mutes background audio, the mute/volume control’s shape change
(circle ↔ pill with volume) is accompanied by the same glitch language so the expand and
collapse feel intentional rather than a plain layout jump.

**Why this priority**: The mute control is the most distinctive interactive chrome on the
atmospheric landing page; tying its morph to the glitch language completes the motion
story, but hover/press on links alone already delivers value.

**Independent Test**: Unmute then mute with motion allowed; confirm expand and collapse
use a glitch-styled transition and the control remains operable throughout.

**Acceptance Scenarios**:

1. **Given** background audio can be unmuted and motion is allowed, **When** the visitor
   unmutes, **Then** the control expands to reveal volume with a short glitch treatment.
2. **Given** sound is on and motion is allowed, **When** the visitor mutes, **Then** the
   control collapses with a short glitch treatment and returns to the compact muted state.
3. **Given** a morph glitch is in progress, **When** the visitor clicks the mute toggle
   again, **Then** the click still registers (no dead zones from the animation).

---

### User Story 3 - Reduced-motion visitors get a calm static UI (Priority: P1)

A visitor who prefers reduced motion does not see glitch treatments. Controls stay fully
usable with normal hover/focus affordances and no forced motion language.

**Why this priority**: Accessibility and the constitution require respecting reduced
motion; this must ship with the feature, not as polish later.

**Independent Test**: Enable reduced motion, reload, interact with the same controls;
confirm no glitch animations run and actions still work.

**Acceptance Scenarios**:

1. **Given** reduced motion is preferred, **When** the visitor hovers, focuses, or presses
   interactive controls, **Then** no glitch animation plays.
2. **Given** reduced motion is preferred, **When** the visitor mutes or unmutes, **Then**
   the control may still change state/layout as needed for clarity, but without glitch
   motion language.
3. **Given** reduced motion is preferred, **When** the visitor uses the keyboard, **Then**
   focus and activation remain clear without relying on glitch cues.

---

### Edge Cases

- Rapid hover in/out or repeated presses → treatments stay short and do not stack into a
  long or chaotic sequence; the control remains usable.
- Touch devices without true hover → press/tap still gets a brief treatment where
  applicable; lack of hover must not break the control.
- Mute control hidden (no audio, fallback, or reduced-motion video off) → no glitch
  required for that control while it is unavailable.
- Overlapping hover and press → press may supersede an in-flight hover treatment; never
  leave the control stuck in a glitched visual state.
- Very small viewports → glitch displacement must not push critical controls off-screen or
  cover primary content permanently.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Marked interactive controls on the landing experience and legal panel MUST
  present a short glitch treatment on hover (pointer) and on keyboard focus when motion is
  allowed.
- **FR-002**: Marked interactive controls MUST present a short glitch treatment on press
  when motion is allowed, without preventing the control’s normal action.
- **FR-003**: Glitch treatments MUST be brief, non-looping for a single idle hover, and
  calm enough that text/icons remain recognizable during and after the effect.
- **FR-004**: While a glitch is playing, the affected control MUST remain activatable
  (click/tap/keyboard); the effect MUST NOT remove or meaningfully shrink the hit target.
- **FR-005**: When motion is allowed, mute/unmute transitions that expand or collapse the
  volume affordance MUST use the same glitch language for open and close.
- **FR-006**: When the visitor prefers reduced motion, the site MUST NOT play glitch
  treatments on hover, focus, press, or mute morph.
- **FR-007**: Glitch treatments MUST NOT introduce tracking, third-party scripts, or
  persistent visitor storage.
- **FR-008**: This feature MUST NOT change the site’s primary typeface, add a visitor-facing
  motion picker, or deepen per-video theme packs beyond reusing existing accent/surface
  colors for the glitch look.
- **FR-009**: After any glitch completes (or is skipped), the control MUST return to a
  stable, non-glitched visual resting state.

### Key Entities

- **Glitch hit target**: An interactive control opted into the glitch language (e.g.
  channel link, legal link, legal exit, mute/volume control).
- **Glitch treatment**: A short, one-shot visual disturbance (displacement / tear / color
  fringing character) triggered by hover, focus, press, or mute morph — not a continuous
  ambient animation.
- **Motion preference**: Visitor/OS preference for reduced motion; when set, all glitch
  treatments are omitted.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With motion allowed, at least 90% of informal testers notice a glitch on
  hover or press of a primary control within 5 seconds of interacting with it.
- **SC-002**: With reduced motion preferred, 0 glitch treatments play across hover, focus,
  press, and mute morph on a full walkthrough of landing + legal exit + mute (if shown).
- **SC-003**: During an active glitch, 100% of deliberate click/tap attempts on that
  control register on the first try in a short manual check (no “dead” frames).
- **SC-004**: A glitch treatment for a single hover or press completes in under 1 second
  and leaves the control in a stable resting appearance.
- **SC-005**: At least 80% of informal testers agree the effect feels intentional and
  on-brand (electronic) rather than broken or seizure-inducing intensity.

## Assumptions

- This feature builds on the published landing atmosphere and mute/volume control from
  `002-themed-background-video`; it does not replace background video or theme binding.
- A provisional implementation may already exist on branch `003-ui-glitch` from work
  extracted out of `002`; planning and tasks should treat that as a starting point to
  refine against this spec, not as an excuse to skip the spec-kit plan/tasks steps.
- Seravek (or any primary typeface change) remains a separate idea and is out of scope
  here even though an earlier idea combined type + glitch.
- Per-video deep motion packs (different glitch languages per theme) remain a separate
  idea (`IDEA-002`); this feature uses one shared glitch language tinted by existing
  theme colors.
- Client-side behavior required for triggering treatments will be justified in the feature
  plan against the constitution’s lightweight-by-default principle.
- No new tracking, cookies, or third-party motion libraries are introduced.
