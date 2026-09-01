# Data Model: Mobile Stage HUD

**Date**: 2026-09-02 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

No new content collections. Extends UI chrome and visit-only **player-dock
position**. Playback flags stay as specified in `011`. Channel URLs stay in
`src/data/site.json`.

## Entity: UiChrome (extended)

File: `src/content/ui/chrome.md`

| Field | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `playerExpandLabel` | string | no | `Show player controls` | Accessible name of the handle when collapsed |
| `playerCollapseLabel` | string | no | `Hide player controls` | Accessible name of the handle when expanded |
| `socialsIcon` | string | no | token `socials` | HUD token or emoji for the socials trigger |

Existing `socialsLabel` is the socials trigger accessible name / tray label.
Existing `currentlyPlayingLabel` stays for discography rows (`014`); the
collapsed now-playing **center** uses the active jukebox `label`, not this
prefix.

Handle labels MUST be editable without layout code (FR-017).

## Entity: HudIconToken (extended)

Add: `socials` (connected-nodes / share glyph). Existing tokens unchanged.

## Entity: PlayerDockPosition (visit-only)

Client memory only. No `localStorage`, no cookies.

| Field | Values | Default | Notes |
| ----- | ------ | ------- | ----- |
| `expanded` | `true` / `false` | `false` (collapsed) | Reset on reload. Independent of shuffle/loop. |
| `exclusiveSheet` | `none` / `about` / `discography` / `tour` / `vflip-list` / `socials` | `none` | Below 1024px only |

Handle hit target: ≥ **44×24px** (FR-006a).

Resize to ≥ 1024px: stop swipe/hint (`matchMedia` teardown); do not require collapsing (laptop CSS
hides phone-only chrome). Resize back below 1024px: restore collapsed unless
the handle was left expanded this visit.

## Entity: NowPlayingLabel (derived)

| Input | Output |
| ----- | ------ |
| Active jukebox `label` | That string (trimmed) |
| Future optional theme display name ≠ `label` | `{label} / {themeDisplayName}` |
| `themeId` only | **Never** shown |

Ellipsis in the visual slot; full string remains for assistive tech.

## Entity: HandleHint (client)

| Rule | Value |
| ---- | ----- |
| Nods per burst | **3** |
| Pause between bursts | **60** seconds |
| Runs when | landing ready (no intro pending/active), collapsed, width ≤ 1023px, motion allowed |
| Persistence | none |

## Relationships

```text
UiChrome ──handle labels──► PlayerDock handle
UiChrome ──socialsIcon────► Content dock socials trigger
site.json channels ───────► Socials tray (same list as laptop)
JukeboxEntry.label ───────► NowPlayingLabel
PlayerDockPosition ───────► transport visibility (not a sheet)
exclusiveSheet ───────────► About | Discography | Tour | V-Flip list | Socials
```

## Validation

- Missing chrome handle labels → code fallbacks (English defaults above).
- Unknown `socialsIcon` token → fallback `socials` + console warn (same
  pattern as `hud-icons.ts`).
- No About content → About control omitted; dock stays boxed.
- Coming-soon channels → not followable (existing `004` rule).
