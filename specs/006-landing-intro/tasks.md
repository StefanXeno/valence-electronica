# Tasks: Landing Intro — “Hi, I’m Valence”

**Input**: Design documents from `/specs/006-landing-intro/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/intro-ui.md, quickstart.md

**Tests**: Not requested. CI gates (`astro check`, `astro build`) plus manual walks in `quickstart.md` are the validation path.

**Organization**: Tasks grouped by user story. Chrome schema + intro helpers are foundational; US1 ships white sheet + portal cut-out + name-only zoom; US2 adds playback flag + skip + no-JS; US3 adds reduced motion + dev-only demo replay; US4 confirms content-only editing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm feature context before code changes

- [x] T001 Verify branch `006-landing-intro` and read `specs/006-landing-intro/contracts/intro-ui.md` plus `specs/006-landing-intro/data-model.md` for white portal layout, name-only zoom, and storage key
- [x] T002 [P] Read `specs/006-landing-intro/research.md` (R5–R12): white sheet, portal cut-out, stage visible through name, zoom from center, dev-only replay, `html[data-intro-active]` gating

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Content schema, chrome strings, shared intro helpers, base styles

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Add optional `introLead` and `introName` string fields to the `ui` collection schema in `src/content.config.ts`
- [x] T004 [P] Set `introLead: "Hi I'm"` and `introName: "Valence"` in `src/content/ui/chrome.md`
- [x] T005 Extend `UiChrome` interface, fallbacks, and `getChrome()` in `src/lib/stage.ts` to expose `introLead` and `introName` (defaults per FR-002 when fields absent)
- [x] T006 Create `src/lib/intro.ts` with constants/helpers per contract: storage key `valence-intro-seen`, `hasIntroBeenSeen()`, `markIntroSeen()`, `prefersReducedMotion()`, `hasReplayIntroQuery()` (**dev-only**), `shouldPlayIntro({ name })` (trim-empty `introName` → false)
- [x] T007 [P] Create `src/styles/intro.css` with full-viewport `.landing-intro__sheet` white field, **portal cut-out** on `.landing-intro__name` (FR-003a/c; see research R9–R11), name-only zoom from center (FR-003b), subtler `.landing-intro__lead` entrance + fade during zoom, HUD pointer-events gating for `html[data-intro-active]` (not stage `opacity: 0`), and `@media (prefers-reduced-motion: reduce)` kill-switch

**Checkpoint**: `npm run check` passes; chrome loads intro fields; `intro.ts` exports compile

---

## Phase 3: User Story 1 - First-time visitor gets a short branded greeting (Priority: P1) 🎯 MVP

**Goal**: White sheet + viewport-centered two-line greeting; portal cut-out “Valence”; zoom into name from center; stage fully interactive after reveal

**Independent Test**: Fresh profile, motion allowed, clear storage → load `/` → white sheet + portal cut-out + centered zoom → jukebox/socials work after reveal (quickstart scenarios 1, 10)

- [x] T008 [US1] Create `src/components/LandingIntro.astro` with white sheet + name portal cut-out + lead line (separate lines, viewport-centered per contract); site stays rendered behind sheet (FR-003c)
- [x] T009 [US1] Import `src/styles/intro.css` in `src/components/LandingIntro.astro` and implement auto sequence: set `html[data-intro-active]` on start, run **name-only** zoom from center on `.landing-intro__name` cut-out, subtler lead entrance, remove overlay on completion; cap total auto path ~2–4 s with timeout fallback (FR-003b, FR-014)
- [x] T010 [US1] Ensure atmosphere/stage remain visible **through the name cut-out** during intro; gate pointer interaction on HUD only until reveal completes (FR-012, SC-001a) — do not hide `.stage` with opacity; avoid FOUC with `html[data-intro-pending]` when intro will play
- [x] T011 [US1] Mount `LandingIntro.astro` in `src/pages/index.astro` only, passing `introLead` and `introName` from `getChrome()` in `src/lib/stage.ts` — not in `src/layouts/Base.astro` (FR-010)
- [x] T012 [US1] Manually walk quickstart scenarios 1 and 10; confirm portal cut-out (not black text), centered name, no zoom drift (SC-001b); jukebox, panels, socials, mute, and legal footer behave as before 004/002/003 after reveal

**Checkpoint**: First-visit intro plays on landing; see-through name + name zoom verified

---

## Phase 4: User Story 2 - Return visitors and skippers are not blocked (Priority: P1)

**Goal**: Playback flag prevents replay; Escape and click/tap skip immediately; no-JS shows normal landing; legal routes untouched

**Independent Test**: Complete or skip intro → reload skips; Escape during intro → immediate reveal; disable JS → no blocking overlay (quickstart scenarios 2–4, 8)

- [x] T013 [US2] Wire `src/lib/intro.ts` in `src/components/LandingIntro.astro` client script: skip intro when `!shouldPlayIntro()`; call `markIntroSeen()` on natural completion (FR-004, FR-007)
- [x] T014 [US2] Add Escape key and overlay click/tap listeners in `src/components/LandingIntro.astro` to end intro immediately, clear `data-intro-active`, remove overlay, and `markIntroSeen()` (FR-006, FR-013, SC-003 — perceived skip ≤300 ms)
- [x] T015 [US2] Verify reload after complete/skip does not replay intro when storage available (SC-002); handle storage write failures gracefully — intro still skippable, site usable (edge case: blocked storage)
- [x] T016 [US2] Progressive enhancement in `src/components/LandingIntro.astro`: without scripting, do not leave a blocking overlay — stage content visible from SSR (FR-009, SC-005)
- [x] T017 [P] [US2] Confirm `src/pages/legal/[slug].astro` and legal overlay flow do not import `LandingIntro.astro` (FR-010); walk quickstart scenario 8

**Checkpoint**: Skip + no-replay + no-JS degradation verified

---

## Phase 5: User Story 3 - Reduced motion and demo replay (Priority: P2)

**Goal**: Reduced motion skips intro entirely; dev-only `?replay-intro` and optional `/dev/intro` for maintainers

**Independent Test**: Reduce motion → no intro; dev + flag set + `?replay-intro` → intro once; reduce + query → still no intro (quickstart scenarios 5–6, 6b)

- [x] T018 [US3] Ensure `shouldPlayIntro()` in `src/lib/intro.ts` returns false when `prefersReducedMotion()` and that `LandingIntro.astro` never activates overlay in that case (FR-008, SC-004)
- [x] T019 [US3] Implement `hasReplayIntroQuery()` bypass in `shouldPlayIntro()` gated by `import.meta.env.DEV` only (FR-011); demo query MUST NOT override reduced motion
- [x] T020 [US3] Add optional `src/pages/dev/intro.astro` that clears flag and redirects to `/?replay-intro` in dev; production build MUST omit or redirect away (FR-011a); walk quickstart scenarios 6 and 6b

**Checkpoint**: Accessibility and maintainer replay paths verified

---

## Phase 6: User Story 4 - Greeting copy is content-editable (Priority: P2)

**Goal**: Editor changes lead and name in chrome content only; empty name disables intro

**Independent Test**: Edit `chrome.md` → new two-line text in intro; empty `introName` → no intro (quickstart scenarios 7, 9)

- [x] T021 [US4] In `src/components/LandingIntro.astro`, omit overlay entirely when trimmed `introName` is empty — no blank layer (FR-015)
- [x] T022 [US4] Manually walk quickstart scenarios 7 and 9; confirm no component edits required for lead/name changes (FR-003, SC-006)

**Checkpoint**: Content-only two-line greeting workflow confirmed

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, build gates, full validation

- [x] T023 [P] Add **Landing intro** subsection to README.md: white portal behavior, `introLead` / `introName` in `src/content/ui/chrome.md`, `valence-intro-seen` storage key, dev-only `?replay-intro` and `/dev/intro`, link to `specs/006-landing-intro/contracts/intro-ui.md`
- [x] T024 [P] Confirm no third-party scripts, cookies, or intro audio were added (FR-016, FR-017); note storage flag for future IDEA-009 privacy copy in README if helpful
- [x] T025 Run `npm run check && npm run build` from repository root and fix any type or content errors
- [x] T026 Execute the full `specs/006-landing-intro/quickstart.md` checklist (scenarios 1–11 and 6b); spot-check ~320px width for two-line layout; note any follow-ups

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **blocks all user stories**
- **US1 (Phase 3)**: Depends on Foundational — MVP
- **US2 (Phase 4)**: Depends on US1 component existing
- **US3 (Phase 5)**: Depends on US2 playback gating
- **US4 (Phase 6)**: Foundational + US1; empty-name task after component exists
- **Polish (Phase 7)**: Depends on US1–US4 complete

### User Story Dependencies

- **US1 (P1)**: After Foundational — white portal + name zoom; no dependency on US2–US4
- **US2 (P1)**: After US1 overlay exists — adds flag + skip + no-JS
- **US3 (P2)**: After US2 gating logic — reduced motion + demo query
- **US4 (P2)**: Chrome fields in Foundational; validation after US1 component

### Parallel Opportunities

- Phase 1: T001 ∥ T002
- Phase 2: T004 ∥ T006 ∥ T007 (after T003 schema)
- Phase 4: T017 ∥ other US2 work once LandingIntro exists
- Phase 7: T023 ∥ T024

---

## Parallel Example: Foundational

```bash
# After T003 schema lands:
Task T004: chrome.md introLead + introName
Task T007: intro.css white sheet + portal cut-out + name zoom keyframes
# Then T005 (stage.ts) and T006 (intro.ts)
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1–2 (Setup + Foundational)
2. Complete Phase 3 (US1 white portal + zoom)
3. **STOP and VALIDATE** quickstart scenarios 1 and 10
4. Demo intro motion before skip/storage polish

### Incremental Delivery

1. Foundational → US1 (greeting plays) → US2 (skip + no replay) → US3 (a11y + demo) → US4 (content edge cases) → Polish

---

## Notes

- Landing-only mount in `src/pages/index.astro` is intentional (FR-010)
- Constitution IV exception: new client JS justified in plan Complexity Tracking
- Zoom MUST target `.landing-intro__name` cut-out only — not the lead line (FR-003b)
- Name MUST be a portal cut-out in the white sheet — site visible through letterforms (FR-003a, SC-001a)
- Do not persist jukebox selection — only intro seen flag (004 rule unchanged)
- Mid-intro navigation: always clear overlay on skip/complete; never leave `data-intro-active` stuck
