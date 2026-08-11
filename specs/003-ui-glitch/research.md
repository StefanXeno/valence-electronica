# Research: UI Glitch Interactions

**Date**: 2026-08-12 | **Plan**: [plan.md](./plan.md)

All Technical Context unknowns for this feature were resolved as follows.

## R1: Refine provisional implementation vs rewrite

- **Decision**: Treat the existing `003-ui-glitch` provisional code
  (`GlitchPress.astro`, `glitch.ts`, `glitch.css`, mute morph in `MuteControl.astro`,
  `glitch-hit` markers) as the **starting point** and refine it against the clarified
  spec — do not throw away the motion language.
- **Rationale**: Spec assumptions explicitly allow this; constitution VI prefers the
  simplest path that satisfies the spec; most visual work already exists.
- **Alternatives considered**: Greenfield rewrite (waste); ship provisional as-is without
  plan/tasks (violates constitution VI and leaves clarify gaps unfixed — e.g. continuous
  mute hover, focus-visible, closed set).

## R2: Trigger model (hover, press, keyboard-visible focus)

- **Decision**: Keep a small document-level binder (`GlitchPress`) that:
  - fires **one-shot** hover glitch on pointer enter for non-mute hit targets;
  - fires **one-shot** on `pointerdown` for non-mute hit targets;
  - fires **one-shot** on keyboard-visible focus only (e.g. element matches
    `:focus-visible`); mouse-click focus does not;
  - **skips** press glitch on mute (morph owns the click);
  - enforces **at most one** active treatment per control (press supersedes hover/focus).
- **Rationale**: Matches FR-001, FR-002, FR-013, FR-014 and clarify session answers.
- **Alternatives considered**: CSS-only `:hover`/`:active` (cannot gate focus-visible or
  stacking cleanly); per-element inline scripts (heavier, harder to keep consistent).

## R3: Continuous mute-button hover

- **Decision**: While the pointer is over the **mute button** only **and audio is muted**,
  allow a continuous glitch (looping or repeatedly refreshed treatment) that **stops
  immediately** on pointer-out or when audio starts playing. No other element may use
  continuous hover glitch. Touch without hover simply skips continuous mode; tap still
  gets morph on mute/unmute.
- **Rationale**: Clarify + post-implement owner polish — distinctive chrome in the muted
  idle state without competing with playing audio.
- **Alternatives considered**: Continuous while unmuted/playing (rejected by owner);
  one-shot hover on mute only (rejected earlier); continuous on all controls (rejected);
  continuous on entire volume shell including slider (slider is out of scope).

## R4: Mute morph vs press

- **Decision**: Unmute/mute click → **shell morph glitch only** (existing
  `MuteControl` path). Do not stack a separate press glitch on the button for that click.
- **Rationale**: Clarify Option B; avoids double-glitch chaos during expand/collapse.
- **Alternatives considered**: Press + morph (noisy); morph-only and also strip mute hover
  (rejected — continuous mute hover desired).

## R5: Reduced motion

- **Decision**: Dual gate — CSS `@media (prefers-reduced-motion: reduce)` disables
  glitch animations; binder checks `matchMedia('(prefers-reduced-motion: reduce)')`
  **at bind time and before each trigger** (and may listen for `change`) so mid-session
  preference flips stop new glitches without requiring a full rewrite.
- **Rationale**: Spec US3 / FR-006; CSS kill-switch helps if JS fails mid-animation;
  checking before triggers covers the deferred “live toggle” edge without persistence.
- **Alternatives considered**: CSS-only (misses class toggles still applied); JS-only
  (worse if styles still animate).

## R6: Intensity / photosensitivity

- **Decision**: Keep preset pool calm (short durations under 1 s for one-shots; modest
  displacement; theme-tinted RGB/scan character). Target soft bar ~≤3 distinct flashes/sec
  and no full-viewport flashes. **Owner eyeball** is the acceptance gate (SC-006), not
  automated WCAG tooling.
- **Rationale**: Clarify Option B + owner judgment; constitution IV a11y without fake
  certification claims.
- **Alternatives considered**: Formal WCAG 2.3.1 automation (overkill / false confidence);
  unconstrained intensity (fails SC-005/SC-006).

## R7: Content / data for hit targets

- **Decision**: **No new JSON schema**. Closed set is expressed in markup (e.g.
  `glitch-hit` on the four target kinds). Placeholders and volume slider never get the
  marker. Expanding the set requires a spec amendment.
- **Rationale**: Glitch is chrome, not artist content; constitution III still holds for
  channels/legal/background data elsewhere.
- **Alternatives considered**: Data-driven “glitchTargets” config (YAGNI for four fixed
  controls); open class opt-in without spec gate (rejected in clarify).

## R8: Dependencies

- **Decision**: First-party CSS + TS only. No GSAP/anime.js/framer or similar.
- **Rationale**: Constitution V/VI; feature is achievable with CSS animations + tiny
  orchestration script already present.
- **Alternatives considered**: Motion library (bundle + privacy/ops noise); WebGL glitch
  (far too heavy).
