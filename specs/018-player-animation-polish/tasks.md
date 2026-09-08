# Tasks: Player Animation Polish

**Input**: Design documents from `/specs/018-player-animation-polish/`

**Prerequisites**: plan.md (required), spec.md (required for user stories),
research.md, data-model.md, contracts/phone-player-polish.md, quickstart.md

**Tests**: Vitest for `src/lib/playlist-window.ts` only (plan / research
R11). **No** Playwright, Puppeteer, Chromium, or `npm run verify:hud`
as an 018 gate. **No** `npm install` / new packages. Visual QA is
operator/manual per [quickstart.md](./quickstart.md).

**Organization**: Setup + foundation (window helper), then US1 solo
open (P1 MVP), US2 drag (P1), US3 three-slot playlist (P1), polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: Which user story this task belongs to (US1–US3)
- Include exact file paths in descriptions

## Path Conventions

Single Astro project. Phone player only (`src/lib/player-dock.ts`,
`src/components/Jukebox.astro`, `src/components/Discography.astro`).
Do **not** fold IDEA-024/025 or edit laptop HUD rules.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align with locked forks; no new toolchain

- [x] T001 Read `specs/018-player-animation-polish/plan.md`, `research.md`, and `contracts/phone-player-polish.md`; do not implement IDEA-024/025 or edit `specs/015-mobile-stage-hud/spec.md`
- [x] T002 [P] Confirm `package.json` / `package-lock.json` stay unchanged (no new npm packages)
- [x] T003 [P] Confirm `docs/artist-guide.md` will not be updated (FR-010 / constitution VII)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Testable FR-005 / FR-015 / FR-016 helpers exist before sheet work

**⚠️ CRITICAL**: No user story work until the window helper and its Vitest file exist

### Tests for foundation (required by plan Testing / research R11)

> Write T004 first and confirm it **fails**, then implement T005.

- [x] T004 [P] Add failing Vitest cases for first / last / middle windows, `n === 1` / `n === 2` placeholder pad, hop in-window vs out-of-window in `src/lib/playlist-window.test.ts`

### Implementation

- [x] T005 Implement `playlistWindow`, slot (`top` / `middle` / `bottom`), placeholder indices, and `shouldRewindow` in `src/lib/playlist-window.ts` so `src/lib/playlist-window.test.ts` passes (FR-005, FR-015, FR-016)

**Checkpoint**: `npx vitest run src/lib/playlist-window.test.ts` passes. No player UI change yet.

---

## Phase 3: User Story 1 - Opening the player shows the current song as a card (Priority: P1) 🎯 MVP

**Goal**: Phone handle open/close still lands on the solo current card
(no play button) with floor chrome, transport, and top-edge handle
visible. Easing stays as-built 320ms. Playlist requested mid-open
applies **after settle**.

**Independent Test**: Operator [quickstart.md](./quickstart.md) Scenario 1
and Scenario 2 at ~390×844. Keyboard / reduced motion still toggle
without drag (spec US1 independent test).

### Implementation for User Story 1

- [x] T006 [US1] In `src/lib/player-dock.ts`, keep `morphPlayerSheet` solo target as `measureSoloOpenPx` / `fitSheetToSoloCard`; do not change `SETTLE_MS` or `PHONE_PANEL_PHASE_MS` in `src/lib/panel-motion.ts` (FR-003). Under `prefers-reduced-motion: reduce`, apply the solo open/close **face instantly** (no required travel); do not regress FR-006
- [x] T007 [US1] In `src/components/Jukebox.astro`, replace the mid-open playlist `return` (when `is-sheet-morphing` and not `is-playlist-morphing`) with a last-committed pending playlist request (FR-008)
- [x] T008 [US1] In `src/lib/player-dock.ts`, apply that pending playlist **after** `morphPlayerSheet` / drag settle finishes; do not apply mid-travel or flash dest-height rows (FR-008). Cancel any in-flight morph/settle; last committed action wins (FR-008)
- [x] T009 [US1] In `src/components/Jukebox.astro` and `src/components/Discography.astro`, keep the open solo face as the current theme-track card **without** a play button; floor chrome + transport stay visible; handle stays on the top edge (FR-003, FR-011)
- [x] T010 [US1] In `src/lib/player-dock.ts` `phoneMq` change handler, clear pending playlist and drop phone height locks when crossing 1023/1024 so laptop does not inherit a mid-morph pill (FR-009)

**Checkpoint**: US1 — solo open/close + queued playlist-after-settle; laptop HUD untouched

---

## Phase 4: User Story 2 - Dragging the handle feels finished (Priority: P1)

**Goal**: Handle drag is tighter / more 1:1 with less rubber-band.
Drag-open shows the solo card. Drag-close from the playlist shrinks
the **three-row** sheet (verify after US3 height exists).

**Independent Test**: Operator [quickstart.md](./quickstart.md) Scenario 3
(SC-002). Tiny slip still taps.

### Implementation for User Story 2

- [x] T011 [US2] In `src/lib/player-dock.ts`, set `RUBBER` to `0.78` and `OVERSCROLL_PX_MAX` to `40`; leave `TAP_SLOP_PX`, `SNAP_PX`, `FLICK_PX_MS`, and in-range 1:1 `rawH` unchanged (FR-004)
- [x] T012 [US2] In `src/lib/player-dock.ts` `beginSheetDrag` / `openHeightPx`, drag-open cap stays the **solo** open height when playlist is off (not the three-row / full-list height)
- [x] T014 [US2] In `src/lib/player-dock.ts` `settleSheet`, tap open height and drag open height still match for the active face; no leftover bounce after release (FR-004)

> **I1 / T013**: Playlist drag-close is implemented **after T015** (three-row height). Do **not** mark T013 complete until T015 exists and drag-close shrinks that 3-row sheet.

**Checkpoint**: US2 — drag feel + solo drag-open; playlist drag-close shrinks the live sheet (3-row after US3)

---

## Phase 5: User Story 3 - Playlist opens as a three-slot window around the current song (Priority: P1)

**Goal**: Playlist is a three-row release-order window with a dynamic
shared-element morph into TOP / MIDDLE / BOTTOM, placeholders if
`n < 3`, tap-to-play + soundwave-on-current, shuffle does not reorder,
re-window only if the new current is outside the visible window.

**Independent Test**: Operator [quickstart.md](./quickstart.md) Scenarios
4–7 (SC-003, SC-009, SC-010, SC-011). Vitest window cases already green.

### Implementation for User Story 3

- [x] T015 [US3] In `src/lib/player-dock.ts`, change `measurePlaylistOpenPx` / `openHeightPx` to chrome + **exactly three** row heights + two gaps using `src/lib/playlist-window.ts` (not all `n` rows); honor existing `sheetCapPx` / `--player-sheet-max` (FR-005, FR-012)
- [x] T013 [US2] **After T015 only.** In `src/lib/player-dock.ts`, drag-close while `is-theme-tracks` shrinks `--player-sheet-h` from the **three-row** playlist sheet; do **not** call `morphPlaylist(false)` mid-drag; turn playlist off only after collapse **settles** (FR-004). Treat incomplete until T015 is done
- [x] T016 [P] [US3] In `src/components/Jukebox.astro` phone CSS, make the settled playlist scrollport a **three-row** viewport (scroll through the full real list; floor chrome stays visible)
- [x] T017 [P] [US3] In `src/components/Discography.astro`, add inert placeholder row markup/CSS (`data-playlist-placeholder`, no play button, no soundwave, not startable) (FR-015)
- [x] T018 [US3] **Owner:** `src/lib/playlist-window.ts` (placeholder indices) + `src/lib/player-dock.ts` (apply/inject). Pad so a settled playlist always shows three rows when `n < 3`; do not duplicate real tracks. Do **not** own this in Astro (FR-015)
- [x] T019 [US3] In `src/lib/player-dock.ts` `morphPlaylist` (open), compute slot via `playlistWindow`; shared-element / FLIP **position** of the current card into **that** slot plus **opacity / header cross-fade**; only the other two **visible** rows enter with height grow; no dest-height flash; **no fly-over** neighbor (A1 / FR-005). Under `prefers-reduced-motion: reduce`, apply both faces **instantly** (no required travel); do not regress FR-006
- [x] T020 [US3] In `src/lib/player-dock.ts` `morphPlaylist` (close), reverse the same morph into the solo card; extra rows leave with the shrink (FR-005). Under `prefers-reduced-motion: reduce`, apply both faces **instantly** (no required travel); do not regress FR-006
- [x] T021 [P] [US3] In `src/components/Jukebox.astro`, keep header cross-fade `currentlyPlayingLabel` ↔ `jukeboxPanelTitle` on playlist toggle (FR-005)
- [x] T022 [US3] On playlist open, set the three-row scroll so the FR-005 window fills the viewport (first → later reachable; last → earlier; else both) in `src/lib/player-dock.ts` (FR-012)
- [x] T023 [US3] **Owner:** `src/lib/playlist-window.ts` (`shouldRewindow`) + `src/lib/player-dock.ts` (apply after hop). After a hop while playlist is on, re-apply FR-005 **only** if the new current does not intersect the three-row scrollport; otherwise move FR-014 chrome only. Do **not** edit `src/lib/stage-switch.ts` (FR-016)
- [x] T024 [P] [US3] Confirm `src/lib/playback.ts` and the theme-track DOM in `src/components/Discography.astro` are **not** reordered when shuffle is on (FR-013)
- [x] T025 [US3] In `src/components/Discography.astro`, keep tap-to-play; current real row = moving `.discog__eq` and no play button; other real rows = play button only; placeholders omit both (FR-014, FR-015)

**Checkpoint**: US3 — three-slot morph + window rules; US1/US2 still hold

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Regression edges and operator QA — no new packages, no browser automation

- [x] T026 [P] Add a one-paragraph pointer on the 015 playlist sheet (full-list unfold) to `specs/015-mobile-stage-hud/contracts/mobile-hud-ui.md` stating 018 `contracts/phone-player-polish.md` wins below 1024px for that sheet
- [x] T027 [P] Confirm `docs/artist-guide.md` is unchanged
- [x] T028 Confirm `package.json` / `package-lock.json` still have no 018 packages
- [x] T029 Run `npx vitest run src/lib/playlist-window.test.ts` and `npm run check` (existing scripts only; do not `npm install`)
- [ ] T030 Operator/manual [quickstart.md](./quickstart.md) Scenarios 1–9 at 320 / 390 / 1023 / 1024 — **do not** run Playwright / Chromium / `npm run verify:hud`
- [x] T031 [P] Confirm exclusive-open, click-outside, Legal overlay skip, intro hide, and reduced-motion still match `specs/015-mobile-stage-hud/contracts/mobile-hud-ui.md` after the player-dock changes in `src/lib/player-dock.ts`
- [x] T032 [P] [US3] Document and gate a **test-only** short-catalog fixture (1–2 theme tracks) so SC-010 can be proven: describe activation in `specs/018-player-animation-polish/quickstart.md` Scenario 7; implement the gate in `src/lib/player-dock.ts` (query/flag). Do **not** change or ship the live four-track catalog as production content

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Stories (Phase 3–5)**: All depend on Foundational
  - Sequential recommended: US1 → US2 → US3 (shared `player-dock.ts`)
  - **I1 HARD**: Implement T015 (3-row height) **before** T013
    (playlist drag-close). Mark T013 complete only after T015; T013
    lives after T015 in Phase 5
- **Polish (Phase 6)**: Depends on US1–US3

### User Story Dependencies

- **User Story 1 (P1)**: After Foundational — no dependency on US2/US3
- **User Story 2 (P1)**: After Foundational — solo drag independent;
  playlist drag-close (T013) **must follow** T015 (hard dependency)
- **User Story 3 (P1)**: After Foundational — uses `playlist-window.ts`;
  pending-playlist from US1 must keep working

### Within Each User Story

- Foundation tests MUST fail before T005
- Shared `player-dock.ts` tasks are sequential (avoid parallel edits)
- [P] tasks are different files only
- Do not start `/speckit-implement` from this document until analyze
  passes

### Parallel Opportunities

- T002 / T003 after T001
- T004 can start once Phase 1 is done
- T016 / T017 / T021 / T024 in parallel with each other after T005
  (different files)
- T026 / T027 / T031 in polish (docs vs confirmations)
- **Not** parallel: most `player-dock.ts` tasks (T006, T008, T010–T015,
  T013 after T015, T018–T020, T022–T023)

---

## Parallel Example: User Story 3

```text
# After T005 (and T015 if measuring against live CSS):
Task: "Three-row scrollport CSS in src/components/Jukebox.astro"
Task: "Placeholder row markup/CSS in src/components/Discography.astro"
Task: "Confirm shuffle does not reorder src/lib/playback.ts / Discography DOM"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (window helper + tests)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Operator quickstart Scenarios 1–2
5. Then US2 drag, then US3 three-slot (the distinctive 018 story)

### Incremental Delivery

1. Setup + Foundational → helper green
2. US1 → solo card + playlist-after-settle
3. US2 → drag feel (playlist drag-close finishes with US3)
4. US3 → three-slot morph + hop/placeholder/shuffle rules
5. Polish → operator QA; no Playwright

### Parallel Team Strategy

One engineer recommended: almost all behavior lives in
`src/lib/player-dock.ts`. A second person can own T016/T017 CSS in
parallel after T005.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete work
- [Story] label maps task to US1–US3
- Open/close easing is **reuse as-built** — do not invent leftover-jank
- Locked: 3-slot window, newest-first, pad if `n<3`, tap-to-play,
  soundwave on current only, shuffle does not reorder, playlist after
  settle, drag-close shrinks 3-row sheet, handle stays, re-window only
  if new current is outside the window
- Visual verification is operator/manual — agents do not spin up browsers
- Commit only if the operator asks
