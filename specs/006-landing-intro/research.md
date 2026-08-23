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
- **Status**: **Superseded by R12** for dev-only gating and optional `/dev/intro` route.
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

- **Decision**: Name line is a **portal cut-out** in a full-viewport white sheet — holes in
  the white show the live landing through the letterforms. Prefer techniques that keep the
  site rendered underneath (see R9–R11).
- **Rationale**: Meets FR-003a / SC-001a; matches product intent (white page → dive into
  Valence → full site).
- **Alternatives considered**:
  - Semi-transparent rgba fill — rejected (muddies the view; spec asks see-through portal).
  - Solid white/black text on scrim — rejected (hides site; not a cut-out).
  - Stroke-only outline without cut-out — rejected (does not read as “zoom into the word”).

## R9 — White sheet overlay

- **Decision**: Intro uses a **full-viewport white layer** over the landing. Atmosphere and
  stage stay in the DOM and paint behind the sheet; gate **pointer-events** on HUD regions
  until reveal — do **not** set `opacity: 0` on the whole stage/page-shell.
- **Rationale**: Portal cut-out requires the site to be visible through letterforms; hiding
  the stage breaks the effect.
- **Alternatives considered**:
  - Fade stage in after intro — rejected (nothing to see through the name during zoom).
  - Replace page with blank white SSR — rejected (flash; loses live atmosphere).

## R10 — Portal cut-out implementation

- **Decision**: Implementer chooses a cut-out technique that produces **holes in white**,
  not visible black letterforms. Document the chosen approach in the component. Known
  pitfalls from spike (2026-08-23):
  - `mix-blend-mode: destination-out` on a sibling text layer can render as **solid black
    text** instead of a cut-out when stacking/isolation is wrong.
  - SVG `<text>` inside a mask with CSS `scale` can **drift off-center** if transform-origin
    uses the text bounding box instead of the name center.
  - SVG `viewBox` units for font size do not match HTML `clamp()` — avoid mismatched lead/name
    sizing unless foreignObject or HTML drives layout.
- **Rationale**: Visual quality is fragile; spec captures intent; implementation must verify
  in browser (see quickstart scenario 10).
- **Alternatives considered**:
  - Single technique mandated in spec — rejected (browser/compositing differences; pick at
    implement time with acceptance tests).

## R11 — Zoom anchoring

- **Decision**: Name zoom uses CSS `transform: scale()` with **`transform-origin: center
  center`** on an element that is **flex- or translate-centered** in the viewport. Keyframes
  include the centering transform (e.g. `translate(-50%, -50%) scale(...)`) if position is
  absolute — do not scale from a corner.
- **Rationale**: “Zoom into Valence” requires the portal to grow from the word’s center
  without drift (user feedback 2026-08-23).
- **Alternatives considered**:
  - Scale from viewport center while text is off-center — rejected (does not feel like diving
    into the name).
  - Animate toward top-left HUD identity — rejected (out of scope unless requested later).

## R12 — Dev preview path

- **Decision**: `?replay-intro` honoured only when `import.meta.env.DEV` (or equivalent).
  Optional `src/pages/dev/intro.astro` clears `valence-intro-seen` and redirects to landing
  with replay — page omitted from production build output.
- **Rationale**: Maintainers need repeatability without shipping demo hooks to GitHub Pages.
- **Alternatives considered**:
  - Replay query in production — rejected (fans could bookmark replay URL).
  - localStorage clear in README only — kept as fallback, not primary workflow.

