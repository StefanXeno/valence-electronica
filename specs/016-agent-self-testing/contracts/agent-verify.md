# Contract: Agent HUD verification command

**Date**: 2026-09-05 | **Plan**: [../plan.md](../plan.md) | **Spec**: [../spec.md](../spec.md)

This is a **developer/agent CLI contract**, not a visitor API.

## Command

Proposed (implementation MAY bikeshed the script name, not the meaning):

```bash
npm run verify:hud
```

Optional flags (if cheap):

| Flag | Meaning |
|------|---------|
| `--phone-only` | Skip laptop viewport |
| `--laptop-only` | Skip phone flows |
| `--skip-unit` | Do not compose `npm test` / `check` |

Default: phone + cheap laptop + existing unit/type checks.

## Inputs

- Repo root as cwd
- Existing `package.json` scripts (`test`, `check`, `dev`, `preview`, `build`)
- Mise-provided Node 24 + Playwright 1.62.1 (see `017`)
- No new environment secrets
- Preview URL default: local Astro origin (document the port)

## Outputs

1. **stdout**: one line per `FlowCase` (`pass` / `fail` / `skipped`)
   plus a final summary.
2. **artifact directory** (gitignored): labeled PNGs, `report.md`,
   optional `trace.zip` on fail.
3. **exit code**: `0` if no `fail` and tools were present; non-zero if
   any `fail` or Playwright/Chromium is missing.

## Phone viewport (required)

- Width **≤ 1023px**. Review size **~390×844**.
- Intro dismissed or equivalent so docks are visible.
- Expected chrome: as-built `015` (see research R4).

## Laptop viewport (cheap path)

- Width **≥ 1024px**. Review size **~1280×800**.
- Expected: `009` / `011` laptop HUD. Unmute MAY show a slider.

## Flow actions the harness MUST drive

When Playwright Chromium is available:

| Flow | Minimum action |
|------|----------------|
| `phone-rest` | Load landing, chrome visible, screenshot |
| `phone-tap-open` | Activate player handle (tap); screenshot + measure open height |
| `phone-drag-open` | Real drag from collapsed handle; same open height as tap; no leftover overshoot |
| `phone-playlist` | Open playlist; screenshot; confirm current card still present |
| `phone-collapse` | Close via handle tap or drag-down; transport gone |
| `phone-mute-center` | Measure mute vs now-playing row vertical center |
| `phone-content-info` | Open Info; screenshot; open Imprint or Privacy overlay |
| `phone-pause-flatten` | Pause; assert flatten class or bar heights |
| `laptop-rest` | Second context at 1280×800; screenshot |

`phone-drag-open` is **required**. Do **not** mark it `pass` without a
real Playwright drag.

## Forbidden

- `npm install` of Puppeteer, jsdom, extra browsers, or any **undeclared**
  package
- Importing the harness from visitor pages
- Writing cookies / analytics
- Editing `specs/015-mobile-stage-hud/`
- Instructing the artist to run this command in `docs/artist-guide.md`

## Failure copy (required phrases)

When Playwright or Chromium is missing, stdout MUST include:

- that HUD verification could not run
- that tools are installed **mise-first** (`mise install`)
- that browsers need the remaining command
  (`mise run playwright:chromium` or `playwright install chromium`)

When a flow fails, stdout MUST include the **flow id** (FR-010).
