# Feature Specification: Developer Tooling & Verification

**Feature Branch**: `033-dev-tooling`

**Created**: 2026-10-05

**Status**: As-built (consolidated living spec)

**Consolidates**: `016-agent-self-testing`, `017-mise-toolchain`, test parts of `013`

**Input**: Consolidation of how operators and coding agents prepare a clone, verify
changes (type/content checks, unit tests, build), and — where approved — exercise the
running HUD without the operator filming every animation.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One file prepares a clone (Priority: P1)

An operator or agent clones the repo and runs `mise install`, `npm ci`, and (optionally)
the Chromium task. Node and Playwright versions are pinned in one committed file with no
secrets.

**Why this priority**: Reproducible setup is the precondition for every other check.

**Independent Test**: On a fresh machine with mise, run the README setup; confirm
`npm run check`, `npm test`, and `npm run build` succeed.

**Acceptance Scenarios**:

1. **Given** a fresh clone, **When** the documented setup runs, **Then** the pinned Node
   major (24) and Playwright CLI are available.
2. **Given** `mise.toml`, **When** reviewed, **Then** it contains no secrets and no unused
   tools.

---

### User Story 2 - Every change is checked automatically (Priority: P1)

Pull requests and pushes to `pre-release` run type and content checks, the production
build, and unit tests in CI.

**Why this priority**: The artist edits content without local tooling; CI is their safety
net (see `023`, `024`).

**Independent Test**: Open a PR with a deliberate content schema error; confirm the check
fails naming the file.

**Acceptance Scenarios**:

1. **Given** a PR, **When** CI runs, **Then** `npm run build` (incl. `astro check`) and
   `npm test` must pass.
2. **Given** pure logic modules (schedule, tagline pool, catalog, theme packs, playback,
   player sheet math), **When** they change, **Then** unit tests cover their behavior.

---

### User Story 3 - Agent verifies the HUD without a filmed recap (Priority: P2)

With operator approval, a coding agent starts the dev server and runs one command that
drives phone and laptop flows in a headless browser, writing pass/fail plus screenshots
to a gitignored folder.

**Why this priority**: Cuts the "operator films every animation" loop.

**Independent Test**: Run `npm run verify:hud` with Chromium installed; confirm a report
and artifacts appear in `.verify-hud/`; without Chromium, confirm a clear "missing tools"
message.

**Acceptance Scenarios**:

1. **Given** tools are installed, **When** `npm run verify:hud` runs, **Then** each flow
   reports pass/fail and writes artifacts to `.verify-hud/`.
2. **Given** tools are missing, **When** it runs, **Then** it exits with setup
   instructions instead of installing anything.

---

### Edge Cases

- Agents MUST NOT install packages, browsers, or tooling without operator approval
  (`.claude/rules/operator-workflow.md`, `.cursor/rules/operator-workflow.mdc`).
- Browser verification is opt-in; the default for visual checks is to ask the operator.
- `verify:hud` is dev-only and never shipped to visitors.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `mise.toml` MUST pin Node (major 24) and the Playwright CLI version used by
  `package.json`, and provide `playwright:chromium` and `setup` tasks; no secrets.
- **FR-002**: `package.json` scripts MUST provide `dev`, `check`, `build` (check + build),
  `preview`, `test`, `test:watch`, and `verify:hud`.
- **FR-003**: CI (`check.yml`) MUST run build and unit tests on pull requests and
  `pre-release` pushes.
- **FR-004**: Pure logic MUST live in `src/lib/` modules with colocated `*.test.ts` vitest
  suites.
- **FR-005**: `scripts/verify-hud.mjs` MUST drive named phone and laptop flows against the
  running dev server and write results to the gitignored `.verify-hud/`.
- **FR-006**: Agent rules MUST require operator approval before installing dependencies or
  running browser automation.

### Key Entities

- **Toolchain pin**: `mise.toml`, `.nvmrc`, `package.json` `engines`.
- **HUD flow**: a named scripted interaction with expected results.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A fresh clone reaches a green `npm run build && npm test` with three
  documented commands.
- **SC-002**: 100% of PRs run CI checks before merge.

## Assumptions

- 14 unit test files exist today and pass; there is no formatter or linter (IDEA-017).

## Known Gaps *(as of 2026-10-05)*

- `verify:hud` flows still target the phone player, which is hidden since 2026-09-18 (see
  `026`); the phone flows fail or test dead UI.
- No tests for `track-rub.ts`, `infinite-spin.ts`, `achievement-toast.ts`.
- Node version is stated in three places (`.nvmrc`, `mise.toml`, `deploy.yml` hard-codes
  24) while `engines` allows ≥22.
- Spec-kit is installed for both Cursor (`.cursor/`) and Claude Code (`.claude/`); both
  carry a copy of the operator-workflow rule.
