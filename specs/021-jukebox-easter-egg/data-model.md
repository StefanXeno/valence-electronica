# Data Model: Jukebox Easter Egg & Song-Select First

**Date**: 2026-09-18 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

No new content collections. Extends UI chrome and visit-only player surface
state. Catalog membership stays existing jukebox / stage entries (`010`
unchanged). Atmosphere media binding shape for dual videos is owned by
`022` — this model only requires opacity to that future shape.

## Entity: SongSelectionSurface

Default player body listing selectable stage/catalog tracks.

| Field / concern | Type | Notes |
| --------------- | ---- | ----- |
| `tracks` | derived list | Existing theme-track / jukebox-selectable entries |
| `activeTrackId` | string | Current stage entry id |
| `visibleByDefault` | boolean | **true** after this feature (both breakpoints’ default useful state) |

**Rules**: Single-track catalog still shows that one track (edge case).
Explicit visitor selection beats shuffle hop.

## Entity: NowPlayingSurface

Optional detail for the active track.

| Field / concern | Type | Notes |
| --------------- | ---- | ----- |
| `visibleByDefault` | boolean | **false** |
| `openControl` | chrome-backed control | Opt-in from selection (repurposed playlist toggle or equivalent) |

Reload / close → return to SongSelectionSurface.

## Entity: VinylControl

Quiet brand object; click/tap opens V-Flip easter egg.

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `accessibleName` | string | yes | From chrome (`jukeboxLabel` or dedicated `vinylLabel`) |
| `discovery` | enum | yes | `click-tap` only — not corner/konami/long-press-only |
| `primaryNav` | boolean | const false | Must not appear in `020` top menu |
| `requiredForSongChange` | boolean | const false | |

## Entity: VFlipEasterEgg

Alternate jukebox experience revealed from vinyl.

| Concern | Rule |
| ------- | ---- |
| Open path | Vinyl activate → open easter-egg drawer/experience |
| Default player | Remains song selection; easter egg must not trap visitor |
| Content | May reuse TrackInfoPanel / legacy list+detail sections |

## Entity: UiChrome (extended / retargeted)

File: `src/content/ui/chrome.md`

| Field | Role after 021 |
| ----- | -------------- |
| `currentlyPlayingLabel` | Optional now-playing header / control — **not** default rest title |
| `currentlyPausingLabel` | Optional pausing variant when now-playing visible |
| `jukeboxPanelTitle` | Prefer as **default selection** surface title (or add `songsTitle`) |
| `jukeboxLabel` | Vinyl / easter-egg accessible name (quiet; not top-nav CTA) |
| `playlistLabel` | May become “show now playing” / selection toggle label — retarget carefully |
| `stageButtonLabel` | Per-row play affordance if still shown |
| `shuffleLabel` / icons | Behavior retained; **look** owned by `022` |

New optional fields (if clearer than retargeting):

| Field | Default | Description |
| ----- | ------- | ----------- |
| `songsTitle` | `Songs` | Default selection surface title |
| `nowPlayingOpenLabel` | `Now playing` | Opt-in control to open NowPlayingSurface |
| `vinylLabel` | `Vinyl` / brand | Accessible name for vinyl control if distinct from `jukeboxLabel` |

## Entity: PlayerSurfaceState (visit-only)

Client memory only. No `localStorage`, no cookies.

| Field | Values | Default after 021 | Notes |
| ----- | ------ | ----------------- | ----- |
| `selectionVisible` | true/false | **true** (when player useful-open / desktop rest) | Replaces “playlist off = solo default” |
| `nowPlayingVisible` | true/false | **false** | Optional detail |
| `vflipEasterEggOpen` | true/false | **false** | Vinyl-opened experience |
| `expanded` (phone) | true/false | false until open | Open useful state shows selection |
| `shuffle` / mute / pause | existing | existing | FR-007 meanings preserved |

Map to existing DOM flags where practical (`is-theme-tracks`, `is-open`,
etc.) — implementer may invert flag meaning rather than rename classes.

## Entity: AtmosphereMediaRef (opaque)

| Rule | Value |
| ---- | ----- |
| Player UI | MUST NOT assume a single shared video file per track across viewports |
| Resolution | Deferred to stage-switch / `022` dual-video binding |
| Selection | Track identity + audio eligibility only |

## Validation

- Default rest screenshots: selection body visible; not Currently playing
  as primary body (SC-005).
- Vinyl hit target remains tappable with `020` top nav present.
- Reduced motion: selection + easter egg usable without motion-only cues.
