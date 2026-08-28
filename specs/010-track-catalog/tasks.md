# Tasks: Track Catalog & Song Identity

**Input**: Design documents from `/specs/010-track-catalog/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Vitest for `catalog-tracks.ts` per plan.md (sort + validation helpers). CI:
`astro check`, `astro build`, `npm test`. Manual validation in `quickstart.md`.

**Organization**: US1 and US2 are both P1 — foundational schema/lib blocks both; US1
(content population) before US2 (catalog panel). US3 now-playing; US4 credits in popover.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: User story label (US1–US4)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align implementer with contracts before code changes

- [X] T001 Review `specs/010-track-catalog/contracts/track-catalog-content.md` and `specs/010-track-catalog/contracts/track-catalog-ui.md` against current `src/components/StagePanels.astro` and `src/content/jukebox/` layout

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema, catalog lib, chrome model, HUD icon tokens — blocks all user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Extend jukebox Zod schema in `src/content.config.ts` with `sortDate`, optional `blurb`, `listenLinks`, `credits`, `mentions` per `specs/010-track-catalog/data-model.md`
- [X] T003 [P] Extend `ui` collection schema in `src/content.config.ts` with `catalogTitle`, `catalogIcon`, `nowPlayingLabel`, `nowPlayingIcon`, `emptyCatalog`
- [X] T004 Create `src/lib/catalog-tracks.ts` — types, platform/url validation, `getValidCatalogTracks()` wired to `getCollection('jukebox')`, sort + warn-and-omit rules
- [X] T005 [P] Add `src/lib/catalog-tracks.test.ts` — sort order, tie-break by title, invalid link/credit omission
- [X] T006 Extend `HudIconToken` and `resolveHudIcon` defaults in `src/lib/hud-icons.ts` with `catalog` and `info` tokens
- [X] T007 [P] Add SVG paths for `catalog` and `info` tokens in `src/components/HudIcon.astro`
- [X] T008 Extend `UiChrome` interface and `getChrome()` in `src/lib/stage.ts` for catalog + now-playing chrome fields with fallbacks
- [X] T009 [P] Add `catalogTitle`, `catalogIcon`, `nowPlayingLabel`, `nowPlayingIcon`, `emptyCatalog` to `src/content/ui/chrome.md`

**Checkpoint**: `npm run check` passes; `getValidCatalogTracks()` returns empty until jukebox files have `sortDate`

---

## Phase 3: User Story 1 - Maintainer defines catalog in content (Priority: P1) 🎯 MVP (data)

**Goal**: Every stage track has catalog metadata in jukebox frontmatter; build validates and sorts

**Independent Test**: Add `sortDate` to all four jukebox files; `npm run build` succeeds; helper returns four rows with ids matching filenames

### Implementation for User Story 1

- [X] T010 [P] [US1] Add `sortDate` and placeholder catalog fields to `src/content/jukebox/nightmare.md`
- [X] T011 [P] [US1] Add `sortDate` and placeholder catalog fields to `src/content/jukebox/taking-over.md`
- [X] T012 [P] [US1] Add `sortDate` and placeholder catalog fields to `src/content/jukebox/show-me-how.md`
- [X] T013 [P] [US1] Add `sortDate` and placeholder catalog fields to `src/content/jukebox/example-cyan.md`
- [X] T014 [US1] Verify `getValidCatalogTracks()` maps `label` → title and omits entries missing `sortDate` with console warn (covered by T004 + T005 tests)
- [X] T015 [US1] Verify build warns when one jukebox file lacks `sortDate` but stage entry still builds; edit `blurb` on one file and confirm rebuild updates catalog row (quickstart Scenario 2)

**Checkpoint**: Catalog data layer complete — four valid tracks with stable ids

---

## Phase 4: User Story 2 - Visitor browses chronological catalog (Priority: P1)

**Goal**: Tracks panel in dock lists all catalog entries newest-first

**Independent Test**: quickstart.md Scenario 1 — open Tracks icon, four rows, correct order, exclusive open

### Implementation for User Story 2

- [X] T016 [US2] Create `src/components/TrackCatalog.astro` — scrollable list from `getValidCatalogTracks()`; title + year; optional blurb ellipsis; `emptyCatalog` state
- [X] T017 [US2] Register catalog panel in `src/components/StagePanels.astro` — `catalogTitle`/`catalogIcon`, horizontal row order (About, Lyrics, Tracks, Discography, Tour); `glitch-hit` + panel-motion parity with siblings
- [X] T018 [US2] Manually walk quickstart.md Scenario 1; fix panel width/scroll until exclusive-open and chronological order pass (Scenario 2 content edit validated in T015)

**Checkpoint**: MVP UI — visitor can browse full track catalog from dock

---

## Phase 5: User Story 3 - Now playing + listen links (Priority: P2)

**Goal**: Info control beside jukebox shows active track + outbound platform links

**Independent Test**: quickstart.md Scenario 3 — select track, open info, link opens new tab; updates on switch

### Implementation for User Story 3

- [X] T019 [US3] Create `src/components/NowPlayingControl.astro` — `glitch-hit` + `data-hud-label`/`data-hud-label-anchor="above"` on trigger; icon trigger, popover shell, SSR catalog JSON via `data-track-catalog` on `src/pages/index.astro`
- [X] T020 [US3] Create `src/lib/now-playing.ts` — popover open/close, Escape/outside click, focus trap while open with focus return to trigger, sync on `bg-state-change` and jukebox option clicks
- [X] T021 [US3] Add `nowPlaying` slot to `src/components/StageDock.astro` left cluster (order: jukebox → nowPlaying → mute) and mount `NowPlayingControl` from `src/pages/index.astro`
- [X] T022 [US3] Add listen link rows in popover — platform labels, `target="_blank"` + `rel="noopener noreferrer"`; hide when no URLs
- [X] T023 [P] [US3] Add sample `listenLinks` on `src/content/jukebox/taking-over.md` for manual Scenario 3
- [X] T024 [US3] Manually walk quickstart.md Scenario 3 and regression jukebox/theme/mute/lyrics (FR-010)

**Checkpoint**: Active track discoverable with outbound links in ≤2 interactions

---

## Phase 6: User Story 4 - Credits and honorable mentions (Priority: P3)

**Goal**: Optional credits list and mentions in now-playing popover

**Independent Test**: quickstart.md Scenario 4 — credits on one track only; omitted sections elsewhere

### Implementation for User Story 4

- [X] T025 [US4] Render optional `credits` list and `mentions` prose in `src/components/NowPlayingControl.astro` popover (omit empty sections)
- [X] T026 [P] [US4] Add sample `credits` and `mentions` to one jukebox file (e.g. `src/content/jukebox/nightmare.md`) for quickstart Scenario 4
- [X] T027 [US4] Manually walk quickstart.md Scenario 4; confirm long credits scroll inside popover without layout break at 320px width

**Checkpoint**: Full IDEA-006 context in popover without empty chrome

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Docs, contracts cross-link, full validation

- [X] T028 [P] Update `docs/artist-guide.md` — new jukebox catalog fields and chrome keys per `specs/010-track-catalog/contracts/track-catalog-content.md`
- [X] T029 [P] Amend `specs/004-landing-content-layout/contracts/stage-content.md` jukebox section with catalog field summary (or pointer to `010` content contract)
- [X] T030 [P] Add cross-reference row to `specs/009-desktop-stage-ui/contracts/desktop-hud-ui.md` for Tracks + now-playing controls (pointer to `010/contracts/track-catalog-ui.md`)
- [X] T031 Run `npm run check`, `npm run build`, and `npm test`
- [X] T032 Walk full `specs/010-track-catalog/quickstart.md` (Scenarios 1–8); explicitly confirm discography panel unchanged (FR-011); note follow-ups in plan or PR if any

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — **blocks all user stories**
- **US1 (Phase 3)**: Depends on Foundational
- **US2 (Phase 4)**: Depends on US1 (needs populated `sortDate` for meaningful list)
- **US3 (Phase 5)**: Depends on Foundational + US1 (catalog JSON); panel optional for US3
- **US4 (Phase 6)**: Depends on US3 (popover exists)
- **Polish (Phase 7)**: Depends on US2–US4 for full quickstart

### User Story Dependencies

| Story | Depends on | Independent test |
|-------|------------|------------------|
| US1 | Foundational | Build + helper returns four tracks |
| US2 | US1 | Tracks panel list |
| US3 | US1 | Now-playing popover + links |
| US4 | US3 | Credits in popover |

### Parallel Opportunities

- **Phase 2**: T003, T005, T007, T009 in parallel after T002
- **Phase 3**: T010–T013 all parallel
- **Phase 5**: T023 parallel with T019–T022 if different authors
- **Phase 6**: T026 parallel with T025
- **Phase 7**: T028, T029, T030 in parallel

### Parallel Example: User Story 1

```bash
# Populate all four jukebox files concurrently:
T010 nightmare.md | T011 taking-over.md | T012 show-me-how.md | T013 example-cyan.md
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Phase 1–2: Foundational
2. Phase 3: US1 content + helper
3. Phase 4: US2 Tracks panel
4. **STOP and VALIDATE** quickstart Scenario 1; Scenario 2 covered at US1 checkpoint (T015)

### Incremental Delivery

1. US1 + US2 → browse catalog (MVP)
2. US3 → now-playing + listen links
3. US4 → credits/mentions
4. Polish → artist guide + full quickstart

---

## Notes

- Jukebox filename slugs remain stable ids — do not rename
- Discography component unchanged except regression check in T024/T032
- No new npm dependencies
- Commit after each phase checkpoint when working on branch `010-track-catalog`
