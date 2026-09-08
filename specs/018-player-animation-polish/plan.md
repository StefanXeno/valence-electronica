# Implementation Plan: Player Animation Polish

**Branch**: `018-player-animation-polish` | **Date**: 2026-09-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/018-player-animation-polish/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Polish the shipped **015 phone player pill** (viewport **below 1024px**)
and change the **open-player sheet**:

- **Open / close** still grows the same floor-pinned pill to the **solo
  current card** (no play button). Floor chrome + transport stay
  visible; handle stays on the top edge. Tap easing **reuses as-built
  320ms** — not a leftover-jank defect list.
- **Handle drag** tracks **tighter / more 1:1** with **less rubber-band**
  (`RUBBER` 0.32 → **0.78**, overshoot cap 18 → **40px**). Drag-open
  shows the solo card. Drag-close from the playlist **shrinks the
  three-row sheet** (no mid-drag solo morph).
- **Playlist** is a **three-slot window** around the current song
  (TOP / MIDDLE / BOTTOM per FR-005), not the 015 full-list unfold.
  Shared-element morph into **that** slot. Pad inert placeholders if
  `n < 3`. Tap-to-play + soundwave-on-current stay. Shuffle does not
  reorder. Re-window only if the new current is **outside** the visible
  window. Playlist requested mid-open applies **after settle**.

Do **not** fold IDEA-024 (desktop HUD) or IDEA-025 (spec shrink). Laptop
HUD from 1024px up stays `009` / `011`.

**Technical approach** (from [research.md](./research.md)):

- Extend `player-dock.ts` + `Jukebox.astro`; extract
  `src/lib/playlist-window.ts` (pure FR-005 / FR-015 / FR-016 helpers).
- Playlist open height = chrome + **three** rows, not `n` rows.
- Pending playlist queue replaces the as-built mid-open `return`.
- No new npm packages. Vitest for the window helper. Visual QA is
  **operator/manual** ([quickstart.md](./quickstart.md)).
- Contract: [contracts/phone-player-polish.md](./contracts/phone-player-polish.md)
  amends the 015 open sheet only.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 22+ (build tooling only)

**Primary Dependencies**: Astro 7 static output; as-built `015`
`player-dock.ts` / `Jukebox.astro` / theme-track `Discography`; `011`
playback (shuffle hop, pause). **No new npm packages.**

**Storage**: None. Visit-only dock / window / pending-action memory.
No new `chrome.md` fields. No cookies.

**Testing**: Vitest for `playlist-window.ts`; `astro check` + `astro
build` in CI. Operator [quickstart.md](./quickstart.md) at 320 / 390 /
1023 / 1024. Do **not** run Playwright / `verify:hud` as an 018 gate.

**Target Platform**: Static GitHub Pages (`/valence-electronica` base path)

**Project Type**: Single-repo Astro static site

**Performance Goals**: No regression vs constitution IV — landing usable
within 2s on an average mobile connection. No second atmosphere stack,
no extra fonts, no gesture library.

**Constraints**: Static-first (I); free tier (II); no new content fields
(III); justified JS extension of `player-dock.ts` (IV); no tracking (V);
phone-only; no IDEA-024/025 (VI); no artist-guide update (VII). Open/
close easing reuse-as-built. Locked forks: 3-slot window, newest-first,
placeholders if `n<3`, tap-to-play, soundwave on current only, shuffle
does not reorder, playlist after settle, drag-close shrinks 3-row sheet,
handle stays, re-window only if new current is outside the window.

**Scale/Scope**: Phone player sheet measure + drag constants + playlist
morph rewrite + window helper + placeholder rows. Content dock, idle
nod, and laptop HUD untouched.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Static-First Delivery | Astro static HTML; drag / morph / windowing are client enhancements | PASS |
| II. Zero-Cost, Zero-Ops Publishing | Unchanged Pages + Actions | PASS |
| III. Content-Code Separation | No new chrome / content fields; placeholders are UI, not artist data | PASS |
| IV. Lightweight by Default | **Justified**: extend existing `player-dock.ts` (already required for drag / playlist morph). Add a small pure helper for testable window math. No new packages. 320px load unchanged | PASS (with justified exception) |
| V. Privacy & Legal Compliance | No cookies, embeds, tracking, or Web Audio | PASS |
| VI. Simplicity & Spec-Driven Change | Phone open-sheet only; 015 docks stay; no IDEA-024/025; no second player island | PASS |
| VII. Artist-Facing Change Documentation | No new artist-editable surface — **do not** update `docs/artist-guide.md` (FR-010) | PASS |

**Post-design re-check (after Phase 1)**: PASS —
[data-model.md](./data-model.md) is visit-only window / pending-action
state; [contracts/phone-player-polish.md](./contracts/phone-player-polish.md)
is CSS/DOM visitor behavior, not a runtime backend. No artist-guide
delta.

## Project Structure

### Documentation (this feature)

```text
specs/018-player-animation-polish/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── phone-player-polish.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks) — not created here
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── playlist-window.ts       # NEW — FR-005 / FR-015 / FR-016 helpers
│   ├── playlist-window.test.ts  # NEW — Vitest
│   ├── player-dock.ts           # UPDATE — drag constants, 3-row measure,
│   │                            #          pending playlist, shared-element morph
│   ├── panel-motion.ts          # UNCHANGED — 320ms open/close
│   ├── playback.ts              # UNCHANGED — shuffle hop only
│   └── catalog-tracks.ts        # UNCHANGED — newest-first theme list
├── components/
│   ├── Jukebox.astro            # UPDATE — queue playlist after settle
│   └── Discography.astro        # UPDATE — placeholder row hook / CSS
└── styles/
    └── global.css               # TOUCH ONLY if phone player tokens need
                                 # a 3-row viewport rule (prefer Jukebox CSS)
```

**Structure Decision**: Stay single Astro project. 018 is a **behavior
layer** on the existing phone player dock, not a second HUD tree.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Extend client JS `player-dock.ts` | 3-row measure, tighter drag, dynamic shared-element, pending playlist | CSS cannot compute FR-005 slots, queue after settle, or FLIP into top/middle/bottom |
| New `playlist-window.ts` | Testable FR-005 / FR-016 without a browser | Inlining the algorithm in the dock module blocks Vitest coverage of SC-003 windows |

## Phase 0 & Phase 1 Outputs

| Artifact | Path | Status |
|----------|------|--------|
| Research | [research.md](./research.md) | Complete |
| Data model | [data-model.md](./data-model.md) | Complete |
| UI contract | [contracts/phone-player-polish.md](./contracts/phone-player-polish.md) | Complete |
| Quickstart | [quickstart.md](./quickstart.md) | Complete |

## Implementation Notes

1. **Do not retune open/close easing.** Reuse `PHONE_PANEL_PHASE_MS`
   (320ms) and existing solo `measureSoloOpenPx` / `fitSheetToSoloCard`.
2. **Drag**: change only overshoot (`RUBBER` / `OVERSCROLL_PX_MAX`).
   In-range follow, slop, snap, flick stay. Playlist drag-close keeps
   `is-theme-tracks` until collapse **settles**.
3. **Playlist height**: replace `measurePlaylistOpenPx` over **all**
   rows with chrome + **three** row heights + two gaps. Scrollport is
   the three-row viewport.
4. **Morph**: drop pin-all-siblings-to-full-list. FLIP **position** of
   the current card into `slot` plus opacity / header cross-fade; no
   fly-over. Animate only the other two visible rows with height.
5. **Pending playlist**: last-committed queue in `Jukebox.astro` /
   `player-dock.ts` when `is-sheet-morphing` && !`is-playlist-morphing`.
6. **Placeholders**: inject `data-playlist-placeholder` when a window
   index is missing. Inert. Live catalog stays four tracks. SC-010
   uses a **test-only** 1–2 track fixture (documented + gated; not
   production content).
6b. **Reduced motion (FR-006)**: solo open/close and playlist
   open/close faces apply **instantly** — no required travel.
6c. **File owners**: placeholder apply + hop re-window live in
   `playlist-window.ts` + `player-dock.ts` (not Astro / `stage-switch`).
6d. **T013 after T015**: playlist drag-close is complete only once
   the three-row sheet height exists.
7. **Hop**: `syncStageUi` already moves FR-014 chrome. Add scrollport
   intersection → optional FR-005 re-window.
8. **Breakpoint**: existing `phoneMq` teardown; also clear pending
   playlist + height locks (FR-009).
9. **QA**: unit tests + operator quickstart. No Playwright. No
   `npm install`.
10. **015 / 016**: do not rewrite `verify:hud` flows in this feature.

## Governance

Phone **HUD composition** stays `015`. This feature is authority for
the **open-player sheet + the three motion surfaces** below 1024px.
Laptop stays `009` / `011`. Drive-by desktop CSS violates constitution
VI and IDEA-024.

## Next Step

`/speckit-tasks` — generate [tasks.md](./tasks.md). Do **not** implement
the player in this planning pass.
