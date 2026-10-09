# Feature Specification: Stage Player & Song Switching

**Feature Branch**: `026-stage-player`

**Created**: 2026-10-05

**Status**: As-built (consolidated living spec)

**Updated**: 2026-10-06 — hidden stage player with song selection (folded in from `035`)

**Consolidates**: jukebox parts of `004-landing-content-layout`, `011-vflip-now-playing`,
playback parts of `013-codebase-hardening`, `015-mobile-stage-hud`,
`018-player-animation-polish`, `019-desktop-chrome-polish`, `021-jukebox-easter-egg`,
`035-hidden-stage-player`

**Input**: Consolidation of the "jukebox": the set of stage entries (songs bound to an
atmosphere and a theme), how the stage switches between them, the shuffle auto-advance,
and the hidden player that exposes song choice, shuffle, pause, and sound.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - The stage plays through Valence's songs (Priority: P1)

A visitor leaves the site open. With shuffle on (the default), the stage moves to another
song after the current one has played through — the atmosphere, theme, and sound change
together with a smooth handoff. The visitor never has to touch anything.

**Why this priority**: The stage is a jukebox; auto-advance makes the site feel alive
and exposes more of the catalog.

**Independent Test**: Load the landing, unmute, and wait one clip length; confirm a
different audio entry takes over with a crossfade and sound continues.

**Acceptance Scenarios**:

1. **Given** shuffle is on and at least two eligible entries exist, **When** the current
   entry's advance point is reached, **Then** a different random eligible entry takes over
   (no immediate repeat).
2. **Given** the current entry has audio and its video duration is known, **When** timing
   the advance, **Then** the advance point is one full video duration; otherwise it is 45
   seconds.
3. **Given** the visitor has unmuted, **When** picking the next entry, **Then** only
   entries with playable audio are eligible; while muted, all entries are eligible.
4. **Given** the atmosphere is paused, the landing intro is still running, or shuffle is
   off, **When** time passes, **Then** the stage does not advance.

---

### User Story 2 - Curious visitor discovers the hidden player (Priority: P1)

The stage starts clean — no player chrome. Tapping or clicking empty stage three times
quickly makes a vinyl record peek in from the bottom-left edge; tapping it opens the full
player. The first reveal in a browser shows a one-time achievement and is remembered:
later visits start with the small vinyl button.

**Why this priority**: The artist wants a clean stage; discovery is how newcomers find
the player.

**Independent Test**: Fresh browser at 390px and 1280px: tap empty stage three times
within ~1.5 s, tap the peeking vinyl, confirm the full player and the achievement toast;
reload and confirm the vinyl button is shown at rest.

**Acceptance Scenarios**:

1. **Given** a clean stage and no prior discovery, **When** the visitor taps/clicks empty
   stage 3 times within ~1.5 s, **Then** the vinyl peeks in with a short nudge and stays
   ~4 s; without a tap on it, it slides away.
2. **Given** the vinyl is peeking, **When** the visitor taps it, **Then** the full player
   opens; the first time in this browser an achievement toast appears.
3. **Given** taps land on navigation, overlays, links, controls, or during the intro,
   **When** counted, **Then** they do not count toward the hint.
4. **Given** a later visit in the same browser, **When** the landing loads, **Then** the
   player starts as the minimal vinyl button.

---

### User Story 3 - Fan picks a song and controls playback (Priority: P1)

The full player shows the song on stage, a list of all stage songs (cover + title,
current marked), shuffle, play/pause, and mute (plus volume slider on laptop). Closing it
collapses to the small vinyl in the corner, which spins while music plays.

**Why this priority**: Song choice and sound control without covering the stage.

**Independent Test**: Open the player, pick another song, toggle shuffle, pause, unmute;
close via X, Escape, and outside tap; reopen via the vinyl.

**Acceptance Scenarios**:

1. **Given** the full player, **When** the fan taps another song, **Then** it goes on
   stage with the manual-pick behavior (FR-010) and is marked current.
2. **Given** the full player, **When** the visitor closes it (close button, Escape, tap
   outside) or opens a content overlay / the phone menu, **Then** it collapses to the
   minimal vinyl.
3. **Given** the minimal vinyl, **When** music plays, **Then** it spins slowly (not when
   paused or with reduced motion).
4. **Given** keyboard navigation from a fresh browser, **When** the visitor tabs, **Then**
   a "Show player" button appears on focus and opens the full player; Escape returns
   focus to the vinyl.

---

### User Story 4 - Any UI puts a specific song on stage (Priority: P2)

A visitor who knows a track wants it on stage now. Picking an entry starts it immediately
with the same handoff as shuffle, keeps the sound preference, and restarts that entry's
advance clock. Shuffle state is not reset by a manual pick.

**Why this priority**: Fans come for specific songs; the stage should honor that.

**Independent Test**: Trigger a manual pick for a non-active entry; confirm the
atmosphere, theme, and "currently playing" markers update and the next shuffle advance is
timed from the pick.

**Acceptance Scenarios**:

1. **Given** a manual pick of another entry, **When** it is applied, **Then** atmosphere,
   theme, now-playing markers, and mute availability update together without a reload.
2. **Given** a pick of the already-active entry, **When** it is applied, **Then** nothing
   restarts.
3. **Given** several picks in quick succession, **When** handoffs overlap, **Then** the
   last pick wins and the stage never ends in a mixed state.

Entry points: the player song list and the discography play buttons (see `028`).

---

### Edge Cases

- Only one entry, or no other eligible entry → shuffle has nothing to advance to; the
  stage stays.
- A handoff involving the glitch-capable pack (Nightmare) → stepped ~720ms crossfade with
  an atmosphere glitch pulse; between calm packs → ~1000ms ease; reduced motion → instant
  swap.
- Video metadata events from the idle (next) video layer must not restart the active
  entry's clock.
- Corrupt stage catalog data in the page → the landing still works; switching is
  disabled.
- Reload → playback state (shuffle, loop, mute, picked entry) resets to content defaults
  and today's scheduled entry.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Stage entries MUST come from `src/content/jukebox/`; each requires `label`
  and `poster`, and MAY set `themeId`, `hasAudio`, `sources`, `default`, plus catalog
  fields (see `028`). The filename slug is the stable id.
- **FR-002**: Switching entries MUST update atmosphere media, theme pack, now-playing
  markers, and mute availability together, without a page reload, using the crossfade
  rules in Edge Cases.
- **FR-003**: Overlapping switches MUST resolve to the latest request without leaving the
  stage in an inconsistent state.
- **FR-004**: Shuffle MUST default from UI chrome (`shuffleDefault`, currently on) and
  MUST be a visit-only toggle.
- **FR-005**: Auto-advance MUST run only when scripting is available, shuffle is on, loop
  is off, playback is not paused, the intro is finished, and another eligible entry
  exists; it MUST follow the timing and eligibility rules of User Story 1.
- **FR-006**: Auto-advance MUST NOT start audio by itself and MUST preserve the visit's
  mute preference.
- **FR-007**: Loop (repeat current entry, wins over shuffle) MUST remain supported by the
  playback logic with `loopDefault` in UI chrome; there is no loop control.
- **FR-008**: The player MUST have four states: **hidden** (no chrome), **hint** (vinyl
  peeking at the bottom edge), **minimal** (vinyl-only corner button), **full** (title,
  stage song list, Shuffle, Play/Pause, Mute + volume slider on laptop, close). Phone
  (<1024px) and laptop use the same structure; only placement/size and the slider differ.
- **FR-009**: The player MUST start **hidden** unless the browser has discovered it
  (first-party `localStorage` key `ve-player-discovered`; blocked storage → hidden, and
  discovery lasts for the page load). Three taps/clicks on empty stage within ~1.5 s MUST
  move hidden → hint (controls, nav, overlays, the intro, and rub/spin gestures never
  count); pressing a discography play button (`data-stage-button`) while hidden MUST do
  the same; a tap on the peeking vinyl MUST open **full**; without it, hint returns to hidden
  after ~4 s. The first reveal MUST unlock the "player found" achievement (see `032`).
- **FR-010**: A manual pick MUST be requestable by any UI through one stage-select event
  (and by `data-stage-button` / `data-jukebox-option` controls); it MUST start the entry
  immediately and restart its advance clock without resetting shuffle.
- **FR-011**: The player MUST stay at the periphery; it MUST NOT cover the stage center.
  After ~4 s without input, the minimal vinyl and the closed achievement trophy fade out
  (any input, hover or keyboard focus brings them back; `src/lib/idle-fade.ts`).
  The minimal vinyl is the only chrome at rest (phone ~70px, about 1.5% of a 390×844
  viewport) and MUST keep its position when the player opens or closes.
- **FR-012**: The song list MUST show only stage songs (valid jukebox entries), newest
  release first; catalog-only tracks MUST NOT appear.
- **FR-013**: Closing the full player (close button, Escape, outside tap/click) or opening
  a content overlay / the phone menu MUST collapse it to **minimal**; activating the vinyl
  MUST open **full**.
- **FR-014**: A "Show player" button, visually hidden until keyboard focus and present only
  in the hidden state, MUST open the full player. On open, focus moves to the current
  song; on close, focus returns to the vinyl. All player labels come from UI chrome; the
  player shows its name (`jukeboxLabel`, V-Flip) and uses the display font.
- **FR-015**: Reduced motion MUST remove the peek slide, nudge, vinyl spin, and panel
  animation while keeping all states reachable.
- **FR-016**: Without JavaScript there is no player; the stage shows the static default.

### Key Entities

- **Stage entry (jukebox entry)**: id, label, theme id, `hasAudio`, poster, sources,
  `default` flag, catalog metadata.
- **Playback mode**: shuffle on/off, loop on/off, paused flag — all visit-only.
- **Advance clock**: per active entry; video duration for audio entries, 45 s otherwise.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Five picks within three seconds, repeated ten times, leave 0 stuck or mixed
  stage states.
- **SC-002**: With shuffle on and the page untouched, the stage advances within ±2 s of
  the expected advance point.
- **SC-003**: From the full player, switching to a specific song takes exactly one action.
- **SC-004**: On a first visit, 0 player pixels cover the stage at rest.

## Assumptions

- Songs are first-party audio muxed into the stage videos; there is no separate audio
  player or third-party embed.
- The player is called **V-Flip** in visitor copy (`jukeboxLabel`); "jukebox" survives in the
  content folder and code naming.

## Known Gaps *(as of 2026-10-06)*

- Exact hint visuals (peek depth, nudge, spin speed) were tuned without a broad device
  review; revisit after operator feedback.
- The achievement toast reuses the rub glyph; a dedicated vinyl glyph is open.
