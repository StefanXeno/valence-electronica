# Implementation Plan: Jukebox Easter Egg & Song-Select First

**Branch**: `021-jukebox-easter-egg` | **Date**: 2026-09-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/021-jukebox-easter-egg/spec.md`

## Summary

Make **song selection** the default player surface on phone and laptop,
minimize taps to change tracks, and demote V-Flip to a **vinyl click/tap
easter egg**. Optional now-playing remains available but is not the home
state. Preserve shuffle/mute/hop meanings; defer shuffle **look** and
tap-vs-swipe polish to `022`. Do not assume a single shared atmosphere
video per track (dual videos in `022`).

**Technical approach** (from [research.md](./research.md)):

- Invert default of `is-theme-tracks` / selection visibility in
  `Jukebox.astro` + `player-dock.ts`.
- Retarget playlist control toward optional now-playing.
- Unhide/relocate vinyl as quiet brand object → open TrackInfoPanel /
  legacy V-Flip drawer.
- Chrome string retargets; artist guide if new fields.
- Contract: [contracts/jukebox-selection-first-ui.md](./contracts/jukebox-selection-first-ui.md).
- **Depends on `020`** for simplified chrome; coordinate with `022` for
  gestures and dual-video opacity.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 22+ (build only)

**Primary Dependencies**: Astro 7 static site; existing `Jukebox.astro`,
`player-dock.ts`, `stage-switch.ts`, Discography theme tracks,
TrackInfoPanel. **No new npm packages.**

**Storage**: `src/content/ui/chrome.md` (surface titles, vinyl a11y);
jukebox entries unchanged for membership; visit-only surface flags in
memory.

**Testing**: `astro check` + `astro build`; manual [quickstart.md](./quickstart.md)

**Target Platform**: Static GitHub Pages

**Project Type**: Single-repo Astro static site

**Performance Goals**: No second player tree; no new media stacks; keep
constitution IV mobile usability.

**Constraints**: Static-first (I); content-editable labels (III); justified
existing dock JS only (IV); no tracking (V); supersedes 011/015/018/019
default surfaces (VI); artist guide for new chrome fields (VII)

**Scale/Scope**: Player default surface + vinyl discovery. Not top nav
(`020`), not dual-video/shuffle glyph (`022`).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Static-First | Client enhancements only; no backend | PASS |
| II. Zero-Cost, Zero-Ops | Unchanged hosting/CI | PASS |
| III. Content-Code Separation | Labels in chrome.md | PASS |
| IV. Lightweight by Default | Reuse existing dock JS; no gesture libraries; vinyl is CSS/DOM revive | PASS (justified existing JS) |
| V. Privacy & Legal | No new embeds/cookies | PASS |
| VI. Simplicity & Spec-Driven | Selection-first + vinyl only; defers shuffle look / dual video | PASS |
| VII. Artist-Facing Docs | Update artist guide if new chrome fields | PASS |

**Post-design re-check**: PASS — data-model is chrome + visit-only state;
contract is UI behavior; atmosphere media left opaque for `022`.

## Project Structure

### Documentation (this feature)

```text
specs/021-jukebox-easter-egg/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── jukebox-selection-first-ui.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Jukebox.astro           # Default selection; vinyl revive; now-playing opt-in
│   ├── Discography.astro       # Theme-track selection cards (default body)
│   ├── TrackInfoPanel.astro    # Easter-egg / detail surface behind vinyl
│   └── MuteControl.astro       # Unchanged meanings
├── lib/
│   ├── player-dock.ts          # Phone open → selection; surface flags
│   ├── player-sheet.ts         # Height math as needed
│   ├── stage-switch.ts         # Keep media loading opaque to dual-video
│   └── stage.ts                # Chrome field fallbacks
├── content/ui/chrome.md        # songs / now-playing / vinyl labels
├── content.config.ts
├── styles/global.css           # Vinyl visibility; selection-first rest CSS
docs/
└── artist-guide.md             # New chrome fields if any
```

**Structure Decision**: Single Astro project; compose existing jukebox
sections rather than a second player app.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Client JS surface-state | Selection default, vinyl open, phone expand | Pure CSS cannot sync exclusive sheets + catalog pressed state |

## Phase 0 & Phase 1 Outputs

| Artifact | Path | Status |
|----------|------|--------|
| Research | [research.md](./research.md) | Complete |
| Data model | [data-model.md](./data-model.md) | Complete |
| UI contract | [contracts/jukebox-selection-first-ui.md](./contracts/jukebox-selection-first-ui.md) | Complete |
| Quickstart | [quickstart.md](./quickstart.md) | Complete |

## Cross-feature dependencies

| Spec | Note |
| ---- | ---- |
| `020-site-nav-chrome` | **Prefer implement first** — player designed against new chrome |
| `022-stage-artist-polish` | Shuffle look, tap-not-swipe, dual videos — do not block 021 MVP |
| `011` / `015` / `018` / `019` | Superseded for default surfaces / primary V-Flip chrome |

## Next Step

Run `/speckit-tasks` → [tasks.md](./tasks.md). Analyze before implement.
