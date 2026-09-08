# Feature Specification: Player Animation Polish

**Feature Branch**: `018-player-animation-polish`

**Created**: 2026-09-06

**Status**: Draft — operator forks locked 2026-09-06; planning-ready

**Input**: User description: "IDEA-023 — Player animation polish (open/close,
    drag, Currently Playing ↔ V-Flip morph). Parked 2026-09-05 as a post-015
    follow-up, not leftover 015 scope. Start from the as-built 015 player
    pill. Do not invent a motion solution in the idea notes. Do not fold
    IDEA-024 (lift mobile HUD onto desktop) or IDEA-025 (spec shrink /
    overhaul). Operator design dump 2026-09-06: floor chrome always visible;
    transport stays above it; open/drag shows the current song as a card
    without a play button; playlist open grows to three songs; the current
    song occupies top, middle, or bottom; list order is release order;
    the three-row list can scroll."

## As-built baseline *(015 player, 2026-09-05)*

This feature starts from the shipping phone player. **018 changes the open
player sheet** (solo card, three-slot playlist window, shared-element morph).
It does **not** redesign the rest of the HUD.

On viewports **below 1024px**, the landing player is one floor-pinned pill:


| State                          | What the visitor sees today                                                                                                                                                                 | Motion today                                                                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Collapsed**                  | Now-playing row (soundwave, track label, mute) plus a small wide **up** arrow on the top edge                                                                                               | —                                                                                                                                              |
| **Open / close**               | Handle tap or handle drag grows or shrinks the **same** pill from the floor. Open **is** V-Flip. Arrow flips to **down** when open. Solo face: current theme-track card, no play button.     | Height travel with a settle after tap or after drag release. Drag past the open height rubber-bands, then snaps to the same height a tap uses. |
| **Currently Playing ↔ V-Flip** | Playlist on: header becomes **V-Flip aka. Jukebox**, **all** other theme-track cards appear, list can scroll. Playlist off: header returns to **Currently playing**, only the current card remains. Collapse turns playlist off. | The sheet and cards change together (today a slightly longer “pluck” than the content-dock open). Full-list height, not a three-row window.    |


**Unchanged from 015 (not this feature):** exclusive-open, mute-only volume,
no vinyl / no loop on phone, handle idle nod (3× / 60s), handle on the **top**
edge of the pill, content-dock morph, laptop HUD from 1024px up, shuffle /
pause / playlist **membership** meaning.

**This feature does change (vs earlier 018 “motion only” text):** the open
player **layout and interaction** for the solo card and the playlist face —
three visible rows, current-song slot, release-order window, sheet height
for three songs, and the shared-element morph into that window.

## Clarifications

### Session 2026-09-06

- Q: What should “finished” open/close feel like? → A: **Operator design
  dump is the intended open / playlist behavior** (not a leftover-jank
  defect list). Open/drag shows the current song as a card without a
  play button. Floor chrome (soundwave, name, mute) and transport
  (shuffle, play/pause, playlist) stay visible. Playlist open grows the
  sheet to three songs and moves the current card into top, middle, or
  bottom. Tap open/close **easing / timing** is a smaller leftover —
  reuse as-built travel unless the operator later names a feel change.
  Do **not** invent leftover-jank, overshoot, or double-settle defects.
- Q: What should handle drag feel like? → A: **Tighter / more 1:1 with
  the finger; less rubber-band (option B).** Mechanical tracking; easier
  to overshoot past the open-height cap than today’s stretchier follow.
- Q: What should Currently Playing ↔ V-Flip morph feel like? → A:
  **Shared-element / cross-fade (option C), now specified as the
  three-slot playlist story.** The open-state current card morphs into
  whichever of the three slots it will occupy; the other two rows
  enter/leave with the height grow. Phone player only (below 1024px).
- Q: When the theme-track catalog has fewer than three songs, what fills
  the playlist window? → A: **Always three rows.** The live catalog has
  more than three theme tracks. If a catalog is shorter than three,
  **pad placeholder rows** so the window still shows three slots.
  Placeholders are non-interactive: no tap-to-play, no play button, and
  MUST NOT look like a startable theme track.
- Q: May the current track leave the three-row window, and how should the
  open→playlist animation follow it? → A: **Yes — the current track may
  change position / leave the window.** They mean this primarily for the
  **open→playlist animation**. The shared-element morph is **dynamic**:
  the solo current card morphs into **whichever of the three slots**
  holds the current track at playlist-open time (FR-005 TOP / MIDDLE /
  BOTTOM for the **initial** window). Do **not** hardcode a single morph
  path; if the window would place current in a different slot, adapt.
  Collapse already resets playlist, so the next open is the solo card.
- Q: How do playlist rows play and show now-playing? → A: **Keep
  tap-to-play.** Only the **currently playing** row shows the **moving
  soundwave** (no play button). Other rows stay as today: **play button
  only**, no soundwave.
- Q: Does shuffle change the visible playlist order? → A: **No.**
  Shuffle on does **not** change playlist visual order. Shuffle only
  hops **which track plays next**. The list stays release order (newest
  first).
- Q: When playback hops to another track while playlist is open, should
  the three-row window re-center? → A: Operator answered **selection
  chrome**, not hop-windowing: the current row looks selected via the
  moving soundwave (no play button); other rows keep a play button —
  same as today / the playlist-row answer above. **Operator-adjacent
  default (not contradicted):** re-window **only** if the new current is
  **outside** the visible three-row window; if it is already visible,
  keep the window and move the soundwave only (avoids a tapped card
  jumping slot). Override if they meant hop-windowing instead.
- Q: If playlist is requested while open/close motion is still running,
  when does the playlist face apply? → A: **After the in-flight
  open/close finishes** (last-committed-action after settle).
- Q: When the visitor drag-closes from the three-row playlist face, what
  does the sheet do during the drag? → A: **Shrink the three-row
  sheet.** Do **not** morph back to the solo card mid-drag. Collapse
  still turns playlist off, so the next open is the solo card.
- Q: Does always-visible floor/transport chrome remove the handle? → A:
  **No. The handle stays** on the top edge. Always-visible chrome does
  not remove it.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Opening the player shows the current song as a card (Priority: P1)

A visitor on a phone expands the player pill (handle tap or equivalent).
The pill grows from the floor. They always see the **currently playing
song as a card**, **without a play button**. The **soundwave, playing
name, and mute** stay on the bottom and stay visible. **Shuffle,
play/pause, and playlist** stay above that floor row. The handle stays
on the top edge (up when collapsed, down when open) — always-visible
chrome does **not** remove it. Closing returns to the collapsed
now-playing face. Collapse turns playlist off, so the next open is this
solo card again.

Tap open/close **easing** is not a new feel bar — keep the as-built
travel unless the operator later names a change.

**Why this priority**: This is the face every visitor hits first. The
dump locks what that face contains.

**Independent Test**: On a phone-width viewport (~390×844), expand and
collapse the player with the handle several times. Confirm the open
face is the current theme-track card with no play button, floor chrome
and transport stay visible, the handle remains on the top edge, and the
pill ends at the tap open height or collapsed height. Repeat with
reduced motion: still toggles, without requiring travel animation.

**Acceptance Scenarios**:

1. **Given** the player pill is collapsed on a phone-width viewport and
   motion is allowed, **When** the visitor activates the handle, **Then**
   the pill grows from the floor into the open (V-Flip) position showing
   the **current song card without a play button**, with floor chrome
   (soundwave, name, mute) visible and transport (shuffle, play/pause,
   playlist) above that row, and the **handle still on the top edge**
   (FR-003, FR-011).
2. **Given** the player pill is open, **When** the visitor activates the
   handle, **Then** the pill collapses to the now-playing face and
   playlist is **off** for the next open.
3. **Given** reduced motion, a keyboard, or a screen reader, **When** the
   visitor expands or collapses, **Then** they still reach both positions
   without drag and without being required to wait through travel
   animation.
4. **Given** a viewport **1024px** wide or wider, **When** the visitor
   uses V-Flip, **Then** the laptop player motion and layout from `009` /
   `011` are unchanged.
5. **Given** open/close motion is still running, **When** the visitor
   turns playlist on, **Then** the playlist face is applied **after**
   that open/close settles (last committed action) — not mid-travel
   (FR-008).

---

### User Story 2 - Dragging the handle feels finished (Priority: P1)

A visitor drags the handle up to open and down to close. During
drag-open they see the **same solo current card** as a tap open (no
play button) — not the three-row playlist. The pill tracks the finger
**tighter / more 1:1** than today — more mechanical, with **less
rubber-band**. That makes it **easier to overshoot past the open-height
cap**. On release it settles to fully open or fully collapsed — the
same end states a tap uses. The drag does **not** feel like a broken
tap, a delayed catch-up, or a second animation fighting the finger.

Drag-close from the **three-row playlist face** **shrinks that sheet**.
It does **not** morph back to the solo card mid-drag. Collapse still
turns playlist off, so the next open is the solo card.

**Why this priority**: Drag is the other path into the same pill. Polish
that only fixes tap open/close leaves the player half-finished.

**Independent Test**: On a phone-width viewport, drag the handle up past
the open height and release; drag down to collapse; do a short drag that
should still count as a tap. Confirm end heights match tap, the open
face is the solo current card, overshoot past the cap is easier with
less rubber-band than today, and the in-drag / release feel matches
FR-004. Open playlist, then drag-close: the sheet shrinks from the
three-row face with no mid-drag morph to solo.

**Acceptance Scenarios**:

1. **Given** the player is collapsed and motion is allowed, **When** the
   visitor drags the handle up and releases, **Then** the pill ends at the
   **same** open height a handle tap uses, shows the **current song card
   without a play button**, and the drag tracks the finger tighter /
   more 1:1 with less rubber-band (FR-004).
2. **Given** the player is open on the solo card, **When** the visitor
   drags the handle down and releases, **Then** the pill ends collapsed
   (V-Flip closed) with the same feel bar as drag-open.
3. **Given** the visitor drags past the open height, **When** they
   release, **Then** the pill still settles to that same tap open height
   (no leftover bounce after settle). Rubber-band during the overshoot
   is **less** than today’s stretchier follow; overshooting the cap is
   **easier** (FR-004).
4. **Given** a movement too small to count as a drag, **When** the
   visitor lifts, **Then** the handle still toggles like a tap (drag is
   not required; a tiny slip does not steal the tap).
5. **Given** reduced motion or no drag, **When** the visitor uses the
   handle, **Then** open/close still works (User Story 1).
6. **Given** playlist is on (three-row face) and motion is allowed,
   **When** the visitor drags the handle down to close, **Then** the
   sheet **shrinks from the three-row face** and does **not** morph
   back to the solo card mid-drag; after collapse, playlist is off so
   the next open is the solo card (FR-004).

---

### User Story 3 - Playlist opens as a three-slot window around the current song (Priority: P1)

A visitor with the player already open turns playlist on. The sheet
**grows smoothly** to the height of **three songs**. The current card
**morphs dynamically** into **whichever of the three slots** holds the
current track at that moment (top, middle, or bottom per FR-005) — not
a single hardcoded path. The other two visible rows enter with that
height grow. The header switches from **Currently playing** to **V-Flip
aka. Jukebox**. The visible list is **release order** (newest first) —
not shuffle order. Shuffle only hops which track plays next. The
visitor can **scroll** the three-row viewport through the rest of the
list; the current song **may leave** the window. Only the **currently
playing** row shows the **moving soundwave**; other real rows show a
**play button** only. Tap-to-play stays. Turning playlist off reverses
the morph: the current card returns to the solo face, the extra rows
leave, the sheet shrinks, the header returns.

**Why this priority**: This is the morph story IDEA-023 / Q3 named. It
is the distinctive player motion and the layout change the dump asked
for.

**Independent Test**: Open the player (solo card). Toggle playlist on,
then off. Confirm exactly three rows are visible (real tracks, or real
tracks plus inert placeholders when the catalog is short), the current
song is in the correct slot, the morph is a shared-element / cross-fade
of that card into **that** slot (not one fixed path), and scroll can
reveal tracks outside the opening window when more than three real
tracks exist. Repeat when the current track is first, last, and
neither. Tap another visible real row to play it; confirm the soundwave
moves to that row and the window does not jump. Repeat with shuffle on:
visual order unchanged.

**Acceptance Scenarios**:

1. **Given** the player is open on the current card only and at least
   three theme tracks exist, **When** the visitor turns playlist on,
   **Then** the sheet grows to three-song height, exactly **three**
   rows are visible, the current card **morphs** into **whichever slot
   it occupies at that moment** (FR-005), the other two rows enter with
   the grow, and the header becomes **V-Flip aka. Jukebox**.
2. **Given** the current track is the **first** in release order,
   **When** playlist opens, **Then** that card occupies **top** and the
   window is [current, next, next+1] (placeholders fill any missing
   indices).
3. **Given** the current track is the **last** in release order and is
   not also first, **When** playlist opens, **Then** that card occupies
   **bottom** and the window is [prev-1, prev, current] (placeholders
   fill any missing indices).
4. **Given** the current track is **neither** first nor last, **When**
   playlist opens, **Then** that card occupies **middle** and the window
   is [prev, current, next].
5. **Given** playlist is on, **When** the visitor turns playlist off,
   **Then** only the current card remains, the header returns to
   **Currently playing**, and the reverse morph is the same
   shared-element / cross-fade into the solo card (FR-005).
6. **Given** playlist is on and more than three theme tracks exist,
   **When** the visitor scrolls the list, **Then** the three-row
   viewport moves through the release-order list; the current song
   **may leave** the window; the floor chrome still shows the playing
   name (FR-012).
7. **Given** reduced motion, **When** the visitor toggles playlist,
   **Then** both faces are still reachable without a required travel
   animation.
8. **Given** fewer than three theme tracks, **When** playlist opens,
   **Then** the window still shows **exactly three** rows: every real
   theme track plus **placeholder** rows; placeholders do not play, have
   no play button, and do not look like startable tracks (FR-015).
9. **Given** playlist is on, **When** the visitor looks at the rows,
   **Then** the currently playing row shows the **moving soundwave** and
   **no** play button; every other **real** row shows a **play button**
   and **no** soundwave; tapping a real row or its play control starts
   that track (FR-014).
10. **Given** playlist is on and shuffle is on, **When** the visitor
    reads the list or shuffle advances to another track, **Then** the
    visible order stays **release order (newest first)**; shuffle only
    changes which track plays next (FR-013).
11. **Given** playlist is on and playback hops to a track that is
    **already visible**, **When** the hop completes, **Then** the
    three-row window **does not** re-center; only the soundwave /
    selection chrome moves to the new current row (FR-016).
12. **Given** playlist is on and playback hops to a track **outside**
    the visible window, **When** the hop completes, **Then** the window
    re-applies FR-005 so the new current is visible in its slot
    (FR-016).

---

### Edge Cases

- **Reduced motion**: Open/close, drag release, and the playlist morph
  MUST NOT require travel animation. Handle tap still toggles. Drag MUST
  NOT become the only path. Idle handle nod from 015 stays off (that nod
  is not this feature). Playlist on still shows the three-slot window
  (placeholders pad a short catalog to three rows).
- **Mid-motion interrupt**: If the visitor taps the handle, starts a
  drag, or toggles playlist while a player motion is still running, the
  pill MUST end in a real open, collapsed, solo, or playlist face — not
  a stuck half-height or a mixed header. A playlist request during
  open/close is applied **after** that open/close finishes (last
  committed action after settle), so a mid-open playlist tap still
  lands on the three-slot face.
- **Exclusive-open**: Opening About / Discography / Tour / Socials /
  Info still collapses the player. That close MUST use the same close
  as the handle. Playlist turns off with collapse (as-built).
- **Click-outside**: Tapping outside the player still collapses V-Flip
  (015). Legal overlay still does **not** collapse the player behind it.
- **Resize across 1024px**: Crossing the phone / laptop line MUST NOT
  leave a half-morphed phone pill on the laptop HUD, or the reverse.
  Playlist on phone turns off when the viewport becomes laptop (as-built).
- **Short landscape / 320px**: Polish MUST NOT clip dock buttons or
  introduce horizontal page scroll. Three-row height MUST still fit
  under the existing sheet cap; if it cannot, the three-row viewport
  scrolls inside the capped sheet (floor chrome stays visible).
- **No scripting**: Collapsed docks still paint; handle expand, drag,
  and playlist morph still do not run (same accepted degradation as 015).
- **Fewer than three theme tracks**: The playlist viewport MUST still
  show **exactly three** rows. Missing slots are **placeholder rows**
  (FR-015). Do **not** duplicate a real song to fill a slot. The live
  catalog has more than three theme tracks; padding is the short-catalog
  / test-fixture rule. A single theme track: playlist on still uses the
  three-row sheet (current in **top**, two placeholders) and the header
  may still switch.
- **Very long track names / long playlist**: Truncation from 015 stays.
  Once playlist is open, the **three-row viewport** scrolls through the
  full release-order list.
- **Intro still showing**: Player chrome stays hidden until intro is
  dismissed; no polish motion runs on hidden chrome.
- **Shuffle hop while playlist is open**: Visual order stays release
  order. Re-apply the three-slot window **only** when the new current
  track is **outside** the visible window; if the new current is already
  visible, keep the window and move the soundwave / selection chrome
  only (FR-016, operator-adjacent).
- **Visitor picks another visible row**: Keep the window; do not snap
  the list so the new current jumps to a new slot. Playback / stage
  change meaning stays 015. The tapped row becomes current via
  soundwave selection chrome (FR-014).
- **Drag-close while playlist is open**: The sheet **shrinks from the
  three-row face** (do not morph back to the solo card mid-drag).
  Collapse still turns playlist off, so the next open is the solo card.
- **Playlist before the solo card has settled**: See mid-motion
  interrupt. Apply playlist after open/close settle. Do not flash
  dest-height rows for a frame.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: This feature MUST change **motion and the open-player
  sheet** on the as-built **015 phone player pill** (viewport width
  **below 1024px**): solo current card, three-slot playlist window,
  sheet height for that window, and the shared-element morph between
  those faces. It MUST NOT change exclusive-open rules, mute behavior
  (floor-row toggle, no slider), handle **placement** (top edge of the
  pill), control **set** (floor: soundwave / name / mute; transport:
  shuffle / play/pause / playlist), playlist **membership** (theme /
  stage tracks only), chrome label strings, or the 1024px laptop HUD.
- **FR-002**: The three surfaces in scope MUST be: **(1)** player
  open/close to the solo current card, **(2)** handle drag, **(3)**
  Currently Playing ↔ V-Flip (playlist on/off) three-slot morph.
  Content-dock morph, handle idle nod, desktop V-Flip open/close, and
  any HUD lift onto laptop MUST stay out of scope.
- **FR-003**: Player **open and close** MUST grow or shrink the same
  floor-pinned pill. The open face MUST be the **currently playing
  theme-track card without a play button**. Floor chrome and transport
  MUST stay visible (FR-011). After any open/close motion ends, the
  pill MUST sit at the tap open height (solo card) or the collapsed
  height. Collapse MUST turn playlist off so the next open is the solo
  card (as-built). Tap open/close **easing / timing** is **not** a new
  defect list — reuse as-built travel unless the operator later names
  a feel change. Do **not** invent leftover-jank, overshoot, or
  double-settle work.
- **FR-004**: When motion is allowed, handle **drag** MUST track the
  finger **tighter / more 1:1** than the as-built 015 follow, with
  **less rubber-band**. The feel is **more mechanical**. Overshooting
  past the open-height cap MUST be **easier** than today’s stretchier
  resistance. Drag-open MUST show the same **solo current card** as a
  tap (no play button), not the three-row playlist. Drag-close from the
  **three-row playlist face** MUST **shrink that sheet** and MUST NOT
  morph back to the solo card mid-drag. Tap open height and drag open
  height MUST still match. On release the pill MUST settle to the tap
  open height or the collapsed height with no leftover bounce. Drag
  MUST NOT be the only path to open or close. Scope is the phone player
  (viewport width **below 1024px**) only.
- **FR-005**: When motion is allowed, toggling playlist MUST read as
  **one** Currently Playing ↔ V-Flip morph: a **shared-element /
  cross-fade**. The open-state current card MUST morph into **whichever
  of the three slots** holds the current track at playlist-open time;
  the morph path MUST be computed from that slot (**dynamic** — MUST
  NOT hardcode a single TOP-only, MIDDLE-only, or BOTTOM-only path).
  The other visible rows MUST enter or leave with the sheet’s height
  grow (playlist on) or shrink (playlist off). Headers MUST cross-fade
  **Currently playing** ↔ **V-Flip aka. Jukebox**. The morph MUST NOT
  flash the other cards at their final size for a frame, and MUST NOT
  fly the current card over a neighbor.
  **Three-slot window** (always three visual rows; see FR-015 when
  `n < 3`): index the release-order list `0 … n-1` with `i` = current
  index. Missing indices (outside `0 … n-1`) are placeholder rows.
  - If `i === 0` (first, including `n === 1`): slot **TOP**, window
    `[i, i+1, i+2]`.
  - Else if `i === n-1` (last): slot **BOTTOM**, window `[i-2, i-1, i]`.
  - Otherwise: slot **MIDDLE**, window `[i-1, i, i+1]`.
  The settled playlist sheet height MUST fit those three rows (plus
  unchanged chrome). Collapse resets playlist, so the next open is the
  solo card and the next playlist-on uses this **initial-window**
  algorithm again. Scope is the phone player (viewport width
  **below 1024px**) only.
- **FR-006**: Reduced motion MUST still complete every primary task in
  User Stories 1–3 without drag and without required travel animation
  (same rule as 015).
- **FR-007**: Keyboard and screen-reader visitors MUST still expand /
  collapse via the handle and toggle playlist when the pill is open.
  Real playlist rows MUST remain operable; placeholder rows MUST NOT
  be operable (FR-015).
- **FR-008**: Rapid or overlapping input (second tap, drag during
  settle, playlist during open/close) MUST leave the player in a
  coherent end state (open or collapsed; solo or playlist) matching the
  last committed action. A playlist request while open/close motion is
  in flight MUST be applied **after** that open/close **settles**.
- **FR-009**: Crossing **1023px / 1024px** MUST tear down phone player
  motion so the laptop HUD does not inherit a mid-morph phone pill.
- **FR-010**: This feature MUST NOT add routes, third-party embeds,
  cookies, tracking, or new artist-editable surfaces. If no
  artist-visible HUD surface changes, artist-facing docs MUST NOT
  require an update.
- **FR-011**: While the player is open or being dragged, the
  **soundwave, currently playing name, and mute** MUST stay on the
  **bottom** of the pill and stay visible. **Shuffle, play/pause, and
  playlist** MUST stay **above** that floor row. The handle MUST stay
  on the **top** edge of the pill (015 placement). Always-visible floor
  and transport chrome MUST NOT remove the handle.
- **FR-012**: While playlist is on, the visible list MUST be a
  **three-row viewport** that can **scroll** through the full
  release-order theme-track list (placeholder rows do not add
  scrollable catalog). After the visitor scrolls, the current song MAY
  leave the viewport. The floor chrome MUST still show the playing
  track. Opening playlist MUST place the window so the remaining list
  is reachable in the direction(s) the current slot allows (first →
  scroll toward later rows; last → toward earlier rows; otherwise both
  ways).
- **FR-013**: The playlist’s **visual order** MUST be **release order,
  newest first** (same chronological default as the track catalog /
  discography). Shuffle MUST NOT reorder the visible list. Shuffle
  MUST only hop **which track plays next**. Pause and which entries
  are theme tracks MUST keep their 015 / 011 meaning.
- **FR-014**: Playlist rows MUST keep **tap-to-play** (activate a real
  row or its play control to play that track). The **currently
  playing** row MUST show the **moving soundwave** and MUST NOT show a
  play button (same selection chrome as today’s current row). Every
  other **real** row MUST show a **play button only** and MUST NOT show
  a soundwave.
- **FR-015**: When fewer than three theme tracks exist (`n < 3`), the
  playlist viewport MUST still show **exactly three** rows by padding
  **placeholder rows** for missing FR-005 window indices. A placeholder
  row MUST NOT start playback, MUST NOT accept tap-to-play, MUST NOT
  show a play button or soundwave, and MUST NOT present as a startable
  theme track (no playable title or control a visitor could use to start
  a song). Placeholders MUST NOT duplicate a real theme track. The live
  catalog has more than three theme tracks; this rule covers short
  catalogs and test fixtures.
- **FR-016**: While playlist is on, a playback hop (shuffle, natural
  advance, or tap-to-play) MUST move selection chrome per FR-014.
  **Operator-adjacent default:** re-apply the FR-005 three-slot window
  **only** if the new current track is **outside** the visible
  three-row window; if the new current is already visible, keep the
  window (do not snap a tapped card to a new slot).

### Key Entities

- **Player pill**: The floor-pinned phone player. Two positions —
  collapsed (now-playing) and expanded (V-Flip). Expanded has two
  faces: solo current card, and three-slot playlist.
- **Floor chrome**: Soundwave, playing name, mute — always at the
  bottom of the pill, always visible when the player is shown.
- **Transport**: Shuffle, play/pause, playlist — above the floor
  chrome when the pill is open.
- **Handle**: Top-edge arrow on the pill. Always-visible chrome does
  not remove it. Points up when collapsed, down when open.
- **Handle drag**: Finger or pointer travel on the top-edge arrow.
  Shares end heights with handle tap. Locked feel is tighter / more
  1:1 with less rubber-band (FR-004). Enhancement; never the only
  path. Drag-open shows the solo card, not the playlist. Drag-close
  from the playlist face shrinks the three-row sheet.
- **Currently Playing face**: Expanded player with playlist **off** —
  header `currentlyPlayingLabel`, current theme-track card only, **no
  play button** on that card.
- **V-Flip playlist face**: Expanded player with playlist **on** —
  header `jukeboxPanelTitle`, always-three-row window into the
  release-order theme-track list (placeholders pad a short catalog).
- **Three-slot window**: The visible playlist rows and the current
  song’s top / middle / bottom slot (FR-005). The current song MAY
  leave this window after scroll.
- **Placeholder row**: An inert padded slot used only when `n < 3`.
  Not a theme track; not operable; no play button; MUST NOT look
  startable.
- **Playlist morph**: The visitor-facing change between the two
  expanded faces. Locked feel is a **shared-element / cross-fade** of
  the current card into **whichever slot** it occupies at playlist-open
  time, with the other rows and sheet height traveling together.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On ~390×844, a reviewer can expand and collapse **5
  times** and report **0** opens that are not the current song card
  without a play button, **0** opens that hide floor chrome, transport,
  or the top-edge handle, and **0** cases where the pill does not end
  at tap open height or collapsed height. Open/close easing is **not**
  scored as leftover-jank / overshoot / double-settle.
- **SC-002**: On the same viewport, a reviewer can drag open past the
  cap and drag closed **3 times** and report **0** cases where the end
  height differs from a tap, **0** cases where the pill keeps bouncing
  after release, **0** drag-opens that show the three-row playlist
  instead of the solo card, **0** drag-closes from the playlist face
  that morph back to solo mid-drag, and that in-drag tracking feels
  **tighter / more 1:1** with **less rubber-band** than the as-built
  015 follow (FR-004).
- **SC-003**: On the same viewport, with at least three theme tracks, a
  reviewer can toggle playlist **on then off 3 times** — once with
  current = first, once current = last, once current = neither — and
  report the matching top / bottom / middle window from FR-005, a
  **shared-element / cross-fade** of the current card into **that**
  slot (not one hardcoded path), exactly **three** visible rows when
  playlist is on (before scroll), and **0** card jumps, overlaps, or
  one-frame flashes of the other cards already at their final size.
- **SC-004**: With reduced motion, the same reviewer completes expand,
  collapse, and playlist toggle in under **15 seconds** with **0**
  required travel animations and **0** drag requirement.
- **SC-005**: Keyboard-only on a narrow viewport can still: expand,
  collapse, read the current track name, and toggle playlist when
  shown. Real playlist rows remain operable; placeholder rows do not
  start playback.
- **SC-006**: On a 1280×800 viewport, a side-by-side check against
  current `009` / `011` finds **0** intentional player-motion or layout
  changes.
- **SC-007**: On a 320px-wide viewport, **0** new horizontal scrolling
  and **0** newly clipped dock buttons.
- **SC-008**: No new third-party embeds, cookies, or tracking.
- **SC-009**: With more than three theme tracks and playlist on, a
  reviewer can scroll until the current song is **out of** the
  three-row window and still read the playing name on the floor
  chrome.
- **SC-010**: With a fixture of **one** or **two** theme tracks,
  playlist on shows **exactly three** rows; activating a placeholder
  starts **0** tracks; placeholders show **0** play buttons and do not
  read as startable theme tracks (FR-015).
- **SC-011**: With playlist on, a reviewer reports the current row has
  the moving soundwave and **no** play button, every other real row has
  a play button and **no** soundwave, tap-to-play on a real row works,
  shuffle **on** leaves visual order as release order, a hop to a
  **visible** track does **not** re-window, and a hop to a track
  **outside** the window does re-window (FR-014, FR-013, FR-016).

## Assumptions

- IDEA-023 is **phone player only**. Laptop HUD stays `009` / `011`.
  Lifting phone HUD ideas onto desktop is **IDEA-024**, not this spec.
- Shrinking or overhauling player/HUD specs is **IDEA-025**, not this
  spec. This spec does not reopen 015 implementation or the 2026-09-01
  mock.
- Breakpoint stays **below 1024px = phone HUD** (015). This feature
  does not invent a new breakpoint.
- Open/close, drag, and playlist morph already exist. This feature
  raises their quality bar **and** changes the open-sheet layout to a
  three-slot playlist window. It does not add a new player mode.
- **Release order = newest first**, then title ascending on the same
  date. That default is already locked for the track catalog /
  discography (`010` / `014`). Today’s theme-track list uses the same
  sort. This spec does **not** invent a second chronology.
- Today’s shipped theme playlist has **four** stage tracks (newest →
  oldest: Show Me How, Nightmare, Taking Over, Infinite). Nightmare is
  the default stage, so a first playlist open on a fresh visit SHOULD
  place Nightmare in **middle** with [Show Me How, Nightmare, Taking
  Over] visible. Catalog-only discography rows stay **out** of this
  list (015).
- As-built **collapse turns playlist off**. The dump’s “when dragging
  or opening, always show the current card” matches that. Encoded, not
  changed.
- As-built solo card already **hides the play button / now-playing
  badge**. The dump keeps that for open and drag-open.
- **Locked this session (was recommended defaults):**
  - Fewer than three theme tracks → pad inert **placeholder rows** to
    keep exactly three slots (FR-015). Live catalog has more than three.
  - Playlist rows keep tap-to-play. Current row = moving soundwave, no
    play button. Other real rows = play button only, no soundwave
    (FR-014).
  - Visual list stays release order while shuffle is on; shuffle only
    hops which track plays next (FR-013).
  - After open, the visitor **may** scroll the current song out of the
    three-row window (FR-012). Open→playlist morph is dynamic into the
    current slot at that moment (FR-005).
  - Re-window on hop / track change **only** if the new current is
    outside the visible window; picking a visible row does not snap the
    window (FR-016, **operator-adjacent** — Q5 was answered as selection
    chrome, not hop-windowing).
  - Drag-close from the playlist face shrinks that face; it does not
    morph to solo mid-drag (FR-004).
  - Playlist requested during open/close is applied after that motion
    settles (FR-008).
  - Handle stays on the top edge; always-visible chrome does not remove
    it (FR-011).
- **FR-004** (drag feel + playlist drag-close) is **locked**. **FR-005**
  (three-slot shared-element morph, dynamic path) is **locked**.
  **FR-003** open **composition** is **locked**; open/close **easing**
  is a leftover, not a defect list.
- Placeholder **art** is not directed here. Acceptance is behavioral:
  inert, no play control, not startable. Visual treatment is a plan /
  implement choice as long as SC-010 holds.
- Content-dock ~320ms morph, handle idle nod, soundwave motion, and
  glitch treatments are **out of scope** unless the operator expands
  IDEA-023 later.
- Reduced-motion and no-JS degradation stay as in 015.
- Visual review is **operator-led**. Agents do not install browser
  automation or add packages for this feature.
- No new artist-editable strings or files; chrome labels stay where
  015 left them.

## Dependencies

- `015-mobile-stage-hud` — as-built phone player pill (start point).
- `011-vflip-now-playing` — V-Flip / Currently Playing meaning
  (playback rules unchanged).
- `010-track-catalog` / `014-discography-only-tracks` — newest-first
  release order; player list is theme / stage tracks only.
- `009-desktop-stage-ui` — laptop HUD must stay untouched.
- `006-landing-intro` — chrome hidden until intro is dismissed.

## Out of Scope

- Desktop / typical laptop HUD changes (IDEA-024)
- Spec shrink or overhaul of 015 / 009 / 011 / 004 / 010 / 014
  (IDEA-025)
- Reopening exclusive-open, the phone icon set, mute-as-slider, vinyl,
  loop, or the 2026-09-01 mock
- Moving the handle off the top edge, or moving mute off the floor row
- Content-dock open/close morph
- Handle idle nod timing or motion
- New routes, embeds, cookies, or artist-guide surfaces
- Playback rule changes (what shuffle **does** to advance, pause hold,
  which tracks are in the playlist)
- Invented leftover-jank / overshoot / double-settle open/close defects
- Placeholder-row visual art (behavior only; see FR-015 / SC-010)
