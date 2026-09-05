# Tasks: Mise Project Toolchain

**Input**: Design documents from `/specs/017-mise-toolchain/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/mise-toolchain.md, quickstart.md

**Tests**: No new test framework. Validation is `mise install` + the Chromium
task + `npm run verify:hud` (`016`). **Do not implement these tasks in the
current pass** — spec/plan/tasks only.

**Organization**: Setup + foundation (`mise.toml`), US1 clone install, US2
pins, US3 016 alignment, polish.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm 016 actuals before writing `mise.toml`

- [X] T001 Read `specs/017-mise-toolchain/contracts/mise-toolchain.md` and `specs/016-agent-self-testing/research.md` (R3); confirm `package.json` still has `playwright` `1.62.1`
- [X] T002 [P] Confirm `.nvmrc` is `24` and `.github/workflows/check.yml` uses `node-version-file: .nvmrc`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Committed `mise.toml` exists with comments, no secrets

**⚠️ CRITICAL**: No user story polish until the file is valid TOML

- [X] T003 Create `mise.toml` at repo root with English comments per `specs/017-mise-toolchain/contracts/mise-toolchain.md`
- [X] T004 Add `[tools]` pins in `mise.toml`: `node = "24"` and `"npm:playwright" = "1.62.1"` (or registry shorthand `playwright`)
- [X] T005 Add `[tasks."playwright:chromium"]` in `mise.toml` with `run = "playwright install --with-deps chromium"`

**Checkpoint**: File exists; no extra tools; no secrets

---

## Phase 3: User Story 1 - One file prepares a clone (Priority: P1) 🎯 MVP

**Goal**: Documented `mise install` + remaining Chromium command

**Independent Test**: Follow `specs/017-mise-toolchain/quickstart.md` on a machine with mise.

### Implementation for User Story 1

- [X] T006 [US1] Optional `[tasks.setup]` in `mise.toml` that runs `npm ci && playwright install --with-deps chromium`
- [X] T007 [P] [US1] Add a one-line developer pointer to `mise install` / `mise run playwright:chromium` in `README.md` (not in `docs/artist-guide.md`)

**Checkpoint**: US1 — clone path is one file + documented remaining command

---

## Phase 4: User Story 2 - Versions stay pinned and secret-free (Priority: P1)

**Goal**: Pins match 016 / `.nvmrc`; no unused tools

**Independent Test**: Diff `mise.toml` `[tools]` against `package.json` and `.nvmrc`.

### Implementation for User Story 2

- [X] T008 [US2] Confirm Playwright version in `mise.toml` equals `package.json` `devDependencies.playwright` (`1.62.1`)
- [X] T009 [US2] Confirm `mise.toml` has no secrets, no Firefox/WebKit, no extra language runtimes

**Checkpoint**: US2 — pins match reality

---

## Phase 5: User Story 3 - 016 verify assumes these tools (Priority: P2)

**Goal**: Missing-tool copy and mise task names agree

**Independent Test**: `scripts/verify-hud.mjs` failure phrases name `mise install` and `mise run playwright:chromium`.

### Implementation for User Story 3

- [X] T010 [US3] Align required phrases in `scripts/verify-hud.mjs` with `mise.toml` task id `playwright:chromium`
- [X] T011 [P] [US3] Confirm `docs/artist-guide.md` has no mise or HUD-harness section

**Checkpoint**: US3 — 016 consume path is consistent

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T012 Walk `specs/017-mise-toolchain/quickstart.md` after implement (not in this pass)
- [X] T013 [P] Confirm no `src/` visitor changes and `specs/015-mobile-stage-hud/` untouched

---

## Dependencies & Execution Order

- **Setup** → **Foundational** (blocks stories) → US1 / US2 → US3 → Polish
- US2 can start as soon as T004 exists
- US3 needs T005 (task name) and the existing `016` harness

### Parallel Opportunities

- T002 after T001
- T007 / T011 / T013 once files exist

---

## Implementation Strategy

### MVP

1. `mise.toml` with Node 24 + Playwright 1.62.1 + Chromium task
2. README one-liner
3. Confirm 016 failure copy

### Guardrails

- Do not implement in the current operator pass
- `--with-deps` is required (operator-approved); ⚠️ may sudo/apt
- No unused tools
- No artist-guide mise section
- Do not pop `stash@{0}`

---

## Notes

- Suggested MVP: T001–T005
- `016` already added Playwright to `package.json`; this feature only pins it in mise
