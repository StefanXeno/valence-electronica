# Tasks: Rotating Identity Subtext

**Input**: Design documents from `/specs/012-rotating-tagline/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/tagline-pool.md, quickstart.md

**Tests**: Plan calls for `vitest` on pure resolver/eligibility (`src/lib/tagline-pool.test.ts`). CI gates: `astro check`, `astro build`, `npm test`. Manual walks in `quickstart.md` for fade timing and 60 s cadence.

**Organization**: Foundational module blocks all stories. US1 delivers 60 s rotation + sequential fade (MVP). US2 adds easter-egg eligible set. US3 is editor workflow + artist guide. US4 is no-JS + reduced motion + cleanup.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Pool data file and operator pointer before library code

- [ ] T001 Create starter `src/data/tagline-pool.json` with `timezone: Europe/Berlin`, normal lines, and example easter-egg rules per `specs/012-rotating-tagline/contracts/tagline-pool.md`
- [ ] T002 [P] Add **Tagline pool** pointer to the **Editing content** section in `README.md` (one file, 60 s rotation summary, link to contract, `npm run check` before publish)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pool types, Berlin eligibility, validation, and unit tests — no UI rotator yet

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Create `src/lib/tagline-pool.ts` with types for `TaglinePool`, `TaglineLine`, and discriminated `TaglineRule` union (`date` | `range` | `weekday` | `time`) per `specs/012-rotating-tagline/data-model.md`
- [ ] T004 Implement `berlinTimeParts(now?: Date)` and rule matchers (`matchesDateRule`, `matchesRangeRule`, `matchesWeekdayRule`, `matchesTimeRule` including cross-midnight) in `src/lib/tagline-pool.ts`; reuse `berlinCalendarParts()` from `src/lib/stage-schedule.ts`
- [ ] T005 Implement `buildEligibleSet(pool, now)` in `src/lib/tagline-pool.ts` — all matching easter eggs in file order, else weight-expanded normal lines; return `[]` when nothing eligible
- [ ] T006 Implement `loadTaglinePool()` and `validateTaglinePool(pool)` in `src/lib/tagline-pool.ts` with clear `lines[n]` / `rules[m]` error messages; missing or unparsable `src/data/tagline-pool.json` MUST fail at build import time (FR-010)
- [ ] T007 Implement `formatTagline(text)` in `src/lib/tagline-pool.ts` preserving the ` for ` non-breaking space rule from `src/components/Hero.astro`
- [ ] T008 [P] Create `src/lib/tagline-pool.test.ts` with vitest coverage for eligibility, weight expansion, validation failures, and time-window matching
- [ ] T009 Call `validateTaglinePool(loadTaglinePool())` from the frontmatter of `src/components/Hero.astro` so `astro check` / `npm run build` fail on invalid pool data

**Checkpoint**: `src/lib/tagline-pool.ts` exports loader, validator, eligibility, and formatter; build validates pool; tests pass for pure logic

---

## Phase 3: User Story 1 - Visitors see rotating identity subtext (Priority: P1) 🎯 MVP

**Goal**: Subtext advances every **60 seconds** through the eligible normal pool with sequential fade-out then fade-in

**Independent Test**: ≥2 normal lines, no matching easter eggs; stay on `/` ≥2 minutes; observe ~60 s cadence and fade-out → fade-in (quickstart scenarios 1–4)

### Implementation for User Story 1

- [ ] T010 [P] Create `src/styles/tagline-rotate.css` with opacity transitions for `[data-tagline-phase="out"]` and `[data-tagline-phase="in"]` (~400–600 ms each); `@media (prefers-reduced-motion: reduce)` disables transitions
- [ ] T011 [US1] Update `src/components/Hero.astro` frontmatter to SSR-render `artist.tagline` from `src/data/site.json` on `.tagline` with `data-tagline-root`; import `src/styles/tagline-rotate.css`
- [ ] T012 [US1] Add client `<script>` in `src/components/Hero.astro` that imports `loadTaglinePool`, `buildEligibleSet`, and `formatTagline`; on load compute eligible set, apply `eligible[0]` if non-empty, else keep SSR fallback and do not start timer (FR-008)
- [ ] T013 [US1] Implement 60-second rotation in `src/components/Hero.astro` client script: advance index with wrap; schedule next step **60 s after** the previous transition completes (FR-006, FR-018)
- [ ] T014 [US1] Implement sequential fade in `src/components/Hero.astro` + `src/styles/tagline-rotate.css`: phase `out` (opacity 0) → swap `textContent` → phase `in` (opacity 1) on `transitionend`; skip animation when next text equals current (FR-015, FR-017)
- [ ] T015 [US1] Manually walk `specs/012-rotating-tagline/quickstart.md` scenarios 1–4 (60 s rotation, sequential fade, same-line skip, typography / 320px); confirm fade reads cleanly on `.tagline.glitch-hit`

**Checkpoint**: MVP — normal pool rotates every minute with fade; fallback when pool empty

---

## Phase 4: User Story 2 - Scheduled easter eggs appear at the right time (Priority: P1)

**Goal**: Matching easter-egg lines replace the normal rotation set; all matching eggs rotate together; eligibility updates on rule boundaries

**Independent Test**: Two easter-egg lines matching “now”; rotation cycles only between them; leaving a time window drops an egg on next tick (quickstart scenarios 5–7)

### Implementation for User Story 2

- [ ] T016 [US2] Add vitest assertions in `src/lib/tagline-pool.test.ts` that `buildEligibleSet()` excludes normal lines when easter eggs match and includes **all** matching easter eggs (covered by T005; this task verifies via tests + contract alignment)
- [ ] T017 [P] [US2] Align shipped examples in `src/data/tagline-pool.json` with easter-egg scenarios in `specs/012-rotating-tagline/contracts/tagline-pool.md` (date, range, weekday, time, combined AND rules)
- [ ] T018 [US2] Extend `src/lib/tagline-pool.test.ts` for multiple matching easter eggs, AND rule groups, and normal-pool exclusion when eggs match
- [ ] T019 [US2] Update rotator in `src/components/Hero.astro` to recompute `buildEligibleSet()` on each tick; clamp or reset index when eligible length changes (FR-005, spec edge case rule boundaries)
- [ ] T020 [US2] Manually walk `specs/012-rotating-tagline/quickstart.md` scenarios 5–7 (easter-egg set only, time boundary, AND rules)

**Checkpoint**: Easter eggs join rotation set; normal pool excluded while eggs match

---

## Phase 5: User Story 3 - Artist maintains lines in one place (Priority: P2)

**Goal**: Editors change copy and rules only in `tagline-pool.json`; build catches mistakes; artist guide documents the surface

**Independent Test**: Edit pool file only → new line appears in rotation after publish; invalid entry fails `npm run check` (quickstart scenarios 8)

### Implementation for User Story 3

- [ ] T021 [US3] Verify `validateTaglinePool()` via `src/components/Hero.astro` rejects empty text, `rules: []`, bad dates/times, inverted ranges, and bad weights with indexed errors; confirm `npm run check` fails (SC-006)
- [ ] T022 [P] [US3] Add **Tagline pool** subsection to `docs/artist-guide.md` — file path, normal vs easter-egg lines, 60 s rotation, fade behavior, weight, fallback to `site.json`, link to `specs/012-rotating-tagline/contracts/tagline-pool.md` (FR-014)
- [ ] T023 [US3] Manually walk quickstart scenario 8 (editor changes pool only; build failure on invalid data)

**Checkpoint**: One-file editing workflow documented; CI guards pool quality

---

## Phase 6: User Story 4 - Site stays usable without scripting and with reduced motion (Priority: P2)

**Goal**: No-JS shows static fallback; reduced motion keeps 60 s cadence with instant swap; rotator cleans up on navigation

**Independent Test**: Scripting off → `site.json` tagline, no rotation. Reduced motion on → instant swap every 60 s (quickstart scenarios 9–11)

### Implementation for User Story 4

- [ ] T024 [US4] Confirm `src/components/Hero.astro` without scripting renders only `site.json` tagline and never leaves subtext blank (FR-009, SC-003)
- [ ] T025 [US4] In `src/components/Hero.astro` rotator, honor `prefers-reduced-motion: reduce` with instant text swap (no `data-tagline-phase` transitions) while keeping 60 s scheduling (FR-016)
- [ ] T026 [US4] Add `pagehide` / teardown handler in `src/components/Hero.astro` rotator to clear timers and avoid overlapping fade sequences when leaving the page (spec edge cases)
- [ ] T027 [US4] Manually walk `specs/012-rotating-tagline/quickstart.md` scenarios 9–11 (no-JS, reduced motion, legal overlay route with identity chrome)

**Checkpoint**: Accessible degradation paths verified; no timer leaks

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Full validation, CI green, docs alignment

- [ ] T028 [P] Smoke-test landing with rotator active: jukebox pick, intro skip/replay, theme/atmosphere, and mute unchanged (FR-013); run full `specs/012-rotating-tagline/quickstart.md` checklist and fix gaps in `src/lib/tagline-pool.ts`, `src/components/Hero.astro`, or `src/styles/tagline-rotate.css`
- [ ] T029 [P] Run `npm run check`, `npm run build`, and `npm test` from repository root; fix type, integration, or test regressions
- [ ] T030 [P] Update `README.md` **Editing content** if operator steps changed during implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — **BLOCKS** all user stories
- **User Stories (Phase 3–6)**: Depend on Foundational completion
  - **US1 (Phase 3)** must complete before meaningful US2/US4 manual fade/timer walks
  - **US2 (Phase 4)** extends eligibility + rotator recompute (depends on T005, T012–T014)
  - **US3 (Phase 5)** can overlap US2 after T009; artist guide after behavior is stable
  - **US4 (Phase 6)** builds on US1 rotator (T012–T014); reduced-motion CSS starts at T010
- **Polish (Phase 7)**: After desired user stories complete

### User Story Dependencies

| Story | Depends on | Independent test |
|-------|------------|------------------|
| **US1 (P1)** | Foundational | 2+ normal lines rotate every ~60 s with sequential fade |
| **US2 (P1)** | US1 rotator + T005 | Matching easter eggs rotate; normal pool excluded |
| **US3 (P2)** | Foundational (T009) | Edit JSON only; build validates |
| **US4 (P2)** | US1 rotator | No-JS fallback; reduced-motion instant swap |

### Parallel Opportunities

- **Phase 1**: T001 and T002 in parallel
- **Phase 2**: T008 parallel with T003–T007 once T005 exists (tests target stable API)
- **Phase 3**: T010 parallel with T011 (CSS vs Hero frontmatter)
- **Phase 4**: T017 parallel with T018 after T016
- **Phase 5**: T022 parallel with T021
- **Phase 7**: T029 and T030 in parallel

### Parallel Example: Phase 1

```bash
# Different files — run together:
Task T001: Create src/data/tagline-pool.json
Task T002: Update README.md editing section
```

### Parallel Example: After Foundational

```bash
# US1 (sequential on Hero.astro script):
T011 → T012 → T013 → T014

# While US1 in progress, another dev can:
T010: Create src/styles/tagline-rotate.css
T017: Expand easter-egg examples in src/data/tagline-pool.json
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: User Story 1 (T010–T015)
4. **STOP and VALIDATE**: quickstart scenarios 1–4 (~2 min wait for rotation)
5. Demo rotating subtext on landing

### Incremental Delivery

1. Setup + Foundational → eligibility + validation ready
2. US1 → 60 s rotation + fade (**MVP**)
3. US2 → easter-egg eligible set + boundary recompute
4. US3 → artist guide + build hard-fail confirmation
5. US4 → no-JS + reduced motion + cleanup
6. Polish → full quickstart + CI green

### Suggested MVP Scope

**Phases 1–3 only** (T001–T015): delivers FR-006/FR-015 visitor value with normal-pool rotation and sequential fade. Easter eggs (US2) follow without breaking MVP.

---

## Notes

- Do not add npm date libraries; use `Intl` only (`specs/012-rotating-tagline/research.md` R10)
- Do not persist rotation index in `localStorage` / cookies (FR-012)
- SSR always prerender `site.json` tagline; expect brief correction when first pool line differs (plan Complexity Tracking)
- Production rotation interval is **60 seconds**; dev-only shorter interval is optional YAGNI (research R14)
- `[P]` tasks touching `src/lib/tagline-pool.ts` still require sequential edits within that file unless split by exported functions after T003
- Sequential tasks on `src/components/Hero.astro` client script: T012 → T013 → T014 → T019 → T025 → T026

---

## Task Summary

| Phase | Tasks | Story |
|-------|-------|-------|
| 1 Setup | T001–T002 (2) | — |
| 2 Foundational | T003–T009 (7) | — |
| 3 US1 | T010–T015 (6) | US1 |
| 4 US2 | T016–T020 (5) | US2 |
| 5 US3 | T021–T023 (3) | US3 |
| 6 US4 | T024–T027 (4) | US4 |
| 7 Polish | T028–T030 (3) | — |
| **Total** | **30 tasks** | |

(T028 includes FR-013 stage regression smoke per analyze remediation.)
