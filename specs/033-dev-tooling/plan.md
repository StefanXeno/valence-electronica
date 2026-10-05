# Implementation Plan: Developer Tooling & Verification

**Branch**: `033-dev-tooling` | **Date**: 2026-10-05 | **Spec**: [spec.md](./spec.md)

**Input**: As-built consolidation — documents the shipped implementation; no new work.

## Source Map

| Concern | Files |
| ------- | ----- |
| Toolchain pins + tasks | `mise.toml`, `.nvmrc`, `package.json` (`engines`, scripts) |
| CI checks | `.github/workflows/check.yml` |
| Unit tests | `src/lib/*.test.ts` (vitest) |
| HUD verification | `scripts/verify-hud.mjs`, artifacts in `.verify-hud/` (gitignored) |
| Agent rules | `.claude/rules/operator-workflow.md`, `.cursor/rules/operator-workflow.mdc`, `.claude/settings.json` |
| Spec-kit | `.specify/` (integrations: `cursor-agent`, `claude`), `.claude/skills/speckit-*`, `.cursor/skills/speckit-*` |
| Dependency updates | Dependabot (TypeScript majors ignored) |
