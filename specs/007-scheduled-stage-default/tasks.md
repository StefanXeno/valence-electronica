# Tasks: Scheduled Stage Default

**Input**: Design documents from `/specs/007-scheduled-stage-default/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/stage-schedule.md, quickstart.md

**Tests**: Not requested. CI gates (`astro check`, `astro build`) plus manual walks in `quickstart.md` are the validation path.

**Organization**: Tasks grouped by user story. Core resolver module is foundational; US1 delivers visitor-facing scheduled default; US2/US4 share build validation; US3 is override behavior on top of US1.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Schedule data file and operator docs before resolver code

- [ ] T001 Create starter `src/data/stage-schedule.json` with `timezone: Europe/Berlin` and commented-out or inactive example rules per `specs/007-scheduled-stage-default/contracts/stage-schedule.md` (ship with empty `rules: []` so behavior matches pre-feature until editor adds rules)
- [ ] T002 [P] Add `src/data/stage-schedule.json` editing notes to the **Editing content** section in `README.md` (one file, rule types, link to contract, `npm run check` before publish)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared schedule types, Berlin calendar helper, tiered resolver, and build loader

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Create `src/lib/stage-schedule.ts` with TypeScript types for `StageSchedule` and discriminated rule union (`date` | `range` | `weekday`) per `specs/007-scheduled-stage-default/data-model.md`
- [ ] T004 Implement `berlinCalendarParts(now?: Date)` in `src/lib/stage-schedule.ts` using `Intl.DateTimeFormat` with `timeZone: Europe/Berlin` (year, month, day, ISO weekday 1–7)
- [ ] T005 Implement `resolveScheduledDefault(schedule, parts, catalogIds, staticFallbackId)` in `src/lib/stage-schedule.ts` with tier order date → range → weekday → fallback and first-match-wins within each tier per `specs/007-scheduled-stage-default/data-model.md`
- [ ] T006 Implement `loadStageSchedule()` in `src/lib/stage-schedule.ts` to read `src/data/stage-schedule.json`, treat missing file as empty rules, reject non-`Europe/Berlin` timezone at build, and parse rule arrays
- [ ] T007 Implement `validateStageSchedule(schedule, usableJukeboxIds)` in `src/lib/stage-schedule.ts` to fail on unknown `jukeboxId`, invalid calendar dates (`MM-DD`, `YYYY-MM-DD`), and `range.from > range.to` with clear error messages

**Checkpoint**: `src/lib/stage-schedule.ts` exports resolver + loader + validator; no UI wiring yet

---

## Phase 3: User Story 1 - Visitor sees the right atmosphere for today (Priority: P1) 🎯 MVP

**Goal**: Landing loads with the jukebox entry scheduled for today in Europe/Berlin (atmosphere + theme + lyrics sync) before any manual jukebox interaction

**Independent Test**: Add a `date` rule for today (Berlin) pointing at a non-`default` entry; hard reload `/`; that entry is active on first load (quickstart scenario 1)

### Implementation for User Story 1

- [ ] T008 [US1] Extend `getBackgroundConfig()` in `src/lib/background.ts` to call `loadStageSchedule()` and `validateStageSchedule()` against usable jukebox ids; keep `defaultVideoId` as **static fallback** (`default: true` entry); add `schedule` payload to returned config
- [ ] T009 [US1] Ensure `getDefaultVideo()` in `src/lib/background.ts` and SSR in `src/layouts/Base.astro` continue to use static fallback only (not client-resolved id) for no-JS and initial HTML
- [ ] T010 [US1] Embed schedule JSON and static fallback id on the jukebox root in `src/components/Jukebox.astro` via `data-stage-schedule` and `data-stage-fallback` (keep `data-stage-default` as SSR/static fallback id)
- [ ] T011 [US1] Update `initStageSwitch()` in `src/lib/stage-switch.ts` to parse embedded schedule, call `berlinCalendarParts()` + `resolveScheduledDefault()`, and when result ≠ SSR `defaultId` immediately `applyStageEntry()` + `syncStageUi()` before user interaction
- [ ] T012 [US1] Confirm `src/components/LyricsPanel.astro` and `src/components/BackgroundAtmosphere.astro` SSR the static fallback entry while client sync from `src/lib/stage-switch.ts` updates active lyrics/atmosphere when scheduled default differs
- [ ] T013 [US1] Manually walk `specs/007-scheduled-stage-default/quickstart.md` scenario 1 (scheduled default on load) and fix regressions in `src/lib/stage-switch.ts` / `src/components/Jukebox.astro`

**Checkpoint**: MVP — calendar rule for today changes landing default without redeploy on reload

---

## Phase 4: User Story 2 - Artist edits the schedule in one place (Priority: P1)

**Goal**: Timed defaults change only via `src/data/stage-schedule.json`; publish validates rules against real jukebox ids

**Independent Test**: Change only `src/data/stage-schedule.json`, run `npm run check`, reload on matching day — default follows (quickstart scenarios 2–3)

### Implementation for User Story 2

- [ ] T014 [P] [US2] Populate `src/data/stage-schedule.json` with shipped example rules (yearly `10-31` → `nightmare`, sample range, sample weekday) per `specs/007-scheduled-stage-default/contracts/stage-schedule.md`; disable or comment rules that would override today in dev unless intentional
- [ ] T015 [US2] Wire `validateStageSchedule()` into the build path from `src/lib/background.ts` so `astro check` / `npm run build` fails when schedule references invalid ids or dates (FR-008)
- [ ] T016 [US2] Manually walk `specs/007-scheduled-stage-default/quickstart.md` scenario 3 (editor changes schedule file only, no component edits)

**Checkpoint**: Non-programmer can retime defaults by editing one JSON file; bad ids fail CI

---

## Phase 5: User Story 3 - Manual jukebox choice still wins (Priority: P2)

**Goal**: Visitor jukebox pick overrides scheduled default for the visit; reload re-applies schedule

**Independent Test**: With scheduled default active, pick another entry — stays until reload (quickstart scenario 4)

### Implementation for User Story 3

- [ ] T017 [US3] Verify `initStageSwitch()` in `src/lib/stage-switch.ts` resolves schedule **once at boot** only; `STAGE_SELECT_EVENT` handler must not re-run schedule resolution (manual `activeId` until navigation reload)
- [ ] T018 [US3] Manually walk `specs/007-scheduled-stage-default/quickstart.md` scenario 4 (override persists for visit, reload restores scheduled default)

**Checkpoint**: Jukebox explicit choice beats schedule; no cookies or storage added

---

## Phase 6: User Story 4 - Safe fallbacks when schedule is incomplete or wrong (Priority: P2)

**Goal**: Empty/missing schedule, no matching rule, or bad runtime id never blanks the landing; priority tiers behave predictably

**Independent Test**: Empty rules, invalid id at build, priority overlap walks (quickstart scenarios 5–10)

### Implementation for User Story 4

- [ ] T019 [US4] Ensure `loadStageSchedule()` in `src/lib/stage-schedule.ts` returns empty rules for missing file without throwing; `getBackgroundConfig()` in `src/lib/background.ts` behaves identically to pre-feature (static fallback only)
- [ ] T020 [US4] Ensure `resolveScheduledDefault()` in `src/lib/stage-schedule.ts` skips rules whose `jukeboxId` ∉ `catalogIds` at runtime and falls through to next tier / static fallback (FR-009)
- [ ] T021 [US4] Add build failure coverage for invalid `jukeboxId`, invalid date, and inverted range in `src/lib/stage-schedule.ts` / `src/lib/background.ts`; confirm error messages name the offending rule/id
- [ ] T022 [US4] Manually walk `specs/007-scheduled-stage-default/quickstart.md` scenarios 5–10 (empty schedule, build fail on bad id, priority date vs weekday, yearly recurrence, no-JS static fallback)

**Checkpoint**: Broken or empty schedule degrades safely; editors get fast publish feedback

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Full validation and docs alignment

- [ ] T023 Run full `specs/007-scheduled-stage-default/quickstart.md` validation checklist and fix any gaps in `src/lib/stage-schedule.ts`, `src/lib/background.ts`, `src/lib/stage-switch.ts`, or `src/components/Jukebox.astro`
- [ ] T024 [P] Run `npm run check` and `npm run build` from repository root; fix type or integration regressions
- [ ] T025 [P] Update `README.md` **Editing content** if operator steps changed during implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS** all user stories
- **User Stories (Phase 3–6)**: Depend on Foundational completion
  - US1 (Phase 3) should complete before US3/US4 manual walks that assume wired landing
  - US2 (Phase 4) can overlap US1 after T008 (validation) but examples ship after resolver exists
  - US3 (Phase 5) depends on US1 boot wiring (T011)
  - US4 (Phase 6) partially overlaps US2 (build validation); runtime fallback tests after US1
- **Polish (Phase 7)**: After desired user stories complete

### User Story Dependencies

| Story | Depends on | Independent test |
|-------|------------|------------------|
| **US1 (P1)** | Foundational | Today date rule → non-default entry on load |
| **US2 (P1)** | Foundational + US1 wiring for end-to-end | Edit JSON only; build validates ids |
| **US3 (P2)** | US1 | Manual jukebox overrides until reload |
| **US4 (P2)** | Foundational; full walk after US1 | Empty/bad schedule → static fallback |

### Parallel Opportunities

- **Phase 1**: T001 and T002 in parallel
- **Phase 2**: T004 and T006 can start after T003 (same file — sequence T003 → T004/T006 → T005/T007)
- **Phase 4**: T014 parallel with T015 once validator exists
- **Phase 7**: T024 and T025 in parallel

### Parallel Example: Phase 1

```bash
# Different files — run together:
Task T001: Create src/data/stage-schedule.json
Task T002: Update README.md editing section
```

### Parallel Example: After Foundational

```bash
# US1 wiring (sequential on stage-switch.ts):
T008 → T010 → T011

# While US1 in progress, another dev can:
T014: Example rules in src/data/stage-schedule.json
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1 (T008–T013)
4. **STOP and VALIDATE**: quickstart scenario 1
5. Demo scheduled default on today’s Berlin date

### Incremental Delivery

1. Setup + Foundational → resolver ready
2. US1 → scheduled default on load (**MVP**)
3. US2 → editor workflow + build validation
4. US3 → confirm override semantics
5. US4 → fallback and priority edge cases
6. Polish → full quickstart + CI green

### Suggested MVP Scope

**Phases 1–3 only** (T001–T013): delivers FR-004/FR-005 visitor value with static fallback SSR and client resolution. US2 build-hard-fail can follow immediately after without breaking MVP demo.

---

## Notes

- Do not add npm date libraries; use `Intl` only (`specs/007-scheduled-stage-default/research.md` R5)
- Do not persist jukebox selection in `sessionStorage` / cookies (FR-013)
- SSR always prerender static fallback; expect possible brief correction when scheduled ≠ fallback and JS runs (plan Complexity Tracking)
- `[P]` tasks touching `src/lib/stage-schedule.ts` still require sequential edits within that file unless split by exported functions after T003

---

## Task Summary

| Phase | Tasks | Story |
|-------|-------|-------|
| 1 Setup | T001–T002 (2) | — |
| 2 Foundational | T003–T007 (5) | — |
| 3 US1 | T008–T013 (6) | US1 |
| 4 US2 | T014–T016 (3) | US2 |
| 5 US3 | T017–T018 (2) | US3 |
| 6 US4 | T019–T022 (4) | US4 |
| 7 Polish | T023–T025 (3) | — |
| **Total** | **25 tasks** | |
