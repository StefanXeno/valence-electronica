# Implementation Plan: Mobile Stage HUD

**Branch**: `015-mobile-stage-hud` | **Date**: 2026-09-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/015-mobile-stage-hud/spec.md`

## Summary

Give viewports **below 1024px** a dedicated bottom-stacked HUD: collapsed
**now-playing pill** (soundwave + track label + mute toggle, handle arrow on
top), expandable **V-Flip / shuffle / loop**, boxed **content dock** (About,
Discography, Tour, socials trigger), and an on-demand **socials tray**.
Sheets rise from the docks, one at a time. Laptop HUD (`009` / `011`) is
unchanged from **1024px** up, including the volume slider.

**Technical approach** (from [research.md](./research.md)):

- CSS-first split: `@media (max-width: 1023px)` + `--hud-scale: 1`. One DOM.
- Reposition `StageDock` / `StagePanels` / `Jukebox` / `Channels` / `Footer`.
- `player-dock.ts`: handle toggle, swipe, 3×/60s hint, now-playing label sync.
- Hide mute **slider** below 1024px; keep one `MuteControl`.
- Extend exclusive-open on phone to V-Flip list + socials tray.
- New HUD token `socials`; chrome handle labels.
- Contract: [contracts/mobile-hud-ui.md](./contracts/mobile-hud-ui.md). Amend
  `009` / `011` “IDEA-013” pointers.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 22+ (build tooling only)

**Primary Dependencies**: Astro 7 static output; existing `002` atmosphere /
mute / legal overlay, `003` glitch, `004` stage content, `006` intro, `009`
dock / icons, `011` playback. **No new npm packages.**

**Storage**: `src/content/ui/chrome.md` (handle labels, `socialsIcon`).
Channels stay in `src/data/site.json`. Player expand flag is memory-only.

**Testing**: `astro check` + `astro build` in CI; optional vitest for
now-playing label join helper if extracted; manual
[quickstart.md](./quickstart.md) at 320 / 390 / 1023 / 1024.

**Target Platform**: Static GitHub Pages (`/valence-electronica` base path)

**Project Type**: Single-repo Astro static site

**Performance Goals**: No regression vs constitution IV — landing usable
within 2s on an average mobile connection. Phone HUD MUST NOT add a second
atmosphere stack or extra font files.

**Constraints**: Static-first (I); free tier (II); labels/icons in chrome
(III); justified JS for swipe / hint / exclusive-open / label sync (IV);
no tracking (V); spec-driven; `015` contract authority below 1024px (VI);
artist guide for handle + socials icon (VII)

**Scale/Scope**: Landing HUD CSS + dock composition; one small lib module;
chrome fields; contract cross-links. No playback-rule changes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Static-First Delivery | Astro static HTML; swipe/hint/exclusive-open are enhancements | PASS |
| II. Zero-Cost, Zero-Ops Publishing | Unchanged Pages + Actions | PASS |
| III. Content-Code Separation | Handle copy + `socialsIcon` in `chrome.md`; channels unchanged | PASS |
| IV. Lightweight by Default | **Justified** `player-dock.ts` (swipe, 3×/60s hint, phone exclusive-open, now-playing text). Layout is CSS. No gesture libraries. 320px load | PASS (with justified exception) |
| V. Privacy & Legal Compliance | Footer still reachable; no new cookies; soundwave is CSS not Web Audio; overlay unchanged | PASS |
| VI. Simplicity & Spec-Driven Change | One DOM two CSS; no tablet-third layout; playback stays `011` | PASS |
| VII. Artist-Facing Change Documentation | Artist guide: handle labels, `socials` token, phone vs laptop HUD | PASS |

**Post-design re-check (after Phase 1)**: PASS — [data-model.md](./data-model.md)
adds chrome fields + visit-only dock position only;
[contracts/mobile-hud-ui.md](./contracts/mobile-hud-ui.md) is CSS/DOM
behavior, not a runtime backend.

## Project Structure

### Documentation (this feature)

```text
specs/015-mobile-stage-hud/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── mobile-hud-ui.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks — not created by plan)
```

### Source Code (repository root)

```text
src/
├── content/
│   └── ui/chrome.md                 # ADD playerExpandLabel, playerCollapseLabel, socialsIcon
├── content.config.ts                # ADD those chrome fields
├── lib/
│   ├── hud-icons.ts                 # ADD token `socials`
│   ├── stage.ts                     # READ new chrome fields
│   └── player-dock.ts               # NEW — expand, swipe, hint, exclusive-open (phone)
├── components/
│   ├── HudIcon.astro                # ADD socials SVG
│   ├── StageDock.astro              # REFACTOR — phone stack vs laptop rail
│   ├── StagePanels.astro            # REFACTOR — boxed dock + sheet CSS; socials trigger
│   ├── Jukebox.astro                # REFACTOR — now-playing row + transport slot + handle
│   ├── Channels.astro               # REUSE — one instance; CSS corner vs tray
│   ├── MuteControl.astro            # CSS: no slider ≤1023px
│   ├── Footer.astro                 # OFFSET above phone docks
│   ├── Hero.astro                   # minor compact top on phone
│   └── …                            # playback logic unchanged
├── styles/
│   ├── global.css                   # PHONE stage grid, --hud-scale: 1, footer offset
│   └── intro.css                    # HIDE new dock selectors during intro
├── pages/
│   └── index.astro                  # minor compose if slots change
└── layouts/
    └── Base.astro                   # only if a phone root class is needed

docs/
└── artist-guide.md                  # UPDATE chrome handle + socials icon + phone HUD note

specs/009-desktop-stage-ui/contracts/
└── desktop-hud-ui.md                # AMEND: phone polish → 015 (not IDEA-013)

specs/011-vflip-now-playing/contracts/
└── vflip-player-ui.md               # AMEND: pointer to 015 for <1024px chrome
```

**Structure Decision**: Stay single Astro project. Phone HUD is a
**composition layer** on existing dock components, not a second app shell.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Client JS `player-dock.ts` | Swipe, 3×/60s hint, phone exclusive-open across V-Flip + socials, now-playing label sync | CSS cannot do 3 nods then 60s pause, swipe, or close a jukebox `<details>` when About opens |
| Hide mute slider with extra CSS | FR-003 phone toggle-only | Deleting slider globally breaks `011` laptop unmute |
| Touch listeners on player dock | FR-004 swipe up/down | Handle-only fails the specified swipe; a npm gesture lib is heavier |

## Phase 0 & Phase 1 Outputs

| Artifact | Path | Status |
|----------|------|--------|
| Research | [research.md](./research.md) | Complete |
| Data model | [data-model.md](./data-model.md) | Complete |
| UI contract | [contracts/mobile-hud-ui.md](./contracts/mobile-hud-ui.md) | Complete |
| Quickstart | [quickstart.md](./quickstart.md) | Complete |

## Implementation Notes (for `/speckit-tasks`)

1. **Breakpoint + scale**: `global.css` `@media (max-width: 1023px)` grid and
   `--hud-scale: 1` before component surgery.
2. **Player dock anatomy**: now-playing row + handle + transport; mute **not**
   inside the handle; no-JS transport visible.
3. **Mute**: hide slider ≤1023px; eligibility unchanged.
4. **Content dock box** + socials trigger + tray. **One** `Channels` tree
   in `index.astro`; CSS hides the laptop corner below 1024px and places
   those same nodes in the tray. Never mount a second channel list.
5. **Sheets**: StagePanels bodies **and** the Jukebox `[data-jukebox]`
   drawer as dock-anchored sheets (not laptop side panels).
6. **`player-dock.ts`**: expand, swipe, hint, exclusive-open, label sync,
   `html[data-player-dock-js]`, `matchMedia` resize teardown.
7. **Footer offset** + intro CSS + glitch hit boxes.
8. **Chrome + HudIcon `socials`** + artist guide.
9. **Amend 009 / 011 contracts** (IDEA-013 → this feature).
10. **Manual QA**: quickstart 320 / 390 / 1023 / 1024; reduced motion;
    keyboard; intro.

## Governance: Future layout changes

Phone HUD authority is `specs/015-mobile-stage-hud/`. Laptop HUD stays
`009` / `011`. Drive-by CSS without spec updates violates constitution VI.

## Next Step

Run **`/speckit-tasks`** to generate dependency-ordered `tasks.md`.
