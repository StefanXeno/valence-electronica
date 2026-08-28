# Research: Desktop Stage UI Redesign

**Date**: 2026-08-28 (as-built sync 2026-08-28) | **Plan**: [plan.md](./plan.md)

All Technical Context items for this feature were resolved as follows.

## R1: Desktop HUD composition (symmetric peripheral layout)

- **Decision**: Replace the four-corner asymmetric layout with a **three-band desktop shell**:
  1. **Top band** — identity (name + hook, compact) top-left; social icon row top-right with
     matched inset and comparable visual mass.
  2. **Bottom tool dock** — single horizontal rail above the footer: **left cluster** with
     jukebox icon + mute (when visible) side by side; **right segment** with on-demand icons
     (About, Lyrics, Discography, Tour) in a **horizontal row** (no vertical stack).
  3. **Footer band** — copyright + legal links **bottom center**, full viewport width, below
     the dock and clear of jukebox/mute hit targets.
  Open panel bodies still anchor to the dock edge (expand upward/over the periphery), never
  the center stage.
- **Rationale**: The current bottom-right vertical `<details>` stack is the main asymmetry
  source (spec FR-001). A horizontal icon dock reduces vertical footprint and balances left
  (jukebox + mute) vs right (four icons) at rest. Top band already pairs identity vs socials.
- **Alternatives considered**:
  - Keep vertical stack, shrink text only — still heavy on the right (rejected).
  - Centered single icon strip across full bottom — mute + jukebox fight for center (rejected).
  - Mute at dock trailing edge — owner preferred beside jukebox (rejected in polish pass).

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

## R3: Label reveal (anchored floater)

- **Decision**: One shared **floating label layer** (`#hud-label-reveal`) plus
  `src/lib/label-reveal.ts`:
  - On pointer enter / keyboard-visible focus of a **closed** `[data-hud-label]` control,
    copy label text into the floater and position horizontally centered on the control.
  - **Dock controls** (`data-hud-label-anchor="above"`): label above trigger (`6px` gap).
  - **Social links** (`data-hud-label-anchor="below"`): label below icon (`6px` gap).
  - Suppress floater when parent `<details>` is open (inline title shown in summary instead).
  - On leave / blur / panel open, fade out and remove.
  - `@media (prefers-reduced-motion: reduce)` — same anchored position, no travel (FR-005).
  - Without scripting: visually hidden text + `aria-label` (degradation in contract).
- **Rationale**: Owner polish rejected center-slide (collision with open panels / footer).
  Anchored floater keeps one DOM node, works for all dock slots, and pairs with inline open
  headers. Pure CSS cannot suppress reveal on open panels without JS.
- **Alternatives considered**:
  - Slide toward viewport center — original spec direction; rejected after visual review.
  - CSS-only `::after` on each control — no open-panel suppression (rejected).
  - Permanent tooltip library — npm + overlap issues (rejected).

## R4: Glitch hit-target fix (dead zones during split)

- **Decision**: Split glitch responsibilities:
  - **Closed summary hover**: `glitch-hit` on `<summary>` + `GlitchPress` one-shot (same as
    social links). Summary uses live-safe keyframes when glitching.
  - **Open/close morph**: `data-stage-panel` / `[data-jukebox]` shell gets morph glitch with
    **live-safe** keyframes (`ui-glitch-live-*`, no `clip-path` on hit target).
  - **Jukebox vinyl**: `data-glitch-live` on toggle only — continuous hover when collapsed.
  - `pointer-events: auto` on interactive elements; pseudo-elements `pointer-events: none`.
- **Rationale**: Putting `data-glitch-live` on entire panel `<details>` blocked `GlitchPress`
  hover. Moving `glitch-hit` to summary + morph on shell fixed hover and hit targets.
- **Alternatives considered**:
  - `data-glitch-live` on all panel `<details>` — blocked hover glitch (rejected).
  - Disable glitch on panels — regresses `004`/`005` (rejected).

## R5: Content model changes (minimal)

- **Decision**: Extend `src/content/ui/chrome.md` frontmatter with optional icon tokens:
  `jukeboxIcon`, `aboutIcon`, `lyricsIcon`, `discographyIcon`, `tourIcon` (string tokens or
  emoji). Existing title fields (`aboutTitle`, `lyricsTitle`, …) remain the **label** source
  for reveal, inline open headers, and accessible names. No new collections.
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
- **Alternatives considered**:
  - Replace `stage-ui.md` entirely — loses as-built history (rejected; amend + pointer).

## R7: Testing approach

- **Decision**: `astro check` + `astro build` in CI; manual walkthrough in `quickstart.md`.
  Optional vitest for pure helpers if extracted; not required (YAGNI).
- **Rationale**: Matches `004`/`003` pattern; visual/layout features are screenshot/manual
  verified.

## R8: Panel open/close motion (default vs glitch theme)

- **Decision**: Theme-split motion in `src/lib/panel-motion.ts` + component CSS:
  - **Default theme** (`data-hud-glitch="false"`): two-phase `280ms` ease — open expands
    shell then body (`is-panel-opening`); close collapses body then shell (`is-panel-closing`).
    Open is the reverse choreography of close.
  - **Glitch theme**: morph glitch on open/close unchanged; jukebox vinyl stays in fixed
    anchor cell during shell transition.
  - **Reduced motion**: instant toggle, no phases.
- **Rationale**: Owner wanted smooth default-theme animation without losing Nightmare morph.
  Two-phase JS hook needed because native `<details>` toggles body and shell simultaneously.
- **Alternatives considered**:
  - Single-phase CSS transition on open — felt abrupt vs close (rejected).
  - Same glitch morph on default theme — too harsh for non-glitch packs (rejected).

## R9: Open panel header + jukebox vinyl anchor

- **Decision**: When open, show chrome title **inline beside icon** in summary (`18px` scaled,
  icon `22px`). Jukebox vinyl wrapped in fixed `var(--control-size)` cell so it does not
  jump when panel expands. On-demand open width `18rem` scaled (fits “Discography”).
- **Rationale**: Owner polish — floating label redundant when open; vinyl stability improves
  perceived quality of dock animation.
