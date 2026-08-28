# Tasks: Codebase Hardening & Quality Pass

**Input**: Design documents from `/specs/013-codebase-hardening/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/track-detail-ui.md, contracts/stage-handoff.md, quickstart.md

**Tests**: Spec FR-011 / SC-004 require ≥10 new vitest cases in `src/lib/theme-packs.test.ts` and `src/lib/stage.test.ts`. CI gates: `astro check`, `astro build`, `npm test`. Manual walks in `quickstart.md` for stage stress, 320px tagline, and `011` close-out (no browser CI).

**Organization**: Setup + light foundation, then user stories US1–US7 by priority. US1 + US2 are P1 (MVP). US5 (`011` QA) depends on US1–US2 landing. US7 dead-code cleanup can parallel US4 docs after US2 touches `syncStageUi`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: Which user story this task belongs to (US1–US7)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Baseline quality gates and contract alignment before edits

- [x] T001 Verify branch `013-codebase-hardening` and read `specs/013-codebase-hardening/contracts/track-detail-ui.md` and `specs/013-codebase-hardening/contracts/stage-handoff.md`
- [x] T002 [P] Read `specs/013-codebase-hardening/research.md` (R1–R11) and `specs/013-codebase-hardening/quickstart.md` validation scenarios
- [x] T003 [P] Run `npm run check && npm test && npm run build` from repository root; record baseline test count (expect 57) for SC-004 comparison

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Confirm existing schema and parsers — no new data model

**⚠️ CRITICAL**: No user story work should diverge from these surfaces

- [x] T004 Confirm `blurb`, `credits`, and `mentions` exist on jukebox schema in `src/content.config.ts` per `specs/010-track-catalog/contracts/track-catalog-content.md`
- [x] T005 [P] Confirm `parseCredits`, `parseListenLinks`, and related types in `src/lib/catalog-tracks.ts` are the reuse target for `TrackInfoPanel` (research R5 — do not duplicate parsers)

**Checkpoint**: Jukebox frontmatter + parsers ready; US1 can render without schema changes

---

## Phase 3: User Story 1 - Visitor sees full track context in V-Flip drawer (Priority: P1) 🎯 MVP

**Goal**: Inline jukebox track detail shows blurb, release date, listen links, credits, and mentions when configured; omitted sections stay hidden

**Independent Test**: Open drawer → select track with credits in `src/content/jukebox/nightmare.md` → all configured fields visible; track without credits → no credits block (quickstart scenarios 1–4)

### Implementation for User Story 1

- [x] T006 [US1] Extend `src/components/TrackInfoPanel.astro` frontmatter `byId` map to include `blurb`, `credits` (via `parseCredits` from `src/lib/catalog-tracks.ts`), and `mentions` from jukebox collection entries
- [x] T007 [US1] Render optional blurb paragraph (`.track-info__blurb`) above release date in `src/components/TrackInfoPanel.astro` per `specs/013-codebase-hardening/contracts/track-detail-ui.md` content order
- [x] T008 [US1] Render optional credits `<ul class="track-info__credits">` with role + name plain text per contract; omit when `credits.length === 0`
- [x] T009 [US1] Render optional mentions `<p class="track-info__mentions">` below credits; omit when empty
- [x] T010 [P] [US1] Add scoped styles in `src/components/TrackInfoPanel.astro` for credits list, long blurb scroll inside drawer, and 320px no horizontal overflow (FR-001, FR-002)
- [x] T011 [P] [US1] Add sample `blurb`, `credits`, and optional `mentions` to `src/content/jukebox/nightmare.md` for SC-001 verification
- [ ] T012 [US1] Manually walk `specs/013-codebase-hardening/quickstart.md` scenarios 1–4 (metadata visible, omitted sections, track switch sync)

**Checkpoint**: US1 complete — `010` FR-009 satisfied in V-Flip UI model

---

## Phase 4: User Story 2 - Stage playback stays correct under stress (Priority: P1)

**Goal**: Latest-wins crossfades, active-video-only metadata listener, corrupt catalog JSON does not brick landing script

**Independent Test**: Rapid-click five tracks in three seconds → one stable theme; shuffle end advances once; corrupt catalog logs error without script crash (quickstart scenarios 5–7)

### Implementation for User Story 2

- [x] T013 [US2] Add monotonic `handoffGeneration` (module-level or closure in `initStageSwitch`) in `src/lib/stage-switch.ts` per research R1
- [x] T014 [US2] Increment generation on each `select()` in `src/lib/stage-switch.ts`; call `syncStageUi(activeId)` immediately on select
- [x] T015 [US2] At end of `crossfadeStageEntry()` in `src/lib/stage-switch.ts`, compare generation before **any** video swap, `data-theme` write, or `restartClock()` — stale handoffs return early with no DOM mutation (FR-003)
- [x] T016 [US2] Implement `bindActiveVideoMetadataListener(restartClock)` in `src/lib/stage-switch.ts` that attaches `loadedmetadata` only to current `[data-bg-video]` active element (research R2)
- [x] T017 [US2] Call metadata rebind after `swapAtmosphereVideos()` in `src/lib/stage-switch.ts` and on `initStageSwitch` boot; remove one-shot listener on initial video at lines ~476–477 (FR-004)
- [x] T018 [US2] Wrap `JSON.parse` for `data-stage-catalog` and `data-stage-schedule` in try/catch inside `bootStageSwitch()` in `src/components/Jukebox.astro`; `console.error` and return without throwing (FR-005)
- [ ] T019 [US2] Manually walk `specs/013-codebase-hardening/quickstart.md` scenarios 5–7 (rapid switch, shuffle single advance, active video listener); repeat SC-002 protocol **10 times** (five picks in three seconds) and log zero stuck crossfade states

**Checkpoint**: US2 complete — stage handoff contract satisfied

---

## Phase 5: User Story 3 - Identity and tagline stay readable on narrow viewports (Priority: P2)

**Goal**: Long tagline lines wrap to two lines at 320px without horizontal scroll

**Independent Test**: 320px viewport + longest pool line → no scrollbar; start of line visible (quickstart scenario 8)

### Implementation for User Story 3

- [x] T020 [US3] Update `.tagline` in `src/components/Hero.astro` with two-line wrap (`-webkit-line-clamp: 2` or equivalent), `overflow: hidden`, and `max-width: 100%`; remove strict single-line `nowrap` so long lines wrap without horizontal scroll (operator choice — FR-006)
- [ ] T021 [US3] Manually walk quickstart scenario 8 at 320px; confirm two-line wrap and no horizontal scroll; spot-check tagline during intro (`data-intro-active`) does not regress

**Checkpoint**: US3 complete — constitution IV tagline overflow addressed

---

## Phase 6: User Story 4 - Maintainer trusts docs and content boundaries (Priority: P2)

**Goal**: Artist guide documents all rendered jukebox fields; README marks dev-only intro replay; build clean; location consistent

**Independent Test**: Read `docs/artist-guide.md` + README; `npm run build` without releases-directory warning (quickstart scenarios 10–13)

### Implementation for User Story 4

- [x] T022 [P] [US4] Remove `releases` collection definition from `src/content.config.ts` and from `collections` export (research R6, FR-009)
- [x] T023 [US4] Delete unused `getValidReleases()` and any `ReleaseItem`-only imports if orphaned in `src/lib/stage.ts`
- [x] T024 [P] [US4] Add `blurb`, `credits`, `mentions`, and `listenLinks` examples to jukebox section in `docs/artist-guide.md` (FR-007, SC-006)
- [x] T025 [P] [US4] Add **Lyrics not shown on site (v1)** note to jukebox section in `docs/artist-guide.md` — body retained for future spec; remove `lyricsTitle` / `emptyLyrics` references (FR-007)
- [x] T026 [P] [US4] Mark `?replay-intro` and `/dev/intro` as **development-only** in README **Landing intro** section per `specs/006-landing-intro/spec.md` FR-011 (FR-007)
- [x] T027 [US4] Set `artist.location` to **Berlin** in `src/data/site.json` to match `src/content/about/me.md` (FR-008)
- [x] T028 [US4] Run `npm run build` and confirm no recurring warning about missing `src/content/releases/` directory
- [x] T029 [US4] Manually walk quickstart scenarios 10–13 (docs, build hygiene)

**Checkpoint**: US4 complete — constitution VII satisfied for this change set

---

## Phase 7: User Story 5 - Operator signs off V-Flip playback QA (Priority: P2)

**Goal**: All open `011` manual quickstart scenarios pass; failures fixed under `013`; task checkboxes updated

**Independent Test**: Complete table in `specs/013-codebase-hardening/quickstart.md` §011 close-out; check off `specs/011-vflip-now-playing/tasks.md` T017, T021, T026, T033, T037, T040, T042, T043, T048

**Depends on**: US1 + US2 (and preferably US3) before final sign-off

### Implementation for User Story 5

- [ ] T030 [US5] Manually execute `specs/011-vflip-now-playing/quickstart.md` scenario 1 (V-Flip open/close) — record pass/fail in `specs/013-codebase-hardening/quickstart.md` table
- [ ] T031 [US5] Manually execute quickstart scenarios 2, 3, 4, 5, 6, 6b, 7 (shuffle, loop, mute, timing, toggles, toolbar) — fix any failures in `src/` before proceeding
- [ ] T032 [US5] Manually execute quickstart scenarios 8, 9, 10 (reduced motion, keyboard, content-only labels) — fix dock/footer overlap if found (011 T043)
- [ ] T033 [US5] Manually execute quickstart scenarios 11, 12, 13 (009 regression, docs, build)
- [ ] T034 [US5] Check off `specs/011-vflip-now-playing/tasks.md` tasks T017, T021, T026, T033, T037, T040, T042, T043, T048 when all scenarios pass (FR-012, SC-005)

**Checkpoint**: US5 complete — `011` playback UX verified

---

## Phase 8: User Story 6 - Pure library behavior has regression tests (Priority: P3)

**Goal**: ≥10 new vitest cases for `theme-packs.ts` and `stage.ts`; CI green

**Independent Test**: `npm test` shows ≥67 total tests (57 baseline + 10 new) per SC-004

### Implementation for User Story 6

- [x] T035 [P] [US6] Create `src/lib/theme-packs.test.ts` with cases for `resolveThemePack` unknown id → default, incomplete id → default, and `applyThemeAttributes` / HUD glitch flag resolution (research R9)
- [x] T036 [P] [US6] Create `src/lib/stage.test.ts` with cases for `getUpcomingShows()` Berlin today cutoff (past omitted, today inclusive), sort order, and `berlinToday()` edge using fixture show entries
- [x] T037 [US6] Run `npm test` and confirm ≥10 new test cases and zero failures (SC-004)

**Checkpoint**: US6 complete — critical pure-lib fallbacks guarded

---

## Phase 9: User Story 7 - Dead code and stale sync paths removed (Priority: P3)

**Goal**: No orphaned lyrics UI, no stale `data-lyrics-for` sync, no unused catalog/release exports

**Independent Test**: `rg LyricsPanel src/` → no page imports; `rg data-lyrics-for src/lib/stage-switch.ts` → no matches; `rg getValidReleases src/` → no matches (quickstart scenarios 14–16)

### Implementation for User Story 7

- [x] T038 [US7] Delete `src/components/LyricsPanel.astro` and confirm no imports remain in `src/pages/` or `src/components/` (research R7, FR-010)
- [x] T039 [US7] Remove `[data-lyrics-for]` branch from `syncStageUi()` in `src/lib/stage-switch.ts` (FR-010)
- [x] T040 [US7] Remove `lyricsTitle` and `emptyLyrics` from ui schema in `src/content.config.ts`, `src/content/ui/chrome.md`, `UiChrome` / `getChrome()` in `src/lib/stage.ts`, and any component references (FR-010)
- [x] T041 [US7] Remove unused `getValidCatalogTracks()` export from `src/lib/catalog-tracks.ts` if still uncalled after US1; keep `parseCredits` / `parseListenLinks` and existing tests (research R8)
- [x] T042 [P] [US7] Run repository searches documented in quickstart scenarios 14–16 (`LyricsPanel`, `data-lyrics-for`, `getValidReleases`, `lyricsTitle`) and fix any stragglers

**Checkpoint**: US7 complete — dead paths removed

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Full validation and quality gates

- [x] T043 Run `npm run check && npm test && npm run build` from repository root; fix any regressions
- [ ] T044 Execute full `specs/013-codebase-hardening/quickstart.md` checklist (all 013 scenarios + 011 table complete)
- [x] T045 [P] Confirm no third-party scripts, cookies, or tracking added (FR-013)
- [x] T046 [P] Confirm scope excludes IDEA-009, IDEA-013, IDEA-015, IDEA-016, IDEA-017, IDEA-018 (FR-014) — no accidental file creep

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — blocks US1/US2 clarity
- **US1 (Phase 3)** and **US2 (Phase 4)**: Both P1; can run in parallel after Phase 2 (different files)
- **US3 (Phase 5)**: Independent of US1/US2 — parallel OK
- **US4 (Phase 6)**: Partially parallel (`T022`–`T026` [P]); `T027` content edit anytime
- **US5 (Phase 7)**: Depends on US1 + US2 (minimum); best after US3
- **US6 (Phase 8)**: Independent — parallel with US3/US4/US7 after Phase 2
- **US7 (Phase 9)**: `T039` touches `stage-switch.ts` — coordinate with US2 or run after US2
- **Polish (Phase 10)**: After all stories desired for release

### User Story Dependencies

| Story | Depends on | Notes |
|-------|------------|-------|
| US1 | Phase 2 | MVP track detail |
| US2 | Phase 2 | MVP stage hardening |
| US3 | Phase 2 | CSS-only |
| US4 | Phase 2 | Docs + releases removal |
| US5 | US1, US2 | Manual QA |
| US6 | Phase 2 | New test files only |
| US7 | US2 for `syncStageUi` edit | Delete lyrics after US2 lands or merge carefully |

### Parallel Opportunities

```bash
# After Phase 2 — P1 in parallel:
T006–T012 (US1 TrackInfoPanel + nightmare.md)
T013–T019 (US2 stage-switch + Jukebox.astro)

# P2/P3 parallel:
T020–T021 (US3 Hero)
T022, T024, T025, T026 (US4 docs — different files)
T035, T036 (US6 test files)
T038, T041 (US7 delete + audit) — after US2
```

---

## Parallel Example: User Story 1

```bash
# Parallel content + styles:
T010 — styles in src/components/TrackInfoPanel.astro
T011 — sample metadata in src/content/jukebox/nightmare.md

# Sequential core:
T006 → T007 → T008 → T009 → T012
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1–2
2. Complete US1 (track detail metadata)
3. Complete US2 (stage handoff hardening)
4. **STOP and VALIDATE**: quickstart scenarios 1–7
5. Ship to `pre-release` if operator approves

### Incremental Delivery

1. US1 + US2 → visitor-visible bug fixes (MVP)
2. US3 → mobile tagline readability
3. US4 → maintainer docs + build hygiene
4. US6 + US7 → developer quality
5. US5 → operator sign-off on `011` (requires manual/browser time)

### Suggested single-developer order

T001–T005 → T006–T012 → T013–T019 → T020–T021 → T022–T029 → T038–T042 → T035–T037 → T030–T034 → T043–T046

---

## Notes

- US5 tasks are **manual** — operator must run browser checks per workspace rules (no Playwright install)
- Location fix (T027) is content-only; ask owner which city is canonical before editing
- Do not restore `TrackCatalog.astro`, `NowPlayingControl`, or lyrics UI — out of scope per spec clarifications
- `[P]` tasks touch different files; `stage-switch.ts` is shared by US2 and US7 — avoid concurrent edits
