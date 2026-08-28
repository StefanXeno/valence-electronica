# Tasks: Discography-Only Tracks

**Input**: Design documents from `/specs/014-discography-only-tracks/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Vitest for merge/dedup/sort in `src/lib/catalog-tracks.test.ts` per plan.md. CI:
`astro check`, `astro build`, `npm test`. Manual validation in `quickstart.md`.

**Organization**: US1 and US2 are both P1 — foundational schema + merge lib blocks both; wire
Discography in foundational; US1 adds catalog-only content; US2 validates jukebox regression.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: User story label (US1–US3)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align implementer with contracts before code changes

- [X] T001 Review `specs/014-discography-only-tracks/contracts/tracks-content.md` and `specs/014-discography-only-tracks/contracts/discography-merge.md` against current `src/content.config.ts`, `src/lib/catalog-tracks.ts`, and `src/components/Discography.astro`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tracks collection schema, merge lib, unit tests, Discography wiring — blocks all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Add `tracks` content collection to `src/content.config.ts` — required `label`, `sortDate`; optional `kind`, `listenLinks`, `blurb`, `credits`, `mentions`; reuse existing `listenLink` and `credit` Zod objects; export in `collections`
- [X] T003 Refactor `src/lib/catalog-tracks.ts` — add internal `sortDate` on `DiscographyEntry`; extract jukebox row builder; implement pure `mergeDiscographyEntries(...)` per merge contract; sort via shared `dateKey` (not full `CatalogTrack` mapping unless needed)
- [X] T004 Implement `getMergedDiscography(validStageIds)` in `src/lib/catalog-tracks.ts` — load `jukebox` + `tracks` collections; skip track ids present in jukebox; sort by UTC `sortDate` desc then title asc; replace or alias `getDiscographyFromJukebox` export
- [X] T005 [P] Extend `src/lib/catalog-tracks.test.ts` — cover tracks-only row, jukebox-wins dedup on matching id, combined sort by date/title, `inDiscography: false` exclusion via jukebox row builder inputs
- [X] T006 Update `src/components/Discography.astro` — import and call `getMergedDiscography(validIds)` instead of `getDiscographyFromJukebox`

**Checkpoint**: `npm run check` passes; merge unit tests green; Discography still lists existing jukebox rows (no tracks files yet)

---

## Phase 3: User Story 1 - Catalog-only release in Discography (Priority: P1) 🎯 MVP

**Goal**: Artist adds a track file without jukebox; it appears in Discography only (no stage button, not in V-Flip)

**Independent Test**: quickstart.md Scenarios 1–2 — catalog-only row visible; absent from jukebox drawer; Listen On icons work when configured

### Implementation for User Story 1

- [X] T007 [P] [US1] Create `src/content/tracks/example-catalog-only.md` per `specs/014-discography-only-tracks/contracts/tracks-content.md` — EXAMPLE label, `sortDate` older than current jukebox entries, optional `kind` and one `listenLinks` row
- [X] T008 [US1] Run `npm run build` and confirm example track appears in Discography with year/kind and no stage button
- [X] T009 [US1] Confirm example track id is absent from V-Flip jukebox list and `data-stage-catalog` JSON in `src/components/Jukebox.astro` (quickstart Scenario 1)
- [X] T010 [US1] Confirm Discography **Listen On** row shows platform icon links when `listenLinks` configured; title stays plain text (quickstart Scenario 2)

**Checkpoint**: MVP — catalog-only songs publish to Discography without touching jukebox

---

## Phase 4: User Story 2 - Jukebox-backed discography unchanged (Priority: P1)

**Goal**: Existing jukebox discography merge, sort, dedup, and stage binding behave as before; post-ship UI adds Listen On icons and Currently playing badge

**Independent Test**: quickstart.md Scenarios 2b–2c, 3–8 — jukebox rows present with stage affordances; listen icons when configured; id collision dedupes; schedule unaffected

### Implementation for User Story 2

- [X] T011 [US2] Compare Discography row count and stage affordances against pre-feature baseline — all jukebox entries with `sortDate` (and not `inDiscography: false`) still present with Play on V-Flip / Currently playing as appropriate (quickstart Scenarios 2b–2c, 3)
- [X] T012 [US2] Add temporary `src/content/tracks/nightmare.md` with conflicting metadata; verify single jukebox-sourced row; remove temp file after test (quickstart Scenario 4)
- [X] T013 [US2] Verify full-date sort: entries sharing a year order by `sortDate` month/day when titles differ (quickstart Scenario 6)
- [X] T014 [P] [US2] Verify stage isolation — confirm `src/lib/background.ts`, `src/components/Jukebox.astro`, `src/components/TrackInfoPanel.astro`, and `src/lib/stage-schedule.ts` do not import or load `tracks` collection (quickstart Scenarios 8)
- [X] T015 [US2] Add vitest case or manual check that invalid track file (missing `sortDate`) is omitted with warning while build succeeds (quickstart Scenario 7)
- [X] T016 [US2] Verify `inDiscography: false` on a jukebox entry hides it from Discography; confirm same-id tracks file does not produce a row (quickstart Scenario 5)
- [X] T017 [US2] Verify combined Discography at **320px** viewport width — no horizontal scroll (quickstart Scenario 12, SC-004)

**Checkpoint**: No regression on jukebox discography; merge edge cases covered

---

## Phase 5: User Story 3 - Artist guide (Priority: P2)

**Goal**: Artist knows when to use jukebox vs `src/content/tracks/`

**Independent Test**: quickstart.md Scenario 11 + SC-003 self-check — guide documents tracks folder, decision tree, promotion path

### Implementation for User Story 3

- [X] T018 [US3] Update `docs/artist-guide.md` — split Discography section: jukebox for stage + discography; `src/content/tracks/` for catalog-only; shared field vocabulary; promotion steps (same id); same-id + `inDiscography: false` pitfall; deprecate poster-only jukebox workaround for new catalog-only releases
- [X] T019 [P] [US3] Add cross-link at bottom of `specs/010-track-catalog/contracts/track-catalog-content.md` pointing to `specs/014-discography-only-tracks/contracts/tracks-content.md`
- [X] T020 [US3] Self-check SC-003: confirm guide answers jukebox vs. tracks for stage single, back-catalog single, and stage-only WIP scenarios (quickstart Scenario 11 step 3)

**Checkpoint**: Artist-facing docs match shipped edit surfaces (constitution VII)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Full validation, CI, cleanup

- [X] T021 [P] Walk remaining `specs/014-discography-only-tracks/quickstart.md` scenarios not covered above; note any follow-ups in PR description
- [X] T022 Run `npm run check`, `npm run build`, and `npm test` — all green
- [X] T023 [P] Confirm no new client JS, HUD panels, or third-party embeds introduced (spec FR-015, SC-006)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **blocks all user stories**
- **US1 (Phase 3)**: Depends on Foundational — delivers MVP
- **US2 (Phase 4)**: Depends on Foundational — can run parallel with US1 after Phase 2
- **US3 (Phase 5)**: Depends on US1/US2 content paths being final (guide references both surfaces)
- **Polish (Phase 6)**: Depends on US1–US3 complete

### User Story Dependencies

- **US1 (P1)**: Requires merge lib + Discography wiring (Phase 2); no dependency on US2/US3
- **US2 (P1)**: Requires Phase 2; validates jukebox path — independent of US1 example file but benefits from T007 for combined-list tests
- **US3 (P2)**: Documentation only; best after US1 example ships so guide matches live paths

### Parallel Opportunities

- **Phase 2**: T005 (tests) parallel with T003–T004 once merge function signature is agreed
- **Phase 3**: T007 (example content) parallel with any US2 prep after Phase 2
- **Phase 4**: T014 (stage isolation grep) parallel with T011–T013
- **Phase 5**: T017 (010 cross-link) parallel with T016 (artist guide)
- **Phase 6**: T018 and T020 parallel

### Parallel Example: After Phase 2

```bash
# Developer A — US1 content + smoke test
T007 → T008 → T009 → T010

# Developer B — US2 regression
T011 → T012 → T013 → T014 → T015
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T006) — **CRITICAL**
3. Complete Phase 3: User Story 1 (T007–T010)
4. **STOP and VALIDATE**: quickstart Scenarios 1–2
5. Demo catalog-only release in Discography

### Incremental Delivery

1. Setup + Foundational → merge lib ready
2. US1 → catalog-only tracks in Discography (MVP)
3. US2 → regression confidence on jukebox rows
4. US3 → artist guide updated
5. Polish → full quickstart + CI

### Suggested MVP Scope

**Phases 1–3 only** (T001–T010): ships catalog-only discography entries without jukebox side effects.

---

## Notes

- Do **not** reintroduce `TrackCatalog.astro` or Tracks HUD panel (`010` US2 superseded)
- `getDiscographyFromJukebox` may remain as private helper or thin alias — avoid duplicate merge logic
- Remove temporary test files (`tracks/nightmare.md`, `tracks/broken.md`) before merge unless kept as documented examples
- Post-ship UI (2026-08-28): card rows, wider panel, Listen On icons for all rows with links, Currently playing badge — documented in [contracts/discography-ui.md](./contracts/discography-ui.md)
- Task count: **23 tasks** — Setup: 1, Foundational: 5, US1: 4, US2: 7, US3: 3, Polish: 3
