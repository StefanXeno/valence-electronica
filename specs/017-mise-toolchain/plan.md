# Implementation Plan: Mise Project Toolchain

**Branch**: `016-agent-self-testing` (017 specs live on the same branch) | **Date**: 2026-09-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/017-mise-toolchain/spec.md`

## Summary

Commit a root **`mise.toml`** that pins the tools `016` already installed:
**Node 24** and **Playwright 1.62.1**. `mise install` gets the CLI pins.
One remaining task downloads Chromium + OS libs (`playwright install --with-deps chromium`).
Existing `npm ci` still installs `node_modules`. No unused tools. No
secrets. Do **not** implement this file in the current pass — spec/plan/tasks
only.

## Technical Context

**Language/Version**: mise TOML config; Node 24 (`.nvmrc`); Playwright 1.62.1

**Primary Dependencies**: mise (operator-installed); npm backend
`npm:playwright` / registry shorthand `playwright`; existing npm lockfile

**Storage**: N/A (no visitor data). Tool installs land in mise’s data dir
and Playwright’s browser cache (`~/.cache/ms-playwright`).

**Testing**: After implement, `mise install` + `mise run playwright:chromium`
then `npm run verify:hud`. No new test framework.

**Target Platform**: Local WSL/Linux (primary). CI may keep `setup-node`.

**Project Type**: Static Astro site + committed toolchain file

**Performance Goals**: Fresh tool install under 15 minutes (SC-001)

**Constraints**:
- Align with `016` actuals: `playwright@1.62.1`, Chromium only; `--with-deps` approved 2026-09-05
- No unused tools
- No secrets
- Constitution I–V, VII: no published JS, no tracking, no artist-guide mise

**Scale/Scope**: One `mise.toml`. Optional README one-liner. No `src/` changes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Static-First Delivery | Config only; published site unchanged | PASS |
| II. Zero-Cost, Zero-Ops Publishing | No paid service; CI not required to switch | PASS |
| III. Content-Code Separation | No artist content files | PASS |
| IV. Lightweight by Default | No published JS | PASS |
| V. Privacy & Legal Compliance | No tracking / cookies | PASS |
| VI. Simplicity & Spec-Driven Change | Pins only what `016` used | PASS |
| VII. Artist-Facing Change Documentation | Do not add mise to `docs/artist-guide.md` | PASS |

**Post-design re-check**: PASS — contract is a TOML file + tasks, not a
visitor API.

## Project Structure

### Documentation (this feature)

```text
specs/017-mise-toolchain/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── mise-toolchain.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
mise.toml           # NEW — committed toolchain (implement later)
.nvmrc              # KEEP — 24
package.json        # READ — playwright 1.62.1 already declared by 016
README.md           # OPTIONAL one-line mise pointer
docs/artist-guide.md  # DO NOT mention mise / HUD harness
```

**Structure Decision**: Single file at repo root. `mise.toml` not
`.mise.toml` (default, committed, no strong reason to hide it).

## Complexity Tracking

> No constitution violations.

| Topic | Why noted | Simpler alternative |
|-------|-----------|---------------------|
| Dual pin (mise + package.json) | mise CLI + ESM import for `016` | mise-only NODE_PATH rejected in `016` research |
