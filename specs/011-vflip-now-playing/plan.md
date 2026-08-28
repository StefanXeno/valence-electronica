# Implementation Plan: V-Flip Now Playing

**Branch**: `011-vflip-now-playing` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-vflip-now-playing/spec.md`

## Summary

Turn **V-Flip** into the landing player: collapsed **one box** (vinyl + mute/volume),
open panel shows **track name, info, lyrics, mute, shuffle, loop, and the song list**.
Lyrics and Track info leave the right dock. Shuffle is a **toggle** (default on);
loop **pins** the current track and wins over shuffle. Allowed hops **crossfade**
atmosphere + theme (~700ms). No-audio dwell is **45s**; audio entries use **atmosphere
video file duration** (`HTMLMediaElement.duration`). Visit-only mode flags; no new
packages or tracking.

**Technical approach** (from [research.md](./research.md)):

- Move `MuteControl` inside `Jukebox.astro`; drop mute slot from `StageDock`.
- Compose `TrackInfoPanel` + `LyricsPanel` in the jukebox body; strip those icons
  from `StagePanels`.
- `playback.ts` + dwell/`pickOtherId` helpers; chrome shuffle/loop fields + icons.
- Dual video layers in `BackgroundAtmosphere` for crossfade; `applyStageEntry`
  orchestrates fade + theme.
- Vitest for dwell classifier + shuffle pick (mock video duration).
- Amend `009` / `010` HUD contracts; update artist guide.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 22+ (build tooling only)

**Primary Dependencies**: Astro 7 static output; existing `002` atmosphere/mute,
`004` stage-switch, `005` themes, `006` intro attributes, `007` schedule, `009` dock
/ panel-motion / glitch, `010` track info + lyrics nodes. **No new npm packages.**

**Storage**: `src/content/jukebox/*.md` (unchanged);
`src/content/ui/chrome.md` (shuffle/loop labels, icons, defaults). No database.
Playback flags are memory-only.

**Testing**: `astro check` + `astro build` in CI; vitest for dwell + pick helpers;
manual [quickstart.md](./quickstart.md) (short mp4 file length or local `hasAudio`
toggle for 45s path).

**Target Platform**: Static GitHub Pages (`/valence-electronica` base path)

**Project Type**: Single-repo Astro static site

**Performance Goals**: No regression vs `009` — one extra video element (paused /
unloaded when idle); 700ms fade is CSS opacity; catalog size stays tiny (≤20
entries).

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
| III. Content-Code Separation | Chrome shuffle/loop; lyrics/info stay in existing files; dwell from runtime video metadata | PASS |
| IV. Lightweight by Default | **Justified** `playback.ts` + dual-video fade (timers, random, intro gate, crossfade cannot be CSS). Reuse mute/stage-switch. No icon libraries. 320px still loads | PASS (with justified exception) |
| V. Privacy & Legal Compliance | No new cookies/storage for shuffle/loop; hops never auto-unmute; outbound links unchanged | PASS |
| VI. Simplicity & Spec-Driven Change | Single scroll column; no shuffle bag; no tab UI; mobile still IDEA-013 | PASS |
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
└── tasks.md             # Phase 2 (/speckit-tasks — not created by plan)
```

### Source Code (repository root)

```text
src/
├── content/
│   ├── jukebox/*.md          # unchanged frontmatter
│   └── ui/chrome.md          # ADD shuffle/loop labels, icons, defaults
├── content.config.ts         # EXTEND jukebox + ui schemas
├── lib/
│   ├── playback.ts           # NEW — modes, dwell, pickOtherId, intro-gated timer
│   ├── playback.test.ts      # NEW — vitest
│   ├── stage-switch.ts       # EXTEND — crossfade hop, header title, start playback
│   ├── stage.ts              # EXTEND UiChrome
│   ├── hud-icons.ts          # ADD shuffle, loop tokens
│   └── background.ts         # expose video duration to playback on loadedmetadata
├── components/
│   ├── Jukebox.astro         # REFACTOR — mute slot, now-playing body, transport
│   ├── MuteControl.astro     # MOVE mount; styles for in-shell layout
│   ├── LyricsPanel.astro     # MOUNT inside jukebox (logic unchanged)
│   ├── TrackInfoPanel.astro  # MOUNT inside jukebox (logic unchanged)
│   ├── StagePanels.astro     # REMOVE lyrics + trackInfo dock items
│   ├── StageDock.astro       # REMOVE mute slot
│   ├── BackgroundAtmosphere.astro  # ADD incoming video layer
│   └── HudIcon.astro         # ADD shuffle/loop glyphs
├── pages/index.astro         # STOP passing mute as dock sibling
├── styles/
│   ├── global.css            # Jukebox shell + open player width/scroll
│   ├── themes.css            # Optional: html[data-stage-crossfade] token transitions
│   └── intro.css             # Mute is inside dock; keep stage-dock hide rules
└── docs/artist-guide.md      # UPDATE surfaces

specs/009-desktop-stage-ui/contracts/desktop-hud-ui.md   # AMEND pointer
specs/010-track-catalog/contracts/track-catalog-ui.md    # AMEND track-info placement
```

**Structure decision**: Keep one jukebox `<details>`. Do not invent a second player
component. Playback helper stays separate from glitch/panel-motion.

## Complexity Tracking

| Topic | Why needed | Simpler alternative rejected because |
|-------|------------|--------------------------------------|
| Client JS `playback.ts` | FR-017–021 timers + random + intro gate | CSS cannot schedule hops or read intro attributes |
| Dual `<video>` crossfade | FR-022 smooth picture handoff | Single `src` swap is a hard cut |
| `html` token transition flag | Smooth chrome colors with the hop | Instant `data-theme` swap fights “player change” |
| Open width 22rem / taller body | Lyrics readable in-player (FR-007) | 13rem list box truncates lyrics |

No constitution principle is violated; IV exceptions are listed in the gate table.

## Phase 0 Output

See [research.md](./research.md) — all Technical Context items resolved (no
NEEDS CLARIFICATION remaining).

## Phase 1 Output

| Artifact | Path |
|----------|------|
| Data model | [data-model.md](./data-model.md) |
| UI contract | [contracts/vflip-player-ui.md](./contracts/vflip-player-ui.md) |
| Playback contract | [contracts/vflip-playback.md](./contracts/vflip-playback.md) |
| Validation guide | [quickstart.md](./quickstart.md) |

## Implementation Notes (for `/speckit-tasks`)

1. **Schema** — chrome shuffle/loop fields + booleans; tooltip strings.
2. **Playback helper** — `dwellSeconds(entry, videoDurationSec?)`, `pickOtherId(ids, current)`,
   intro-attribute observer, timer API used by `stage-switch`; subscribe to video
   `loadedmetadata` for audio dwell.
3. **Shell** — Mute inside jukebox; `StageDock` / `index.astro` stop sibling mute;
   mute button + volume slider **tooltips** via label-reveal + chrome strings.
4. **Open body** — Header title node `[data-now-playing-title]`; mount info +
   lyrics; transport buttons; widen CSS.
5. **Panels** — Remove lyrics/track-info from `StagePanels`.
6. **Atmosphere** — Second video; `applyStageEntry` fade path; reduced-motion
   instant; `data-stage-crossfade` on `html`.
7. **Icons** — SVG paths for shuffle/loop; `HudIcon` + `hud-icons.ts`.
8. **Contracts** — One-line supersession notes on `009` and `010` UI contracts.
9. **Docs** — Artist guide: V-Flip contents, toggles, video-length shuffle timing,
   removed HUD buttons.
10. **Tests** — Vitest dwell + pick; quickstart with short mp4 or local `hasAudio`
    toggle for 45s.

## Next Step

Run **`/speckit-tasks`** to generate dependency-ordered `tasks.md`, then
`/speckit-implement`.

**Owner visual check** (not automated): collapsed one-box mute, open player
stacking, 700ms hop. Do not treat a single screenshot as done — walk
[quickstart.md](./quickstart.md).
