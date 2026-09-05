# Quickstart & Validation: Mise Project Toolchain

**Date**: 2026-09-05 | **Plan**: [plan.md](./plan.md)

**This feature is not implemented yet.** Validation applies after implement.

## Prerequisites

- mise installed by the operator
- Network for tool + Chromium downloads
- [contracts/mise-toolchain.md](./contracts/mise-toolchain.md)
- `016` already on this branch (`playwright@1.62.1`, `npm run verify:hud`)

## After implement

```bash
mise install
npm ci
mise run playwright:chromium   # ⚠️ --with-deps may sudo/apt
node -v                  # 24.x
playwright --version     # 1.62.1
npm run verify:hud
```

## Validation scenarios (017)

### US1 — Clone ready

1. Confirm `mise.toml` exists at repo root.
2. `mise install` provides Node 24 and Playwright CLI.

### US2 — Pins and no secrets

3. `node` pin is `24`; Playwright pin is `1.62.1`.
4. File has no tokens; `[tools]` has only Node + Playwright.

### US3 — 016 consumer

5. Missing-tool copy in `scripts/verify-hud.mjs` matches the task names.
6. After the remaining Chromium command, `npm run verify:hud` can run.

## Out of scope for this quickstart

- Implementing `mise.toml` in this pass
- `--with-deps`
- Migrating GitHub Actions to mise
