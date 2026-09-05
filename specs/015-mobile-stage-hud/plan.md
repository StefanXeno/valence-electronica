# Implementation Plan: Mobile Stage HUD

**Branch**: `015-mobile-stage-hud` | **Date**: 2026-09-02 | **Spec**: [spec.md](./spec.md)

**As-built sync**: 2026-09-05 — this plan’s original 4-icon / loop / detached-tray
/ footer-offset design shipped differently. Authority is [spec.md](./spec.md)
and [contracts/mobile-hud-ui.md](./contracts/mobile-hud-ui.md). Do not
re-implement the 2026-09-02 sketch.

**Input**: Feature specification from `/specs/015-mobile-stage-hud/spec.md`

## Summary

Give viewports **below 1024px** a dedicated bottom-stacked HUD:

- Floor-pinned **player pill** (`bottom: 0`): collapsed `wave | title | mute`
  + handle; expand **is** V-Flip (no vinyl button, no loop). Transport:
  shuffle + play/pause (background video) + theme-track playlist. Handle
  tap and drag share open height. Unmuted volume **50%**. Mute stays in the
  floor row even when the current track has `hasAudio: false`.
- **Content pill** above it: five icons (About, Discography, Tour, Socials,
  Info). Same pill grows (~320ms). Socials channels parked **in** the
  sheet. Info holds © + English Imprint / Privacy Policy → Legal overlay.
  Phone footer legal is **hidden**.
- Exclusive-open across content sheets + V-Flip. Click-outside closes the
  content sheet (not while Legal overlay is open). No phone HUD hover
  tooltips.

Laptop HUD (`009` / `011`) is unchanged from **1024px** up, including the
volume slider.

**Technical approach** (from [research.md](./research.md), as-built):

- CSS-first split: `@media (max-width: 1023px)` + `--hud-scale: 1`. One DOM.
- Equal phone pad tokens: `--phone-bar-pad`, `--phone-open-pad`,
  `--phone-inline-pad`, body/tray gaps.
- `player-dock.ts`: handle tap + drag, 3×/60s hint (including expanded),
  content-pill controller, click-outside, play/pause, playlist morph.
- Hide mute **slider** below 1024px; keep mute in the floor row on phone.
- Exclusive-open on phone: About / Discography / Tour / Socials / Info /
  V-Flip.
- Chrome: handle labels, `socialsIcon`, `infoTitle` / `infoIcon`,
  `imprintButton` / `privacyButton`, `playlistLabel`.
- Contract: [contracts/mobile-hud-ui.md](./contracts/mobile-hud-ui.md).

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 22+ (build tooling only)

**Primary Dependencies**: Astro 7 static output; existing `002` atmosphere /
mute / legal overlay, `003` glitch, `004` stage content, `006` intro, `009`
dock / icons, `011` playback. **No new npm packages.**

**Storage**: `src/content/ui/chrome.md` (handle labels, socials / info /
legal HUD strings, playlist label). Channels stay in `src/data/site.json`.
Player expand flag is memory-only.

**Testing**: `astro check` + `astro build` in CI; manual
[quickstart.md](./quickstart.md) at 320 / 390 / 1023 / 1024.

**Target Platform**: Static GitHub Pages (`/valence-electronica` base path)

**Project Type**: Single-repo Astro static site

**Performance Goals**: No regression vs constitution IV — landing usable
within 2s on an average mobile connection. Phone HUD MUST NOT add a second
atmosphere stack or extra font files.

**Constraints**: Static-first (I); free tier (II); labels/icons in chrome
(III); justified JS for drag / hint / exclusive-open / play-pause /
playlist morph (IV); no tracking (V); spec-driven; `015` contract authority
below 1024px (VI); artist guide for handle + socials / info icons (VII)

**Scale/Scope**: Landing HUD CSS + dock composition; `player-dock.ts`;
chrome fields; contract cross-links. Laptop playback rules stay `011`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Static-First Delivery | Astro static HTML; drag/hint/exclusive-open/play-pause are enhancements | PASS |
| II. Zero-Cost, Zero-Ops Publishing | Unchanged Pages + Actions | PASS |
| III. Content-Code Separation | Handle copy, `socialsIcon`, Info / Imprint / Privacy / playlist in `chrome.md` | PASS |
| IV. Lightweight by Default | **Justified** `player-dock.ts` (drag, 3×/60s hint, phone exclusive-open, playlist morph, play/pause). Layout is CSS. No gesture libraries. 320px load | PASS (with justified exception) |
| V. Privacy & Legal Compliance | Info sheet + existing overlay; no new cookies; soundwave is CSS not Web Audio | PASS |
| VI. Simplicity & Spec-Driven Change | One DOM two CSS; no tablet-third layout; laptop playback stays `011` | PASS |
| VII. Artist-Facing Change Documentation | Artist guide: handle labels, `socials` / `info` tokens, phone vs laptop HUD | PASS |

**Post-design re-check (after Phase 1)**: PASS — [data-model.md](./data-model.md)
adds chrome fields + visit-only dock position only;
[contracts/mobile-hud-ui.md](./contracts/mobile-hud-ui.md) is CSS/DOM
behavior, not a runtime backend.

**As-built re-check (2026-09-05)**: PASS — phone legal moved into Info
(footer hidden); still no cookies / new routes. JS surface grew (drag,
playlist morph, play/pause) but stays one module, no new packages.

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
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── content/
│   └── ui/chrome.md                 # handle labels, socials/info/legal HUD, playlist
├── content.config.ts                # those chrome fields
├── lib/
│   ├── hud-icons.ts                 # tokens: socials, info, play, pause, playlist
│   ├── stage.ts                     # chrome fields
│   └── player-dock.ts               # expand === V-Flip, drag, hint, content pill, play/pause
├── components/
│   ├── StagePanels.astro            # 5-icon growing pill + Info + LegalSheet
│   ├── Jukebox.astro                # floor-pinned player; theme-track playlist
│   ├── LegalSheet.astro             # English Imprint / Privacy Policy pills
│   ├── MuteControl.astro            # no slider ≤1023px; phone 50%; keep floor mute
│   ├── Footer.astro                 # hidden ≤1023px
│   ├── Discography.astro            # themeTracksOnly inside player
│   └── Channels.astro               # one instance; parked into the content sheet on phone
├── styles/
│   └── global.css                   # phone tokens, --hud-scale: 1, hide hover floaters
```

**Structure Decision**: Stay single Astro project. Phone HUD is a
**composition layer** on existing dock components, not a second app shell.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Client JS `player-dock.ts` | Handle drag, 3×/60s hint, phone exclusive-open, playlist morph, play/pause | CSS cannot do 3 nods then 60s pause, capped drag, or close V-Flip when About opens |
| Hide mute slider with extra CSS | FR-003 phone toggle-only | Deleting slider globally breaks `011` laptop unmute |
| Pointer listeners on the handle | FR-004 drag + shared open height | Tap-only fails the specified drag; a npm gesture lib is heavier |

## Phase 0 & Phase 1 Outputs

| Artifact | Path | Status |
|----------|------|--------|
| Research | [research.md](./research.md) | Complete (as-built 2026-09-05) |
| Data model | [data-model.md](./data-model.md) | Complete (as-built 2026-09-05) |
| UI contract | [contracts/mobile-hud-ui.md](./contracts/mobile-hud-ui.md) | Complete (as-built 2026-09-05) |
| Quickstart | [quickstart.md](./quickstart.md) | Complete (as-built 2026-09-05) |

## Implementation Notes (as-built)

1. **Breakpoint + scale**: `global.css` `@media (max-width: 1023px)` and
   `--hud-scale: 1`.
2. **Player dock**: floor-pinned height morph; expand === V-Flip; no vinyl /
   loop on phone; mute **not** inside the handle.
3. **Mute**: hide slider ≤1023px; keep floor slot on no-audio tracks; 50%
   unmuted.
4. **Content pill** + five icons. **One** `Channels` tree; park it into the
   sheet on phone. Never mount a second channel list.
5. **Sheets**: content pill `--phone-sheet-h` (~320ms); player
   `--player-sheet-h` from `bottom: 0`.
6. **`player-dock.ts`**: expand, drag, hint (incl. expanded), exclusive-open
   + Info, click-outside (skip Legal overlay), play/pause, playlist morph,
   `html[data-player-dock-js]`, `matchMedia` resize.
7. **Footer hidden** on phone; legal via Info + `LegalSheet`.
8. **No phone HUD hover** (`.hud-label-reveal` hidden; strip `title`).
9. **Amend 009 / 011 contracts** (IDEA-013 → this feature) — already done.
10. **Manual QA**: [quickstart.md](./quickstart.md) 320 / 390 / 1023 / 1024.

## Governance: Future layout changes

Phone HUD authority is `specs/015-mobile-stage-hud/`. Laptop HUD stays
`009` / `011`. Drive-by CSS without spec updates violates constitution VI.

## Next Step

Implementation already shipped. Use [tasks.md](./tasks.md) only for leftover
manual QA. Do not regenerate this plan from the 2026-09-01 mock.
