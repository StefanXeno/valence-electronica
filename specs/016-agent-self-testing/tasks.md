# Tasks: Agent Self-Testing

**Input**: Design documents from `/specs/016-agent-self-testing/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/agent-verify.md, quickstart.md

**Tests**: This feature *is* the verification path. Harness cases live in
`scripts/verify-hud.mjs`. Vitest stays jsdom-free (`src/lib/*.test.ts` only
if no extra packages). Playwright is the **approved** agent package.
Do **not** add Puppeteer, jsdom, Firefox, or WebKit.

**Organization**: Setup + foundation (command + Playwright), then US1
phone flows (P1 MVP), US2 readable output (P1), US3 laptop (P2), US4
declared-tools gate (P2), polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete work)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Align with contracts; declare Playwright only

- [X] T001 Read `specs/016-agent-self-testing/contracts/agent-verify.md` and `specs/016-agent-self-testing/research.md` (R1–R10); do not edit `specs/015-mobile-stage-hud/`
- [X] T002 [P] Confirm `package.json` / `package-lock.json` baseline; the only new package allowed is `playwright@1.62.1`
- [X] T003 [P] Map flow ids in `specs/016-agent-self-testing/data-model.md` to as-built `015` outcomes in `specs/016-agent-self-testing/research.md` (five-icon growing pill, expand === V-Flip, Info legal)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Dev-only command exists; Playwright declared; Chromium via documented remaining command

**⚠️ CRITICAL**: No user story work until the stub command runs with Playwright declared

- [X] T004 Add `.verify-hud/` to `.gitignore` so artifacts are not committed
- [X] T005 Add `playwright` `1.62.1` as a **devDependency** in `package.json` (no other new packages) and refresh `package-lock.json`
- [X] T006 Create `scripts/verify-hud.mjs` as a Node 24 ESM stub that prints usage and exits 0
- [X] T007 Add `"verify:hud": "node scripts/verify-hud.mjs"` to `package.json`
- [X] T008 In `scripts/verify-hud.mjs`, create `.verify-hud/` and write a skeleton `report.md` that lists all flow ids from `specs/016-agent-self-testing/data-model.md`
- [X] T009 Install Playwright Chromium with the remaining documented command (`playwright install chromium` / `npx playwright install chromium`). Do **not** run `--with-deps` unless the operator later approves sudo/apt.

**Checkpoint**: `npm run verify:hud` runs; lockfile adds only Playwright; Chromium available for US1

---

## Phase 3: User Story 1 - Agent verifies the phone HUD without a filmed recap (Priority: P1) 🎯 MVP

**Goal**: Playwright harness covers the six phone flow families against as-built `015`, including a real drag-open

**Independent Test**: `npm run verify:hud` with Chromium and visible chrome produces pass/fail/skip for rest, tap-open, drag-open, playlist, collapse, mute center, content/Info, pause flatten — without operator video.

### Implementation for User Story 1

- [X] T010 [US1] In `scripts/verify-hud.mjs`, reuse or start existing `astro preview` / `astro dev` per `specs/016-agent-self-testing/contracts/agent-verify.md` (document the URL; do not add a new server package)
- [X] T011 [US1] In `scripts/verify-hud.mjs`, launch Playwright Chromium at ~390×844, dismiss or skip the landing intro so docks paint (`006` / `015`)
- [X] T012 [US1] Implement `phone-rest` in `scripts/verify-hud.mjs`: two docks, five content icons, no socials bar, no phone footer legal; write `.verify-hud/phone-rest.png`
- [X] T013 [US1] Implement `phone-tap-open` in `scripts/verify-hud.mjs`: handle tap, expand === V-Flip, full current theme-track card, shuffle + play/pause + playlist, no vinyl/loop; write `.verify-hud/phone-tap-open.png` and record open height
- [X] T014 [US1] Implement `phone-drag-open` in `scripts/verify-hud.mjs` with a **real Playwright drag**; same open height as tap; no leftover overshoot; write `.verify-hud/phone-drag-open.png` — never a fake pass
- [X] T015 [US1] Implement `phone-playlist` in `scripts/verify-hud.mjs`: current card stays, others add in, list scrolls, close does not jump; write `.verify-hud/phone-playlist.png`
- [X] T016 [US1] Implement `phone-collapse` in `scripts/verify-hud.mjs`: handle tap (or drag-down) hides transport; write `.verify-hud/phone-collapse.png`
- [X] T017 [US1] Implement `phone-mute-center` in `scripts/verify-hud.mjs`: mute right of floor row, vertically centered, no slider; `skipped` if mute is not mounted
- [X] T018 [US1] Implement `phone-content-info` in `scripts/verify-hud.mjs`: growing pill for About / Discography / Tour / Socials / Info; Info → Imprint or Privacy overlay; write `.verify-hud/phone-content-info.png`
- [X] T019 [US1] Implement `phone-pause-flatten` in `scripts/verify-hud.mjs` using running-page evidence of `src/lib/eq-flatten.ts` (flat bars or `is-eq-flat`); write `.verify-hud/phone-pause-flatten.png`

**Checkpoint**: US1 — phone flows scored without a filmed recap; drag-open is real

---

## Phase 4: User Story 2 - One documented command the agent can run and read (Priority: P1)

**Goal**: One primary command, labeled artifacts, flow ids on stdout

**Independent Test**: Follow `specs/016-agent-self-testing/quickstart.md`. A person can name a failed flow from stdout or `.verify-hud/` in under 2 minutes.

### Implementation for User Story 2

- [X] T020 [US2] Print one stdout line per flow id (`pass` / `fail` / `skipped`) from `scripts/verify-hud.mjs` per `specs/016-agent-self-testing/contracts/agent-verify.md`
- [X] T021 [US2] Write `.verify-hud/report.md` summarizing the run (viewports, toolPath, playwrightPresent, browserPresent, each flow) per `specs/016-agent-self-testing/data-model.md`
- [X] T022 [US2] Exit non-zero from `scripts/verify-hud.mjs` when any flow is `fail` or Playwright/Chromium is missing
- [X] T023 [P] [US2] Add a one-line developer pointer to `npm run verify:hud` in `README.md` (not in `docs/artist-guide.md`)
- [X] T024 [US2] Optionally compose existing `npm test` and `npm run check` at the start of `scripts/verify-hud.mjs` (or document `--skip-unit`); do not add vitest browser mode
- [X] T025 [US2] On flow `fail`, write an optional Playwright `trace.zip` under `.verify-hud/` labeled by flow id

**Checkpoint**: US2 — command + artifacts readable without operator narration

---

## Phase 5: User Story 3 - Laptop HUD stays cheaply testable (Priority: P2)

**Goal**: Same command, second Playwright context (~1280×800, width ≥1024)

**Independent Test**: `.verify-hud/laptop-rest.png` shows `009`/`011` HUD, not phone docks.

### Implementation for User Story 3

- [X] T026 [US3] Add a laptop Playwright context (~1280×800) to `scripts/verify-hud.mjs` using the same Playwright Chromium (no second tool family)
- [X] T027 [US3] Implement `laptop-rest` in `scripts/verify-hud.mjs`: screenshot + score that phone growing-pill docks are not the laptop chrome; honor `--phone-only` / `--laptop-only` if flags exist

**Checkpoint**: US3 — cheap laptop artifact in the same sitting

---

## Phase 6: User Story 4 - Declared agent tools only; extra packages stay gated (Priority: P2)

**Goal**: Fail closed without Playwright/Chromium; lockfile adds only Playwright; no artist-guide harness

**Independent Test**: Diff `package.json` / `package-lock.json` is Playwright + `verify:hud` only. Missing Chromium → incomplete + mise-first / `playwright install chromium` phrases. `docs/artist-guide.md` untouched.

### Implementation for User Story 4

- [X] T028 [US4] When Playwright or Chromium is missing, `scripts/verify-hud.mjs` exits non-zero and prints the required phrases in `specs/016-agent-self-testing/contracts/agent-verify.md` (mise-first + remaining browser command)
- [X] T029 [US4] Confirm `package-lock.json` added only `playwright` (and its transitive tree); do not add Puppeteer, jsdom, or extra browsers
- [X] T030 [P] [US4] Confirm `docs/artist-guide.md` has no harness how-to and that `scripts/verify-hud.mjs` is not imported from `src/pages/` or `src/components/`
- [X] T031 [P] [US4] Confirm no production JS, routes, cookies, or tracking were added under `src/`

**Checkpoint**: US4 — extra-tool gate and constitution I–V, VII hold

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validate the quickstart; keep 015 specs untouched

- [X] T032 Walk `specs/016-agent-self-testing/quickstart.md` scenarios 1–10 and fix gaps in `scripts/verify-hud.mjs` or `README.md` only
- [X] T033 [P] Re-read constitution check in `specs/016-agent-self-testing/plan.md`; confirm `specs/015-mobile-stage-hud/` was not modified on this branch

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Setup — **BLOCKS** all user stories
- **US1 (Phase 3)**: Depends on Foundational
- **US2 (Phase 4)**: Depends on Foundational; should land with or right after US1 so stdout/report wrap the phone flows
- **US3 (Phase 5)**: Depends on Foundational; can start after T011 (Playwright page)
- **US4 (Phase 6)**: Can be checked continuously; T028 needs the stub from Phase 2
- **Polish**: After desired stories

### User Story Dependencies

- **User Story 1 (P1)**: After Phase 2 — MVP
- **User Story 2 (P1)**: After Phase 2; output layer for US1
- **User Story 3 (P2)**: After Playwright launch (T011); independent of Info/playlist details
- **User Story 4 (P2)**: Independent checks; T028 after stub exists

### Parallel Opportunities

- T002 / T003 after T001
- T023 / T030 / T031 / T033 once files exist
- US3 (T026–T027) after T011, parallel to later US1 flows if careful in the same script

---

## Parallel Example: User Story 1

```bash
# After T010–T011 (preview + intro), cases are sequential in one script
# but independently reviewable:
#   phone-rest, phone-tap-open, phone-drag-open, phone-playlist,
#   phone-collapse, phone-mute-center, phone-content-info, phone-pause-flatten
```

---

## Implementation Strategy

### MVP First (User Story 1 + command stub)

1. Phase 1–2: `npm run verify:hud` stub + Playwright + Chromium
2. Phase 3: phone flows including real drag-open
3. Phase 4: make the report readable
4. Operator reviews artifacts

### Incremental Delivery

1. Stub command → proves the entry point
2. Rest + tap-open + drag-open + Info screenshots → first film-free loop
3. Playlist / mute / pause / collapse
4. Laptop rest
5. Fail-closed copy when tools are missing

### Guardrails (do not violate)

- Playwright only — no Puppeteer / jsdom / extra browsers
- No `--with-deps` / sudo apt unless the operator later approves
- No edits under `specs/015-mobile-stage-hud/`
- No artist-guide harness section
- No published-site JS for this feature
- Do not implement `017` (`mise.toml` as that feature) in this task list

---

## Notes

- [P] tasks = different files, no dependencies
- Flow ids MUST match `specs/016-agent-self-testing/data-model.md`
- Suggested MVP: T001–T014 + T018 + T020–T022 (rest, tap-open, drag-open, Info, readable report)
