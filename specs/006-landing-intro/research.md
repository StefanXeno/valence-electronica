# Research: Landing Intro

**Feature**: `006-landing-intro` | **Date**: 2026-08-22

## R1 — Once-only storage mechanism

- **Decision**: `localStorage` key `valence-intro-seen` with value `"1"` when intro completes
  or is skipped.
- **Rationale**: Spec requires per-browser persistence across sessions without cookies.
  `sessionStorage` would replay every new session (too noisy for fans). Constitution V allows
  a non-tracking UX preference flag.
- **Alternatives considered**:
  - `sessionStorage` — rejected (replays every browser session).
  - Cookie — rejected (constitution V default: no cookies).
  - No storage (CSS `:visited` hack) — rejected (unreliable, not spec-compliant).

## R2 — Skip interaction

- **Decision**: Escape key + click/tap on the intro overlay both skip immediately and set the
  playback flag.
- **Rationale**: Meets FR-006/FR-013; no separate skip button needed (overlay is the target).
  Document in quickstart for testers.
- **Alternatives considered**:
  - Dedicated “Skip” link — rejected (extra chrome; click-anywhere is faster).
  - Skip only after N seconds — rejected (traps impatient users).

## R3 — Demo replay for maintainers

- **Decision**: Query parameter `replay-intro` (presence check, no value required) bypasses
  read of playback flag for that load only; completion/skip still writes flag.
- **Rationale**: Lets artist/dev preview without clearing all site data.
- **Alternatives considered**:
  - `localStorage.removeItem` in devtools only — kept as fallback, not primary workflow.
  - Persistent `?replay-intro` that clears flag — rejected (too easy to leave enabled).

## R4 — Reduced motion path

- **Decision**: If `prefers-reduced-motion: reduce`, do not mount intro behavior; landing
  visible immediately. Demo query does not override reduce.
- **Rationale**: Matches 002/003/004 patterns and spec FR-008.
- **Alternatives considered**:
  - Static text without zoom — rejected (still adds overlay complexity; instant landing is
    clearer).

## R5 — Stage visibility during intro

- **Decision**: Landing atmosphere and stage content stay **rendered behind** the greeting.
  The **name line uses transparent letterforms** so the site remains visible through
  “Valence” during the zoom; avoid a full opaque scrim over the name. Stage HUD may stay
  visible through the name cut-out; full interactivity still waits until intro completes or
  is skipped.
- **Rationale**: Product intent (session 2026-08-22) — zoom **into** Valence as a window
  onto the site, not a opaque title card.
- **Alternatives considered**:
  - Hide entire stage until reveal — rejected (conflicts with see-through name).
  - Full-screen opaque black — rejected (fights atmosphere).

## R6 — Animation approach

- **Decision**: CSS `@keyframes` on `.landing-intro__name` for zoom-into-name; separate
  subtler entrance on `.landing-intro__lead`; thin script sets classes and removes overlay
  on `animationend` / timeout / skip.
- **Rationale**: Constitution prefers CSS-first motion; zoom target is name-only per spec.
- **Alternatives considered**:
  - Zoom entire greeting block — rejected (spec FR-003b).
  - Web Animations API only — rejected (more JS than needed).
  - GSAP / motion library — rejected (new dependency, YAGNI).

## R7 — Content fields

- **Decision**: Add `introLead` (first line) and `introName` (second line, required for
  intro to run) to `ui` collection schema and `chrome.md`.
- **Rationale**: Principle III; two-line layout is content-driven; name is the zoom target.
- **Alternatives considered**:
  - Single `introGreeting` string — rejected (cannot enforce line break + name styling).
  - New `intro` collection — rejected (YAGNI).

## R8 — Transparent name treatment

- **Decision**: Name line uses transparent fill with visible stroke and/or
  `background-clip: text` over the live page layer so atmosphere/HUD show through
  letterforms; contrast sufficient to read the name shape.
- **Rationale**: Meets FR-003a / SC-001a without opaque blocking the site.
- **Alternatives considered**:
  - Semi-transparent rgba fill — rejected (still muddiess the view; spec asks see-through).
  - Solid white text — rejected (hides site behind name).

