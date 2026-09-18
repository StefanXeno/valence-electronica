# Feature Specification: Jukebox Easter Egg & Song-Select First

**Feature Branch**: `021-jukebox-easter-egg`

**Created**: 2026-09-18

**Status**: Draft

**Input**: User description: "V-Flip is strong but should stay a hidden
    easter egg people discover. 'Currently playing' must NOT be the
    default look — the song selection panel should be. Minimize taps /
    clicks to switch songs. Related: `020-site-nav-chrome`,
    `022-stage-artist-polish`. Feedback from Hendrik (+ Gosha on side
    chrome / shuffle owned partly by siblings)."

## Related Specs

| Spec | Relationship |
| ---- | ------------ |
| `020-site-nav-chrome` | Sibling. Owns top nav / side socials / removing circular side docks. This feature owns **player & song-select UX**. |
| `022-stage-artist-polish` | Sibling. Shuffle **visual** redesign, mobile tap-vs-swipe preference, track atmosphere. This feature owns **default player surface** and V-Flip secrecy. |
| `011-vflip-now-playing` | **Superseded** for “V-Flip as primary visible jukebox chrome” and for any requirement that collapsed/expanded vinyl is the main song UI. Playback meanings (shuffle on/off, hop timing, mute eligibility) stay until explicitly replaced. |
| `019-desktop-chrome-polish` | **Superseded** for desktop default of always-open **Currently playing** card as the primary look. Song selection becomes the default surface. |
| `015-mobile-stage-hud` / `018-player-animation-polish` | **Superseded** for phone default expanded header **“Currently playing”** as the first thing fans see in the player. Song list / selection-first; transport may remain. Swipe-vs-tap detail → `022`. |

## Design Direction *(draft)*

Hendrik: V-Flip is unnecessarily complicated; the strong bottom-left
control should become a **hidden easter egg**. Casual listeners should
land on a **song selection** surface, not a “Currently playing” card that
adds extra taps before they can change tracks.

| Concern | Target |
| ------- | ------ |
| **Default player look** | Song selection panel / list (pick a track) — **not** “Currently playing” as the default. |
| **Song switch cost** | Minimize taps/clicks from rest → hearing another catalog track. |
| **V-Flip** | Remains a delightful discovery for people who find it; **not** labeled or placed as primary chrome. Bottom-left strength is remembered as easter-egg energy, not as the main CTA. |
| **Casual path** | Fan/casual listener changes songs without learning V-Flip lore. |

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Casual listener switches songs with minimal effort (Priority: P1)

A casual listener wants to hear a different track. From the landing at
rest, they reach another song with as few actions as practical — the
default player chrome already presents **song selection**, not a
now-playing card that must be dismissed or switched first.

**Why this priority**: Direct feedback — selection panel default;
minimize taps.

**Independent Test**: Count actions from cold load (after any intro) to
playing a non-default track; compare to today’s currently-playing-first
flow — new flow must use fewer obligatory steps.

**Acceptance Scenarios**:

1. **Given** the landing is ready on laptop width, **When** the visitor
   views the player chrome at rest, **Then** the default surface is song
   selection (list/cards of selectable tracks), not a Currently playing
   detail card.
2. **Given** the landing is ready on phone width, **When** the visitor
   opens or views the player chrome at its default useful state, **Then**
   song selection is the default surface (not Currently playing).
3. **Given** song selection is visible, **When** the visitor chooses
   another catalog track, **Then** that track becomes active without an
   extra obligatory “open playlist / leave currently playing” step.
4. **Given** a visitor who never finds V-Flip, **When** they only use
   song selection + basic transport (play/pause, mute, shuffle as
   present), **Then** they can still browse and play catalog tracks
   successfully.

---

### User Story 2 - V-Flip is a discoverable easter egg (Priority: P1)

A curious visitor who explores the stage can still discover V-Flip as a
hidden delight. It must not appear as a labeled primary control in the
main chrome, and it must not be required for song changes.

**Why this priority**: Explicit Hendrik feedback — keep the strong idea,
hide it.

**Independent Test**: Primary chrome review shows no “V-Flip” primary
CTA; a documented discovery path still reveals it. [Discovery mechanism
needs clarification.]

**Acceptance Scenarios**:

1. **Given** a first-time casual visitor, **When** they use only obvious
   primary chrome, **Then** they are not required to open V-Flip to
   change songs.
2. **Given** a curious visitor follows the intended discovery path,
   **When** they trigger it, **Then** V-Flip (or equivalent hidden
   jukebox experience) becomes available as an easter egg.
3. **Given** V-Flip is hidden at rest, **When** reviewers inspect primary
   nav and primary player chrome, **Then** V-Flip is not advertised as a
   main menu item or default player tab label.

---

### User Story 3 - Now-playing remains available without being default (Priority: P2)

Listeners who want to see what is playing (title, card, lyrics-adjacent
context if any) can still reach a now-playing view, but it is optional —
not the home state of the player.

**Why this priority**: Preserves useful feedback without fighting
selection-first.

**Independent Test**: From song selection, open now-playing in one
action; returning or defaulting still lands on selection.

**Acceptance Scenarios**:

1. **Given** a track is playing, **When** the visitor opts into
   now-playing, **Then** they can see the active track identity.
2. **Given** the visitor closes now-playing or reloads, **When** the
   player returns to its default surface, **Then** song selection is
   shown again (not currently-playing-first).

---

### Edge Cases

- Only one catalog track — selection still shows that track; no empty
  confusing panel.
- Track with no audio — still selectable if it is a valid stage entry;
  mute/audio rules from existing playback meaning still apply.
- Shuffle on while browsing selection — selecting a track still takes
  priority as an explicit visitor choice.
- Easter egg discovered mid-session — song selection remains available;
  easter egg does not trap the visitor.
- Reduced motion — selection and easter egg remain usable without
  relying on motion-only cues.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The default player surface on both phone and laptop widths
  MUST be **song selection** (browse/choose tracks), not a Currently
  playing card or equivalent detail view.
- **FR-002**: Visitors MUST be able to switch to another catalog track
  with fewer obligatory actions than the current
  currently-playing-first → playlist flow (target: **one** primary
  action from visible selection).
- **FR-003**: V-Flip MUST NOT be required to change songs.
- **FR-004**: V-Flip MUST NOT appear as labeled primary chrome (not in
  the `020` top menu; not as the default player title).
- **FR-005**: V-Flip MUST remain available as a **hidden easter egg**
  discoverable by curious visitors. [NEEDS CLARIFICATION: How should
  visitors discover V-Flip — subtle unmarked control, gesture/long-press,
  konami-style sequence, or content-configured secret?]
- **FR-006**: An optional now-playing / current-track detail view MAY
  exist but MUST NOT be the default rest state.
- **FR-007**: Existing playback meanings that are still desired MUST be
  preserved unless a sibling spec overrides them: shuffle on/off as a
  visitor control, mute eligibility, hop timing for audio vs no-audio
  entries (from `011` as-built meaning). Loop remains absent on phone /
  desktop chrome unless a future spec revives it.
- **FR-008**: Player chrome MUST continue to leave the center stage
  visually dominant; song selection grows from the player periphery, not
  a full-screen takeover that kills the atmosphere.
- **FR-009**: All player chrome strings for this feature MUST remain
  content-editable (constitution III).
- **FR-010**: This feature MUST NOT reintroduce circular side button
  docks owned by `020`.

### Key Entities

- **Song Selection Surface**: Default player panel listing selectable
  stage/catalog tracks.
- **Now-Playing Surface**: Optional detail for the active track.
- **V-Flip Easter Egg**: Hidden alternate jukebox experience; discovery
  trigger TBD by clarification.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: From ready landing to a different track playing takes
  **≤ 2** intentional activations on phone and laptop for **≥ 90%** of
  test participants (excluding mute/volume).
- **SC-002**: In first-use tests, **≥ 90%** of casual participants change
  songs **without** discovering V-Flip.
- **SC-003**: At least **50%** of participants prompted to “find something
  hidden related to the old jukebox” discover V-Flip within **3 minutes**
  once the chosen discovery method is implemented (validates easter-egg
  findability without making it primary).
- **SC-004**: Preference test: **≥ 80%** prefer selection-first over
  currently-playing-first for “quickly try another song.”
- **SC-005**: Default rest screenshots on phone and laptop show song
  selection as the visible player body, not Currently playing.

## Assumptions

- “V-Flip” name may stay internal / easter-egg copy; casual UI can say
  “Songs” / “Tracks” / similar — exact strings are content.
- Catalog membership follows existing stage/jukebox entries (and
  `010` if/when catalog ships); this feature does not redefine the
  track catalog model.
- Desktop and phone both adopt selection-first; breakpoint remains
  aligned with current HUD split (~1024px) unless `020` changes overall
  layout breakpoints.
- Transport controls (shuffle, play/pause, mute) may sit with the player;
  shuffle **look** is owned by `022`.
- Bottom-left “strong” energy of classic V-Flip informs the easter egg’s
  *feel*, not a requirement to keep a permanent bottom-left vinyl control
  visible.

## Dependencies

- `020-site-nav-chrome` for simplified page chrome (avoid designing player
  against doomed circular docks).
- `022-stage-artist-polish` for shuffle appearance and mobile
  tap-not-swipe on the bottom player.
- Historical playback rules from `011` / `015` / `019` except where this
  spec supersedes default surfaces.

## Out of Scope

- Top menu Home / Shop / Tour / Contact (`020`).
- NCS logo, Minecraft sprites, Taking Over brightness/cut, Show me How
  audio asset completeness (`022`).
- Full track-catalog panel feature (`010`) beyond using existing
  selectable stage entries.
- Re-adding Loop as a primary control.
