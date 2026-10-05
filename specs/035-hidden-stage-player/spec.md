# Feature Specification: Hidden Stage Player with Song Selection

**Feature Branch**: `035-hidden-stage-player`

**Created**: 2026-10-06

**Status**: Draft

**Input**: User description: "Hidden stage player with song selection. Restore the ability
to pick a specific stage song while keeping the stage clean (artist request). Only stage
songs (entries with a video) are playable and listed; catalog-only tracks are never shown
in the player. The player is discovered through easter-egg style interaction: tapping the
screen a few times hints the player, and an active gesture reveals it fully. The player has
a minimal state — a single vinyl-record button — that keeps the stage unobstructed and
opens the full player. The full player shows the current song title, a song list of the
stage songs (selection first), shuffle, play/pause, and mute. Phone and desktop share one
player design with only small viewport differences. The discography play button puts a
stage song on stage (only shown for stage songs; hidden for catalog-only tracks); on phone
it closes the overlay, desktop behavior to be decided. Player discovery may unlock an
achievement (see IDEA-026 for a future easter egg overview page)."

**Amends**: `026-stage-player` (player chrome, manual pick entry points, phone player),
`028-music-catalog` (FR-008 play button), `032-easter-eggs` (new achievement)

## Clarifications

### Session 2026-10-06

- Q: Which active gesture reveals the full player from the hint? → A: A tap/click on the
  peeking vinyl.
- Q: Is a discovered player remembered across visits? → A: Yes, per browser; later visits
  start in the minimal vinyl state.
- Q: Desktop discography play — close or keep the overlay? → A: Close it, same as phone.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Curious visitor discovers the player (Priority: P1)

A visitor lands on a clean stage with no player chrome. Tapping (or clicking) the empty
stage a few times in quick succession makes a vinyl record peek in from the bottom edge for
a moment. Tapping or clicking the peeking vinyl brings up the full player. The first time
this happens, an achievement toast celebrates the find.

**Why this priority**: The artist wants a clean stage; discovery is the only way the player
appears for newcomers, so it must be reliable on phone and laptop.

**Independent Test**: On a fresh browser at 390px and 1280px, tap/click three times on
empty stage within about 1.5 s; confirm the vinyl peeks; tap/click the vinyl;
confirm the full player opens and the achievement toast shows once.

**Acceptance Scenarios**:

1. **Given** a clean stage and no player discovered, **When** the visitor taps or clicks
   empty stage area 3 times within ~1.5 s, **Then** the vinyl peeks in from the bottom
   edge with a short nudge animation and stays for ~4 s.
2. **Given** the vinyl is peeking, **When** the visitor taps or clicks it,
   **Then** the full player opens.
3. **Given** the vinyl is peeking, **When** ~4 s pass without a tap, **Then** it
   slides away and the stage is clean again.
4. **Given** the player is revealed for the first time in this browser, **When** it
   opens, **Then** a one-time achievement toast appears.
5. **Given** taps land on navigation, overlays, links, or other controls, **When**
   counted, **Then** they do not count toward the hint.

---

### User Story 2 - Fan picks a specific song (Priority: P1)

With the full player open, the fan sees the title of the song on stage and a list of all
stage songs (covers + titles). One tap on another song puts it on stage — atmosphere,
theme, and sound change together — and the list marks it as current.

**Why this priority**: This is the capability that is currently missing entirely.

**Independent Test**: Open the full player; confirm the current song title and all four
stage songs are listed; tap a different song; confirm it plays and is marked current.

**Acceptance Scenarios**:

1. **Given** the full player is open, **When** it renders, **Then** it shows the current
   song title, the list of stage songs (only entries with a stage video), shuffle,
   play/pause, and mute.
2. **Given** the list, **When** the fan activates a different song, **Then** that song
   goes on stage immediately with the existing handoff and the list marks it as current.
3. **Given** the stage changes by shuffle, **When** the player is open, **Then** the title
   and current marker update.
4. **Given** catalog-only tracks exist, **When** the list renders, **Then** none of them
   appear.

---

### User Story 3 - Player stays out of the way once found (Priority: P1)

After closing the full player, it collapses to its minimal state: a single small vinyl
button in a corner. The stage stays unobstructed. Tapping the vinyl opens the full player
again.

**Why this priority**: Clean stage and quick access must coexist once the visitor knows
the player.

**Independent Test**: Open, close, and reopen the player via the vinyl; confirm the
minimal state covers only the vinyl button and the center stays free.

**Acceptance Scenarios**:

1. **Given** the full player is open, **When** the visitor closes it (close control, tap
   outside, Escape), **Then** it collapses to the vinyl-only minimal state.
2. **Given** the minimal state, **When** the visitor activates the vinyl, **Then** the
   full player opens.
3. **Given** the minimal state, **When** music is playing, **Then** the vinyl spins
   slowly to signal playback (no spin when paused or with reduced motion).
4. **Given** a later visit in the same browser, **When** the landing loads, **Then** the
   player starts in the minimal state (the discovery is remembered).

---

### User Story 4 - Fan plays a song from the discography (Priority: P2)

In the discography, songs that have a stage video show a play button; others show none.
Pressing play puts that song on stage.

**Why this priority**: Connects the catalog to the stage with little extra UI.

**Independent Test**: Open Discography; confirm play buttons only on the four stage
songs; press one on phone and on laptop.

**Acceptance Scenarios**:

1. **Given** a catalog card for a stage song, **When** it renders, **Then** it shows a
   play button (or a "currently playing" marker when that song is on stage).
2. **Given** a catalog-only track, **When** its card renders, **Then** no play button
   appears.
3. **Given** a phone-width viewport, **When** the fan presses play, **Then** the song
   goes on stage and the overlay/menu closes so the stage change is visible.
4. **Given** a laptop-width viewport, **When** the fan presses play, **Then** the song
   goes on stage and the overlay closes, as on phone.
5. **Given** the player has not been discovered yet, **When** a song is played from the
   discography, **Then** the player is not forced open; it remains hidden.

---

### User Story 5 - Keyboard and assistive-technology users reach the player (Priority: P2)

Visitors who cannot tap or gesture can still reach the player: a control that is
invisible at rest becomes visible on keyboard focus and reveals the player; screen readers
find it as a normal button.

**Why this priority**: Constitution IV makes keyboard navigation mandatory; sound and song
choice must not be gesture-only.

**Independent Test**: Tab from the top of the page; confirm a "Show player" control
appears on focus and Enter reveals the full player; operate all player controls by
keyboard.

**Acceptance Scenarios**:

1. **Given** keyboard navigation, **When** the visitor tabs through the page, **Then** a
   "Show player" control becomes visible on focus and reveals the full player on
   activation.
2. **Given** the full player is open, **When** navigating by keyboard, **Then** song
   list, shuffle, play/pause, mute (and volume on laptop), and close are reachable and
   operable; Escape collapses to the minimal state.

---

### Edge Cases

- Reduced motion → hint appears and disappears without slide/nudge; vinyl does not spin;
  player opens without animation.
- Taps during the landing intro do not count; the hint waits until the intro has ended.
- Rub (discography) and Infinite spin gestures must not trigger the hint and vice versa;
  taps that start a rub or spin are not counted.
- Many rapid taps (> 3) while the vinyl is already peeking do not restart the animation in
  a loop; they extend the peek window once.
- Only one stage song → the list shows that one song; selection is a no-op.
- Player open + content overlay (Tour, Discography, …) opened from the nav → the player
  collapses to minimal so overlays are not stacked on phone.
- Storage blocked (private mode) → discovery and achievement work for the current page
  load only.
- Without JavaScript → no player (as today); the stage shows the static default.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The player MUST have four states: **hidden** (no chrome), **hint** (vinyl
  peeking at the bottom edge), **minimal** (vinyl-only button), and **full** (complete
  player).
- **FR-002**: On landing, the player MUST start **hidden** unless restored per FR-011.
- **FR-003**: Three taps/clicks on empty stage area within ~1.5 s MUST move hidden →
  hint; interactive elements, overlays, and gesture sessions (rub, spin) MUST NOT count.
- **FR-004**: From hint, a tap/click on the peeking vinyl MUST move to **full**. Without
  it, hint MUST return to hidden after ~4 s.
- **FR-005**: The full player MUST show the current song title, the list of stage songs
  (entries with stage video; cover + title; current marked), shuffle, play/pause, mute
  (plus volume slider on laptop widths), and a close control. Opening it MUST show the
  song list first (selection first), not a now-playing card.
- **FR-006**: Selecting a song in the list MUST use the existing manual-pick behavior
  (`026` FR-010): immediate handoff, shuffle state unchanged, advance clock restarted.
- **FR-007**: Closing the full player (close control, tap/click outside, Escape) MUST
  collapse it to **minimal**; activating the vinyl in minimal MUST open **full**.
- **FR-008**: The minimal vinyl MUST occupy only a small corner button (≤ ~48px visual
  size on phone, comparable on laptop), MUST NOT cover the stage center, and SHOULD spin
  slowly while music plays (not when paused or with reduced motion).
- **FR-009**: Phone (<1024px) and laptop (≥1024px) MUST use the same player structure and
  states; allowed differences: placement/size, phone mute-only vs laptop volume slider,
  and touch vs pointer input.
- **FR-010**: Catalog-only tracks MUST NOT appear in the player; discography play buttons
  MUST appear only for stage songs and MUST put that song on stage; on phone the
  overlay (laptop) or menu (phone) MUST close after play.
- **FR-011**: The first reveal MUST be remembered per browser; later visits MUST start in
  **minimal**. Persistence MUST use first-party `localStorage` only (constitution V); with
  storage blocked, discovery lasts for the current page load.
- **FR-012**: The first reveal in a browser MUST unlock a one-time achievement through the
  existing achievement toast; its title and subtitle MUST come from UI chrome content.
- **FR-013**: A keyboard-focusable "Show player" control MUST exist at rest, visually
  hidden until focused, that reveals the full player; all player controls MUST be keyboard
  operable with accessible names from UI chrome.
- **FR-014**: All new visitor-facing strings (show player, close, song list title,
  achievement copy) MUST live in `src/content/ui/chrome.md`; the artist guide MUST
  describe the player's discovery in one short paragraph (constitution III, VII).
- **FR-015**: Reduced motion MUST remove peek/nudge/spin/open animations while keeping all
  states reachable.
- **FR-016**: The dormant phone player implementation (`026` FR-009) MUST be removed or
  replaced by this player, so only one player implementation ships.
- **FR-017**: The feature MUST NOT add tracking, cookies, third-party code, or new
  dependencies.

### Key Entities

- **Player state**: hidden | hint | minimal | full; current visit only, plus optional
  discovery flag.
- **Stage song**: a jukebox entry with stage video (see `026`); the only songs listed.
- **Discovery flag / achievement**: first-party storage key marking the player as found.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At rest on first visit, 0 player pixels cover the stage; in minimal state the
  player covers less than 1% of a 390×844 viewport.
- **SC-002**: A visitor told "tap the stage three times" reaches the full player in under
  10 seconds on phone and laptop, on the first try in at least 4 of 5 attempts.
- **SC-003**: From the full player, switching to a specific song takes exactly one action.
- **SC-004**: A keyboard-only user reaches and operates the player in under 30 seconds.
- **SC-005**: 0 catalog-only tracks are offered for playback anywhere.
- **SC-006**: Only one player implementation is shipped (dormant phone player removed).

## Assumptions

- Stage songs are the four jukebox entries with video; adding a song stays a content edit.
- The hint uses the vinyl as the brand object (artist idea); exact visuals are a plan-time
  design choice and need operator review in the browser.
- Shuffle keeps auto-advancing while the player is hidden (as today); audio stays muted
  until the visitor unmutes in the full player.
- The achievement overview page is out of scope (IDEA-026).
- Browser-based visual verification is done by the operator (agent rules).
