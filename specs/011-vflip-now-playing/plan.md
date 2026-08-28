# Implementation Plan: V-Flip Now Playing

**Branch**: `011-vflip-now-playing` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-vflip-now-playing/spec.md`

## Summary

Turn **V-Flip** into the landing player: collapsed **one box** with bottom **toolbar**
(vinyl, shuffle, loop, mute/volume). Open drawer shows **panel title + track list**
with **inline track info** on the selected row. Lyrics and Track info leave the right
dock; **lyrics are not shown** in the open drawer (v1). Shuffle is a **toggle**
(default on); loop **pins** the current track and wins over shuffle. Allowed hops use
**dual-mode crossfade** — ~1000ms smooth between calm themes, ~720ms stepped/glitch
when Nightmare (or any glitch pack) is involved. No-audio dwell is **45s**; audio
entries use **atmosphere video file duration**. Visit-only mode flags; no new packages
or tracking.

**Technical approach** (from [research.md](./research.md)):

- Move `MuteControl` inside `Jukebox.astro`; drop mute slot from `StageDock`.
- Embed `TrackInfoPanel` nodes in list rows; strip Lyrics/Track info icons from
  `StagePanels`.
- `playback.ts` + dwell/`pickOtherId` helpers; chrome shuffle/loop + panel title fields.
- Dual video layers in `BackgroundAtmosphere`; `resolveThemeHandoff()` + crossfade.
- Vitest for dwell classifier + shuffle pick (mock video duration).
- Amend `009` / `010` HUD contracts; update artist guide.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 22+ (build tooling only)

**Primary Dependencies**: Astro 7 static output; existing `002` atmosphere/mute,
`004` stage-switch, `005` themes, `006` intro attributes, `007` schedule, `009` dock
/ panel-motion / glitch, `010` track info nodes. **No new npm packages.**

**Storage**: `src/content/jukebox/*.md` (unchanged);
`src/content/ui/chrome.md` (shuffle/loop labels, panel title, listen-on label).
No database. Playback flags are memory-only.

**Testing**: `astro check` + `astro build` in CI; vitest for dwell + pick helpers;
manual [quickstart.md](./quickstart.md).

**Target Platform**: Static GitHub Pages (`/valence-electronica` base path)

**Project Type**: Single-repo Astro static site

**Performance Goals**: No regression vs `009` — one extra video element (paused /
unloaded when idle); crossfade is CSS opacity; catalog size stays tiny (≤20 entries).

**Constraints**: Static-first (I); free tier (II); duration + chrome in content
(III); justified JS for timer/random/crossfade (IV); no tracking/storage for
toggles (V); amend HUD contracts (VI); artist guide (VII)

**Scale/Scope**: ~10–14 source files; one new lib module; dual-video atmosphere;
HUD composition change limited to V-Flip + right-dock icons.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Static-First Delivery | SSR player body; hops are client enhancement | PASS |
| II. Zero-Cost, Zero-Ops Publishing | Unchanged Pages + Actions | PASS |
| III. Content-Code Separation | Chrome shuffle/loop/panel copy; metadata in existing files; dwell from runtime video metadata | PASS |
| IV. Lightweight by Default | **Justified** `playback.ts` + dual-video fade (timers, random, intro gate, crossfade cannot be CSS). Reuse mute/stage-switch. No icon libraries. 320px still loads | PASS (with justified exception) |
| V. Privacy & Legal Compliance | No new cookies/storage for shuffle/loop; hops never auto-unmute; outbound links unchanged | PASS |
| VI. Simplicity & Spec-Driven Change | Toolbar + inline info; no shuffle bag; no in-drawer lyrics; mobile still IDEA-013 | PASS |
| VII. Artist-Facing Change Documentation | Artist guide + chrome fields in implementation tasks | PASS |

**Post-design re-check (after Phase 1)**: PASS — [data-model.md](./data-model.md)
adds chrome fields only; [contracts/](./contracts/) pin HUD + playback;
crossfade is two layers + CSS, not a new runtime.

## Project Structure

### Documentation (this feature)

```text
specs/011-vflip-now-playing/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── vflip-player-ui.md
│   └── vflip-playback.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── content/
│   ├── jukebox/*.md          # unchanged frontmatter
│   └── ui/chrome.md          # shuffle/loop, panel title, listen-on, tooltips
├── content.config.ts         # EXTEND ui schema
├── lib/
│   ├── playback.ts           # modes, dwell, pickOtherId, intro-gated timer
│   ├── playback.test.ts
│   ├── stage-switch.ts       # crossfade hop, theme handoff, shuffle filter, toggle glitch
│   ├── stage.ts              # UiChrome
│   ├── hud-icons.ts          # shuffle, loop tokens
│   └── background.ts         # video duration hook
├── components/
│   ├── Jukebox.astro         # toolbar, drawer, inline track info in list
│   ├── MuteControl.astro     # in-shell layout + tooltips
│   ├── TrackInfoPanel.astro  # nodes per row (not separate dock panel)
│   ├── StagePanels.astro     # REMOVE lyrics + trackInfo dock items; open title glow
│   ├── StageDock.astro       # REMOVE mute slot
│   ├── BackgroundAtmosphere.astro  # incoming video layer
│   └── HudIcon.astro
├── pages/index.astro
├── styles/
│   ├── global.css
│   └── themes.css            # data-stage-crossfade smooth|glitch
└── docs/artist-guide.md

specs/009-desktop-stage-ui/contracts/desktop-hud-ui.md   # AMEND pointer
specs/010-track-catalog/contracts/track-catalog-ui.md    # AMEND track-info placement
```

**Structure decision**: Keep one jukebox `<details>`. Playback helper stays separate
from glitch/panel-motion.

## Complexity Tracking

| Topic | Why needed | Simpler alternative rejected because |
|-------|------------|--------------------------------------|
| Client JS `playback.ts` | FR-017–021 timers + random + intro gate | CSS cannot schedule hops or read intro attributes |
| Dual `<video>` crossfade | FR-022 smooth picture handoff | Single `src` swap is a hard cut |
| Dual crossfade modes | Nightmare vs calm theme feel | One duration fits neither |
| Open width 22rem / taller body | Inline listen links readable (FR-007) | 13rem list box truncates info |

No constitution principle is violated; IV exceptions are listed in the gate table.

## Phase 0 Output

See [research.md](./research.md) — all Technical Context items resolved.

## Phase 1 Output

| Artifact | Path |
|----------|------|
| Data model | [data-model.md](./data-model.md) |
| UI contract | [contracts/vflip-player-ui.md](./contracts/vflip-player-ui.md) |
| Playback contract | [contracts/vflip-playback.md](./contracts/vflip-playback.md) |
| Validation guide | [quickstart.md](./quickstart.md) |

## Implementation Notes (for `/speckit-tasks`)

1. **Schema** — chrome shuffle/loop, panel title, listen-on, tooltip strings.
2. **Playback helper** — `dwellSeconds`, `pickOtherId(ids, current, isAllowed?)`, intro gate, audio-filtered shuffle pool when unmuted.
3. **Shell** — Toolbar transport; mute inside jukebox; explicit closed widths; two-phase open.
4. **Open body** — Panel title + list rows with embedded track info; no lyrics block.
5. **Panels** — Remove lyrics/track-info dock icons; open panel title glow.
6. **Atmosphere** — Dual video; `resolveThemeHandoff()`; `data-stage-crossfade` smooth|glitch.
7. **Polish** — Continuous glitch on pressed shuffle/loop; slider label anchor from mute button.
8. **Contracts** — Supersession notes on `009` and `010`.
9. **Docs** — Artist guide reflects shipped layout.

## Next Step

Walk [quickstart.md](./quickstart.md) for manual validation.

**Owner visual check** (not automated): collapsed toolbar, inline info on selected row,
smooth vs glitch hops. Do not treat a single screenshot as done.
