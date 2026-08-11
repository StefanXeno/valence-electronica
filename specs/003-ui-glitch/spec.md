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

## Clarifications

### Session 2026-08-12

- Q: When a visitor clicks mute/unmute, separate press glitch plus morph, or morph only?
  → A: Morph only for mute/unmute clicks; hover/focus glitch on the mute button still
  allowed. Exception: while the pointer hovers the mute button **and audio is muted**,
  that button may glitch continuously for the duration of the hover — mute button only;
  no other element may use continuous hover glitch. Continuous mute hover MUST NOT run
  while background audio is playing.

### Session 2026-08-12 (post-implement owner polish)

- Q: Should continuous mute-button hover also run while audio is unmuted/playing?
  → A: No — continuous hover glitch only while muted; quiet chrome while audio plays.
- Q: How should legal Exit present visually?
  → A: X icon with accessible name “Exit” (legal overlay presentation owned by feature
  `002`; glitch hit-target rules unchanged).
- Q: Which interactive elements are in scope as glitch hit targets?
  → A: Closed set only: active channel links, legal links, legal exit, and the mute
  button (plus mute shell morph on unmute/mute). Volume slider and “coming soon”
  placeholders are out of scope for glitch treatments.
- Q: How hard should glitch intensity be capped for flash/photosensitivity?
  → A: Soft safety bar: about ≤3 distinct flashes per second, no large full-viewport
  flashes; same cap for continuous mute hover. Final intensity/taste within that bar is
  decided by the project owner (manual judgment), not by automated compliance tooling.
- Q: If multiple glitch triggers fire at once on one control, what should happen?
  → A: At most one active glitch per control; press supersedes hover/focus; no stacked
  one-shots. Mute continuous hover and mute morph keep their already-clarified special
  rules.
- Q: Should focus glitch play for every focus event, or only keyboard-style focus?
  → A: Only keyboard-visible focus triggers the focus glitch; focus caused by a mouse
  click does not. Pointer users rely on hover/press; mute continuous hover remains
  pointer-hover only.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Interactive controls feel alive on hover and press (Priority: P1)

A visitor explores the landing page and legal panel. When they hover or press the in-scope
controls (active channel links, legal links, legal exit; mute covered in User Story 2),
those controls briefly glitch in a calm, electronic-music style — then settle — so the UI
feels part of the same atmospheric world as the background, without becoming noisy or hard
to use. The volume slider and placeholder channel chips do not glitch.

**Why this priority**: The glitch language is the core value of this feature. Without a
clear, tasteful hit/press treatment on key controls, there is nothing to ship.

**Independent Test**: With motion allowed, hover and press channel/legal/mute controls;
confirm a short glitch plays and the control remains usable and readable afterward.

**Acceptance Scenarios**:

1. **Given** motion is allowed and an in-scope control other than the mute button is
   visible, **When** the visitor hovers it with a pointer or moves keyboard-visible focus
   onto it, **Then** a short glitch treatment plays once for that interaction (not a
   continuous loop while idle).
2. **Given** motion is allowed and an in-scope control is visible, **When** the visitor
   presses/activates it (except mute/unmute — see User Story 2), **Then** a short glitch
   treatment plays and the control’s normal action still occurs (navigate, etc.).
3. **Given** a glitch is playing on a control, **When** the visitor tries to click or
   activate that same control, **Then** the control remains hittable and activates
   reliably (glitch must not steal or shrink the hit target).
4. **Given** motion is allowed and an in-scope control receives focus from a mouse click,
   **When** that focus arrives without keyboard-visible focus, **Then** no focus glitch
   plays for that focus change (hover/press rules still apply).

---

### User Story 2 - Mute/volume shell morphs with the same language (Priority: P2)

When the visitor unmutes or mutes background audio, the mute/volume control’s shape change
(circle ↔ pill with volume) is accompanied by the same glitch language so the expand and
collapse feel intentional rather than a plain layout jump. A mute/unmute click does not
also fire a separate press glitch on the button — the morph is the click treatment. While
the pointer rests on the mute button **and audio is muted**, that button alone may keep
glitching for the whole hover (continuous); no other control may do that, and continuous
hover MUST NOT run while audio is playing.

**Why this priority**: The mute control is the most distinctive interactive chrome on the
atmospheric landing page; tying its morph to the glitch language completes the motion
story, but hover/press on links alone already delivers value.

**Independent Test**: Unmute then mute with motion allowed; confirm expand and collapse
use a glitch-styled transition, no extra press glitch stacks on the click, hover on the
mute button can sustain glitch while the pointer stays on it, and the control remains
operable throughout.

**Acceptance Scenarios**:

1. **Given** background audio can be unmuted and motion is allowed, **When** the visitor
   unmutes, **Then** the control expands to reveal volume with a short glitch treatment
   and no separate press glitch is required on the button for that click.
2. **Given** sound is on and motion is allowed, **When** the visitor mutes, **Then** the
   control collapses with a short glitch treatment and returns to the compact muted state
   (again without a stacked press glitch).
3. **Given** a morph glitch is in progress, **When** the visitor clicks the mute toggle
   again, **Then** the click still registers (no dead zones from the animation).
4. **Given** motion is allowed, the mute button is visible, and audio is muted, **When**
   the visitor keeps the pointer hovering over the mute button, **Then** that button may
   glitch continuously for the duration of the hover and stops when the pointer leaves.
5. **Given** motion is allowed and audio is playing, **When** the visitor hovers the mute
   button, **Then** continuous hover glitch MUST NOT run.
6. **Given** motion is allowed, **When** the visitor hovers any in-scope control that is
   not the mute button, **Then** that control MUST NOT use continuous hover glitch
   (one-shot only per User Story 1).

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
   interactive controls (including sustained hover on mute), **Then** no glitch animation
   plays.
2. **Given** reduced motion is preferred, **When** the visitor mutes or unmutes, **Then**
   the control may still change state/layout as needed for clarity, but without glitch
   motion language.
3. **Given** reduced motion is preferred, **When** the visitor uses the keyboard, **Then**
   focus and activation remain clear without relying on glitch cues.

---

### Edge Cases

- Rapid hover in/out or repeated presses on non-mute controls → treatments stay short and
  do not stack into a long or chaotic sequence; the control remains usable.
- Mute button continuous hover → allowed only while the pointer is over the mute button
  **and** background audio is muted; leaving the button or unmuting MUST end the continuous
  glitch and return to a stable resting state (must not stay glitching after pointer-out
  or while audio is playing).
- Mute/unmute click → morph glitch only; do not stack a separate press glitch on the same
  click. If continuous mute hover was active, morph **wins** for the click; continuous
  hover may resume only if the pointer is still over the mute button, audio is muted, and
  the morph has completed.
- Touch devices without true hover → press/tap still gets a brief treatment where
  applicable; lack of hover must not break the control; continuous mute hover simply does
  not apply without a hover pointer.
- Mute control hidden (no audio, fallback, or reduced-motion video off) → no glitch
  required for that control while it is unavailable.
- Overlapping hover and press (non-mute) → at most one active glitch per control; press
  supersedes an in-flight hover/focus treatment; never leave the control stuck in a
  glitched visual state; do not stack multiple one-shots on the same activation.
- Focus arriving together with pointer press (e.g. mouse click on a link) → press treatment
  wins; mouse-click focus MUST NOT play a focus glitch; keyboard-visible focus still may
  play a one-shot when navigating with the keyboard.
- Very small viewports → glitch displacement must not push critical controls off-screen or
  cover primary content permanently.
- Volume slider or placeholder (“coming soon”) channel chips → no glitch treatment on
  hover, focus, press, or drag; they are outside the closed hit-target set.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: In-scope glitch hit targets (see FR-011) on the landing experience and legal
  panel MUST present a short glitch treatment on pointer hover and on keyboard-visible
  focus when motion is allowed. Focus caused by a mouse click MUST NOT trigger the focus
  glitch. For controls other than the mute button, hover glitch MUST be one-shot (not
  continuous while idle).
- **FR-002**: In-scope hit targets other than the mute/unmute control MUST present a short
  glitch treatment on press when motion is allowed, without preventing the control’s
  normal action. Mute/unmute clicks are covered by FR-005 instead (no separate stacked
  press glitch on that click).
- **FR-003**: Glitch treatments MUST be calm enough that text/icons remain recognizable
  during and after the effect. Non-mute hover/press/keyboard-focus treatments MUST be
  brief and non-looping for a single idle hover. The mute button MAY glitch continuously
  while the pointer hovers it **and** audio is muted; continuous hover glitch is forbidden
  on every other element and MUST NOT run while background audio is playing.
- **FR-004**: While a glitch is playing, the affected control MUST remain activatable
  (click/tap/keyboard); the effect MUST NOT remove or meaningfully shrink the hit target.
- **FR-005**: When motion is allowed, mute/unmute transitions that expand or collapse the
  volume affordance MUST use the same glitch language for open and close; that morph is
  the click treatment for mute/unmute (no additional press glitch required on the same
  click).
- **FR-006**: When the visitor prefers reduced motion, the site MUST NOT play glitch
  treatments on hover, keyboard-visible focus, press, continuous mute hover, or mute morph.
- **FR-007**: Glitch treatments MUST NOT introduce tracking, third-party scripts, or
  persistent visitor storage.
- **FR-008**: This feature MUST NOT change the site’s primary typeface, add a visitor-facing
  motion picker, deepen per-video theme packs beyond reusing existing accent/surface
  colors for the glitch look, or apply glitch treatments to the volume slider or
  placeholder channel chips.
- **FR-009**: After any glitch completes (or is skipped), or when continuous mute hover
  ends (pointer leaves), the control MUST return to a stable, non-glitched visual resting
  state.
- **FR-010**: Continuous hover glitch MUST apply only to the mute button, and only while
  background audio is muted; it MUST stop when audio is playing. Other in-scope hit
  targets MUST remain one-shot on hover.
- **FR-011**: The closed set of glitch hit targets for this feature is exactly: active
  channel links, legal footer links, legal-panel exit, and the mute button (with mute
  shell morph on unmute/mute). No other elements are in scope unless this spec is amended.
- **FR-012**: Glitch treatments (including continuous mute hover) MUST stay within a soft
  safety bar of roughly ≤3 distinct visual flashes per second and MUST NOT use large
  full-viewport flashes. Final intensity within that bar is owner-approved by eye (no
  automated photosensitivity tooling required for this feature).
- **FR-013**: A control MUST present at most one active glitch treatment at a time. When
  triggers overlap, press supersedes hover/keyboard-focus; a new one-shot MUST NOT stack
  on an in-flight one-shot. Mute continuous hover (FR-010) and mute morph (FR-005) keep
  their special rules: on mute/unmute click, morph supersedes continuous hover; continuous
  hover may resume only if the pointer remains over the mute button, audio is muted, and
  morph has ended.
  Treatments MUST NOT leave the control unusable or stuck glitching after the interaction
  ends.
- **FR-014**: Focus glitch MUST fire only for keyboard-visible focus. Pointer users rely on
  hover and press (and mute continuous hover / morph where applicable); a normal focus
  outline remains available for accessibility regardless of glitch.

### Key Entities

- **Glitch hit target**: One of the closed-set interactive controls: active channel link,
  legal link, legal exit, or mute button (shell morph is a mute-specific treatment, not a
  separate hit target).
- **Glitch treatment**: A short, one-shot visual disturbance (displacement / tear / color
  fringing character) triggered by pointer hover, keyboard-visible focus, press, or mute
  morph — except continuous hover glitch, which is allowed only on the mute button while
  the pointer remains over it and audio is muted.
- **Motion preference**: Visitor/OS preference for reduced motion; when set, all glitch
  treatments (including continuous mute hover) are omitted.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With motion allowed, at least 90% of informal testers notice a glitch on
  hover or press of a primary control within 5 seconds of interacting with it.
- **SC-002**: With reduced motion preferred, 0 glitch treatments play across hover,
  keyboard-visible focus, press, continuous mute hover, and mute morph on a full
  walkthrough of landing + legal exit + mute (if shown).
- **SC-003**: During an active glitch, 100% of deliberate click/tap attempts on that
  control register on the first try in a short manual check (no “dead” frames).
- **SC-004**: A one-shot glitch treatment for a single hover or press completes in under 1
  second and leaves the control in a stable resting appearance; continuous mute-button
  hover may last for the hover duration but MUST end immediately when the pointer leaves.
- **SC-005**: At least 80% of informal testers agree the effect feels intentional and
  on-brand (electronic) rather than broken or seizure-inducing intensity.
- **SC-006**: Owner review confirms treatments stay within the soft flash/intensity bar
  (roughly ≤3 distinct flashes/sec, no large full-viewport flashes), including continuous
  mute hover.

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
- Adding glitch to new controls later requires an explicit spec amendment; open-ended
  “mark anything” opt-in is not part of this feature.
- Photosensitivity is gated by the soft safety bar (FR-012) plus project-owner taste;
  this is not a claim of automated WCAG 2.3.1 certification.
