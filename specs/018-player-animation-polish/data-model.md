# Data Model: Player Animation Polish

**Date**: 2026-09-06 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

No new content collections and no new `chrome.md` fields. Playback
membership, shuffle **advance**, and newest-first catalog sort stay
`010` / `011` / `014` / `015`. This feature adds visit-only **window**
and **pending-action** state on the existing phone player pill.

## Entity: PlayerPill (as-built, faces refined)

Floor-pinned phone player (`[data-player-dock]` / `[data-jukebox]`).
Client memory only. No `localStorage`, no cookies.

| Field | Values | Default | Notes |
| ----- | ------ | ------- | ----- |
| `expanded` | `true` / `false` | `false` | Expanded === V-Flip open (015). |
| `playlistOpen` | `true` / `false` | `false` | Theme-track list face. Collapse sets `false`. |
| `face` | `collapsed` / `solo` / `playlist` | `collapsed` | Derived: collapsed; expanded+off = solo current card; expanded+on = three-slot window. |

**Validation**

- Solo face: current theme-track card **without** a play button.
- Playlist face: always **three** visual rows (FR-015 pad when `n < 3`).
- Collapse → `playlistOpen = false` so the next open is solo.
- Laptop resize (`≥ 1024px`) → tear down phone motion; playlist off
  (as-built).

## Entity: ThreeSlotWindow

Computed from the release-order theme-track list. Source of truth for
the algorithm is [research.md](./research.md) R4 and FR-005.

| Field | Type | Description |
| ----- | ---- | ----------- |
| `n` | integer ≥ 0 | Count of **real** theme tracks (not placeholders). |
| `currentIndex` | integer | Index `i` of the current track in `0 … n-1`. `n === 0` has no current. |
| `slot` | `top` / `middle` / `bottom` | Where the current track sits in the opening window. |
| `indices` | length-3 tuple | Each entry is a real index in `0 … n-1` or `placeholder`. |

**Initial window (playlist-open / re-window)**

- If `i === 0` (including `n === 1`): `slot = top`, `[i, i+1, i+2]`.
- Else if `i === n-1`: `slot = bottom`, `[i-2, i-1, i]`.
- Else: `slot = middle`, `[i-1, i, i+1]`.
- Indices outside `0 … n-1` → `placeholder`.

**After visitor scroll**

- The **visible** window is whichever three rows intersect the
  three-row scrollport. Current **may** leave the window (FR-012).
- Floor chrome still shows the playing name.

**Hop / tap (FR-016)**

- If the new current **intersects** the scrollport → keep window;
  move selection chrome only.
- If it does **not** → recompute this entity for the new `i` and
  scroll so that window fills the viewport.

**Validation**

- Always three slots after playlist settles.
- Do not duplicate a real track to fill a slot.
- Visual order is release order (newest first). Shuffle MUST NOT
  rewrite `indices` order.

## Entity: PlaceholderRow

Used only when a window index is missing (`n < 3` or a computed
index is out of range).

| Field | Rule |
| ----- | ---- |
| Identity | `data-playlist-placeholder`. No `data-discog-item`. |
| Operable | No. Not in tab order. No tap-to-play. |
| Chrome | No play button, no soundwave, no startable title. |
| A11y | `aria-hidden="true"`. |
| Visual | Muted empty slot; MUST NOT look like a startable theme track. |
| Catalog | MUST NOT clone a real row. Does not add scrollable catalog. |

Live catalog has more than three theme tracks. This entity exists for
short catalogs and test fixtures (SC-010).

## Entity: PlaylistMorph

Visitor-facing change between solo and playlist faces.

| Field | Rule |
| ----- | ---- |
| Feel | Shared-element / cross-fade of the **current card** into `ThreeSlotWindow.slot`. |
| Path | Dynamic from `slot` — MUST NOT hardcode top-only / middle-only / bottom-only. |
| Companions | The other two **visible** rows enter/leave with sheet height. |
| Headers | Cross-fade `currentlyPlayingLabel` ↔ `jukeboxPanelTitle`. |
| Duration | `PLAYLIST_MORPH_MS` = **380** when motion allowed (as-built playlist timing). |
| Reduced motion | Instant face swap; no required travel. |
| Forbidden | One-frame dest-height flash; flying the current card over a neighbor. |

Collapse resets playlist; the next playlist-on uses the **initial**
window again.

## Entity: HandleDrag

| Field | As-built 015 | 018 |
| ----- | ------------ | --- |
| In-range follow | 1:1 `rawH` | Unchanged |
| `RUBBER` | `0.32` | **`0.78`** |
| `OVERSCROLL_PX_MAX` | `18` | **`40`** |
| `TAP_SLOP_PX` | `8` | Unchanged |
| `SNAP_PX` | `40` | Unchanged |
| `FLICK_PX_MS` | `0.45` | Unchanged |
| Drag-open face | Solo card | Solo card (not three-row) |
| Drag-close from playlist | Shrink current sheet | Shrink **three-row** sheet; no mid-drag solo morph |
| End heights | Tap open / collapsed | Same (solo tap height or 3-row tap height matching the face) |

**Validation**

- Drag MUST NOT be the only open/close path.
- After release: no leftover bounce; playlist off only after collapse
  **settles**.

## Entity: PendingPlayerAction

Visit-only queue for overlapping input (FR-008).

| Field | Values | Notes |
| ----- | ------ | ----- |
| `kind` | `playlist-on` / `playlist-off` / `none` | Last committed playlist request. |
| `blockedBy` | `open-close-morph` / `drag-settle` / `none` | Playlist applies only after this clears. |

**Validation**

- A playlist request while open/close is in flight MUST be stored, not
  dropped (as-built drop is the defect).
- Last tap wins if several arrive before settle.
- Do not apply playlist at dest height for a frame during open/close.

## Entity: PlaylistRowChrome (as-built, restated)

| Row kind | Play button | Soundwave | Tap-to-play |
| -------- | ----------- | --------- | ----------- |
| Current real theme track | Hidden | Moving `.discog__eq` | N/A (already current) |
| Other real theme track | Shown | Hidden | Yes (row or play control) |
| Placeholder | None | None | No |

Shuffle does not change this table or list order.

## Entity: UiChrome (unchanged)

No new fields. Reuse `playerExpandLabel`, `playerCollapseLabel`,
`playlistLabel`, `currentlyPlayingLabel`, `jukeboxPanelTitle`.
`jukeboxPanelTooltip` stays laptop-only.

## Relationships

```text
Theme-track catalog (newest first)
        │
        ▼
ThreeSlotWindow ──slot──► PlaylistMorph (dynamic path)
        │
        ├── real indices ──► Discography theme rows (FR-014 chrome)
        └── placeholder ──► PlaceholderRow (inert)

PlayerPill.expanded ──► solo | collapsed
PlayerPill.playlistOpen ──► playlist face + three-row height
HandleDrag ──► same end heights as tap; shrinks playlist sheet on close
PendingPlayerAction ──► playlist apply after open/close settle
Floor chrome ──► playing name even if current left the window
```

## State transitions

```text
collapsed --handle tap/drag open--> solo
solo --handle tap/drag close--> collapsed
solo --playlist (settled)--> playlist
playlist --playlist off--> solo
playlist --drag-close--> (shrink three-row) --> collapsed  [playlist off after settle]
any expanded --exclusive-open / click-outside--> collapsed  [same close as handle]
open/close in flight + playlist tap --> PendingPlayerAction --> playlist after settle
playlist + hop in-window --> chrome only
playlist + hop out-of-window --> re-apply ThreeSlotWindow
viewport ≥1024 --> teardown phone motion; playlist off
```

## Persistence

None. Reload starts collapsed. No cookies. No artist-editable files.
