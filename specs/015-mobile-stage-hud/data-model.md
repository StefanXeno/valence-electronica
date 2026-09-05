# Data Model: Mobile Stage HUD

**Date**: 2026-09-02 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

**As-built sync**: 2026-09-05.

No new content collections. Extends UI chrome and visit-only **player-dock
position**. Laptop playback flags stay as specified in `011`. Channel URLs
stay in `src/data/site.json`.

## Entity: UiChrome (extended)

File: `src/content/ui/chrome.md`

| Field | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `playerExpandLabel` | string | no | `Show player controls` | Accessible name of the handle when collapsed |
| `playerCollapseLabel` | string | no | `Hide player controls` | Accessible name of the handle when expanded |
| `socialsIcon` | string | no | token `socials` | HUD token or emoji for the socials trigger |
| `infoTitle` | string | no | `Info` | Accessible name / sheet title for the circled-i control |
| `infoIcon` | string | no | token `info` | HUD token or emoji for Info |
| `imprintButton` | string | no | `Imprint` | English HUD pill that opens the legal overlay |
| `privacyButton` | string | no | `Privacy Policy` | English HUD pill that opens the legal overlay |
| `playlistLabel` | string | no | `Playlist` | Accessible name of the phone playlist control |
| `currentlyPlayingLabel` | string | no | `Currently playing` | Phone expanded-player header while playlist is **off**; also the discography now-playing indicator name |
| `jukeboxPanelTitle` | string | no | `V-Flip aka. Jukebox` | Phone expanded-player header while playlist is **on** |
| `jukeboxPanelTooltip` | string | no | Pick-a-track copy | **Laptop only.** Must not appear as a phone title / tooltip |

Existing `socialsLabel` is the socials trigger accessible name.
Handle / Info / legal / playlist labels MUST be editable without layout
code (FR-017).

## Entity: HudIconToken (extended)

Add / use on phone: `socials`, `info`, `play`, `pause`, `playlist`.
Existing tokens unchanged.

## Entity: PlayerDockPosition (visit-only)

Client memory only. No `localStorage`, no cookies.

| Field | Values | Default | Notes |
| ----- | ------ | ------- | ----- |
| `expanded` | `true` / `false` | `false` (collapsed) | Reset on reload. **Expanded === V-Flip open.** Independent of shuffle. |
| `exclusiveSheet` | `none` / `about` / `discography` / `tour` / `socials` / `info` / `vflip-list` | `none` | Below 1024px only. `vflip-list` is the expanded player pill. |
| `playlistOpen` | `true` / `false` | `false` | Theme-track list inside the open player. Visit-only. |
| `playerPaused` | `true` / `false` | `false` | `html[data-player-paused]` — wave flatten + shuffle hold |

Handle hit target: ≥ **44×24px** (FR-006a).

Resize to ≥ 1024px: stop drag/hint (`matchMedia` teardown); do not require
collapsing (laptop CSS hides phone-only chrome). Resize back below 1024px:
restore collapsed unless the handle was left expanded this visit.

## Entity: NowPlayingLabel (derived)

| Input | Output |
| ----- | ------ |
| Active jukebox `label` | That string (trimmed) on the collapsed floor |
| Expanded, playlist off | `currentlyPlayingLabel` as the sheet title |
| Expanded, playlist on | `jukeboxPanelTitle` as the sheet title |
| `themeId` only | **Never** shown |
| `jukeboxPanelTooltip` | **Never** on phone |

Ellipsis in the visual slot. No native `title` on phone.

## Entity: HandleHint (client)

| Rule | Value |
| ---- | ----- |
| Nods per burst | **3** |
| Pause between bursts | **60** seconds |
| Runs when | landing ready (no intro pending/active), width ≤ 1023px, motion allowed, **collapsed or expanded** |
| Persistence | none |

## Entity: PhoneVolume (client)

| Rule | Value |
| ---- | ----- |
| Unmuted level | **0.5** (50%) |
| Slider | hidden below 1024px |
| Floor mute when current `hasAudio: false` | **shown** (layout slot stays) |
| Catalog has no audio entries | mute control may be omitted from the DOM |

## Relationships

```text
UiChrome ──handle labels──► PlayerDock handle
UiChrome ──socialsIcon────► Content pill socials trigger
UiChrome ──info* / legal──► Info sheet + overlay pills
UiChrome ──playlistLabel──► Phone playlist control
site.json channels ───────► Content sheet (same list as laptop; parked)
JukeboxEntry.label ───────► NowPlayingLabel (floor)
PlayerDockPosition ───────► V-Flip open (expanded is the sheet)
exclusiveSheet ───────────► About | Discography | Tour | Socials | Info | V-Flip
theme-track rows ─────────► Player playlist (not full catalog)
```

## Validation

- Missing chrome handle / Info / legal / playlist labels → code fallbacks
  (English defaults above).
- Unknown `socialsIcon` / `infoIcon` token → fallback token + console warn
  (same pattern as `hud-icons.ts`).
- No About content → About control omitted; pill stays boxed.
- Coming-soon channels → not followable (existing `004` rule).
