# Data Model: Mise Project Toolchain

**Date**: 2026-09-05 | **Plan**: [plan.md](./plan.md)

No visitor persistence. Entities are the **toolchain file** and its
**pins / tasks**.

## Entity: ToolchainFile

| Field | Description |
|-------|-------------|
| `path` | `mise.toml` at repo root |
| `tools` | Map of tool id → version |
| `tasks` | Named commands operators/agents run |
| `secrets` | MUST be empty |

### Validation

- Filename is `mise.toml`, not `.mise.toml`
- Comments are English
- No env vars that embed tokens

## Entity: ToolPin

| Id | Version | Source of truth |
|----|---------|-----------------|
| `node` | `24` | `.nvmrc`, CI |
| `npm:playwright` | `1.62.1` | `package.json` / `016` lockfile |

### Validation

- Playwright pin MUST equal the `package.json` `devDependency`
- No other `[tools]` entries in v1

## Entity: MiseTask

| Id | Command | When |
|----|---------|------|
| `playwright:chromium` | `playwright install --with-deps chromium` | After `mise install`; remaining browser + OS libs |
| `setup` (optional) | `npm ci` then Chromium task | Full clone bootstrap |

### Validation

- Chromium task MUST pass `--with-deps` (operator-approved; ⚠️ sudo/apt)
- Task names MUST match `016` missing-tool copy (`mise run playwright:chromium`)

## Relationships

```text
ToolchainFile
  ├── 1..n ToolPin
  └── 1..n MiseTask
         └── playwright:chromium  →  016 verify:hud
```

## State transitions

```text
clone
  → mise install          # Node 24 + Playwright CLI
  → npm ci                # Astro / vitest / playwright module
  → mise run playwright:chromium
  → npm run verify:hud    # 016
```
