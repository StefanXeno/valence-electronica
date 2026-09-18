# Implementation Plan: Stage Artist Polish

**Branch**: `022-stage-artist-polish` | **Date**: 2026-09-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/022-stage-artist-polish/spec.md`

## Summary

Polish the **stage itself**: ship dual **mobile/desktop** atmosphere videos
for every V-Flip stage bed, make Show me How play music, brighten Taking
Over, add optional **NCS center logo**, ensure Minecraft sprites stay
absent, give shuffle a **new look**, and guarantee phone bottom-player
flows work by **tap alone**. No in-product “cut” tooling for Taking Over.

**Technical approach** (from [research.md](./research.md)):

- Schema + loaders: locked fields `sourcesMobile` / `sourcesDesktop`
  (no nested `atmosphere` dual-option); viewport resolve in
  `background.ts` / `stage-switch.ts`.
- Content: Show me How `hasAudio: true` + music bed; dual assets per entry;
  optional `centerLogo`.
- Theme CSS brighten for Taking Over; new shuffle glyph; center overlay
  component; **verify** Minecraft sprites absent (no invented asset purge).
- Tap-sufficient phone open (**after `021`** for US6 QA).
- Contract: [contracts/stage-artist-polish.md](./contracts/stage-artist-polish.md).
- **Depends on**: operator-supplied dual video + Show me How audio +
  ⚠️ owner-approved NCS art; `021` before US6; do not fight `020` chrome.
  Asset-gated tasks skip with notes if files missing — other 022 work continues.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 22+ (build only)

**Primary Dependencies**: Astro 7; existing atmosphere, theme packs,
jukebox, player-dock. **No new npm packages.**

**Storage**: `src/content/jukebox/*.md` (dual sources, hasAudio, centerLogo);
`public/videos/*` + approved NCS image; `src/styles/themes.css` (brightness);
`src/content/ui/chrome.md` (shuffle icon token if needed).

**Testing**: `astro check` + `astro build`; manual [quickstart.md](./quickstart.md).
Optional maintainer script to assert dual-video completeness (reuse or
extend existing verify scripts — no new deps without approval).

**Target Platform**: Static GitHub Pages

**Project Type**: Single-repo Astro static site

**Performance Goals**: Two viewport assets exist in content, but only the
active viewport’s video should be loaded/played at a time when practical;
avoid doubling decode on one device. Constitution IV mobile usability.

**Constraints**: Static-first (I); free tier (II); content binds media/logo
(III); no heavy new JS frameworks (IV); no tracking; NCS embed is a static
image asset not a third-party player (V); YAGNI on video editor (VI);
artist guide (VII)

**Scale/Scope**: Jukebox media model extension + theme/shuffle/overlay
polish. Not nav IA (`020`) or vinyl discovery (`021`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Static-First | Dual videos are static assets; no runtime media server | PASS |
| II. Zero-Cost, Zero-Ops | Unchanged Pages/Actions; larger video assets still static files | PASS |
| III. Content-Code Separation | Video paths, hasAudio, centerLogo in jukebox content | PASS |
| IV. Lightweight by Default | Viewport picker reuses existing stage-switch; brightness is CSS; justify any small overlay JS | PASS |
| V. Privacy & Legal | Static NCS image only with owner approval — not a tracking embed. No analytics | PASS ⚠️ owner must approve NCS asset usage |
| VI. Simplicity & Spec-Driven | Dual-video pairing only; no in-app cutter; sprites verify-absent | PASS |
| VII. Artist-Facing Docs | Artist guide must document dual videos + logo + audio expectations | PASS |

**Post-design re-check**: PASS — data-model extends content schema; contract
is presentation/behavior; no backend.

⚠️ **Security / compliance note**: Shipping partner logos requires
owner-approved artwork and usage permission (spec Assumptions).

## Project Structure

### Documentation (this feature)

```text
specs/022-stage-artist-polish/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── stage-artist-polish.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── content/
│   └── jukebox/*.md              # Dual sources; Show me How audio; centerLogo
├── content.config.ts             # Schema for sourcesMobile/Desktop, centerLogo
├── lib/
│   ├── background.ts             # Viewport-aware BackgroundVideo
│   ├── stage-switch.ts           # Load correct sources on select + resize
│   ├── theme-packs.ts            # Unchanged IDs unless new pack needed
│   ├── hud-icons.ts              # New shuffle token if required
│   ├── player-dock.ts            # Verify tap-sufficient open/select
│   └── player-handle-tap.ts      # Tap path remains primary
├── components/
│   ├── BackgroundAtmosphere.astro
│   ├── CenterStageLogo.astro     # NEW: optional center mark
│   ├── HudIcon.astro             # New shuffle glyph
│   └── Jukebox.astro             # Shuffle control consumes new icon
├── styles/
│   ├── themes.css                # Brighter Taking Over / acid-lime treatment
│   └── global.css                # Center logo layout; no sprite layer
public/
├── videos/                       # Mobile + desktop assets per track
└── images/                       # NCS / center logo (owner-approved)
docs/
└── artist-guide.md
```

**Structure Decision**: Single Astro project; extend existing atmosphere
pipeline rather than a second media system.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Dual source fields + viewport resolver | FR-003 hard requirement | One shared file fails SC-007 |
| Center logo component | FR-004 center-stage mark | Corner badge fails “center” |

## Phase 0 & Phase 1 Outputs

| Artifact | Path | Status |
|----------|------|--------|
| Research | [research.md](./research.md) | Complete |
| Data model | [data-model.md](./data-model.md) | Complete |
| Contract | [contracts/stage-artist-polish.md](./contracts/stage-artist-polish.md) | Complete |
| Quickstart | [quickstart.md](./quickstart.md) | Complete |

## Cross-feature dependencies

| Spec | Note |
| ---- | ---- |
| `020` | Do not reintroduce circular docks; Links stays theirs |
| `021` | Selection-first + vinyl; this feature needs opaque dual-video + tap |
| `002` / `005` / `010` | Extended binding; membership model unchanged |
| `015` | Tap supersedes swipe-only reading for bottom player |

## Next Step

`/speckit-tasks` → [tasks.md](./tasks.md). Analyze before implement.
