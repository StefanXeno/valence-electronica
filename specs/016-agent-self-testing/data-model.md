# Data Model: Agent Self-Testing

**Date**: 2026-09-05 | **Plan**: [plan.md](./plan.md)

No visitor persistence. Entities are the **verification run** and its
**flow results**. Expected HUD meaning is defined in as-built `015`, not
duplicated as a second product model.

## Entity: VerificationRun

One execution of the documented command.

| Field | Description |
|-------|-------------|
| `startedAt` | When the run began |
| `command` | Documented entry (e.g. `npm run verify:hud`) |
| `previewUrl` | Local origin used (dev or preview) |
| `phoneViewport` | Width ≤1023; review ~390×844 |
| `laptopViewport` | Width ≥1024; review ~1280×800 (when cheap path on) |
| `toolPath` | `playwright` (approved default) |
| `playwrightPresent` | Whether the `playwright` module / CLI resolved |
| `browserPresent` | Whether Playwright Chromium launched |
| `result` | `pass` / `fail` / `incomplete` |
| `artifactDir` | Folder the agent should open |

### Validation

- A run with `playwrightPresent = false` or `browserPresent = false`
  MUST NOT report phone layout flows as `pass`. Those flows are not
  silently passed. The run is `incomplete` or `fail`, and the report
  MUST name the mise-first install / `playwright install chromium` step.
- `incomplete` is for preview/port / missing-tool failures, not for a
  single flow fail (`fail` + named flow).

## Entity: FlowCase

One named HUD behavior the agent can score.

| Id | Viewport | Expected (as-built `015`) |
|----|----------|---------------------------|
| `phone-rest` | phone | Two docks; five content icons; no socials bar; no footer legal |
| `phone-tap-open` | phone | Expand === V-Flip; full current card; transport visible; no vinyl/loop |
| `phone-drag-open` | phone | Same open height as tap; floor-pinned; rubber-band then settle; no leftover overshoot |
| `phone-playlist` | phone | Current card stays; others add in; list scrolls; close does not jump |
| `phone-collapse` | phone | Drag-down or handle tap hides transport |
| `phone-mute-center` | phone | Mute right of floor row, vertically centered; no slider |
| `phone-content-info` | phone | Growing pill: About / Discography / Tour / Socials / Info; Info → legal overlay |
| `phone-pause-flatten` | phone | Video paused; soundwave flattened |
| `laptop-rest` | laptop | `019` HUD; no phone docks (cheap path) |

### Result values

| Status | Meaning |
|--------|---------|
| `pass` | Check or labeled artifact matches expected |
| `fail` | Check failed or artifact shows the regression |
| `skipped` | Inapplicable (e.g. mute not mounted) |

`not-covered` is **removed** as a happy-path status. With Playwright
approved, tap and drag MUST be driven (SC-008). Missing tools make the
**run** incomplete, not individual flows “not covered.”

### Validation

- `phone-drag-open` MUST be a real drag (Playwright mouse/touch). Do
  **not** mark it `pass` from tap-open screenshots alone.
- `phone-mute-center` is `skipped` when mute is not in the DOM.

## Entity: Artifact

| Field | Description |
|-------|-------------|
| `flowId` | Owning `FlowCase` |
| `kind` | `screenshot` / `report` / `json` / `trace` |
| `path` | Relative to `artifactDir` |
| `note` | Short caption the agent can read (e.g. “tap-open full card”) |

### Validation

- Filenames MUST include the flow id so SC-003 does not require opening
  every PNG.
- Artifacts MUST NOT be committed as goldens in v1 unless a later
  operator-approved change says so.

## Relationships

```text
VerificationRun
  ├── 1..n FlowCase results
  └── 0..n Artifact (usually ≥1 screenshot per covered visual flow)
```

## State transitions

```text
command start
  → resolve Playwright + Chromium
      → missing: print mise-first / playwright install chromium; exit incomplete
  → resolve preview (start or reuse)
  → set viewports, dismiss intro
  → for each FlowCase:
        act (tap / drag / click) → measure and/or screenshot → pass|fail|skipped
  → write report (+ optional traces on fail)
  → exit 0 iff no `fail` and tools were present
```

v1 exit policy: **`fail` or missing tools → non-zero**. `skipped` does
not fail the command. Document this in the report header.
