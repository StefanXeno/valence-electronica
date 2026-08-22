# Tasks: Theme Pack System

**Input**: Design documents from `/specs/005-theme-packs/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/theme-packs.md, quickstart.md

**Tests**: Not requested. CI gates (`astro check`, `astro build`) plus manual walks in `quickstart.md` are the validation path.

**Organization**: Tasks grouped by user story. The theme pack registry is foundational; US1 wires runtime behavior; US2 documents and audits maintainability; US3 confirms reduced-motion paths.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: Which user story this task belongs to (US1–US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm feature context before code changes

- [x] T001 Verify branch `005-theme-packs` and read `specs/005-theme-packs/contracts/theme-packs.md` plus `specs/005-theme-packs/data-model.md` for registry shape and shipped pack matrix
- [x] T002 [P] Baseline audit: run `rg "nightmare-crimson|GLITCH_THEME_ID|VIDEO_THEME_ID|KNOWN_THEME_IDS" src` and note hit files for migration (expect `background.ts`, `stage-switch.ts`, `glitch.ts`, `BackgroundAtmosphere.astro`, `themes.css`, `glitch.css`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Single theme pack registry; background module delegates to it

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Create `src/lib/theme-packs.ts` with typed `THEME_PACKS` map for `default`, `nightmare-crimson`, and `cyan-pulse` per `specs/005-theme-packs/data-model.md` (capabilities: `loopingVideo`, `audioEligible`, `hudGlitch`)
- [x] T004 Implement `src/lib/theme-packs.ts` exports: `THEME_PACKS`, `PACK_CSS_THEME_IDS`
  (ids with CSS blocks in `themes.css`, kept in sync via comment), `isPackComplete(id)`,
  `resolveThemePack(raw)` (Option A — unknown or incomplete → warn + full `default` pack),
  `getThemePack(id)`, `packSupportsLoopingVideo(pack, hasSources)`,
  `packAllowsMute(pack, entryHasAudio, videoPlaying)`, `packAllowsHudGlitch(pack)`, and
  `applyThemeAttributes(pack)` returning `{ themeId, hudGlitch }` for `<html>`
- [x] T005 Refactor `src/lib/background.ts` to use `resolveThemePack()` for each jukebox
  entry’s `themeId`; store resolved pack id on `BackgroundVideo`; remove local
  `KNOWN_THEME_IDS` / `KnownThemeId`; re-export `resolveThemePack` (or thin `resolveThemeId`
  wrapper returning `.id`) for `src/layouts/Base.astro`
- [x] T006 [P] Refresh maintainer comments in `src/styles/themes.css` (preserve all existing token **values** for `default`, `nightmare-crimson`, `cyan-pulse`; document that new packs add a `[data-theme='…']` block here)

**Checkpoint**: `npm run check` passes; registry exists; `background.ts` resolves themes through `theme-packs.ts`

---

## Phase 3: User Story 1 - Visitor feels a coherent mood per jukebox theme (Priority: P1) 🎯 MVP

**Goal**: Switching jukebox entries applies one pack atomically — colors, atmosphere mode, mute eligibility, and glitch gate — with Nightmare parity

**Independent Test**: Switch Nightmare ↔ Example Cyan; each pack’s full presentation applies;
Nightmare glitches on HUD; Cyan stays still; Nightmare parity vs `pre-release` (quickstart
scenarios 1–2 and 6)

### Implementation for User Story 1

- [x] T007 [US1] Update `src/layouts/Base.astro` to set `data-theme` and `data-hud-glitch`
  from `applyThemeAttributes(resolveThemePack(defaultVideo.themeId))` on SSR first paint
- [x] T008 [US1] Update `src/components/BackgroundAtmosphere.astro` to use
  `resolveThemePack` + `packSupportsLoopingVideo` + `packAllowsMute` instead of
  `video.themeId === 'nightmare-crimson'` for initial `useVideo`, `data-has-audio`, and
  `data-bg-state`
- [x] T009 [US1] Update `src/lib/stage-switch.ts` to call `resolveThemePack(entry.themeId)`
  in `applyStageEntry`; set `document.documentElement` theme attributes from
  `applyThemeAttributes(resolved)`; use pack helpers for video/audio (no `VIDEO_THEME_ID`)
- [x] T010 [US1] Update `src/lib/glitch.ts`: remove `GLITCH_THEME_ID`; implement `isGlitchThemeActive()` via `data-hud-glitch === 'true'` (or pack helper); keep `playElementGlitch` no-op when inactive
- [x] T011 [P] [US1] Update `src/styles/glitch.css` to replace all `html:not([data-theme='nightmare-crimson'])` guards with `html:not([data-hud-glitch='true'])`
- [x] T012 [US1] Update `src/components/GlitchPress.astro` MutationObserver `attributeFilter` to include `data-hud-glitch` (in addition to `data-theme`) so glitch classes clear when switching to a non-glitch pack
- [x] T013 [US1] Manually walk `specs/005-theme-packs/quickstart.md` scenarios 1–2 and 6
  (coherent switch, Nightmare glitch, SC-003 parity); fix regressions in
  `src/lib/stage-switch.ts`, `src/components/BackgroundAtmosphere.astro`, or
  `src/lib/glitch.ts`

**Checkpoint**: MVP — jukebox switch applies coherent packs; Nightmare behavior matches `pre-release`

---

## Phase 4: User Story 2 - Maintainer adds or changes a theme through one pack contract (Priority: P1)

**Goal**: Documented checklist; unknown `themeId` warns and falls back; zero scattered capability string checks outside the registry

**Independent Test**: Follow contract checklist to describe a fourth pack; `rg` audit clean; deliberate unknown `themeId` warns at build (quickstart.md scenarios 3–4, SC-006)

### Implementation for User Story 2

- [x] T014 [US2] Add **Theme packs** section to `README.md` with short maintainer steps and link to `specs/005-theme-packs/contracts/theme-packs.md` (define registry → CSS tokens → jukebox `themeId` → validate)
- [x] T015 [US2] Verify unknown and incomplete `themeId` paths in `src/lib/theme-packs.ts`:
  unknown → `[theme] unknown themeId "…"; using default`; registry without CSS →
  `[theme] pack "…" incomplete (missing CSS); using default`; both yield full `default`
  pack (test with local typo and optional registry-only row, then revert)
- [x] T016 [US2] Run SC-006 audit: `rg "nightmare-crimson" src --glob '!**/theme-packs.ts' --glob '!**/themes.css'` — remove any remaining capability logic hits; only comments/CSS selectors may reference pack ids outside `theme-packs.ts`
- [x] T017 [P] [US2] Add superseded-by note in `specs/002-themed-background-video/contracts/background-content.md` theme section pointing to `specs/005-theme-packs/contracts/theme-packs.md` for capabilities
- [x] T018 [P] [US2] Add cross-link in `specs/004-landing-content-layout/contracts/stage-content.md` `themeId` rules: new ids require registry entry in `src/lib/theme-packs.ts` plus CSS block (not component edits)

**Checkpoint**: Maintainer can add a pack using contract only; audit passes

---

## Phase 5: User Story 3 - Reduced motion and accessibility hold for every pack (Priority: P2)

**Goal**: Pack-defined motion suppressed under `prefers-reduced-motion`; poster fallback and readable text for all shipped packs

**Independent Test**: Enable reduced motion; switch all entries; zero glitch; poster +
theme colors apply (quickstart.md scenarios 5 and 7)

### Implementation for User Story 3

- [x] T019 [US3] Verify `src/lib/stage-switch.ts` forces poster fallback when `prefers-reduced-motion` or pack `loopingVideo: false` (no `<source>` nodes attached); align with `src/components/BackgroundAtmosphere.astro` init script behavior
- [x] T020 [US3] Verify `src/lib/glitch.ts` and `src/components/GlitchPress.astro` no-op under reduced motion and when `data-hud-glitch="false"`; clear in-flight glitch classes on theme switch
- [x] T021 [US3] Spot-check contrast for `default`, `nightmare-crimson`, and `cyan-pulse` tokens in `src/styles/themes.css` over their posters (adjust tokens only if readability regressed during refactor)
- [x] T022 [US3] Manually walk `specs/005-theme-packs/quickstart.md` scenarios 5 and 7
  (reduced motion, readability)

**Checkpoint**: All shipped packs pass accessibility bar from spec US3

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: CI gates and full validation

- [x] T023 Run `npm run check && npm run build` from repository root and fix any type or content errors
- [x] T024 Run full `specs/005-theme-packs/quickstart.md` validation checklist (including HTML attribute table for `data-theme` / `data-hud-glitch`)
- [x] T025 [P] Confirm `docs/ideas.md` IDEA-002 promotion link still points to `specs/005-theme-packs/` (update if missing)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **blocks all user stories**
- **US1 (Phase 3)**: Depends on Foundational — **MVP**
- **US2 (Phase 4)**: Depends on US1 (audit meaningful only after migration)
- **US3 (Phase 5)**: Depends on US1 (motion paths wired through registry)
- **Polish (Phase 6)**: Depends on US1–US3

### User Story Dependencies

- **US1 (P1)**: Foundational only — delivers visitor-facing pack switching
- **US2 (P1)**: US1 complete — docs/audit validate the migrated structure
- **US3 (P2)**: US1 complete — reduced-motion verification on wired paths

### Within Each User Story

- Registry (`theme-packs.ts`) and `resolveThemePack()` before consumers (`stage-switch.ts`,
  `BackgroundAtmosphere.astro`, `Base.astro`)
- JS capability gate before CSS selector migration (`glitch.ts` before or with `glitch.css`)
- Manual quickstart walk last in each story phase

### Parallel Opportunities

- **Phase 1**: T002 parallel with T001
- **Phase 2**: T006 parallel with T003–T005 after T003 starts (different files)
- **Phase 3**: T011 parallel with T007–T010 once `data-hud-glitch` contract is defined in T004/T009
- **Phase 4**: T017 and T018 parallel
- **Phase 6**: T025 parallel with T023–T024

---

## Parallel Example: User Story 1

```bash
# After T009 sets data-hud-glitch on switch:
Task T011: Update src/styles/glitch.css attribute guards
Task T012: Update src/components/GlitchPress.astro observer filters
# Both can proceed once T010 defines isGlitchThemeActive() behavior
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (registry + background refactor)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: quickstart scenarios 1–2 and 6 (Nightmare parity)
5. Ship/demo if ready

### Incremental Delivery

1. Setup + Foundational → registry ready
2. US1 → coherent pack switching (MVP)
3. US2 → maintainer docs + SC-006 audit
4. US3 → reduced-motion verification
5. Polish → full quickstart + CI

### Parallel Team Strategy

1. One developer: Phases 1 → 2 → 3 sequentially (single critical path)
2. After US1 lands:
   - Developer A: US2 (README + contract cross-links + audit)
   - Developer B: US3 (reduced-motion walks + token spot-check)

---

## Notes

- Do **not** change color token **values** during migration unless SC-005 spot-check fails
- Do **not** enable `hudGlitch` on non-Nightmare packs in v1 (FR-008)
- No new npm packages; no new client JS bundles — refactor existing modules only
- Incomplete or unknown `themeId` always resolves to full **`default`** pack (Option A —
  no split capabilities/colors fallback)
- Commit after each phase checkpoint if desired (user-requested commits only)
