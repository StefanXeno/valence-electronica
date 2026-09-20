# Feature Specification: Easter Eggs & Achievements

**Feature Branch**: `032-easter-eggs`

**Created**: 2026-10-05

**Status**: As-built (consolidated living spec) — first spec for this feature

**Updated**: 2026-10-06 — "player found" achievement (folded in from `035`)

**Consolidates**: post-spec work from 2026-09-20 (commits `beb17a0` … `5336b73`); replaces
the vinyl → V-Flip easter egg idea from `021-jukebox-easter-egg`, which was retired

**Input**: Document the hidden interactions that reward curious visitors: rubbing a song in
the discography reveals its hidden text, spinning a circle on the Infinite stage, and the
one-time "achievement unlocked" toasts they trigger. Finding the hidden stage player
(see `026`) is the third achievement; typing 666 (the demonic combo) is the fourth.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Rubbing a song reveals its secret text (Priority: P1)

A curious visitor scrubs back and forth over a song card in the discography. After three
quick back-and-forth rubs, a full panel opens with that song's hidden text (e.g. lyrics or
liner notes). The first time ever, an achievement toast pops up ("Why are you rubbing?!"),
and the tagline under the wordmark changes to "You know how to rub ^^" for the rest of the
visit.

**Why this priority**: The flagship easter egg; it gives the stored track text a reason to
exist.

**Independent Test**: On a `rubbable` release with body text, rub horizontally three
times on laptop (mouse) and phone (finger); confirm the panel opens, the toast shows only
on the first success in this browser, and the tagline is pinned until reload.

**Acceptance Scenarios**:

1. **Given** a catalog card marked `rubbable` whose content file has body text, **When** the
   visitor makes three direction reversals with enough horizontal travel within the idle
   window, **Then** a full panel with that text opens.
2. **Given** the panel is open, **When** the visitor uses Close or Escape, **Then** it
   closes and focus returns to where it was.
3. **Given** the first successful rub in this browser, **When** the panel opens, **Then**
   an achievement toast appears once and is announced to screen readers.
4. **Given** a successful rub, **When** the tagline rotates, **Then** it stays pinned to the
   rub line until reload.
5. **Given** the pointer starts on a link, play, or listen control, **When** it moves,
   **Then** no rub starts and the control behaves normally.

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
  toasts do not show; the rub panel still opens.
- Vertical scrolling on touch must not be stolen: only clearly horizontal motion locks a
  rub; a completed rub suppresses the following synthetic click.
- Reduced motion → toast appears and disappears without animation.
- A row without body text or without `rubbable: true` never opens a panel.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Content entries (jukebox or tracks) MAY set `rubbable: true`; only those with
  non-empty Markdown body MUST get a hidden reveal panel.
- **FR-002**: A rub MUST require three direction reversals with ≥ ~36px travel each,
  resetting after ~1.6 s idle; it MUST ignore gestures starting on links, play buttons, or
  listen controls.
- **FR-003**: The reveal panel MUST be a modal dialog with title, artist, body text, a
  Close control, Escape support, and focus restore; it MUST NOT change the URL.
- **FR-004**: The Infinite spin MUST only arm while the active stage id is `infinite`, MUST
  ignore gestures starting on interactive chrome, and MUST unlock after ~0.9 revolutions
  with wobble tolerance and a ~3.2 s idle reset.
- **FR-005**: Achievements MUST be one-shot per browser via first-party `localStorage`
  keys, shown through one shared toast with title, subtitle, glyph, and a screen-reader
  announcement.
- **FR-006**: A successful rub MUST pin the tagline to the rub line for the page session
  only (no persistence).
- **FR-007**: Easter eggs MUST NOT be required for any primary task and MUST NOT add
  tracking. (The hidden player is discovered by a tap gesture but always has a keyboard
  path — see `026` FR-014.)
- **FR-008**: The first reveal of the hidden stage player in a browser MUST unlock the
  "player found" achievement (key `ve-achievement-player-found`); its title and subtitle
  MUST come from UI chrome (`playerAchievementTitle`, `playerAchievementSub`).
- **FR-009**: Rub, Infinite spin, and the player tap hint MUST share one gesture-ignore
  selector set so no gesture starts on controls, navigation, overlays, or the player, and
  a tap on empty stage never starts a rub or spin.
- **FR-010**: Typing `666` on the keyboard (not inside a text field, digits ≤ ~1.6 s apart)
  MUST put Nightmare on stage, unlock the "Demonic Combination" achievement (key
  `ve-achievement-demonic-combo`, glyph `666`), and switch HUD glitches to a "wild" mode
  for the page session (`html[data-glitch-wild]`): stronger presets and a faster ambient
  field that also hits non-interactive stage and HUD surfaces.

### Key Entities

- **Rubbable entry**: catalog entry with `rubbable: true` and body text.
- **Achievement**: storage key, title, subtitle, glyph (`rub`, `infinite`, `demonic`); four
  today: rub, Infinite spin, player found, demonic combo.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor who knows the gesture triggers the rub reveal on the first or
  second attempt on both mouse and touch.
- **SC-002**: Each achievement toast shows at most once per browser.
- **SC-003**: 0 regressions in clicking, scrolling, or expanding discography cards caused
  by gesture detection.

## Assumptions

- Easter eggs are intentionally undocumented for visitors; the artist guide should still
  document the `rubbable` flag.

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
