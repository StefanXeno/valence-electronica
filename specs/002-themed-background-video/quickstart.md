# Quickstart & Validation: Themed Background Video

**Date**: 2026-08-10 | **Plan**: [plan.md](./plan.md)

## Prerequisites

- Node.js 22+ (LTS) and npm
- Feature branch `002-themed-background-video` with implementation complete
- Sample (or real) files present at the paths declared in `src/data/background.json`

## Local development

```bash
npm install
npm run dev       # http://localhost:4321/valence-electronica/
```

## Quality gates (same as CI)

```bash
npm run check
npm run build
npm run preview
```

## Validation scenarios (map to spec)

1. **US1 — muted atmosphere**: With motion allowed, open the landing page. Expect: looping
   full-bleed background video, no audible sound, artist name/tagline/channels still
   readable (scrim/contrast OK), layout usable at ~320px width.
2. **US2 — unmute (audio clips only)**: Set `hasAudio: true` on the default video (and use
   a clip with a soundtrack). Reload. Expect: mute control visible; first load silent;
   unmute then mute again updates the control’s accessible state; sound follows the
   control. Set `hasAudio: false`. Expect: control absent.
3. **US3 — theme binding**: Change `themeId` on the default video to another pack defined
   in `themes.css`, rebuild/refresh. Expect: color/surface mood changes on landing and on
   legal routes without editing components. With reduced motion (scenario 4), the same
   theme still applies to the static fallback.
4. **US4 — reduced motion**: Enable OS/browser “reduce motion”, reload landing. Expect: no
   looping video; poster/static fallback visible; mute control hidden/disabled.
5. **US5 — legal panel**: From the footer, open Impressum and Datenschutzerklärung.
   Expect: near-fullscreen panel with visible margin on all sides; atmosphere visible in
   the margins; top Exit returns to landing; long text scrolls inside the panel. With
   motion allowed, panel entrance is animated; with reduced motion, animation is
   skipped/minimized. Open `/legal/imprint` directly in a new tab — same panel + Exit.
6. **Failure fallback**: Temporarily break the video `src` path in `background.json` (or
   block media in devtools), reload. Expect: readable content + themed static/solid
   fallback; no blank hero; mute control hidden.
7. **Content-code separation**: Swap `defaultVideoId` / poster / theme only in
   `background.json` (+ asset files). Expect: no component edits required for the new
   default (see [contracts/background-content.md](./contracts/background-content.md)).
8. **Weight / privacy**: Network panel, disable cache. Expect: no third-party media hosts;
   identity content appears without waiting for the full video download; only first-party
   requests for page assets.

## Reference

- Data shape: [data-model.md](./data-model.md)
- Maintainer contract: [contracts/background-content.md](./contracts/background-content.md)
- Acceptance source: [spec.md](./spec.md)
