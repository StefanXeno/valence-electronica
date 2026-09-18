# Tasks: Stage Artist Polish

**Input**: Design documents from `/specs/022-stage-artist-polish/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: None requested in spec. CI: `astro check`, `astro build`. Manual
[quickstart.md](./quickstart.md). Prefer `020` + `021` before US6 tap QA.

**Organization**: User stories US1–US6 from spec.md. No new npm packages.
Operator supplies dual video assets + approved NCS artwork + Show me How
music bed (content ops).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Parallelizable
- **[Story]**: US1–US6 from spec.md

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 Review `specs/022-stage-artist-polish/contracts/stage-artist-polish.md` and `research.md` against `src/content.config.ts`, `src/lib/background.ts`, `src/lib/stage-switch.ts`, `src/content/jukebox/*.md`, `src/styles/themes.css`, `src/components/HudIcon.astro`, `src/lib/player-dock.ts`, and sibling `020`/`021` boundaries

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: Dual-video schema + loaders before story content wiring

- [ ] T002 Extend `jukebox` schema in `src/content.config.ts` with `sourcesMobile`, `sourcesDesktop`, and optional `centerLogo` per `data-model.md`; plan migration off legacy single `sources`
- [ ] T003 Update `BackgroundVideo` / `toVideo()` in `src/lib/background.ts` to carry viewport-specific sources (no silent cross-viewport fill-in)
- [ ] T004 Update catalog serialization and `loadVideoSources()` path in `src/lib/stage-switch.ts` (+ `BackgroundAtmosphere.astro` if needed) to resolve sources via `matchMedia('(max-width: 1023px)')` and re-resolve on resize
- [ ] T005 [P] Add or extend a maintainer completeness check (existing `scripts/` or build-time validation) that fails loud when a selectable stage bed lacks mobile or desktop sources — without new npm packages
- [ ] T006 [P] Document dual-video + centerLogo + Show me How audio expectations in `docs/artist-guide.md` (constitution VII) — can finalize copy after content fields land

**Checkpoint**: `npm run check` passes with migrated schema direction; viewport resolver stubbed

---

## Phase 3: User Story 1 - Show me How actually plays music (Priority: P1) 🎯 MVP slice

**Goal**: Show me How is audio-eligible with audible music after unmute

**Independent Test**: quickstart Scenario 1

### Implementation for User Story 1

- [ ] T007 [US1] Update `src/content/jukebox/show-me-how.md` to `hasAudio: true` once music-bearing bed exists under `public/videos/` (operator asset)
- [ ] T008 [US1] Verify eligibility pipeline in `src/lib/background.ts` / theme pack gates treats Show me How as audio-eligible (not dwell-only)
- [ ] T009 [US1] Manually walk `specs/022-stage-artist-polish/quickstart.md` Scenario 1

**Checkpoint**: Show me How produces audible music after unmute

---

## Phase 4: User Story 2 - Taking Over feels brighter (Priority: P1)

**Goal**: Taking Over theme/UI reads clearly brighter; no in-app cut tooling

**Independent Test**: quickstart Scenario 2

### Implementation for User Story 2

- [ ] T010 [US2] Brighten Taking Over presentation tokens in `src/styles/themes.css` (acid-lime and/or dedicated pack) while preserving control/text contrast
- [ ] T011 [P] [US2] Confirm `src/content/jukebox/taking-over.md` themeId still points at the brightened treatment; do **not** add cut/trim UI
- [ ] T012 [US2] Manually walk `specs/022-stage-artist-polish/quickstart.md` Scenario 2

**Checkpoint**: Reviewers can call Taking Over “brighter”

---

## Phase 5: User Story 3 - Dual stage videos for every V-Flip track (Priority: P1)

**Goal**: Every selectable stage bed has distinct mobile + desktop videos; viewports pick correctly

**Independent Test**: quickstart Scenario 3 / SC-007

### Implementation for User Story 3

- [ ] T013 [US3] Migrate all V-Flip-available jukebox entries under `src/content/jukebox/` to `sourcesMobile` + `sourcesDesktop` with real distinct assets in `public/videos/` (operator supplies files)
- [ ] T014 [US3] Ensure Taking Over has dual bindings like every other bed in `src/content/jukebox/taking-over.md`
- [ ] T015 [US3] Wire runtime so phone loads mobile sources and laptop loads desktop sources in `src/lib/stage-switch.ts` (verify via distinct paths)
- [ ] T016 [US3] Enforce incomplete-bed policy (omit selectable and/or fail check from T005) — never silent reuse
- [ ] T017 [US3] Manually walk `specs/022-stage-artist-polish/quickstart.md` Scenario 3 for all beds

**Checkpoint**: Dual-video QA passes for 100% of V-Flip beds

---

## Phase 6: User Story 4 - NCS mark can own the center when relevant (Priority: P2)

**Goal**: Content-configured center-stage NCS logo; absent otherwise; chrome usable

**Independent Test**: quickstart Scenario 4

### Implementation for User Story 4

- [ ] T018 [P] [US4] Add owner-approved NCS (or placeholder-with-approval) asset under `public/images/` 
- [ ] T019 [US4] Create `src/components/CenterStageLogo.astro` and mount it from the stage composition (`src/pages/index.astro` or atmosphere/stage shell) so it centers without covering primary controls
- [ ] T020 [US4] Bind visibility to active entry `centerLogo` via SSR defaults + `src/lib/stage-switch.ts` sync on track change
- [ ] T021 [US4] Set `centerLogo` on NCS-associated jukebox entry(ies) in `src/content/jukebox/`; leave others unset
- [ ] T022 [US4] Manually walk `specs/022-stage-artist-polish/quickstart.md` Scenario 4

**Checkpoint**: Center logo only when configured; chrome still clickable

---

## Phase 7: User Story 5 - Stage drops Minecraft sprites; shuffle looks new (Priority: P2)

**Goal**: Zero Minecraft sprites; shuffle glyph recognizably new; toggle semantics kept

**Independent Test**: quickstart Scenario 5

### Implementation for User Story 5

- [ ] T023 [US5] Audit stage for Minecraft-style sprites; remove any visitor-facing sprite dressing if found (recon expects none) — do not reintroduce in `src/styles/` / components
- [ ] T024 [US5] Implement a new shuffle visual in `src/components/HudIcon.astro` and/or `src/lib/hud-icons.ts` + `src/content/ui/chrome.md` `shuffleIcon` (silhouette/metaphor change, not recolor-only)
- [ ] T025 [US5] Confirm shuffle toggle pressed/unpressed still works in `src/components/Jukebox.astro` / playback wiring
- [ ] T026 [US5] Manually walk `specs/022-stage-artist-polish/quickstart.md` Scenario 5

**Checkpoint**: Sprites absent; shuffle looks new

---

## Phase 8: User Story 6 - Mobile bottom player prefers tap (Priority: P1)

**Goal**: Phone open → select track completable by tap alone; swipe not required

**Independent Test**: quickstart Scenario 6 (prefer after `021` selection-first)

### Implementation for User Story 6

- [ ] T027 [US6] Verify and fix phone open/select flows in `src/lib/player-dock.ts` + `src/lib/player-handle-tap.ts` so tap alone reaches useful selection state and track change (align with `021` defaults)
- [ ] T028 [US6] Ensure any instructional/motion hints do not imply swipe-only in `src/components/Jukebox.astro` / chrome copy
- [ ] T029 [US6] Keep swipe as optional sugar only; do not remove unless it blocks tap
- [ ] T030 [US6] Manually walk `specs/022-stage-artist-polish/quickstart.md` Scenario 6

**Checkpoint**: Tap-only phone flow passes SC-004

---

## Phase 9: Polish & Cross-Cutting Concerns

- [ ] T031 [P] Finalize `docs/artist-guide.md` dual-video / logo / audio / “theme CSS is developer-owned” notes
- [ ] T032 [P] Add callouts in `specs/015-mobile-stage-hud/` (tap supersession) and note dual-video extension vs `002`/`005` in contract cross-links if helpful
- [ ] T033 Confirm FR-008: no circular docks (`020`) and no currently-playing-as-default regression (`021`) during polish
- [ ] T034 Run `npm run check` and `npm run build`; reduced-motion still shows logo/brightness/correct viewport video (poster fallback OK)
- [ ] T035 ⚠️ Confirm owner approval recorded for NCS artwork usage before merge to `main`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup → Foundational (schema/loaders) → content stories
- **US1** can proceed once Show me How asset ready (after T002–T003 ideally)
- **US3** requires Foundational T002–T005
- **US6** best after `021` selection-first
- **US2 / US4 / US5** parallelizable after Foundational (different files)

### User Story Dependencies

- **US1 (P1)**: Content asset + hasAudio — MVP trust fix
- **US2 (P1)**: Theme CSS — independent of dual-video files
- **US3 (P1)**: Foundational schema — largest content dependency
- **US4 (P2)**: Needs centerLogo field from Foundational
- **US5 (P2)**: Independent visually
- **US6 (P1)**: Depends on player surface from `021`

### Parallel Opportunities

- T010–T012 (brightness) ∥ T023–T026 (sprites/shuffle) after Foundational
- T018 asset prep ∥ T019 component scaffold
- US1 content ops ∥ US3 asset pipeline once schema lands

## Parallel Example: After Foundational

```bash
Task: "Brighten Taking Over tokens in themes.css"
Task: "New shuffle glyph in HudIcon.astro"
Task: "Migrate jukebox entries to sourcesMobile/Desktop (when assets ready)"
```

## Implementation Strategy

### MVP trust slice

1. Foundational schema direction
2. US1 Show me How audio (fastest fan-trust win)
3. US3 dual videos when assets ready
4. US2 brightness, US5 shuffle/sprites, US4 NCS, US6 tap

### Incremental vs siblings

1. `020` chrome
2. `021` selection + vinyl
3. **022** (this) media + stage polish — dual video may touch models `021` already kept opaque

## Notes

- No in-product Taking Over cut/trim UI
- No new npm packages; no browser automation installs without approval
- ⚠️ NCS logo = owner-approved asset only
- Operator must supply distinct mobile/desktop video files per track
