# Tasks: Landing Stage (Peripheral Content & Jukebox)

**Input**: Design documents from `/specs/004-landing-content-layout/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/stage-content.md, contracts/stage-ui.md, quickstart.md

**Tests**: Not requested. CI gates (`astro check`, `astro build`) plus manual walks in `quickstart.md` are the validation path.

**Organization**: Tasks are grouped by user story. Content collections and the HUD shell are foundational; stories fill chrome in priority order. US7 (P1, non-programmer editing) is scheduled after the content surfaces exist so its independent test is real.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: Which user story this task belongs to (US1–US7)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Content directories and collection schemas before any UI

- [ ] T001 Create Markdown collection directories `src/content/jukebox/`, `src/content/about/`, `src/content/releases/`, `src/content/shows/`, and `src/content/ui/`
- [ ] T002 Register collections `jukebox`, `about`, `releases`, `shows`, and `ui` in `src/content.config.ts` with optional-enough Zod schemas per `specs/004-landing-content-layout/data-model.md` so a missing logical field does not fail the whole build
- [ ] T003 [P] Add `src/content/ui/chrome.md` with frontmatter labels and empty states from `specs/004-landing-content-layout/contracts/stage-content.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Jukebox collection replaces `background.json`; HUD shell exists; invalid items can be omitted

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Add `src/content/jukebox/placeholder-loop.md` from the current `src/data/background.json` default (`nightmare-crimson`, existing MP4/poster, `default: true`) plus EXAMPLE placeholder lyrics in the body
- [ ] T005 [P] Add `src/content/jukebox/example-cyan.md` reusing the same MP4/poster with `themeId: cyan-pulse`, `default` unset, and EXAMPLE lyrics
- [ ] T006 [P] Add `src/content/about/me.md` with a clearly marked EXAMPLE short bio
- [ ] T007 [P] Add `src/content/releases/example-single.md` (`jukeboxId: placeholder-loop`) and `src/content/releases/example-ep.md` (unbound) per the content contract
- [ ] T008 Rewrite `src/lib/background.ts` to resolve jukebox entries from the `jukebox` collection (default flag, theme fallback, omit unusable entries); delete `src/data/background.json` and update any remaining imports
- [ ] T009 [P] Add `src/lib/stage.ts` to load chrome strings (fallbacks if missing), filter valid releases/shows (omit broken items, upcoming-only shows in Europe/Berlin), and expose helpers for About emptiness
- [ ] T010 Convert landing layout to a full-viewport stage HUD in `src/styles/global.css` (drop `main` `42rem` column; center empty; corner slots; no horizontal scroll from 320px)
- [ ] T011 Compose the stage shell in `src/pages/index.astro` and keep `src/layouts/Base.astro` `data-theme` on the default jukebox entry at load; footer/mute/legal overlay stay peripheral and uncovered

**Checkpoint**: `npm run check` / `npm run build` succeed; default atmosphere still plays from Markdown; HUD slots exist even if some chrome is still the old stacked components

---

## Phase 3: User Story 1 - Visitor sees a stage, not a document (Priority: P1) 🎯 MVP

**Goal**: Center is atmosphere-only; identity is compact top-left chrome; jukebox/socials/on-demand occupy edge slots and do not sit in the middle

**Independent Test**: Laptop + ~320px — name/hook visible without a centered title; middle is atmosphere; About/lyrics/lists not occupying the center; no horizontal scroll (quickstart.md scenario 1)

### Implementation for User Story 1

- [ ] T012 [US1] Refactor `src/components/Hero.astro` into persistent identity chrome (name + tagline from `src/data/site.json` only; no large centered hero block)
- [ ] T013 [P] [US1] Restyle `src/components/Channels.astro` as compact persistent socials chrome (top-right slot); keep `glitch-hit` only on existing active channel links; labels still from `site.json`
- [ ] T014 [US1] Add a compact default-only jukebox readout in `src/components/Jukebox.astro` (current record label from the default entry; no switcher yet) and mount it in the bottom-left slot from `src/pages/index.astro`
- [ ] T015 [US1] Add closed on-demand cluster `src/components/StagePanels.astro` (`<details>` for About, Lyrics, Discography, Tour) using titles from `src/content/ui/chrome.md`; bodies may be empty stubs; nothing expanded on load; mount bottom-right from `src/pages/index.astro`
- [ ] T016 [US1] Manually walk quickstart.md scenario 1 (free center, persistent chrome, 320px) and fix HUD spacing in `src/styles/global.css` / the new components so mute and legal footer stay reachable

**Checkpoint**: MVP — the page reads as a stage, not a stacked document

---

## Phase 4: User Story 2 - Visitor uses the jukebox to change song and world (Priority: P1)

**Goal**: Persistent jukebox lists entries; picking one updates atmosphere, theme, and mute visibility without reload; reload restores default; no storage

**Independent Test**: Two example entries — switch, mute survives, no full reload, reload back to default; reduced motion still updates theme/poster (quickstart.md scenario 2)

### Implementation for User Story 2

- [ ] T017 [US2] Expand `src/components/Jukebox.astro` into an accessible selector of all valid jukebox entries (labels from Markdown; current entry announced); do not add `glitch-hit`
- [ ] T018 [US2] Prerender all valid jukebox payloads (sources, poster, themeId, hasAudio, id) for the client and implement first-party switch logic (extend `src/components/BackgroundAtmosphere.astro` and/or a small script next to `src/components/Jukebox.astro`): swap video/poster, set `document.documentElement.dataset.theme`, dispatch existing `bg-state-change`; no `sessionStorage`/cookies
- [ ] T019 [US2] Update `src/components/MuteControl.astro` so mute visibility and unmute survival follow the **active** entry’s `hasAudio` and playing state after a switch (002 rules)
- [ ] T020 [US2] Manually walk quickstart.md scenario 2 (switch, mute, reload default, reduced motion) and fix regressions in `src/components/Jukebox.astro` / `src/components/BackgroundAtmosphere.astro` / `src/components/MuteControl.astro`

**Checkpoint**: Jukebox is the theme/song switcher for this visit only

---

## Phase 5: User Story 3 - Visitor reads About and reaches socials at the edge (Priority: P1)

**Goal**: About opens on demand from the cluster; empty About hides the control; socials stay persistent chrome

**Independent Test**: Open About, read EXAMPLE bio, center stays open; socials visible without a panel; empty About file hides the control (quickstart.md scenario 3)

### Implementation for User Story 3

- [ ] T021 [US3] Implement About body in `src/components/AboutPanel.astro` from `src/content/about/me.md` and render it inside the About `<details>` in `src/components/StagePanels.astro`
- [ ] T022 [US3] Hide the About control in `src/components/StagePanels.astro` when About body is empty/missing (`src/lib/stage.ts`); restore example bio after verifying hide
- [ ] T023 [US3] Add exclusive-open behavior in `src/components/StagePanels.astro` (opening one `<details>` closes the others; toggle summary to close); first-party listener only, no npm accordion; justified under plan Complexity Tracking (FR-004 when scripting is available). Without JS, disclosures must still work (exclusive-open not required)
- [ ] T024 [US3] Manually walk quickstart.md scenario 3 and confirm socials still open in a new tab from `src/components/Channels.astro`

**Checkpoint**: About + socials match persistent vs on-demand split

---

## Phase 6: User Story 4 - Visitor reads lyrics for the current jukebox song (Priority: P2)

**Goal**: Lyrics panel shows the active entry’s body; empty/instrumental uses chrome empty copy; switch updates lyrics; long text scrolls inside the panel

**Independent Test**: Open lyrics, switch jukebox, lyrics (or empty state) follow; panel scroll does not cover the center (quickstart.md scenario 4)

### Implementation for User Story 4

- [ ] T025 [US4] Implement `src/components/LyricsPanel.astro` with prerendered lyrics HTML per jukebox id and the `emptyLyrics` string from `src/content/ui/chrome.md`
- [ ] T026 [US4] Wire lyrics into the Lyrics `<details>` in `src/components/StagePanels.astro` and update the visible lyrics node on jukebox switch (same script path as T018)
- [ ] T027 [US4] Constrain lyrics overflow to the edge panel in `src/components/LyricsPanel.astro` / `src/styles/global.css` (internal scroll, center stays free)
- [ ] T028 [US4] Manually walk quickstart.md scenario 4

**Checkpoint**: Lyrics are always “this record”, never a mixed dump

---

## Phase 7: User Story 5 - Visitor browses the discography (Priority: P2)

**Goal**: Catalog list from release Markdown; row/link does not switch the stage; bound rows get a small stage button; empty catalog still shows the control

**Independent Test**: Example Single has stage button, Example EP does not; button switches jukebox; outbound link new tab; remove releases → empty-state copy, control remains (quickstart.md scenario 5)

### Implementation for User Story 5

- [ ] T029 [US5] Implement `src/components/Discography.astro` listing valid releases from `src/lib/stage.ts` (title, year, optional kind, optional `url` in a new tab)
- [ ] T030 [US5] Add the stage button (label from `src/content/ui/chrome.md`) only when `jukeboxId` matches a valid entry; click runs the same switch as the jukebox; if already active: visible, pressed/current, no-op; no `glitch-hit`
- [ ] T031 [US5] Render discography inside its `<details>` in `src/components/StagePanels.astro` and show `emptyReleases` when the list is empty (control still present)
- [ ] T032 [US5] Manually walk quickstart.md scenario 5 (including temporarily moving release files aside)

**Checkpoint**: Catalog ≠ jukebox; explicit button is the only catalog→stage path

---

## Phase 8: User Story 6 - Visitor checks tour dates (Priority: P2)

**Goal**: Upcoming shows only; empty state is the v1 default; past dates hidden; broken rows omitted

**Independent Test**: No shows → empty copy, control visible; add past show → hidden; add future show → listed; ticket new tab; show without city omitted and build still works (quickstart.md scenarios 6 and 8)

### Implementation for User Story 6

- [ ] T033 [US6] Implement `src/components/TourDates.astro` using upcoming-only shows from `src/lib/stage.ts` (date, city, venue, optional ticket new tab) and `emptyShows` from chrome
- [ ] T034 [US6] Wire tour into its `<details>` in `src/components/StagePanels.astro`; keep the control visible when the list is empty
- [ ] T035 [US6] Manually walk quickstart.md scenarios 6 and 8 (empty default, past vs future, omit missing `city` without failing the build)

**Checkpoint**: Tour never looks “missing”; v1 ships the empty state honestly

---

## Phase 9: User Story 7 - A non-programmer can change every visible text (Priority: P1)

**Goal**: Every visitor-facing string is in content files; README explains where; ids must not be renamed

**Independent Test**: Change chrome title, one lyric line, Example EP title, tagline in `site.json` only — all update without component edits (quickstart.md scenario 7)

### Implementation for User Story 7

- [ ] T036 [US7] Audit `src/components/` stage chrome (`Hero.astro`, `Jukebox.astro`, `StagePanels.astro`, `Discography.astro`, `TourDates.astro`, `LyricsPanel.astro`, `AboutPanel.astro`, `Channels.astro`) so region titles, empty states, and the stage-button label come only from `src/content/ui/chrome.md` or item Markdown/`site.json` — no leftover hard-coded visitor strings
- [ ] T037 [US7] Extend the “Editing content” section in `README.md` for jukebox/about/releases/shows/chrome, the omit-invalid-item rule, “do not rename ids”, and how to preview (`npm run dev`)
- [ ] T038 [US7] Manually walk quickstart.md scenario 7 as a content-only edit pass

**Checkpoint**: Friend-with-no-code path matches legal-page editing

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Contract compliance, a11y, CI, full quickstart

- [ ] T039 [P] Confirm new controls are **not** `glitch-hit` in `src/components/Jukebox.astro`, `src/components/StagePanels.astro`, and `src/components/Discography.astro` (`003` closed set)
- [ ] T040 [P] Keyboard pass: jukebox, panel summaries, stage button, socials, mute, legal — reachable and named; ~320px spot-check that panels do not cover mute/footer (`src/components/StagePanels.astro`, `src/styles/global.css`)
- [ ] T041 Run `npm run check` and `npm run build` from repo root; fix type/build issues from the stage work
- [ ] T042 Execute the full `specs/004-landing-content-layout/quickstart.md` list (scenarios 1–10), including legal overlay + privacy/weight; note follow-ups

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **US1 (Phase 3)**: Depends on Foundational — MVP HUD
- **US2 (Phase 4)**: Depends on US1 jukebox slot (`Jukebox.astro`)
- **US3 (Phase 5)**: Depends on US1 `StagePanels.astro`; exclusive-open used by later panels
- **US4 (Phase 6)**: Depends on US2 switch script + US3 panel shell
- **US5 (Phase 7)**: Depends on US2 switch helper (stage button) + panel shell
- **US6 (Phase 8)**: Depends on panel shell + `stage.ts` show filtering
- **US7 (Phase 9)**: Depends on US3–US6 surfaces existing so the edit audit is complete
- **Polish (Phase 10)**: Depends on desired stories complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — no switcher required
- **US2 (P1)**: After US1 jukebox readout exists
- **US3 (P1)**: After US1 panel cluster exists; socials already moved in US1
- **US4 (P2)**: After US2 (lyrics follow active id)
- **US5 (P2)**: After US2 (stage button reuses switch)
- **US6 (P2)**: After US1 panel cluster; can parallel US4/US5 if `stage.ts` shows helper is ready
- **US7 (P1)**: After content UIs exist; do not skip — it is a P1 acceptance story

### Parallel Opportunities

- T003 with T002 once directories exist
- T005, T006, T007 in parallel after T002
- T009 with T008 (different files)
- T012 and T013 in parallel (Hero vs Channels)
- T029–T030 vs T033 after `stage.ts` exists (discog vs tour components)
- T039 and T040 in polish before CI

---

## Parallel Example: Foundational content files

```bash
# After T002 schemas exist:
Task: "Add src/content/jukebox/example-cyan.md"
Task: "Add src/content/about/me.md"
Task: "Add src/content/releases/example-single.md and example-ep.md"
```

---

## Parallel Example: User Story 1 chrome

```bash
# After HUD slots exist (T010–T011):
Task: "Refactor src/components/Hero.astro identity chrome"
Task: "Restyle src/components/Channels.astro compact socials"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: quickstart scenario 1
5. Demo the empty-center stage

### Incremental Delivery

1. Setup + Foundational → collections + HUD shell
2. US1 → stage, not document (MVP)
3. US2 → jukebox switch
4. US3 → About + exclusive panels
5. US4 → lyrics follow the record
6. US5 → discography + stage button
7. US6 → tour empty state
8. US7 → README + string audit
9. Polish → glitch-set, a11y, full quickstart

### Parallel Team Strategy

With multiple developers:

1. Pair on Setup + Foundational
2. Dev A: US1 HUD chrome
3. Dev B: US2 jukebox switch (after T014 slot)
4. After US3 shell: Dev A lyrics (US4), Dev B discog (US5) + tour (US6)
5. Together: US7 audit + polish

---

## Notes

- [P] tasks = different files, no incomplete dependencies
- [Story] label maps task to US1–US7
- No automated test tasks — not requested in the spec
- Do not add `glitch-hit` to new controls
- Do not restore `background.json` after T008
- Commit after each task or logical group
- Stop at checkpoints to validate stories independently
