# Tasks: Desktop Stage UI Redesign

**Input**: Design documents from `/specs/009-desktop-stage-ui/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/desktop-hud-ui.md, quickstart.md

**Tests**: Not requested. CI gates (`astro check`, `astro build`) plus manual walks in `quickstart.md` are the validation path.

**Organization**: Tasks grouped by user story. Foundational dock shell blocks all stories. US1 and US2 are both P1; US1 (layout) lands before US2 (label reveal). US3–US5 follow in priority order.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: Which user story this task belongs to (US1–US5)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend chrome content model for icon tokens before UI refactor

- [x] T001 Add optional `jukeboxIcon`, `aboutIcon`, `lyricsIcon`, `discographyIcon`, and `tourIcon` fields to `src/content/ui/chrome.md` (omit or leave defaults — see `specs/009-desktop-stage-ui/data-model.md`)
- [x] T002 [P] Extend `ui` collection Zod schema in `src/content.config.ts` with optional string fields for the five `*Icon` keys
- [x] T003 Extend `getChrome()` and `UiChrome` type in `src/lib/stage.ts` to expose icon tokens with shipped defaults when fields are omitted (`jukebox`, `about`, `lyrics`, `discography`, `tour`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared dock shell, icon component, and stage grid — blocks all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create `src/components/HudIcon.astro` — map known tokens to inline SVG; render emoji when chrome value is a non-ASCII grapheme override
- [x] T005 Create `src/components/StageDock.astro` with root `class="stage-dock"` — bottom horizontal dock with left segment (jukebox slot) and right segment (on-demand row + mute trail) per `specs/009-desktop-stage-ui/contracts/desktop-hud-ui.md`
- [x] T006 Refactor stage layout in `src/styles/global.css` — three-band shell (top identity/socials, bottom dock, footer band); remove bottom-right vertical panel stack positioning; keep 320px no horizontal scroll
- [x] T007 Refactor `src/pages/index.astro` to compose `StageDock`, mount jukebox/panels/mute inside dock slots, and keep `LandingIntro` unchanged
- [x] T008 [P] Update intro hide selectors in `src/styles/intro.css` if stage slot class names or structure change in T007

**Checkpoint**: `npm run check` passes; landing loads with dock shell even if controls still show legacy text summaries

---

## Phase 3: User Story 1 - Center stage feels balanced and undisturbed (Priority: P1) 🎯 MVP

**Goal**: Symmetric desktop HUD at rest — icon-only dock triggers, horizontal on-demand row, free center, balanced left/right weight

**Independent Test**: quickstart.md §1 — 1280×800, panels closed, no persistent text titles; horizontal icon row; center third open

### Implementation for User Story 1

- [x] T009 [US1] Refactor `src/components/StagePanels.astro` — icon-only `<summary>` via `HudIcon`; visually hidden accessible labels from chrome titles; horizontal flex row in dock right segment; panel bodies expand from dock edge
- [x] T010 [US1] Refactor `src/components/Jukebox.astro` — icon-first collapsed trigger in dock left segment (vinyl token default); hide permanent text label at rest; keep existing switch/morph logic
- [x] T011 [P] [US1] Tune `src/components/Hero.astro` and `src/components/Channels.astro` plus top-band rules in `src/styles/global.css` for matched identity/social visual weight
- [x] T012 [US1] Constrain open panel max dimensions and internal scroll in `src/components/StagePanels.astro` / `src/styles/global.css` so bodies stay peripheral
- [x] T013 [US1] Manually walk quickstart.md §1 (symmetric minimal stage) and fix dock spacing until SC-001 visual review passes

**Checkpoint**: MVP — desktop stage reads balanced and icon-minimal at rest

---

## Phase 4: User Story 2 - Icon-first controls reveal labels on demand (Priority: P1)

**Goal**: Floating label slides toward viewport center on hover and keyboard-visible focus; reduced-motion fade-only path

**Independent Test**: quickstart.md §2 — hover/focus each dock icon and social; label animates toward center; chrome edit reflects without code change

### Implementation for User Story 2

- [x] T014 [P] [US2] Create `src/lib/label-reveal.ts` — mount lifecycle, position floater at control center, animate `translateX` toward viewport horizontal center, teardown on leave/blur; reduced-motion branch (fade near control)
- [x] T015 [US2] Add `#hud-label-reveal` mount point in `src/layouts/Base.astro` and initialize `label-reveal.ts` on landing pages only
- [x] T016 [US2] Add `data-hud-label` hooks and label text to dock triggers in `src/components/StagePanels.astro`, `src/components/Jukebox.astro`, and social links in `src/components/Channels.astro`
- [x] T017 [US2] Add floater styles in `src/styles/global.css` (z-index above dock, readable contrast, motion via `@media (prefers-reduced-motion)`)
- [x] T018 [US2] Manually walk quickstart.md §2 including reduced-motion and a `lyricsTitle` edit in `src/content/ui/chrome.md` rebuild smoke test

**Checkpoint**: Label reveal works on all HUD icon controls without permanent text chrome

---

## Phase 5: User Story 3 - Legal and copyright sit bottom center (Priority: P2)

**Goal**: Copyright + Impressum + Datenschutzerklärung centered at bottom; legal overlay unchanged

**Independent Test**: quickstart.md §3 — centered footer; overlay opens; no overlap with dock at default scale

### Implementation for User Story 3

- [x] T019 [US3] Refactor `src/components/Footer.astro` — bottom-center cluster (`left: 50%`, flex row, transparent) per `specs/009-desktop-stage-ui/contracts/desktop-hud-ui.md`
- [x] T020 [US3] Adjust `--hud-footer`, dock bottom inset, and mute trailing position in `src/styles/global.css` so footer clears jukebox and mute hit targets at 1280×800
- [x] T021 [US3] Manually walk quickstart.md §3 (legal overlay from centered footer)

**Checkpoint**: Footer meets FR-006 / SC-003

---

## Phase 6: User Story 4 - Glitch animations never steal clicks (Priority: P2)

**Goal**: Dock panel and jukebox glitch uses live-safe keyframes; full bounding box stays clickable during animation

**Independent Test**: quickstart.md §4 — Nightmare theme, click inside glitch gaps on every dock trigger (5+ tries each)

### Implementation for User Story 4

- [x] T022 [US4] Add `data-glitch-live` to on-demand `<details>` summaries in `src/components/StagePanels.astro` (and jukebox trigger if not already live-safe)
- [x] T023 [US4] Extend live-safe selector block in `src/styles/glitch.css` so `.stage-dock details.glitch-hit.is-glitching` (and hover) use `ui-glitch-live-*` keyframes; confirm summary keeps `pointer-events: auto`
- [x] T024 [US4] Manually walk quickstart.md §4 — zero failed activations during active glitch (SC-004)

**Checkpoint**: FR-008 satisfied on all dock HUD triggers

---

## Phase 7: User Story 5 - All existing content remains reachable in less space (Priority: P3)

**Goal**: No regressions in jukebox switch, exclusive-open, lyrics, discography stage button, tour, About hide rule, socials

**Independent Test**: quickstart.md §5 — full `004` behavior table on desktop

### Implementation for User Story 5

- [x] T025 [US5] Verify and fix exclusive-open listener in `src/components/StagePanels.astro` after dock refactor (at most one panel open when scripting available)
- [x] T026 [US5] Verify jukebox switch, lyrics follow active entry, and mute visibility in `src/components/Jukebox.astro`, `src/components/LyricsPanel.astro`, and `src/components/MuteControl.astro` — fix regressions only
- [x] T027 [US5] Verify discography stage button and tour empty states in `src/components/Discography.astro` and `src/components/TourDates.astro` still work from dock-open panels
- [x] T028 [US5] Manually walk quickstart.md §5 (`004` regression matrix)

**Checkpoint**: SC-005 — all legacy stage behaviors pass on desktop

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Docs, contract cross-links, build gates, full quickstart

- [x] T029 [P] Confirm desktop supersession note and layout-row footnotes in `specs/004-landing-content-layout/contracts/stage-ui.md` point to `specs/009-desktop-stage-ui/contracts/desktop-hud-ui.md`
- [x] T030 [P] Confirm live-safe dock amendment in `specs/003-ui-glitch/contracts/glitch-ui.md` (add if missing)
- [x] T031 [P] Update `docs/artist-guide.md` — document optional `*Icon` fields in `src/content/ui/chrome.md` (constitution VII)
- [x] T032 Run `npm run check` and `npm run build` from repository root
- [x] T033 Manually walk full `specs/009-desktop-stage-ui/quickstart.md` (all sections, optional emoji override, and 320px load smoke — no horizontal scroll, content reachable)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **blocks all user stories**
- **US1 (Phase 3)**: Depends on Foundational
- **US2 (Phase 4)**: Depends on US1 (needs icon triggers to attach label reveal)
- **US3 (Phase 5)**: Depends on Foundational; best after US1 dock spacing is stable
- **US4 (Phase 6)**: Depends on US1 (dock summaries must exist)
- **US5 (Phase 7)**: Depends on US1–US4 complete
- **Polish (Phase 8)**: Depends on US5

### User Story Dependencies

| Story | Priority | Depends on | Independent test |
|-------|----------|------------|------------------|
| US1 | P1 | Foundational | quickstart §1 — symmetric icon dock |
| US2 | P1 | US1 | quickstart §2 — label reveal |
| US3 | P2 | Foundational + US1 spacing | quickstart §3 — centered footer |
| US4 | P2 | US1 | quickstart §4 — glitch hit targets |
| US5 | P3 | US1–US4 | quickstart §5 — `004` regression |

### Parallel Opportunities

- **Phase 1**: T002 ∥ T001→T003 (T003 after T002 schema)
- **Phase 2**: T004 ∥ T008; T005–T007 sequential
- **Phase 3**: T011 ∥ T009–T010 after T009/T010 started (different files)
- **Phase 4**: T014 ∥ T017; T015–T016 sequential after T014
- **Phase 8**: T029 ∥ T030

---

## Parallel Example: User Story 1

```bash
# After T009 starts StagePanels refactor, in parallel:
Task T011: "Tune Hero.astro and Channels.astro top band in global.css"
Task T010: "Refactor Jukebox.astro icon-first trigger"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE** — quickstart §1
5. Demo symmetric icon dock before label reveal

### Incremental Delivery

1. Setup + Foundational → dock shell
2. US1 → balanced icon HUD (MVP)
3. US2 → label reveal animation
4. US3 → centered legal footer
5. US4 → glitch click fix
6. US5 → regression pass
7. Polish → artist guide + full quickstart

### Suggested commit slices

- `feat(hud): extend chrome icon tokens` (T001–T003)
- `feat(hud): add stage dock shell` (T004–T008)
- `feat(hud): icon-first dock controls` (T009–T013)
- `feat(hud): label reveal animation` (T014–T018)
- `feat(hud): center footer cluster` (T019–T021)
- `fix(glitch): live-safe dock triggers` (T022–T024)
- `chore(hud): regression and docs` (T025–T032)

---

## Notes

- Future layout changes MUST update `specs/009-desktop-stage-ui/` and `contracts/desktop-hud-ui.md` before code (constitution VI / plan governance).
- Mobile HUD polish remains IDEA-013 — do not scope creep.
- Track info / streaming links remain IDEA-021 — do not add in this feature.
- No new npm dependencies (no Font Awesome).
