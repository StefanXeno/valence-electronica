# Research: Desktop Stage UI Redesign

**Date**: 2026-08-28 | **Plan**: [plan.md](./plan.md)

All Technical Context items for this feature were resolved as follows.

## R1: Desktop HUD composition (symmetric peripheral layout)

- **Decision**: Replace the four-corner asymmetric layout with a **three-band desktop shell**:
  1. **Top band** — identity (name + hook, compact) top-left; social icon row top-right with
     matched inset and comparable visual mass.
  2. **Bottom tool dock** — single horizontal rail above the footer: jukebox icon on the left
     half of the dock, on-demand icons (About, Lyrics, Discography, Tour) in a **horizontal
     row** on the right half (no vertical stack). Mute sits at the dock’s trailing edge
     (bottom-right inset) when visible, sized like other circular controls.
  3. **Footer band** — copyright + legal links **bottom center**, full viewport width, below
     the dock and clear of mute/jukebox hit targets.
  Open panel bodies still anchor to the dock edge (expand upward/over the periphery), never
  the center stage.
- **Rationale**: The current bottom-right vertical `<details>` stack is the main asymmetry
  source (spec FR-001). A horizontal icon dock reduces vertical footprint and balances left
  (jukebox) vs right (four icons) at rest. Top band already pairs identity vs socials.
- **Alternatives considered**:
  - Keep vertical stack, shrink text only — still heavy on the right (rejected).
  - Centered single icon strip across full bottom — mute + jukebox fight for center (rejected).
  - Left/right side vertical rails — adds edge clutter on wide screens (rejected).

## R2: Icon-first controls (no new npm icon library)

- **Decision**: Use **inline SVG pictograms** in components, keyed by a short **icon token**
  in `src/content/ui/chrome.md` frontmatter (e.g. `jukeboxIcon: vinyl`, `lyricsIcon: lyrics`).
  Shipped defaults map to bundled SVG paths. Optionally allow a **single Unicode emoji** per
  token when the artist sets `*Icon: "🎵"` in chrome — rendered instead of SVG when value is
  one grapheme cluster (document in artist guide).
  Social channels keep existing **platform brand icons** from `site.json` (not replaced by
  generic emoji).
- **Rationale**: Font Awesome adds weight and a npm dependency (constitution IV). Emoji-only
  is editable but inconsistent across OS. Token → SVG gives consistent laptop look; emoji
  override keeps constitution III for artists who prefer it.
- **Alternatives considered**:
  - `@fortawesome/fontawesome-free` — extra bytes + dependency (rejected).
  - Emoji-only in chrome — zero deps but inconsistent rendering (fallback only).
  - Hard-coded icons in components — breaks FR-010/FR-011 (rejected).

## R3: Label reveal animation (slide toward center)

- **Decision**: One shared **floating label layer** (`#hud-label-reveal`) plus a small
  first-party module `src/lib/label-reveal.ts`:
  - On pointer enter / keyboard-visible focus of a `[data-hud-label]` control, clone the
    label text into the floater, position at the control’s center, animate with CSS
    `transform: translateX(...)` toward the viewport horizontal center (same `y` as control
    midline, clamped if needed).
  - On leave / blur, fade out and remove.
  - `@media (prefers-reduced-motion: reduce)` — show label adjacent to control (opacity fade,
    no travel) per FR-005.
  - Without scripting: `<summary>` keeps visually hidden text; optional `title` attribute
    from chrome label (degradation documented in contract).
- **Rationale**: Pure CSS cannot start from arbitrary per-control positions and converge on
  viewport center without N custom keyframes. One floater avoids duplicating label DOM in
  every control and prevents open panels from gaining duplicate titles at rest.
- **Alternatives considered**:
  - CSS-only `::after` on each control — cannot reach viewport center from all slots cleanly.
  - Permanent tooltip library — npm + overlap issues (rejected).
  - Slide label only halfway — weaker than spec FR-004 (rejected).

## R4: Glitch hit-target fix (dead zones during split)

- **Decision**: Route **all HUD `<details>` summary glitch** and **jukebox toggle glitch**
  through the existing **live-safe** keyframe family (`ui-glitch-live-*`) that avoids
  `clip-path` on the interactive element. Concretely:
  - Add `data-glitch-live` to on-demand panel summaries (or a class hook
    `.stage-dock__trigger`).
  - Extend `glitch.css` selectors so `.stage-dock details.glitch-hit.is-glitching` uses
    `ui-glitch-live-*` names (same pattern as `[data-jukebox].is-glitching`).
  - Ensure summary retains `pointer-events: auto` and full box dimensions during animation;
    pseudo-elements stay `pointer-events: none`.
  - Amend `003` contract note: HUD panel triggers are live-safe glitch targets.
- **Rationale**: Root cause is `clip-path` on standard `ui-glitch-*` keyframes carving
  invisible holes in hit testing (comment in `glitch.css` L4 already documents the mute fix).
  Live-safe family preserves visual glitch without clip-path fragmentation.
- **Alternatives considered**:
  - Invisible overlay `::before` capture layer — hacky, z-index fights (rejected).
  - Disable glitch on panels — regresses `004`/`005` (rejected).
  - `pointer-events: none` on animated element + click proxy — worse a11y (rejected).

## R5: Content model changes (minimal)

- **Decision**: Extend `src/content/ui/chrome.md` frontmatter with optional icon tokens:
  `jukeboxIcon`, `aboutIcon`, `lyricsIcon`, `discographyIcon`, `tourIcon` (string tokens or
  emoji). Existing title fields (`aboutTitle`, `lyricsTitle`, …) remain the **label** source
  for reveal and accessible names. No new collections.
- **Rationale**: FR-010/FR-011 + constitution VII — artist edits labels in one file; icons
  are optional overrides.
- **Alternatives considered**:
  - Separate `ui/icons.md` — two files for chrome (rejected).
  - Icon paths in public/ — artist-uploaded SVG complexity (deferred).

## R6: Successor spec relationship (`004` UI contract)

- **Decision**: This feature **supersedes the laptop layout rows** in
  `specs/004-landing-content-layout/contracts/stage-ui.md` for desktop only. Mobile
  degradation stays as-is until IDEA-013. Implementation MUST add a cross-reference in
  `stage-ui.md` header pointing to `009/contracts/desktop-hud-ui.md` as desktop authority.
- **Rationale**: Constitution VI — layout changes belong in specs, not drive-by CSS edits.
  User explicitly asked to be reminded to update specs on future layout changes.
- **Alternatives considered**:
  - Replace `stage-ui.md` entirely — loses as-built history (rejected; amend + pointer).

## R7: Testing approach

- **Decision**: `astro check` + `astro build` in CI; manual walkthrough in `quickstart.md`.
  Optional vitest for `label-reveal.ts` pure helpers (e.g. center offset math) if extracted;
  not required for plan gate (YAGNI).
- **Rationale**: Matches `004`/`003` pattern; visual/layout features are screenshot/manual
  verified.
