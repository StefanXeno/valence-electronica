# Feature Specification: Easter Eggs & Achievements

**Feature Branch**: `032-easter-eggs`

**Created**: 2026-10-05

**Status**: As-built (consolidated living spec) — first spec for this feature

**Updated**: 2026-10-06 — "player found" achievement (folded in from `035`); 2026-10-09 — the
rub egg ("Why are you rubbing?!", reveal panel, rub tagline) is replaced by the Taking Over
swipe

**Consolidates**: post-spec work from 2026-09-20 (commits `beb17a0` … `5336b73`); replaces
the vinyl → V-Flip easter egg idea from `021-jukebox-easter-egg`, which was retired

**Input**: Document the hidden interactions that reward curious visitors: dragging Taking
Over sideways in the discography, spinning a circle on the Infinite stage, and the
one-time "achievement unlocked" toasts they trigger. Finding the hidden stage player
(see `026`) is the third achievement; typing 666 (the demonic combo) is the fourth.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Taking Over takes over (Priority: P1)

A curious visitor grabs the Taking Over row in the discography and drags it sideways. The
row follows the pointer with some resistance and springs back on release. Pulling it far
enough (either direction) unlocks the "Taking Over" achievement once per browser.

**Why this priority**: The flagship easter egg; a playful nod to the track name.

**Independent Test**: Open the discography (laptop overlay and phone menu), drag the Taking
Over row left or right past ~110px; confirm the row springs back and the toast shows only
on the first success in this browser.

**Acceptance Scenarios**:

1. **Given** a catalog row marked `swipeable`, **When** the visitor drags it horizontally
   past ~110px and releases, **Then** the row springs back and the achievement unlocks once.
2. **Given** a shorter drag, **When** released, **Then** the row springs back and nothing
   unlocks.
3. **Given** the motion starts mostly vertical, **When** the finger moves, **Then** the page
   scrolls and the row does not move.
4. **Given** the pointer starts on a link, play, or listen control, **When** it moves,
   **Then** no drag starts and the control behaves normally.

---

### User Story 2 - Spinning on the Infinite stage (Priority: P2)

While the "Infinite" song is on stage, drawing a circle (mouse or finger) anywhere on the
stage unlocks a one-time "Infinite" achievement toast. Imperfect, wobbly circles count.

**Why this priority**: A playful nod to the track name; low cost, delightful.

**Independent Test**: Put Infinite on stage, draw roughly one circle on empty stage area;
confirm the toast appears once per browser.

**Acceptance Scenarios**:

1. **Given** Infinite is the active stage entry, **When** the visitor draws ~0.9 of a turn
   around the press point (radius ≥ ~28px) without a sustained reverse, **Then** the
   achievement unlocks once.
2. **Given** another entry is active, **When** the visitor draws circles, **Then** nothing
   happens.
3. **Given** the gesture starts on any control, panel, or the player, **When** it moves,
   **Then** no spin session starts.

---

### Edge Cases

- `localStorage` blocked (private mode) → achievements are treated as already unlocked, so
  toasts do not show; the row still drags.
- Vertical scrolling on touch must not be stolen: only clearly horizontal motion locks a
  drag; a completed drag suppresses the following synthetic click (no row expand).
- Reduced motion → toast appears and disappears without animation.
- A row without `swipeable: true` never drags.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Content entries (jukebox or tracks) MAY set `swipeable: true` (today: Taking
  Over); their discography rows (overlay and phone menu) become draggable sideways.
- **FR-002**: The drag MUST lock only after ~10px of mostly horizontal motion, move the row
  damped (×0.55, capped at 150px) and spring it back on release; releasing after ≥ ~110px
  of pointer travel MUST unlock "Taking Over" (key `ve-achievement-taking-over`; not
  secret — its title is a public track name, which `check-secrets` would flag). It MUST
  ignore gestures starting on links, play buttons, or listen controls.
- **FR-003**: *(retired with the rub egg: hidden reveal panel.)*
- **FR-004**: The Infinite spin MUST only arm while the active stage id is `infinite`, MUST
  ignore gestures starting on interactive chrome, and MUST unlock after ~0.9 revolutions
  with wobble tolerance and a ~3.2 s idle reset.
- **FR-005**: Achievements MUST be one-shot per browser via first-party `localStorage`
  keys, shown through one shared toast with title, subtitle, glyph, and a screen-reader
  announcement.
- **FR-006**: *(retired with the rub egg: tagline pin.)*
- **FR-007**: Easter eggs MUST NOT be required for any primary task and MUST NOT add
  tracking. (The hidden player is discovered by a tap gesture but always has a keyboard
  path — see `026` FR-014.)
- **FR-008**: The first reveal of the hidden stage player in a browser MUST unlock the
  "player found" achievement (key `ve-achievement-player-found`); its title and subtitle
  MUST come from UI chrome (`playerAchievementTitle`, `playerAchievementSub`).
- **FR-009**: The Taking Over swipe, Infinite spin, and the player tap hint MUST share one gesture-ignore
  selector set so no gesture starts on controls, navigation, overlays, or the player, and
  a tap on empty stage never starts a swipe or spin.
- **FR-010**: Typing `666` on the keyboard (not inside a text field, digits ≤ ~1.6 s apart)
  MUST put Nightmare on stage, unlock the "Demonic Combination" achievement (key
  `ve-achievement-demonic-combo`, glyph `666`), and switch HUD glitches to a "wild" mode
  for the page session (`html[data-glitch-wild]`): stronger presets and a faster ambient
  field that also hits non-interactive stage and HUD surfaces.

### Key Entities

- **Swipeable entry**: catalog entry with `swipeable: true`.
- **Achievement**: see `036` (registry in `src/data/achievements.json`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor who knows the gesture unlocks Taking Over on the first or
  second attempt on both mouse and touch.
- **SC-002**: Each achievement toast shows at most once per browser.
- **SC-003**: 0 regressions in clicking, scrolling, or expanding discography cards caused
  by gesture detection.

## Assumptions

- Easter eggs are intentionally undocumented for visitors; the artist guide should still
  document the `swipeable` flag.

## Known Gaps *(as of 2026-10-06)*

- Rub and Infinite achievement titles/subtitles and the rub tagline are hard-coded in
  TypeScript instead of UI chrome content (constitution III); the player achievement
  already uses chrome.
- Only `taking-over` is `rubbable`, and its body is still placeholder lyrics.
- No unit tests for the rub and spin gesture math (the shared ignore selectors are tested).
- `rubbable` is not documented in `docs/artist-guide.md`.
- No achievements overview page (IDEA-026).
- The demonic combo is keyboard-only; phones have no way to trigger it.
- Wild-mode skip list names `[data-legal-overlay]`, which does not exist (the overlay is
  `#legal-overlay`), so overlay content also glitches in wild mode.
