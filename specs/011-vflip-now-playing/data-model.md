# Data Model: V-Flip Now Playing

**Date**: 2026-08-28 (updated 2026-08-28) | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

No new content collections. Extends UI chrome and visit-only playback state.
Jukebox frontmatter fields from `004` / `010` are unchanged — **no** `durationSeconds`.

## Entity: JukeboxEntry (unchanged)

Existing fields unchanged (`004` / `010`). Dwell is derived at runtime from
`hasAudio` plus atmosphere video metadata (see below).

### Derived advance dwell

Used only when shuffle is on and loop is off:

| Condition | Dwell |
| --------- | ----- |
| `hasAudio === true` and playing atmosphere video with known `HTMLMediaElement.duration` | **video file duration** (seconds, from `loadedmetadata`) |
| `hasAudio === true` but no playable duration (poster/fallback only) | **45** seconds |
| `hasAudio === false` (no song / no audio) | **45** seconds |

Atmosphere `<video loop>` stays on for visual beds (see [research.md](./research.md) R6).

### Shuffle eligible pool (client)

| Visitor audio | Candidate ids for auto-hop |
| ------------- | -------------------------- |
| Muted | All catalog ids |
| Unmuted | Ids where pack allows mute playback (`hasAudio` + `audioEligible` + playing video) |

Manual selection is never filtered by this pool.

## Entity: UiChrome (extended)

File: `src/content/ui/chrome.md`

| Field | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `jukeboxPanelTitle` | string | yes (fallback) | `V-Flip aka. Jukebox` | Open drawer heading |
| `jukeboxPanelTooltip` | string | no | — | Optional hover on panel title |
| `listenOnLabel` | string | yes | `Listen On` | Prefix before platform icons in inline info |
| `shuffleLabel` | string | yes (fallback in code) | `Shuffle` | Accessible name |
| `loopLabel` | string | yes | `Loop` | Accessible name |
| `shuffleIcon` | string | no | token `shuffle` | HUD token or emoji |
| `loopIcon` | string | no | token `loop` | HUD token or emoji |
| `shuffleDefault` | boolean | no | `true` | Load-time shuffle |
| `loopDefault` | boolean | no | `false` | Load-time loop |
| `unmuteTooltip` | string | yes (fallback in code) | `Unmute` | Mute button tooltip when muted |
| `muteTooltip` | string | yes | `Mute` | Mute button tooltip when sound is on |
| `volumeSliderTooltip` | string | yes | `Drag to adjust volume` | Volume slider tooltip when visible |

Existing `releasedLabel`, `emptyTrackLinks`, `jukeboxLabel` (vinyl accessible name),
`lyricsTitle`, `trackInfoTitle`, `emptyLyrics` remain in chrome; lyrics titles are
not used in open V-Flip v1.

## Entity: HudIconToken (extended)

Add: `shuffle`, `loop`.

## Entity: PlaybackMode (visit-only, not persisted)

Client module state. Not a file. Reset on full reload.

| Field | Type | Meaning |
| ----- | ---- | ------- |
| `shuffle` | boolean | Auto-advance allowed when loop is off |
| `loop` | boolean | Pin current track; wins over shuffle |
| `activeId` | string | Current jukebox id (owned with `stage-switch`) |
| `advanceTimer` | timer id \| none | Cleared on pick, hop, shuffle-off, loop-on, unmount |
| `activeVideoDuration` | number \| null | Last known atmosphere video duration for active id |

### State transitions

```text
load ──► shuffle=chrome.shuffleDefault, loop=chrome.loopDefault
         clock starts after intro attributes clear

video loadedmetadata ──► store duration; if shuffle && !loop, restart clock with dwell

shuffle toggle ──► set flag; if now off, clear timer; if now on and loop off, restart clock
loop toggle    ──► set flag; if now on, clear timer; if now off and shuffle on, restart clock
manual pick    ──► applyStageEntry; restart clock if shuffle && !loop
advance fire   ──► if shuffle && !loop && ≥2 eligible ids ► pick other id ► crossfade
                   else ignore
```

## Entity: AtmosphereLayers

| Layer | Role |
| ----- | ---- |
| Current video | Visible atmosphere |
| Next video | Incoming hop target; opacity 0 until crossfade |

Handoff mode: `html[data-stage-crossfade="smooth"|"glitch"]` per [contracts/vflip-playback.md](./contracts/vflip-playback.md).

## Relationships

```text
UiChrome ──► PlaybackMode defaults + labels + panel title
JukeboxEntry.hasAudio + video.duration ──► dwell classifier
PlaybackMode + dwell + eligible pool ──► hop / stay / repeat
Active id ──► track-info nodes, list aria-pressed, mute slot visibility
```

## Validation rules

- `shuffleDefault` / `loopDefault` coerce to boolean; missing → true / false.
- Empty shuffle/loop labels → code fallbacks (`Shuffle` / `Loop`).
- Non-finite or missing video duration with `hasAudio` → fall back to 45s dwell.
