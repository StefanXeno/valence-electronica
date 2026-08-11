# Implementation Plan: Themed Background Video

**Branch**: `002-themed-background-video` | **Date**: 2026-08-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-themed-background-video/spec.md`

## Summary

Add a full-bleed, muted looping background video on the Valence landing experience, bound
to a basic color/surface theme from content data. Visitors can unmute only when the
configured clip has audio and video is actually playing. Reduced-motion and playback
failures fall back to a static/poster presentation while keeping the same theme. Impressum
and privacy are presented as near-fullscreen dismissible panels over that atmosphere
(margins on all sides, top exit, CSS motion with reduced-motion respect).

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 22+ (LTS) for build tooling only

**Primary Dependencies**: Astro 7 (static output); existing Fontsource variable font; no
new runtime frameworks. Minimal first-party client script for mute toggle and playback
fallback class toggling only.

**Storage**: Flat files — extend content with `src/data/background.json` (default video,
theme binding, `hasAudio`); media under `public/videos/` and poster stills under
`public/` (e.g. `public/images/posters/`). Existing `site.json` and legal Markdown
unchanged in role.

**Testing**: `astro check` + `astro build` as CI gates; manual acceptance walks in
`quickstart.md` (motion / reduced-motion / mute / legal panel / failure fallback). No
Playwright suite in this feature (YAGNI).

**Target Platform**: Static hosting on GitHub Pages
(`https://<owner>.github.io/valence-electronica/`)

**Project Type**: Static website (single Astro project at repository root)

**Performance Goals**: Primary landing content usable within 2 s on an average mobile
connection even while video buffers (SC-005). Clips short (~8–20 s), H.264 MP4 baseline,
target a few MB per clip. Video bytes are progressive/lazy relative to content; do not
block first paint of identity/channels/legal links.

**Constraints**: No runtime backend (I); free tier only (II); content-code separation for
video/theme/default (III); client JS only where justified (IV — see Complexity Tracking);
no tracking/third-party embeds (V); YAGNI — no switcher, schedule, deep theme packs, or
track-info panel (VI / FR-011)

**Scale/Scope**: One default background video + one basic theme pack for v1; data model
allows additional video entries later without UI switcher; landing + legal overlay routes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Static-First Delivery | Astro static output; prerendered HTML/CSS/JS/assets; no SSR adapter or serverless | PASS |
| II. Zero-Cost, Zero-Ops Publishing | Unchanged GitHub Pages + Actions free-tier deploy | PASS |
| III. Content-Code Separation | Default video, media paths, `hasAudio`, theme id, and theme tokens driven from data/CSS packs — not hard-coded in page copy components | PASS |
| IV. Lightweight by Default | Semantic HTML video + CSS themes/reduced-motion; **justified** minimal client JS for mute state and playback-failure fallback (see Complexity Tracking). Responsive from 320px; content-first loading | PASS (with justified exception) |
| V. Privacy & Legal Compliance | First-party static media only; no analytics/cookies; Impressum/privacy remain reachable with clearer exit UX; no third-party players | PASS |
| VI. Simplicity & Spec-Driven Change | No new npm UI libs; no video switcher/scheduler; sample/placeholder clip acceptable until real assets arrive | PASS |

**Post-design re-check (after Phase 1)**: PASS — contracts stay file-based; legal panel is
CSS + shared atmosphere layout (no modal framework); client JS surface stays limited to
mute/playback fallback. UI glitch/hover motion was extracted to `003-ui-glitch` and is
not part of this feature’s complexity budget.

## Project Structure

### Documentation (this feature)

```text
specs/002-themed-background-video/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── background-content.md
└── tasks.md             # Phase 2 (/speckit-tasks — not created by plan)
```

### Source Code (repository root)

```text
public/
├── videos/                    # MP4 (optional WebM) sample/placeholder clip(s)
└── images/posters/            # Still fallbacks per video id

src/
├── data/
│   ├── site.json              # Unchanged role (artist, channels, seo)
│   └── background.json        # Default video id, video entries, theme ids, hasAudio
├── styles/
│   ├── global.css             # Base tokens; may read theme variables
│   └── themes.css             # Basic theme packs (color/surface) keyed by data-theme
├── components/
│   ├── BackgroundAtmosphere.astro  # Full-bleed video + poster + theme attribute host
│   ├── MuteControl.astro           # Mute/unmute when hasAudio + playing; small script
│   ├── LegalPanel.astro            # Near-fullscreen panel chrome (margins, top exit)
│   ├── Hero.astro / Channels.astro / Footer.astro  # Adjusted for overlay readability
├── layouts/
│   └── Base.astro             # Apply data-theme from background default; slot atmosphere
├── pages/
│   ├── index.astro            # Landing over atmosphere
│   └── legal/[slug].astro     # Same atmosphere + LegalPanel wrapping content
└── lib/
    └── background.ts          # Typed helpers to resolve default video + theme from JSON
```

**Structure Decision**: Stay on the single Astro root project. Atmosphere is a shared
component used by landing and legal routes so direct legal URLs keep the themed backdrop
and exit-to-home panel pattern without a client-side router.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Client JS for mute toggle + playback failure class | Spec requires interactive unmute only after a user gesture and a non-broken fallback when autoplay/load fails (FR-003, FR-008) | Pure CSS checkbox hacks are brittle for accessible name/state and cannot reliably detect video `error` / blocked autoplay; server cannot know client playback outcome |
