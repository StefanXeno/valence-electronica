# Tasks: UI Glitch Interactions

**Input**: Design documents from `/specs/003-ui-glitch/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/glitch-ui.md, quickstart.md

**Tests**: Not requested for this feature. CI gates (`astro check`, `astro build`) plus manual walks in `quickstart.md` are the validation path.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. Work **refines** the provisional implementation already on branch `003-ui-glitch` against the clarified spec.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: Which user story this task belongs to (US1–US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm provisional glitch surface area and wire points before behavior changes

- [x] T001 Inventory provisional glitch files against the plan (`src/styles/glitch.css`, `src/lib/glitch.ts`, `src/components/GlitchPress.astro`, mute morph in `src/components/MuteControl.astro`, `glitch-hit` usage in `src/components/Channels.astro`, `src/components/Footer.astro`, `src/components/LegalPanel.astro`, mount in `src/layouts/Base.astro`) and note gaps vs `contracts/glitch-ui.md`
- [x] T002 [P] Confirm `src/layouts/Base.astro` imports `src/styles/glitch.css` and mounts `src/components/GlitchPress.astro` so refinements load on landing + legal routes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Closed hit-target set + shared glitch primitives every story uses

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Align the closed hit-target set with `contracts/glitch-ui.md`: ensure `glitch-hit` exists only on active channel links in `src/components/Channels.astro`, legal links in `src/components/Footer.astro`, Exit in `src/components/LegalPanel.astro`, and the mute toggle in `src/components/MuteControl.astro` — never on placeholders or the volume slider
- [x] T004 [P] Keep/refine shared one-shot visual language and theme tint tokens in `src/styles/glitch.css` (accent/text from `src/styles/themes.css`); ensure resting state clears after animation and reduced-motion CSS kill-switch skeleton exists
- [x] T005 [P] Keep/refine `src/lib/glitch.ts` preset helper (`applyGlitchPreset` / `playElementGlitch`) so one-shot durations stay under 1s and intensity stays within the soft flash bar for later owner review (FR-012 / SC-004)

**Checkpoint**: Markers match the closed set; shared CSS/TS helpers are ready for binder + mute refinements

---

## Phase 3: User Story 1 - Interactive controls feel alive on hover and press (Priority: P1) 🎯 MVP

**Goal**: In-scope non-mute controls (and mute focus where applicable) get calm one-shot glitch on pointer hover, keyboard-visible focus, and press — without dead hit targets

**Independent Test**: Motion allowed → hover/press channel + legal links glitch once and stay usable; Tab focus glitches; mouse-click focus does not; placeholders/slider never glitch (quickstart.md scenarios 1–3, 6, 8)

### Implementation for User Story 1

- [x] T006 [US1] Refine `src/components/GlitchPress.astro` for one-shot pointer-hover and press on `.glitch-hit` targets with at-most-one active treatment and press-supersedes-hover stacking (FR-013) (depends on T003–T005)
- [x] T007 [US1] Update focus handling in `src/components/GlitchPress.astro` so glitch fires only for keyboard-visible focus (`:focus-visible`); mouse-click focus must not trigger a focus glitch (FR-014) (depends on T006)
- [x] T008 [US1] Ensure press glitch is skipped for mute (`[data-mute-control]` / volume-control host) in `src/components/GlitchPress.astro` so US2 morph owns mute clicks (FR-002 / FR-005) (depends on T006)
- [x] T009 [P] [US1] Verify hit-testing survival in `src/styles/glitch.css` (and mute live variant if used): no clip-path/opacity tricks that shrink or steal the hit target mid-glitch (FR-004 / SC-003) (depends on T004, T006)
- [x] T010 [US1] Manually walk quickstart scenarios 1–3 and 8 (channel/legal/exit hover, press, keyboard-visible focus, mouse-click focus negative case) and fix any binder regressions in `src/components/GlitchPress.astro` (depends on T007–T009)

**Checkpoint**: MVP — one-shot glitch language demoable on closed non-mute targets (+ focus rules)

---

## Phase 4: User Story 3 - Reduced-motion visitors get a calm static UI (Priority: P1)

**Goal**: Preferring reduced motion disables all glitch language while controls stay usable

**Independent Test**: OS/browser reduce motion on → 0 glitch treatments across hover, keyboard focus, press, mute hover, mute morph; actions still work (quickstart.md scenario 7)

### Implementation for User Story 3

- [x] T011 [US3] Complete `@media (prefers-reduced-motion: reduce)` kill-switch in `src/styles/glitch.css` (and mute morph keyframes in `src/components/MuteControl.astro`) so no glitch animations play when reduce is set (FR-006) (depends on T004)
- [x] T012 [US3] Update `src/components/GlitchPress.astro` to skip binding/triggers when reduced motion is preferred and to re-check preference before each trigger (and on `matchMedia` `change` if practical) so mid-session flips stop new glitches (depends on T006, T011)
- [x] T013 [US3] Ensure `src/components/MuteControl.astro` skips morph glitch (and any continuous hover added in US2) under reduced motion while still allowing compact ↔ expanded layout for clarity (US3 AS2) (depends on T011)
- [x] T014 [US3] Manually validate quickstart scenario 7 for paths available at this phase (hover/focus/press/morph reduce-motion). Note: re-verify continuous mute hover under reduce motion in T018 after T016 (analyze C1) (depends on T012, T013)

**Checkpoint**: Accessibility gate ships with the feature, not as later polish

---

## Phase 5: User Story 2 - Mute/volume shell morphs with the same language (Priority: P2)

**Goal**: Mute/unmute morph uses glitch language; continuous hover glitch only on the mute button; no stacked press; slider stays quiet

**Independent Test**: Unmute/mute morphs with glitch, no stacked press; sustained mute hover glitches continuously and stops on leave; other controls stay one-shot; slider/placeholders never glitch (quickstart.md scenarios 4–6)

### Implementation for User Story 2

- [x] T015 [US2] Refine mute expand/collapse morph glitch in `src/components/MuteControl.astro` so unmute/mute clicks use shell morph only (no stacked press), morph supersedes any in-flight continuous mute hover (FR-013), and the control stays clickable mid-morph (FR-005 / FR-004) (depends on T005, T008, T013)
- [x] T016 [US2] Implement continuous pointer-hover glitch for the mute button only in `src/components/MuteControl.astro` (and/or `src/styles/glitch.css`): sustain while pointer is over the mute toggle; end immediately on pointer-out; resume after morph only if pointer still over mute; forbidden on all other elements (FR-010 / FR-013) (depends on T015)
- [x] T017 [P] [US2] Confirm volume slider and placeholder chips remain unmarked/unglitched in `src/components/MuteControl.astro` and `src/components/Channels.astro` (FR-008 / FR-011) (depends on T003)
- [x] T018 [US2] Manually walk quickstart scenarios 4–6 with motion allowed, then re-check reduce-motion + sustained mute hover (0 continuous glitch) to close analyze C1 / SC-002 (depends on T016, T017)

**Checkpoint**: Mute chrome completes the motion story without leaking continuous hover elsewhere

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Intensity gate, contract compliance, CI, full quickstart

- [x] T019 Owner eyeball review of one-shots + continuous mute hover against soft flash bar (~≤3 distinct flashes/sec, no full-viewport flashes); also check ~320px width so displacement does not push critical controls off-screen; tune presets/keyframes in `src/lib/glitch.ts` / `src/styles/glitch.css` / `src/components/MuteControl.astro` as needed (SC-005 / SC-006)
- [x] T020 [P] Re-read `specs/003-ui-glitch/contracts/glitch-ui.md` trigger matrix and fix any remaining mismatches in `src/components/GlitchPress.astro` and `src/components/MuteControl.astro`
- [x] T021 Run `npm run check` and `npm run build` from repo root; fix type/build issues introduced by glitch refinements
- [x] T022 Execute the full `specs/003-ui-glitch/quickstart.md` validation list (scenarios 1–10), including reduce-motion + continuous mute hover and a ~320px layout spot-check; note any follow-ups

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational — MVP
- **User Story 3 (Phase 4)**: Depends on Foundational; best after US1 binder exists so reduced-motion gating covers real triggers (both are P1)
- **User Story 2 (Phase 5)**: Depends on Foundational + US1 mute press skip (T008) + US3 reduced-motion hooks for mute (T013)
- **Polish (Phase 6)**: Depends on US1–US3 desired scope complete

### User Story Dependencies

- **User Story 1 (P1)**: After Foundational — no dependency on US2/US3 for MVP demo of link glitch
- **User Story 3 (P1)**: After Foundational; integrate with US1 binder; must ship before calling the feature done
- **User Story 2 (P2)**: After US1 mute press exclusion; builds on mute control from feature `002`

### Parallel Opportunities

- T002 with T001 (after inventory starts)
- T004 and T005 in Foundational after T003 (or overlapping if markers already correct)
- T009 parallel with T007/T008 once T006 lands (CSS vs binder files)
- T017 parallel with T016 (marker audit vs continuous hover impl)
- T020 parallel with T019 (contract pass vs intensity tuning) before CI

---

## Parallel Example: User Story 1

```bash
# After T006 lands, these can proceed on different files:
Task: "Update focus-visible gating in src/components/GlitchPress.astro"
Task: "Verify hit-testing survival in src/styles/glitch.css"
```

---

## Parallel Example: User Story 2

```bash
# After morph refine starts:
Task: "Continuous mute hover in MuteControl.astro / glitch.css"
Task: "Confirm slider/placeholders unmarked in MuteControl.astro + Channels.astro"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: quickstart scenarios 1–3, 8
5. Demo one-shot glitch language

### Incremental Delivery

1. Setup + Foundational → markers + shared primitives ready
2. US1 → one-shot hover/press/focus-visible MVP
3. US3 → reduced-motion hard gate (P1)
4. US2 → mute morph + continuous mute hover
5. Polish → owner intensity + full quickstart + CI

### Parallel Team Strategy

With multiple developers:

1. Pair on Setup + Foundational
2. Dev A: US1 binder/CSS hit-testing
3. Dev B: US3 reduced-motion CSS/JS (after T006 exists)
4. Either: US2 mute morph + continuous hover
5. Together: polish / quickstart

---

## Notes

- [P] tasks = different files, no incomplete dependencies
- [Story] label maps task to US1/US2/US3 for traceability
- No automated test tasks — not requested in the spec
- Provisional code is a refine target, not an excuse to skip tasks
- Commit after each task or logical group
- Stop at checkpoints to validate stories independently
