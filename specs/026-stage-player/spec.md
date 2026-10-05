# Feature Specification: Stage Player & Song Switching

**Feature Branch**: `026-stage-player`

**Created**: 2026-10-05

**Status**: As-built (consolidated living spec) — with open product gaps, see Known Gaps

**Consolidates**: jukebox parts of `004-landing-content-layout`, `011-vflip-now-playing`,
playback parts of `013-codebase-hardening`, `015-mobile-stage-hud`,
`018-player-animation-polish`, `019-desktop-chrome-polish`, `021-jukebox-easter-egg`

**Input**: Consolidation of the "jukebox": the set of stage entries (songs bound to an
atmosphere and a theme), how the stage switches between them, the shuffle auto-advance,
and the player chrome that exposes shuffle, pause, and sound.

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

### User Story 2 - Visitor controls playback from a compact player (Priority: P1)

On a laptop, a compact pill at the bottom-left holds a decorative vinyl, a shuffle toggle,
play/pause, and mute with volume slider. The pill is always visible and never changes
width when sound is toggled.

**Why this priority**: Minimal, always-available control over the stage without covering
the center.

**Independent Test**: At 1280×800, toggle shuffle, pause, resume, unmute, and drag volume;
confirm each control works by mouse and keyboard and the pill width never changes.

**Acceptance Scenarios**:

1. **Given** a laptop-width viewport, **When** the landing is ready, **Then** the player
   pill shows vinyl (decorative, not interactive), Shuffle, Play/Pause, and Mute in that
   order at the bottom-left.
2. **Given** shuffle is toggled, **When** its state changes, **Then** its pressed state is
   obvious and auto-advance starts or stops accordingly.
3. **Given** the active entry has no audio, **When** the player renders, **Then** mute
   stays in place but is disabled, so the pill keeps its width.

---

### User Story 3 - Visitor puts a specific song on stage (Priority: P2)

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

> **As-built note**: the selection mechanism exists, but **no visible control currently
> triggers it** (see Known Gaps).

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
  playback logic with `loopDefault` in UI chrome; the loop control is currently hidden on
  all viewports.
- **FR-008**: On laptop widths (≥1024px) the player MUST be an always-visible compact pill
  at the bottom-left with: decorative vinyl, Shuffle, Play/Pause, Mute (+ volume slider,
  see `025`). Controls MUST be keyboard operable and expose accessible names from UI
  chrome.
- **FR-009**: On phone widths (<1024px) the player is currently **not shown**. The phone
  player implementation (floor-pinned pill with tap/drag handle, solo now-playing card,
  three-slot playlist window, idle handle nod) remains in the code but is disabled by CSS.
- **FR-010**: A manual pick MUST be requestable by any UI through one stage-select event
  (and by `data-stage-button` / `data-jukebox-option` controls); it MUST start the entry
  immediately and restart its advance clock without resetting shuffle.
- **FR-011**: The player MUST stay at the periphery; it MUST NOT cover the stage center.

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
- **SC-003**: Toggling sound never changes the laptop player's width.

## Assumptions

- Songs are first-party audio muxed into the stage videos; there is no separate audio
  player or third-party embed.
- The name "V-Flip" survives only in UI copy and code naming; it is no longer a separate
  visitor feature.

## Known Gaps *(as of 2026-10-05)*

- **No visible way to pick a song.** The theme-track list lives in the player drawer,
  which is closed on laptops (no control opens it) and the whole player is hidden on
  phones. The play button on discography catalog rows has no handler (see `028`).
- **Phones have no player at all**: no shuffle toggle, no pause, and no unmute; shuffle
  still auto-advances silently in the background.
- The dormant phone player (`initPlayerDock`, ~1,600 lines) and the hidden loop control
  are still shipped.
- `scripts/verify-hud.mjs` still asserts phone player flows that are hidden today.
