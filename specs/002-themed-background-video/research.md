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

## R5: Legal panel as in-page overlay (static routes + History API)

- **Decision**: Keep shareable routes `/legal/imprint` and `/legal/privacy`. Prerender all
  legal panels into the shared shell (`LegalOverlay` + `LegalPanel`). Footer clicks and
  Exit use small first-party JS (`preventDefault` + `history.pushState` / `popstate`) so
  opening/closing does **not** full-reload the document — atmosphere/audio keep running.
  Direct visit/refresh on `/legal/{slug}` still SSRs the matching panel open over the
  landing shell. Exit control is an **X** icon with accessible name “Exit”. Open animation
  via CSS skipped under reduced motion.
- **Rationale**: Owner wants legal reading without tearing down the landing session; German
  law still needs reachable Impressum/privacy (constitution V); URLs stay bookmarkable.
  Still static HTML/JS artifacts (constitution I); no SPA framework.
- **Alternatives considered**: Full page navigation only (original MVP; rejected after
  owner feedback — interrupts audio/atmosphere); in-page `<dialog>` only on index without
  duplicated deep-link HTML (breaks refresh/direct URLs); Astro View Transitions (heavier
  than needed); third-party dialog/router libs (rejected: IV/V/VI).

## R6: Where content lives

- **Decision**: New `src/data/background.json` for videos, default id, `hasAudio`, theme
  ids, and media paths. Keep `site.json` for artist/channels/seo. Typed helper
  `src/lib/background.ts` resolves the default entry at build time.
- **Rationale**: Separates atmospheric media config from artist profile; still one edit
  locus for video/theme (SC-006). JSON remains GitHub-UI editable.
- **Alternatives considered**: Stuffing videos into `site.json` (noisier); Markdown
  frontmatter (awkward for asset lists).

## R7: Client JS budget

- **Decision**: Small first-party scripts only: (1) `MuteControl` for mute/volume +
  playback-failure fallback; (2) `LegalOverlay` for in-page open/close + History API URL
  sync. No analytics, no frameworks, no hydration libraries. Without JS, footer `href`s
  still hard-navigate to `/legal/{slug}` and Exit still links home.
- **Rationale**: Constitution IV exceptions documented in plan Complexity Tracking; progressive
  enhancement keeps legal reachable if JS fails (constitution V).
- **Alternatives considered**: React/Solid island (rejected: dependency weight); zero JS
  with checkbox mute (weak a11y and no failure path); full reload for every legal open
  (rejected by owner — kills atmosphere/audio continuity).

## R8: Sample assets for shipping

- **Decision**: Ship a clearly temporary sample/placeholder loop + poster sized for
  mobile-friendly weight until the artist provides final clips.
- **Rationale**: Spec assumption allows placeholders; unblocks implementation and QA.
- **Alternatives considered**: Blocking the feature on final assets (unnecessary delay).
