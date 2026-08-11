# Research: Themed Background Video

**Date**: 2026-08-10 | **Plan**: [plan.md](./plan.md)

All Technical Context unknowns for this feature were resolved as follows.

## R1: Background media format and hosting

- **Decision**: Ship short looping **MP4 (H.264)** as the baseline under `public/videos/`;
  optional WebM as a progressive enhancement `<source>` when file size wins. Posters as
  static images under `public/images/posters/`. First-party static hosting only (no CDN
  required for v1; Git LFS later if assets grow).
- **Rationale**: Universal mobile/desktop playback; constitution V forbids third-party
  embeds by default; static files match constitution I/II.
- **Alternatives considered**: GIF/animated WebP (poor quality/size); YouTube/Vimeo embed
  (privacy, cookies, rejected); HLS streaming (backend/CDN complexity, YAGNI).

## R2: Autoplay, mute, and audio policy

- **Decision**: `<video autoplay muted loop playsinline>` for start state. Unmute only via
  explicit control after a user gesture. Content field `hasAudio: boolean` decides whether
  the control is rendered at all (hide when false). Do not probe the media file at runtime
  to detect audio tracks.
- **Rationale**: Matches browser autoplay rules and clarifications (control only while
  playing; hide when no audio). Declarative `hasAudio` keeps content-code separation and
  avoids flaky MediaSource probing.
- **Alternatives considered**: Always show mute control (rejected in clarify); detect audio
  via WebAudio/decoded buffers (heavy, fragile).

## R3: Reduced motion and playback failure

- **Decision**: Prefer **CSS** `@media (prefers-reduced-motion: reduce)` to hide/disable
  the looping `<video>` and show the poster/still. Small client script listens for `error`
  / failed play and adds a `data-bg-state="fallback"` (or class) for load/autoplay failure.
- **Rationale**: Reduced motion should work even if JS fails; failure detection needs a
  tiny script (justified under constitution IV).
- **Alternatives considered**: JS-only reduced-motion handling (worse if JS blocked);
  no failure handling (violates FR-008).

## R4: Basic theme binding

- **Decision**: Set `data-theme="<themeId>"` on `<html>` from the configured default
  video’s `themeId`. Theme packs live in `src/styles/themes.css` as token overrides
  (background, surface, text, accent, border, scrim strength). Same theme applies for
  playback and static fallback.
- **Rationale**: Spec limits this feature to color/surface mood; CSS variables keep packs
  maintainable and avoid shipping deep type/motion packs (IDEA-002).
- **Alternatives considered**: Per-component theme props (harder to keep global mood);
  runtime theme JS (unnecessary for static default).

## R5: Legal panel presentation without a SPA

- **Decision**: Keep routes `/legal/imprint` and `/legal/privacy`. Each legal page reuses
  the shared atmosphere (video/poster + theme) and renders content inside a
  near-fullscreen **panel** with viewport margins and a top **Exit** control linking home
  (`/`). Open animation via CSS (`@keyframes` / transition) skipped under reduced motion.
- **Rationale**: Spec requires direct URL access, exit back to landing, margins revealing
  atmosphere, and readable legal text — all achievable with static pages + CSS, without a
  client router or dialog library (constitution IV/VI).
- **Alternatives considered**: In-page `<dialog>` only on index (breaks refresh/direct
  legal URLs unless duplicated); Astro View Transitions (optional later polish, not
  required); full separate plain legal layout (rejected by clarify answer).

## R6: Where content lives

- **Decision**: New `src/data/background.json` for videos, default id, `hasAudio`, theme
  ids, and media paths. Keep `site.json` for artist/channels/seo. Typed helper
  `src/lib/background.ts` resolves the default entry at build time.
- **Rationale**: Separates atmospheric media config from artist profile; still one edit
  locus for video/theme (SC-006). JSON remains GitHub-UI editable.
- **Alternatives considered**: Stuffing videos into `site.json` (noisier); Markdown
  frontmatter (awkward for asset lists).

## R7: Client JS budget

- **Decision**: One small bundled script attached to `MuteControl` (and shared fallback
  wiring in the atmosphere component): toggle `muted` / `volume`, update accessible
  name/pressed state, set fallback state on error/play rejection. No analytics, no
  frameworks, no hydration libraries. UI glitch/hover motion is out of scope here and
  tracked as `003-ui-glitch`.
- **Rationale**: Constitution IV exception documented in plan Complexity Tracking; legal
  panel needs no JS for MVP.
- **Alternatives considered**: React/Solid island (rejected: dependency weight); zero JS
  with checkbox mute (weak a11y and no failure path); bundling glitch motion into this
  feature (rejected — separate spec `003-ui-glitch`).

## R8: Sample assets for shipping

- **Decision**: Ship a clearly temporary sample/placeholder loop + poster sized for
  mobile-friendly weight until the artist provides final clips.
- **Rationale**: Spec assumption allows placeholders; unblocks implementation and QA.
- **Alternatives considered**: Blocking the feature on final assets (unnecessary delay).
