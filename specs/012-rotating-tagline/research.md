# Research: Rotating Identity Subtext

**Date**: 2026-08-28 | **Plan**: [plan.md](./plan.md)

## R1: Tagline pool file format and location

- **Decision**: JSON at `src/data/tagline-pool.json` with `timezone` + ordered `lines[]`.
- **Rationale**: Matches `stage-schedule.json` / `site.json` pattern (007, III).
- **Alternatives considered**: Rules in `site.json`; shared jukebox schedule file.

## R2: Normal vs easter-egg line classification

- **Decision**: No `rules` → normal; non-empty `rules` → easter egg; `rules: []` invalid at build.
- **Rationale**: Spec FR-002.
- **Alternatives considered**: Explicit `kind` enum (redundant).

## R3: Schedule rule types (v1)

- **Decision**: `date`, `range`, `weekday` (same as 007) + `time` (`HH:MM`, cross-midnight).
- **Rationale**: One editor vocabulary; time windows for late-night eggs.
- **Alternatives considered**: Visitor local TZ; cron strings.

## R4: Eligible set (replaces “first easter egg wins”)

- **Decision**: On each tick, compute:
  - If any easter-egg lines match (all rules AND) → eligible = **all** matching eggs in file order.
  - Else → eligible = all normal lines (expanded by weight — R5).
  - If eligible empty → show `site.json` fallback; pause rotation.
- **Rationale**: Session 2026-08-28 + FR-005/007; rotation needs a set, not a single winner.
- **Alternatives considered**: First match only (incompatible with minute rotation through multiple eggs).

## R5: Rotation sequence and weight

- **Decision**: Walk eligible list in file order; for normal lines, repeat each line `weight`
  times (default 1) before the next. Maintain `index`; advance `(index + 1) % length` every
  60 s after transition completes. Rebuild eligible list each tick (handles rule boundaries).
- **Rationale**: FR-006/007; predictable order for editors; weight = airtime share per cycle.
- **Alternatives considered**: Daily hash pick (superseded by owner 60 s rotation); random per minute (harder to QA).

## R6: 60-second cadence

- **Decision**: `setInterval` equivalent: schedule next step **60 s after** the previous
  transition finishes (fade-out + fade-in). First line shown immediately on rotator start
  (after eligibility computed); first **change** ≥60 s later.
- **Rationale**: FR-006/FR-018; avoids stacking fades if animation runs long.
- **Alternatives considered**: Wall-clock aligned to `:00` seconds (unnecessary complexity);
  interval during fade (would overlap FR-015).

## R7: Sequential fade transition

- **Decision**:
  - Single `.tagline` host (keep glitch-hit).
  - Phase A: add `data-tagline-phase="out"` → CSS `opacity: 0` (~400–600 ms).
  - On `transitionend` (opacity): swap text, phase B `data-tagline-phase="in"` → opacity 1.
  - Clear phase attribute when done.
  - If next text === current: skip phases (FR-017).
- **Rationale**: Owner request — full transparent gap before new line; not crossfade.
- **Alternatives considered**: Crossfade two stacked elements (rejected); Web Animations API (CSS sufficient).

## R8: Reduced motion

- **Decision**: `@media (prefers-reduced-motion: reduce)` sets transition duration 0; rotator
  uses instant `textContent` swap on tick (FR-016). Timer unchanged.
- **Rationale**: Spec US4; WCAG-friendly.
- **Alternatives considered**: Disable rotation entirely (spec requires same cadence, no fade).

## R9: Build-time vs client-time (hybrid)

- **Decision**: Validate pool at build via Hero frontmatter. SSR = `site.json` tagline. Client
  rotator module imports pool + starts timer.
- **Rationale**: Time eggs + minute rotation impossible statically.
- **Alternatives considered**: SSR first pool line (wrong for eggs and timer).

## R10: Europe/Berlin without date library

- **Decision**: Reuse `berlinCalendarParts()`; add `berlinTimeParts()` in `tagline-pool.ts`;
  duplicate date matchers from 007 (YAGNI on shared extract for v1).
- **Rationale**: Proven in repo; zero deps.

## R11: Cleanup and throttling

- **Decision**: On `pagehide` / Astro view transition away, clear timer and abort in-flight
  transition. If tab was backgrounded, on next tick recompute eligibility; at most one fade
  sequence at a time.
- **Rationale**: Edge cases in spec; avoid leak/overlap.
- **Alternatives considered**: `document.visibilitychange` catch-up burst (defer — single tick enough).

## R12: Testing strategy

- **Decision**: Vitest for `buildEligibleSet()`, `nextRotationIndex()`, rule matching;
  manual quickstart for 60 s wait, fade visually, reduced motion, easter-egg set switch.
- **Rationale**: Timer/fade need human or browser QA; pure logic unit-tested.

## R13: Artist documentation

- **Decision**: Update `docs/artist-guide.md` — pool file, 60 s rotation, fade behavior,
  eligible-set rules, link to contract.
- **Rationale**: FR-014 / VII.

## R14: Dev interval override

- **Decision**: **Deferred**. Optional `?tagline-interval=5` dev-only in tasks if QA painful.
- **Rationale**: YAGNI for v1; quickstart can use browser devtools to mock timers in impl phase if needed.
