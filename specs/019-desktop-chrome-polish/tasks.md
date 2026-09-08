# Tasks: Desktop Chrome Polish

**Input**: Design documents from `/specs/019-desktop-chrome-polish/`

**Prerequisites**: plan.md (required), spec.md (required for user stories),
research.md, data-model.md, contracts/desktop-chrome-polish.md, quickstart.md

**Tests**: None requested. **No** Playwright, Puppeteer, Chromium, or
`npm run verify:hud` as a 019 gate. **No** `npm install` / new packages.
Visual QA is operator/manual per [quickstart.md](./quickstart.md).

**Organization**: Setup + two-stage motion foundation, then US1 bar/Info
(P1 MVP), US2 always-open player (P1), US3 grow motion (P1), US4 rest
of stage (P2), polish (artist guide).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Include exact file paths in descriptions

## Path Conventions

Single Astro project. Desktop HUD only (`min-width: 1024px`). Do **not**
change phone `015` / `018` docks, `src/lib/playlist-window.ts`, or
`src/content/ui/chrome.md`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align with locked forks; no new toolchain

- [x] T001 Read `specs/019-desktop-chrome-polish/plan.md`, `research.md`, and `contracts/desktop-chrome-polish.md`; do not edit `specs/015-mobile-stage-hud/` or `specs/018-player-animation-polish/` behavior
- [x] T002 [P] Confirm `package.json` / `package-lock.json` stay unchanged (no new npm packages)
- [x] T003 [P] Note that `docs/artist-guide.md` **must** be updated in polish (T024 / constitution VII / FR-014) — do not write it in this phase

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared sequential two-stage motion exists before US3 wiring

**⚠️ CRITICAL**: No user story work until the two-stage helper exists

- [x] T004 Implement sequential two-stage grow/shrink in `src/lib/panel-motion.ts`: **280ms** per stage (`SMOOTH_PANEL_PHASE_MS`), `cubic-bezier(0.4, 0, 0.2, 1)`; open = width then height; close = height then width; reduced motion = instant (`0` ms); grow **in place** (no translate/slide). Export a single API **StagePanels** can call (FR-007, FR-008). Desktop playlist MUST NOT use this helper (FR-006 is view-switch). Mid-motion interrupt (FR-010): overlapping **bar** toggles settle to the **last committed action**; the always-open player chrome stays visible and MUST NOT collapse

**Checkpoint**: `panel-motion.ts` can sequence two stages. No HUD chrome change yet.

---

## Phase 3: User Story 1 - Desktop bar without socials, with legal Info (Priority: P1) 🎯 MVP

**Goal**: Laptop bar is About, Discography, Tour, **Info**. No socials in
the bar. Footer gone. Info box has © Valence **top-right** and Imprint /
Privacy pills → existing overlay.

**Independent Test**: Operator [quickstart.md](./quickstart.md) Scenario 1
(SC-001, SC-010) at ~1280×800.

### Implementation for User Story 1

- [x] T005 [P] [US1] Hide the landing footer at **all** widths in `src/components/Footer.astro` (remove or replace the `max-width: 1023px`-only hide) so desktop no longer shows the bottom-center legal cluster (FR-003a)
- [x] T006 [P] [US1] Unhide `.stage-panel--info` at `@media (min-width: 1024px)` in `src/components/StagePanels.astro`; keep `.stage-panel--socials` hidden so socials stay top-right only (FR-002, FR-003)
- [x] T007 [US1] Lift phone Info copyright rules so the open desktop Info box pins `© {year} {artist}` (Valence) in the **top-right**, **same row height as the Info heading** (`stage-panel__sheet-copy--summary`) in `src/components/StagePanels.astro` (FR-003, T028)
- [x] T008 [US1] Confirm exclusive-open among About / Discography / Tour / **Info** still works on desktop in `src/components/StagePanels.astro` (and `src/lib/player-dock.ts` only if desktop Info is excluded today) (FR-005)
- [x] T009 [US1] In `src/components/StagePanels.astro` (and legal overlay wiring if needed), keep overlay open from Info pills without collapsing the Info sheet behind it (FR-003, edge case)

**Checkpoint**: US1 — Info in the bar, footer gone, socials top-right only. Player chrome still as-built `011`.

---

## Phase 4: User Story 2 - Always-open desktop player (Priority: P1)

**Goal**: Bottom-left player is always visible after intro: currently
playing track + toolbar **Playlist → Shuffle → Play/pause → Mute**. No
V-Flip/vinyl toggle, no Loop, no volume slider.

**Independent Test**: Operator [quickstart.md](./quickstart.md) Scenario 2
(SC-002) at ~1280×800. Do not click the player first.

### Implementation for User Story 2

- [x] T010 [US2] Reorder the toolbar DOM in `src/components/Jukebox.astro` to **Playlist**, **Shuffle**, **Play/pause**, **Mute** so tab order matches the spec (FR-004a). Keep phone CSS that hides vinyl/loop and shows playlist/play
- [x] T011 [US2] At `@media (min-width: 1024px)` in `src/components/Jukebox.astro`, hide `.jukebox__tool--vinyl` and `.jukebox__tool--loop`; show `.jukebox__tool--playlist` and `.jukebox__tool--video-play` (FR-004, FR-004a)
- [x] T012 [US2] At ≥1024px in `src/components/Jukebox.astro`, paint an **always-open** boxed player at rest: show the **phone now-playing card** (theme-tracks solo card) without a vinyl click; do **not** require `data-jukebox-toggle` to reveal chrome (FR-004, T028). Chrome (always-open player + collapsed bar) **must still paint with no JS**; playlist/bar grow JS is progressive enhancement (FR-016)
- [x] T013 [US2] In `src/components/Jukebox.astro` script, ungating `data-playlist-toggle` so playlist works when `min-width: 1024px`; playlist **switches** to the **phone theme-track card window** (`jukebox__section--theme-tracks`, background-available set), not the `011` TrackInfoPanel list (FR-004c, T028)
- [x] T014 [P] [US2] Restore unmute-to-slider at `@media (min-width: 1024px)` in `src/components/MuteControl.astro` / `Jukebox.astro`: muted = no slider; unmuted = **full** slider; player box + card widen to the right (FR-004b, T028). Keep unmute level `0.7`
- [x] T015 [US2] Leave `src/lib/playback.ts` unchanged; with Loop hidden, desktop loop stays **off** (`loopDefault` false). Do not add a desktop loop path (FR-005)

**Checkpoint**: US2 — always-open player + new toolbar. Bar from US1 still works. Motion may still be the old simultaneous morph.

---

## Phase 5: User Story 3 - Playlist view-switch; bar two-stage (Priority: P1)

**Goal**: Playlist **switches the view** (optional height-up only). Bar
grows **left then up** (close **down then right**). Sequential 280ms
**bar** stages. Not a slide. Playlist MUST NOT two-stage-widen.

**Independent Test**: Operator [quickstart.md](./quickstart.md) Scenarios
3–4 (SC-003, SC-004). Reduced motion still toggles (SC-005).

### Implementation for User Story 3

- [x] T016 [US3] In `src/components/Jukebox.astro`, drive desktop playlist as a **view-switch** (`is-theme-tracks`): currently-playing card ↔ jukebox list; **no** `createTwoStageMotion` / width grow; height MAY grow **up only** (FR-006). Player chrome (track + toolbar) stays; whole player MUST NOT translate. Last committed playlist face wins (FR-010)
- [x] T017 [US3] In `src/components/StagePanels.astro`, drive desktop bar open/close through `src/lib/panel-motion.ts` two-stage grow: **wider left, then taller up**; close **down, then right**; whole bar MUST NOT translate (FR-007). Overlapping bar toggles during motion settle to the last committed action (FR-010)
- [x] T018 [US3] In `src/lib/panel-motion.ts` and callers in `src/components/Jukebox.astro` / `src/components/StagePanels.astro`, under `prefers-reduced-motion: reduce` apply both faces instantly (FR-008)
- [x] T019 [US3] In `src/lib/panel-motion.ts` (and glitch hooks in `src/components/Jukebox.astro` / `src/components/StagePanels.astro` if needed), glitch packs MAY keep morph flavor but MUST NOT invert or skip the width-then-height / reverse order (FR-006, FR-007)

**Checkpoint**: US3 — sequential grow-in-place on playlist and bar. Phone 320ms content-pill unchanged.

---

## Phase 6: User Story 4 - The rest of the stage still works (Priority: P2)

**Goal**: Intro still hides chrome. Resize across 1023/1024 does not mix
HUDs. Keyboard works. Playlist MAY stay open while a bar panel is open.

**Independent Test**: Operator [quickstart.md](./quickstart.md) Scenarios
5–6 (SC-006, SC-007, SC-008).

### Implementation for User Story 4

- [x] T020 [US4] In `src/components/Jukebox.astro` `matchMedia('(max-width: 1023px)')` change handler (and `src/lib/player-dock.ts` only if desktop classes leak), tear down in-flight desktop two-stage + always-open classes when crossing 1023/1024 so phone does not inherit a laptop player (FR-011)
- [x] T021 [US4] Confirm intro still hides the desktop bar and always-open player until dismiss (`src/styles/intro.css` / existing intro hooks). If always-open CSS paints during intro, gate it the same way today’s chrome is hidden (FR-013)
- [x] T022 [US4] In `src/components/Jukebox.astro`, keep hover/focus labels and accessible names on Playlist / Shuffle / Play/pause / Mute after the reorder (FR-009)
- [x] T023 [US4] Do **not** add exclusive-open between playlist and About/Discography/Tour/Info in `src/components/Jukebox.astro` or `src/components/StagePanels.astro` — playlist MAY stay open with a bar panel (FR-005)

**Checkpoint**: US4 — intro, resize, keyboard, independence. Phone HUD at 1023 still `015` / `018`.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Artist docs, contract pointer, no phone regression

- [x] T024 [P] Update `docs/artist-guide.md`: laptop legal is **Info** (not the footer); laptop player is always-open Playlist / Shuffle / Play/pause / Mute; vinyl, loop, and volume slider are not desktop chrome (FR-014, constitution VII)
- [x] T025 [P] Add a one-line supersession pointer on desktop floor chrome in `specs/009-desktop-stage-ui/contracts/desktop-hud-ui.md` to `specs/019-desktop-chrome-polish/contracts/desktop-chrome-polish.md` (plan authority)
- [x] T026 Confirm `@media (max-width: 1023px)` stacked docks in `src/styles/global.css` are unchanged and laptop socials stay `.stage__socials` top-right (FR-012)
- [x] T027 Run existing `npm test` and `npm run build` (no new packages, no browsers). Fix type/build breaks from 019 files only
- [ ] T028 Operator validates [quickstart.md](./quickstart.md) Scenarios 1–7 at 1280×800, 1023 vs 1024, and 320px — agents do not install browser tooling

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **US1 (Phase 3)**: After T004 — MVP bar/Info
- **US2 (Phase 4)**: After T004 — can start in parallel with US1 (different files)
- **US3 (Phase 5)**: After US1 + US2 (same files: `StagePanels.astro`, `Jukebox.astro`) plus T004
- **US4 (Phase 6)**: After US2 (resize / intro / playlist independence)
- **Polish (Phase 7)**: After US1–US4

### User Story Dependencies

- **User Story 1 (P1)**: After Foundational — no dependency on US2
- **User Story 2 (P1)**: After Foundational — no dependency on US1
- **User Story 3 (P1)**: After US1 (bar target) and US2 (playlist target)
- **User Story 4 (P2)**: After US2; uses US1 Info + US3 motion if already present

### Parallel Opportunities

- T002 // T003 after T001
- T005 // T006 (Footer vs StagePanels)
- T014 // T010–T013 (MuteControl vs Jukebox) once US2 starts
- After Foundational, US1 and US2 can be staffed in parallel
- T016 and T017 only after US1/US2 land (same-file conflict if parallelized too early)
- T024 // T025 in polish

### Parallel Example: User Story 1

```text
Task: "Hide footer at all widths in src/components/Footer.astro"
Task: "Unhide Info at min-width 1024px in src/components/StagePanels.astro"
```

Then T007–T009 on `StagePanels.astro` sequentially.

### Parallel Example: User Story 2

```text
Task: "Hide volume slider at ≥1024px in src/components/MuteControl.astro"
```

in parallel with Jukebox toolbar/always-open work (T010–T013) on
`src/components/Jukebox.astro`.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 Setup
2. Phase 2 Foundational (T004 two-stage helper)
3. Phase 3 US1 — bar + Info + footer hidden
4. **STOP and VALIDATE** quickstart Scenario 1
5. Then US2 (player), US3 (motion), US4, polish

### Incremental Delivery

1. Setup + Foundation → motion API ready
2. US1 → legal home on desktop (MVP)
3. US2 → always-open player
4. US3 → two-stage grow
5. US4 → intro / resize / keyboard
6. Polish → artist guide + build

### Parallel Team Strategy

1. Together: Setup + T004
2. Then: Dev A = US1 (`Footer.astro`, `StagePanels.astro`); Dev B = US2
   (`Jukebox.astro`, `MuteControl.astro`)
3. Together: US3 (sequence T016 then T017 or split after merge)
4. US4 + polish

---

## Notes

- [P] tasks = different files, no dependencies on incomplete work
- Do **not** implement phone 018 playlist window on desktop
- Do **not** reintroduce vinyl or Loop on desktop
- Volume slider is desktop chrome **only while unmuted** (T028)
- `src/lib/playback.ts` and `src/content/ui/chrome.md` stay unchanged
- Visual review is operator-led (T028)
- Next command: `/speckit-implement`
