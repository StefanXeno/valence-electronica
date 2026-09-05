# Feature Specification: Mise Project Toolchain

**Feature Branch**: `016-agent-self-testing`

**Created**: 2026-09-05

**Status**: Draft

**Input**: User description: "Add a repo-root mise config file that describes
which tools this project needs (node version, playwright/chromium, anything
else already implied by the repo). One file operators and agents run
(`mise install` / `mise run` as appropriate). Single committed config
(typically mise.toml). [tools] pins for everything the project/agent needs.
How mise install gets a new clone ready; version pinning; no secrets.
Relationship to 016: 016’s verify command assumes mise-provided tools.
Do not invent unused tools. Align with what 016 actually installed."

## Context

A new clone today needs the operator to already have the right Node and,
after `016`, Playwright + Chromium. That knowledge lives in `.nvmrc`, CI
YAML, `package.json` engines, and tribal memory.

This feature adds **one committed toolchain file** at the repo root so
operators and agents run the same install path. It does **not** change the
visitor-facing site.

It formalizes what `016` already used in implementation:

- Node **24** (`.nvmrc` and GitHub Actions)
- Playwright **1.62.1** (declared `devDependency` + CLI)
- Chromium via a **remaining** Playwright browser-download command (mise
  cannot install the browser binary alone)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One file prepares a clone (Priority: P1)

An operator or coding agent clones the repo and needs matching tools
without guessing versions. They run the documented mise install (and the
one remaining browser command if needed) and can then run existing project
scripts and `016` HUD verification.

**Why this priority**: Without this, `016` verify fails closed on a fresh
machine and the agent cannot self-test.

**Independent Test**: On a machine that has mise but not this project's
tools, follow the documented install from the committed file and confirm
Node 24 and the Playwright CLI match the pins, then Chromium is available
after the remaining command.

**Acceptance Scenarios**:

1. **Given** a fresh clone, **When** the agent opens the toolchain file,
   **Then** they see pinned Node and Playwright (and comments in English
   explaining each pin).
2. **Given** that file, **When** they run `mise install`, **Then** Node 24
   and the Playwright CLI are available without picking versions by hand.
3. **Given** `mise install` has finished, **When** Chromium is still
   missing, **Then** docs / a mise task name the **one** remaining command
   (`playwright install --with-deps chromium` / `mise run playwright:chromium`).

---

### User Story 2 - Versions stay pinned and secret-free (Priority: P1)

The committed file pins exact or major-stable versions that match what the
repo already uses. It contains **no secrets**, tokens, or machine-local
paths. Extra unused tools are not listed.

**Why this priority**: Drift between CI, `.nvmrc`, and Playwright is how
the agent “works on my machine” and fails on the next clone.

**Independent Test**: Read the committed file and the repo’s existing
version sources. Confirm they agree, and that the file has no credentials.

**Acceptance Scenarios**:

1. **Given** `.nvmrc` and CI Node version, **When** someone reads the
   toolchain file, **Then** Node is pinned to **24** (same major).
2. **Given** `package.json` after `016`, **When** someone reads the
   toolchain file, **Then** Playwright is pinned to **1.62.1**.
3. **Given** the committed file, **When** it is reviewed, **Then** it has
   no secrets, no unused language runtimes, and no extra browsers
   (Firefox/WebKit).

---

### User Story 3 - 016 verify assumes these tools (Priority: P2)

`npm run verify:hud` is documented to assume mise-provided Node and
Playwright. This feature is the owner of that assumption: the toolchain
file and its tasks are what a missing-tool error in `016` points at.

**Why this priority**: `016` already prints mise-first failure copy. This
feature makes that copy true.

**Independent Test**: Follow `016` missing-tool copy against this file’s
commands. Confirm the named steps exist and match what `016` actually
installed.

**Acceptance Scenarios**:

1. **Given** Playwright or Chromium is missing, **When** `016` verify
   fails, **Then** the printed install steps match this toolchain file.
2. **Given** tools are installed via this file, **When** the agent runs
   `npm run verify:hud`, **Then** they do not need a second ad-hoc
   installer family.
3. **Given** project dependencies (Astro, vitest), **When** a clone is
   prepared, **Then** existing `npm ci` still installs `node_modules`;
   mise does not replace the lockfile.

---

### Edge Cases

- **mise not installed on the machine**: Docs MUST say to install mise
  itself first (operator-owned). This file does not vendor mise.
- **Browsers already cached**: The remaining Chromium command MUST be
  safe to re-run (idempotent enough).
- **Missing OS libraries** (Linux `libnss3`, etc.): The default remaining
  command MUST NOT use `--with-deps` / sudo. That stays an operator
  approval leftover.
- **CI**: v1 does **not** require switching GitHub Actions to mise.
  Actions may keep `setup-node` + `npm ci`. Local/agent use is the target.
- **`.nvmrc` vs mise**: Both MUST stay on Node 24. Do not delete `.nvmrc`
  in this feature unless a later change asks.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The repo MUST contain one committed toolchain file at the
  root named `mise.toml` (not `.mise.toml` unless a later change justifies
  it).
- **FR-002**: That file MUST pin Node **24** and Playwright **1.62.1**
  (the versions `016` actually used).
- **FR-003**: `mise install` MUST be the documented way to install those
  tool pins.
- **FR-004**: Because mise cannot download Playwright Chromium alone, the
  file MUST define one remaining task (name MAY be `playwright:chromium`)
  that runs `playwright install --with-deps chromium` (OS libs approved
  2026-09-05; ⚠️ may sudo/apt on Linux).
- **FR-005**: The file MUST contain English comments for each pin and
  task. It MUST NOT contain secrets.
- **FR-006**: The file MUST NOT add unused tools (no extra languages,
  no Firefox/WebKit, no aqua/ubi substitutes).
- **FR-007**: Existing `npm ci` remains the way to install project
  `node_modules` (Astro, vitest, the declared `playwright` package).
- **FR-008**: `016` verify missing-tool copy MUST stay consistent with
  this file’s commands.
- **FR-009**: The feature MUST NOT add production JavaScript, routes,
  tracking, cookies, or a runtime backend.
- **FR-010**: Artist-facing docs MUST NOT instruct the artist to run
  mise or the HUD harness.

### Key Entities

- **Toolchain file**: The committed `mise.toml`.
- **Tool pin**: A named version (Node 24, Playwright 1.62.1).
- **Remaining browser command**: The one step after `mise install` that
  downloads Chromium.
- **Project lockfile**: Existing `package-lock.json` for npm packages.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new clone can get matching Node + Playwright CLI from
  **one** committed file via `mise install` in under 15 minutes on a
  normal developer machine (network permitting).
- **SC-002**: After the remaining Chromium command, `016` verify can run
  without a second installer family.
- **SC-003**: **0** secrets in the committed toolchain file.
- **SC-004**: **0** unused tools listed beyond Node, Playwright, and the
  Chromium task.
- **SC-005**: **0** visitor-facing files, cookies, or tracking added.

## Assumptions

- Actors are the **operator** and the **coding agent**. Visitors never
  see this.
- `016` implementation already declared `playwright@1.62.1` and used
  `npx playwright install chromium`. `--with-deps` is now the durable
  mise task (approved 2026-09-05). This feature pins those versions.
- mise itself is installed by the operator (or already present). This
  feature does not vendor mise.
- Dual pin is intentional: mise provides the CLI + Node; `package.json`
  lets `scripts/verify-hud.mjs` import `playwright`.
- `.nvmrc` stays `24` so CI `node-version-file` keeps working.
- No paid CI browser job.

## Dependencies

- `016-agent-self-testing` — consumer of these tools; already implemented
  on this branch.
- Existing `.nvmrc` (`24`), `package.json` `engines` (`>=22`), CI
  `setup-node` (24).

## Out of Scope

- Implementing unused tools
- Switching CI to mise (optional later)
- `--with-deps` / sudo apt for Chromium OS libraries
- Changing visitor HUD or site content
- Replacing `npm ci` / `package-lock.json`
- Installing Firefox or WebKit
- Artist-guide mise instructions
