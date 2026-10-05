# Data Model: Hidden Stage Player with Song Selection

**Feature**: `035-hidden-stage-player` | **Date**: 2026-10-06

## Player state (client, per page load)

| Field | Type | Notes |
| ----- | ---- | ----- |
| `state` | `'hidden' \| 'hint' \| 'minimal' \| 'full'` | Exposed as `data-player-state` on the player root |
| `discovered` | boolean | From `ve-player-discovered` (false if storage blocked) |

### Transitions (`player-state.ts`, pure reducer)

| From | Event | To | Side effects |
| ---- | ----- | -- | ------------ |
| hidden | `TAP_HINT` (3 taps ≤ 1.5 s) | hint | start 4 s hint timer |
| hint | `HINT_TIMEOUT` | hidden | — |
| hint | `TAP_HINT` | hint | extend timer once (no animation restart) |
| hint | `ACTIVATE_VINYL` | full | mark discovered, unlock achievement (first time) |
| hidden | `KEYBOARD_REVEAL` | full | mark discovered, unlock achievement (first time) |
| minimal | `ACTIVATE_VINYL` | full | — |
| full | `CLOSE` (button, Escape, outside click) | minimal | focus vinyl |
| full | `OVERLAY_OPENED` | minimal | — |
| boot | `discovered === true` | minimal | — |
| boot | `discovered === false` | hidden | — |

Any other event is a no-op. Reduced motion changes presentation only, not transitions.

## Tap hint counter (`tap-hint.ts`, pure)

| Field | Value |
| ----- | ----- |
| `taps` | timestamps of qualifying taps (max 3 kept) |
| Window | 1,500 ms between first and third tap |
| Tap qualifier | pointer moved < 10 px between down and up |

Returns `true` on the third qualifying tap inside the window, then resets.

## Storage keys (first-party `localStorage`)

| Key | Value | Written when |
| --- | ----- | ------------ |
| `ve-player-discovered` | `'1'` | first transition into `full` |
| `ve-achievement-player-found` | `'1'` | via `maybeUnlockAchievement` (existing helper) |

## Stage song (list item, build time)

From valid jukebox entries (`getBackgroundConfig().videos`):

| Field | Source |
| ----- | ------ |
| `id` | filename slug |
| `label` | `label` |
| `cover` | `cover` → `poster` fallback |
| `sortDate` | ordering (newest first, then label) |

## UI chrome fields (`src/content/ui/chrome.md`)

New (all optional with code fallbacks):

| Field | Default |
| ----- | ------- |
| `playerShowLabel` | `Show player` |
| `playerOpenLabel` | `Open player` |
| `playerCloseLabel` | `Close player` |
| `playerAchievementTitle` | `Found it!` |
| `playerAchievementSub` | `You discovered the hidden player.` |

Reused: `songsTitle`, `currentlyPlayingLabel`, `shuffleLabel`, `unmuteTooltip`,
`muteTooltip`, `volumeSliderTooltip`, `stageButtonLabel`.

No longer used after this feature (kept in schema, removed from `chrome.md`):
`jukeboxLabel`, `jukeboxPanelTitle`, `jukeboxPanelTooltip`, `jukeboxIcon`,
`playerExpandLabel`, `playerCollapseLabel`, `vinylLabel`, `playlistLabel`, `loopLabel`,
`loopIcon`, `nowPlayingOpenLabel`, `trackInfoTitle`, `trackInfoIcon`, `emptyTrackLinks`,
`currentlyPausingLabel`.
