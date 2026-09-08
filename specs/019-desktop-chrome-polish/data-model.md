# Data Model: Desktop Chrome Polish

**Date**: 2026-09-08 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

No new content collections and no new `chrome.md` fields. Shuffle
**advance**, mute eligibility, theme-track membership, and legal
overlay stay `002` / `011` / `015`. This feature adds visit-only
**desktop chrome state** on the existing HUD.

## Entity: DesktopPlayer

Bottom-left laptop player (viewport **≥ 1024px**). Client memory only.
No `localStorage`, no cookies.

| Field | Values | Default | Notes |
| ----- | ------ | ------- | ----- |
| `chrome` | `open` | `open` | Always open. No collapsed vinyl state. |
| `currentTrackLabel` | string | Scheduled / default stage label | Visitor-facing card title (theme-track card, same as phone). |
| `playlistOpen` | `true` / `false` | `false` | Theme-track **card window** view-switched from the player. |
| `shuffleOn` | `true` / `false` | `chrome.shuffleDefault` | Existing visit-only toggle. |
| `loopOn` | `false` | `false` | No Loop control; MUST stay off on desktop. |
| `videoPaused` | `true` / `false` | `false` (after intro, if video can play) | Play/pause of atmosphere video. |
| `muted` | `true` / `false` | muted until visitor unmutes (as-built) | Slider visible only when unmuted. |
| `unmuteLevel` | 0–1 | `0.7` (today’s laptop default) | In-memory only; not shown. |

**Validation**

- No V-Flip / vinyl toggle field.
- Toolbar order is not data — it is chrome layout (Playlist, Shuffle,
  Play/pause, Mute).
- Resize to **≤ 1023px** tears down this rest-state; phone pill from
  `015` / `018` takes over (`playlistOpen` follows phone rules).

## Entity: DesktopContentBar

Bottom-right boxed icon bar (viewport **≥ 1024px**).

| Field | Values | Default | Notes |
| ----- | ------ | ------- | ----- |
| `icons` | About? , Discography, Tour, Info | About omitted if no content | No Socials. |
| `openPanel` | `none` / `about` / `discography` / `tour` / `info` | `none` | Exclusive among these four. |

**Validation**

- Opening one panel closes the others.
- `playlistOpen` MAY stay `true` while `openPanel !== none`.
- Social channels are **not** a bar icon; they stay the top-right
  `Channels` tree.

## Entity: InfoBox

Open face of `openPanel === info`. Same data as phone Info.

| Field | Source | Placement |
| ----- | ------ | --------- |
| `copyright` | `© {year} {site.artist.name}` (Valence) | **Top-right**, same row height as the Info heading |
| `imprintPill` | `chrome.imprintButton` | Opens existing legal overlay (`imprint`) |
| `privacyPill` | `chrome.privacyButton` | Opens existing legal overlay (`privacy`) |

**Validation**

- German legal markdown titles stay on the overlay, not on the pills.
- Landing footer cluster MUST NOT also be visible.

## Entity: TwoStageGrow

Visit-only motion state for **bar panels only**. Desktop playlist is
not a two-stage surface.

| Field | Values | Notes |
| ----- | ------ | ----- |
| `surface` | `bar` | Bottom-right content bar. |
| `phase` | `idle` / `width` / `height` | Sequential. Open: width then height. Close: height then width. |
| `directionOpen` | bar: left then up | Grow in place. |
| `directionClose` | bar: down then right | Reverse shrink. |
| `stageMs` | `280` | `SMOOTH_PANEL_PHASE_MS`. `0` if reduced motion. |

**Validation**

- MUST NOT slide the whole bar.
- MUST NOT run a single diagonal instead of two stages (unless
  reduced motion skips travel).
- Interrupt → settle to last committed open or closed; player chrome
  stays visible.
- Desktop playlist MUST NOT attach this sequencer.

## Entity: PlaylistViewSwitch

Visit-only desktop playlist face.

| Field | Values | Notes |
| ----- | ------ | ----- |
| `face` | `now-playing` / `jukebox` | Header + card list swap. |
| `height` | rest / grow-up | Height MAY rise **up only** so the list fits. No width animation. |

**Validation**

- MUST NOT grow/extend to the right.
- MUST NOT two-stage width-then-height.

## Relationships

```text
DesktopPlayer ──playlistOpen──► PlaylistViewSwitch
DesktopContentBar ──openPanel──► TwoStageGrow (bar)
DesktopContentBar.openPanel=info ──► InfoBox
DesktopPlayer.currentTrackLabel ◄── active stage (007 / 011)
InfoBox pills ──► Legal overlay (002)
```

## Artist-editable surfaces (unchanged files)

| Surface | File | 019 note |
| ------- | ---- | -------- |
| Artist name in © | `src/data/site.json` | Still one place |
| Info / legal pills | `src/content/ui/chrome.md` | `infoTitle`, `imprintButton`, `privacyButton` |
| Legal bodies | `src/content/legal/` | Overlay copy |
| Player labels | `src/content/ui/chrome.md` | `playlistLabel`, `shuffleLabel`, mute tooltips |

No new fields. `loopLabel` / `volumeSliderTooltip` remain in chrome
but are **not shown** on desktop.
