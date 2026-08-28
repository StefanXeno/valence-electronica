# Feature Specification: V-Flip Now Playing

**Feature Branch**: `011-vflip-now-playing`

**Created**: 2026-08-28

**Status**: Draft

**Input**: User description: "I want to do another ui-change. Now i want to include
the mute-button, as well as the Track-name/info and lyrics to display in the V-Flip.
When V-Flip is collapsed, mute/volume must sit in the same box as the vinyl. Randomly
change to another theme with a smooth player-like transition; if a theme has no
song/no audio, switch after ~45 seconds; songs use atmosphere video file length.
Shuffle must be a toggle the visitor
can disable. Add a loop button so the visitor can keep the current track looping."

## Clarifications

### Session 2026-08-28 (follow-up)

- Q: Collapsed mute placement? → A: **Same box as the vinyl.** Mute and volume are
  not a second circle beside V-Flip. One collapsed chrome shell holds vinyl +
  mute/volume.
- Q: Auto-advance? → A: **Shuffle like a music player**, with a **visitor toggle**.
  When shuffle is on and loop is off, after the current item finishes (or after a
  dwell if it never finishes), pick another **random** jukebox entry and crossfade
  into it. When shuffle is **off**, do not auto-advance.
- Q: Dwell when there is no song / no audio? → A: **45 seconds** for
  no-audio entries — **only while shuffle is on and loop is off**. Audio entries
  use **atmosphere video file duration** (see Assumptions).
- Q: Loop control? → A: **Yes.** A loop button lets the visitor pin the current
  track so it repeats. Loop **wins over shuffle**: if loop is on, the current
  item keeps playing and shuffle does not change theme.
- Q: Volume discoverability? → A: **Tooltips.** The mute/volume **button** shows a
  short hint of its function (mute vs unmute as appropriate). When the volume
  **slider** is visible, it shows a hint that the visitor can **drag to adjust
  volume**. Strings are chrome-editable.

### Session 2026-08-28 (analyze remediation)

- Q: Shuffle off + loop off — does the clip stop? → A: **No hop.** The atmosphere
  bed **may keep looping** (HTML `loop` unchanged). Visitor is pinned on this
  track/theme without auto-advance.
- Q: Song advance timing? → A: **Use the atmosphere video file duration** when
  the entry has audio (`hasAudio`) and video is playing. **45 seconds** when the
  entry has **no song / no audio** (`hasAudio` false). Owner accepts that today’s
  short loop-bed mp4s advance on **file length** until full-length stage videos
  ship.
- Q: V-Flip vs About exclusive-open? → A: **No change.** Keep today’s behavior:
  on-demand panels exclusive among themselves; V-Flip **may stay open** while a
  panel is open.

## Design Direction *(approved 2026-08-28)*

Today **V-Flip** (the jukebox) is a compact vinyl control that opens into a song list
only. Mute is a **separate** pill beside it. Lyrics and Track info are extra right-dock
icons. The stage also **loops one clip forever** with no visitor control.

**Composition for this feature** (approved in plan review):

| State | Treatment |
| ----- | --------- |
| V-Flip collapsed | **One box**: vinyl + mute (when eligible). Unmute may expand **that same box** to reveal the volume slider. No sibling mute on the dock. Shuffle/loop stay out of the collapsed box so it does not become a toolbar. |
| V-Flip open | One peripheral player: **active track name**, **track info**, **lyrics**, **mute/volume**, **shuffle toggle**, **loop toggle**, and the **song list**. |
| Right dock | About (if content exists), Discography, Tour only. Center stage stays free. |
| Playback | See loop/shuffle matrix below. Handoffs are **smooth** (no hard cut). |

**Playback matrix** (scripting available):

| Loop | Shuffle | At the current item’s advance point |
| ---- | ------- | ----------------------------------- |
| On   | On or off | Stay on this track; it **repeats**. No theme change. |
| Off  | On      | Pick a **different random** entry; smooth handoff. |
| Off  | Off     | **Stay.** No auto-hop. Atmosphere bed **may keep looping** on this track/theme. |

Exact internal stacking (sections vs. tabs vs. a now-playing header above the list)
is a plan-time layout choice. The open panel MUST stay on the periphery and scroll
internally if content is long.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Open V-Flip and see what is playing (Priority: P1)

A visitor on a typical laptop opens V-Flip. They immediately see the **name of the
active track** and its **track info** (when that info exists: release date and
outbound listen links). They do not have to hunt a second HUD icon for “Track info.”

**Why this priority**: Track identity is the point of treating V-Flip as a player,
not only a switcher.

**Independent Test**: Load the landing, open V-Flip, confirm the active song title
and its info match the current stage track. Close V-Flip; confirm the vinyl rest
state returns and the center stays free.

**Acceptance Scenarios**:

1. **Given** a stage track is active, **When** the visitor opens V-Flip, **Then** the
   active track’s name is visible inside V-Flip (not only the chrome label “V-Flip”).
2. **Given** the active track has a release date and/or listen links in content,
   **When** the visitor opens V-Flip, **Then** that track info is readable in V-Flip
   without opening another HUD control.
3. **Given** the active track has no listen links, **When** the visitor opens V-Flip,
   **Then** no dead or placeholder platform buttons appear (empty-link copy from
   chrome may show, or the links block is omitted — same honesty as today’s Track
   info).
4. **Given** V-Flip is closed, **When** the visitor scans the right dock, **Then**
   there is no separate Track info icon.

---

### User Story 2 - Read lyrics inside V-Flip (Priority: P1)

A visitor opens V-Flip to follow along. Lyrics for the **active** track appear in
V-Flip. If the track has no lyrics, they see the existing empty-lyrics message.
They do not open a separate Lyrics icon on the right.

**Why this priority**: Lyrics are the other half of “what is this song”; folding
them into V-Flip is the requested UI change.

**Independent Test**: Open V-Flip on a track with lyrics; confirm the words match
that track. Switch to a track with empty lyrics; confirm the empty message. Confirm
the right dock has no Lyrics icon.

**Acceptance Scenarios**:

1. **Given** the active track has lyrics in content, **When** the visitor opens
   V-Flip, **Then** those lyrics are readable inside V-Flip.
2. **Given** the active track has no lyrics, **When** the visitor opens V-Flip,
   **Then** the existing empty-lyrics message is shown (not a blank hole).
3. **Given** lyrics are longer than the open panel, **When** the visitor scrolls,
   **Then** scrolling happens inside V-Flip; the center stage is not covered by a
   full-page sheet.
4. **Given** V-Flip is closed, **When** the visitor scans the right dock, **Then**
   there is no separate Lyrics icon.

---

### User Story 3 - Mute and volume live in the V-Flip box (Priority: P1)

A visitor can mute, unmute, and set volume as part of V-Flip. When the player is
open, mute/volume sit **inside** it. When V-Flip is **collapsed**, mute/volume
share the **same box** as the vinyl — one chrome shell, not a second control
beside it. Unmute may widen that same box to show the volume slider. Mute still
follows existing rules: hidden when the active clip has no audio, video is not
playing, or reduced motion / fallback is in effect.

**Why this priority**: Owner-required collapsed composition; audio belongs with
the player without an extra dock icon.

**Independent Test**: With an audio-eligible clip, confirm collapsed V-Flip is a
single box containing vinyl + mute; unmute and confirm the slider appears in that
box; open V-Flip and mute/volume remain in the player; switch to a no-audio clip
and confirm mute disappears while vinyl remains.

**Acceptance Scenarios**:

1. **Given** an audio-eligible clip is playing, **When** V-Flip is collapsed,
   **Then** mute/volume are inside the same box as the vinyl (not a separate
   sibling control).
2. **Given** sound is off in that collapsed box, **When** the visitor unmutes,
   **Then** the volume slider appears by expanding **that same box**.
3. **Given** V-Flip is open, **When** the visitor uses mute or volume, **Then**
   those controls are inside the open player and behave as they do today.
4. **Given** the active clip has no audio, video is not playing, or reduced motion
   / static fallback is active, **When** the visitor looks for mute, **Then** it is
   hidden or disabled; the collapsed V-Flip box remains the vinyl control.
5. **Given** keyboard-only use, **When** the visitor tabs through collapsed
   V-Flip, **Then** vinyl (open/close) and mute/volume are both reachable, with
   muted vs. unmuted announced.
6. **Given** mute is visible, **When** the visitor hovers or keyboard-focuses the
   mute/volume **button**, **Then** a short tooltip explains the button’s action
   (unmute when muted; mute when sound is on).
7. **Given** sound is on and the volume slider is visible, **When** the visitor
   hovers or focuses the **slider**, **Then** a short tooltip explains they can
   drag to adjust volume.

---

### User Story 4 - Switching songs updates the player (Priority: P2)

A visitor picks another song in the V-Flip list. The displayed track name, track
info, lyrics, atmosphere, theme, and mute visibility all follow the new active
entry without a full page reload. Unmute preference in the session still survives
a switch to another audio-eligible clip (existing jukebox rule).

**Why this priority**: Proves V-Flip is one player, not three stale panels glued
together.

**Independent Test**: Open V-Flip, select a different entry, confirm name / info /
lyrics / mute visibility match the new entry and the stage atmosphere changed.

**Acceptance Scenarios**:

1. **Given** V-Flip is open on track A, **When** the visitor selects track B,
   **Then** the name, info, and lyrics inside V-Flip update to track B before the
   next interaction.
2. **Given** track A has audio and track B does not, **When** the visitor selects
   B, **Then** mute hides and the atmosphere follows B’s clip (poster or loop as
   configured).
3. **Given** the visitor unmuted on an audio clip then selects another
   audio-eligible clip, **When** B starts, **Then** audio stays unmuted (existing
   session rule).
4. **Given** the visitor reloads the page, **When** the landing loads, **Then** the
   scheduled or static default track is active; V-Flip still shows that track’s
   name, info, and lyrics when opened (no memory of the last manual pick).
   Shuffle and loop return to their load-time defaults (not the previous visit).

---

### User Story 5 - Visitor turns shuffle on or off (Priority: P1)

A visitor opens V-Flip and sees a **shuffle** control. They can turn it off so
the stage **never** auto-picks another theme. They can turn it on so that, when
loop is also off, the player advances to a **different random** entry at the
current item’s advance point, with a **smooth** atmosphere and theme handoff.

If the current theme has **no song** (`hasAudio` false), shuffle (with loop
off) advances after **45 seconds**. Audio entries advance after **one atmosphere
video file duration** (see Assumptions).

**Why this priority**: Owner-required — shuffle is optional, not forced radio.

**Independent Test**: With shuffle on and loop off, confirm a hop at end/dwell;
turn shuffle off and wait past the same point — no hop. Confirm on/off state is
visible and keyboard-reachable.

**Acceptance Scenarios**:

1. **Given** V-Flip is open, **When** the visitor looks at player controls,
   **Then** a shuffle control is present and shows whether shuffle is on or off.
2. **Given** shuffle is on, loop is off, and at least two entries exist, **When**
   the current item reaches its advance point, **Then** a different random entry
   becomes active (never the same entry twice in a row) with a smooth handoff.
3. **Given** shuffle is **off**, **When** the current item reaches its advance
   point, **Then** the stage does **not** change track or theme by itself.
4. **Given** the visitor turns shuffle off while a hop was pending, **When** the
   advance point arrives, **Then** no hop occurs.
5. **Given** the intro overlay is still showing, **When** time passes, **Then**
   shuffle does not run; the advance clock starts after the intro is dismissed
   (and only if shuffle is on and loop is off).
6. **Given** reduced motion is preferred and a shuffle hop occurs, **When** the
   theme changes, **Then** the handoff MUST NOT require motion-heavy animation.
7. **Given** only one jukebox entry exists, **When** shuffle is on and the
   advance point arrives, **Then** the stage stays on that entry.

---

### User Story 6 - Visitor loops the current track (Priority: P1)

A visitor opens V-Flip and sees a **loop** control. Turning it on keeps the
**current** track repeating (atmosphere and theme stay). Loop **overrides**
shuffle: even if shuffle is on, loop-on means no auto-advance to another
entry. Turning loop off returns to the shuffle/stay rules above.

**Why this priority**: Owner-required pin-this-track control; without it shuffle
cannot be escaped without disabling shuffle.

**Independent Test**: Enable loop, wait past the advance point — same track
still playing. Enable shuffle as well — still no hop. Disable loop with shuffle
on — next advance point hops.

**Acceptance Scenarios**:

1. **Given** V-Flip is open, **When** the visitor looks at player controls,
   **Then** a loop control is present and shows whether loop is on or off.
2. **Given** loop is on, **When** the current item reaches what would be an
   advance point, **Then** that same track continues (repeats); theme does not
   change.
3. **Given** loop is on and shuffle is on, **When** the advance point arrives,
   **Then** shuffle does **not** pick another entry.
4. **Given** loop is on, **When** the visitor picks another track by hand,
   **Then** the new track becomes current and **keeps looping** (loop stays on
   until they turn it off).
5. **Given** loop is off and shuffle is off, **When** any amount of time passes,
   **Then** the stage stays on the current track/theme (no auto-hop); the
   atmosphere bed may keep looping.

---

### User Story 7 - The rest of the stage stays as it is (Priority: P3)

A visitor still reaches About, Discography, Tour, socials, legal, and intro the
same way. Exclusive-open among **on-demand panels** still applies (`004`). V-Flip
and on-demand panels **may both be open** at once — this feature does not add
mutual close between them. The center of the page remains the atmosphere.

**Why this priority**: Confirms this is a V-Flip composition change, not a HUD
rewrite.

**Independent Test**: Walk About, Discography (including stage button), Tour,
socials, legal overlay, and intro hide/show; confirm they still work and the
center stays free.

**Acceptance Scenarios**:

1. **Given** About content exists, **When** the visitor opens About, **Then** it
   still appears as a right-dock panel; V-Flip **may** remain open or closed
   independently (no new mutual-close rule).
2. **Given** a discography release has a stage button, **When** the visitor
   activates it, **Then** the stage switches and V-Flip’s now-playing content
   matches that entry.
3. **Given** the intro overlay is showing, **When** the visitor has not dismissed
   it, **Then** V-Flip (including mute, lyrics, and track info) stays hidden as
   today’s chrome does.
4. **Given** a typical laptop viewport with V-Flip closed, **When** the visitor
   looks at the center third of the page, **Then** it is still free of persistent
   player text.

---

### Edge Cases

- **Very long track names**: Truncate with ellipsis in the V-Flip header; full
  name remains available to assistive tech.
- **Very long lyrics or many listen links**: Content scrolls inside V-Flip; no
  horizontal overflow on a typical laptop; 320px width stays loadable (phone
  polish remains IDEA-013).
- **Single jukebox entry**: V-Flip still opens; name, info, lyrics, and mute
  rules still apply; the list may show one item; shuffle on does not bounce to
  an empty pick.
- **Track info missing release date**: Omit the date line; do not invent a date.
- **Jukebox entry without catalog-style info**: Name falls back to the jukebox
  label; listen-link and date blocks omit empty chrome.
- **No scripting**: Opening V-Flip still reveals lyrics and track info for the
  load-time track. Shuffle/loop toggles and in-session hops do not run; the
  authored clip may still loop as published until a full reload.
- **Reduced motion**: Mute hide rules unchanged; V-Flip open/close does not
  require travel animation; shuffle hops (when allowed) use a non-motion-heavy
  handoff.
- **Glitch theme**: Mute, vinyl, and V-Flip open/close keep existing glitch
  treatments; the full control hit area stays clickable (rule from `009`).
  Shuffle/loop controls follow the same HUD glitch family as other player
  buttons. Auto-advance handoff stays **smooth**, not a glitch smash.
- **Legal overlay open**: Mute and V-Flip may sit under the overlay as today;
  they are not required to stay usable through the overlay. An allowed shuffle
  hop MAY continue under the overlay.
- **Visitor muted**: An allowed shuffle hop still changes theme/atmosphere;
  audio stays muted until they unmute.
- **Collapsed box while unmuted**: Volume slider grows the **same** V-Flip box;
  it MUST NOT spawn a second dock control or cover the center stage.
- **Shuffle off + loop off**: Stay on current track indefinitely; atmosphere may
  keep looping; no 45s hop for no-audio entries either.
- **Short loop-bed mp4s**: Shuffle interval follows **file duration**, not full
  song length, until longer stage videos replace loop beds (owner accepted).
- **Audio entry on poster/fallback** (no playing video): If duration is unknown,
  advance after **45 seconds** when shuffle is on and loop is off.
- **Turning loop on late**: Remaining time on the current pass may finish; then
  it repeats. No hop while loop is on.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When V-Flip is open, it MUST display the **active track name**
  (catalog title when the entry is a known track, otherwise the jukebox label).
- **FR-002**: When V-Flip is open, it MUST display **track info** for the active
  entry: release date when present, and outbound listen links when present.
- **FR-003**: When V-Flip is open, it MUST display **lyrics** for the active
  entry, or the existing empty-lyrics message when the body is empty.
- **FR-004**: Mute/volume MUST live **inside V-Flip**. When collapsed, they MUST
  share the **same box** as the vinyl (one chrome shell). When open, they MUST
  sit in the open player. Unmute MAY expand that same collapsed box to show the
  volume slider. Existing show/hide rules (audio-eligible playing video only;
  hidden on fallback / no audio / reduced motion) MUST be preserved. There MUST
  NOT be a separate mute control elsewhere on the dock.
- **FR-004a**: The mute/volume **button** MUST show a visitor-facing tooltip on
  hover and keyboard-visible focus that hints its function (unmute when muted;
  mute when unmuted). Tooltip copy MUST be editable via UI chrome content.
- **FR-004b**: When the volume **slider** is visible, it MUST show a
  visitor-facing tooltip on hover and keyboard-visible focus that hints the
  visitor can **drag to adjust volume**. Tooltip copy MUST be editable via UI
  chrome content.
- **FR-005**: Lyrics and Track info MUST NOT remain as separate right-dock HUD
  icons. About, Discography, and Tour stay as on-demand right-dock controls.
- **FR-006**: V-Flip MUST still list selectable stage tracks; choosing an entry
  MUST update atmosphere, theme, lyrics, track name, track info, and mute
  visibility without a full page reload when scripting is available.
- **FR-007**: Open V-Flip MUST remain **peripheral**: panel body does not occupy
  the center stage; long content scrolls inside the player.
- **FR-008**: At rest, V-Flip MUST stay compact: **one box** with vinyl plus
  mute/volume when eligible. Track name, lyrics, and track info MUST NOT stay
  on screen when V-Flip is closed.
- **FR-009**: Visitor-facing strings (empty lyrics, empty links, released label,
  V-Flip name, shuffle and loop names, mute/volume tooltips, section headings if
  shown) MUST remain editable in UI chrome / content files without layout code
  changes.
- **FR-010**: Lyrics body and track metadata MUST continue to live in existing
  jukebox/track content files (one place per field). This feature MUST NOT
  introduce a second copy of lyrics or listen links.
- **FR-011**: Keyboard users MUST be able to open V-Flip, read lyrics and info,
  operate mute, toggle shuffle, toggle loop, and select another track without a
  pointer.
- **FR-012**: This feature MUST NOT redesign mobile/small-screen HUD composition
  (IDEA-013); the landing MUST still load from 320px without horizontal scroll.
- **FR-013**: This feature MUST NOT add third-party embeds, autoplay widgets,
  analytics, or cookies.
- **FR-014**: Artist-facing documentation MUST be updated if the artist-visible
  HUD surfaces change (lyrics and track info are no longer separate buttons;
  shuffle and loop are new V-Flip controls).
- **FR-015**: Exclusive-open among **on-demand stage panels** (`004`) MUST be
  preserved when scripting is available. This feature MUST NOT require V-Flip and
  on-demand panels to close each other; both **may** be open at once.
- **FR-016**: Legal footer, socials, identity, intro overlay, discography stage
  button, and scheduled default resolution MUST keep their existing behavior
  except where this spec relocates lyrics, track info, and mute into V-Flip, and
  except where shuffle (when enabled) replaces infinite single-clip looping.
- **FR-017**: V-Flip MUST expose a **shuffle toggle**. Its on/off state MUST be
  obvious. When shuffle is **off**, the stage MUST NOT auto-advance to another
  entry.
- **FR-018**: V-Flip MUST expose a **loop toggle**. Its on/off state MUST be
  obvious. When loop is **on**, the current entry MUST repeat and the stage
  MUST NOT auto-advance to another entry (loop wins over shuffle).
- **FR-019**: Shuffle-advance MUST run only when **all** of these are true:
  scripting is available, shuffle is on, loop is off, and at least two jukebox
  entries exist. The next entry MUST be a different random pick (no immediate
  repeat).
- **FR-020**: If a shuffle-advance is allowed and the current entry **has audio**
  (`hasAudio`) and atmosphere video is **playing** with a known duration, the
  advance point MUST be **one full atmosphere video file duration** after that
  item became active (from `loadedmetadata` / `HTMLMediaElement.duration`) — not
  the 45-second dwell.
- **FR-021**: If a shuffle-advance is allowed and the current entry has **no
  audio** (`hasAudio` false), the advance point MUST be **45 seconds** after that
  item became active (clock starts after intro is dismissed).
- **FR-022**: An allowed shuffle handoff MUST change atmosphere and bound theme
  **smoothly** (no hard cut of picture or sound). Reduced motion MAY use a
  simpler fade or instant theme swap.
- **FR-023**: A manual pick (V-Flip list or discography stage button) MUST
  start that entry immediately and reset its advance clock. Shuffle and loop
  toggle states MUST NOT reset on a manual pick.
- **FR-024**: Shuffle MUST NOT start background audio by itself. Mute/unmute
  preference for the visit MUST survive a shuffle hop the same way it survives
  a manual jukebox pick.
- **FR-025**: Shuffle and loop MUST be reachable from the **open** V-Flip
  player. They MUST NOT appear as extra right-dock icons. They SHOULD NOT
  crowd the collapsed vinyl+mute box (collapsed stays compact).
- **FR-026**: Shuffle and loop states are **for this visit only**. Reload
  returns to load-time defaults. Defaults MUST be editable in chrome/content
  (not hard-coded labels only — the starting on/off MAY be content-defined).
- **FR-027**: Artist-facing docs MUST mention shuffle, loop, and that shuffle
  timing for songs follows **stage video file length** (and 45s for no-audio
  entries).

### Key Entities

- **V-Flip (jukebox)**: The landing player control. Closed: one box (vinyl +
  mute/volume when eligible). Open: now-playing surface (name, info, lyrics,
  mute/volume, shuffle, loop) plus the track list.
- **Active track**: The jukebox entry currently driving atmosphere, theme,
  lyrics, track info, mute eligibility, and the advance clock.
- **Track info**: Release date and optional outbound listen links already
  maintained in track/jukebox content (`010`).
- **Mute/volume control**: Visitor control for background audio; lives inside
  the V-Flip box; visibility still depends on the active clip and playback /
  fallback state (`002` / `005`).
- **Shuffle**: Visitor toggle. When on (and loop is off), auto-advance to a
  different random jukebox entry at the advance point.
- **Loop**: Visitor toggle. When on, the current entry repeats and shuffle
  MUST NOT auto-advance.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a typical laptop, a visitor can open V-Flip once and see the
  active track name, lyrics (or empty message), and mute (when eligible) without
  using any other HUD icon — 100% of those three in a single open action.
- **SC-002**: After this change, 0 Lyrics icons and 0 Track info icons remain in
  the right dock in manual review.
- **SC-003**: With an audio-eligible clip, a first-time visitor can mute or
  unmute within **10 seconds** of noticing the control **without** opening
  V-Flip, using the mute control **inside the collapsed V-Flip box**.
- **SC-003a**: In manual review, hover/focus on the mute button and on the
  visible volume slider each shows a readable tooltip that matches the chrome
  strings (button action hint; slider “drag to adjust” hint).
- **SC-004**: After selecting another jukebox entry, name, lyrics, and track
  info inside V-Flip match the new entry before the visitor’s next action (no
  stale previous-track copy).
- **SC-005**: On a 1280×800 viewport with V-Flip closed, the center third of the
  page still has no persistent player text (same spirit as `009` SC-001).
- **SC-006**: Keyboard-only visitors can complete: open V-Flip → read lyrics →
  toggle mute (when shown) → toggle shuffle → toggle loop → pick another track
  → close V-Flip.
- **SC-007**: No new third-party embeds or tracking are introduced.
- **SC-008**: With shuffle **on** and loop **off**, a no-song endless theme
  advances within **45 ± 2 seconds** of that item becoming active (after intro).
- **SC-009**: With shuffle on and loop off, an **audio** entry does **not** hop at
  45 seconds; it hops after **one atmosphere video file duration** (manual check
  against a known-length mp4).
- **SC-010**: With shuffle **off**, waiting **60 seconds** past the advance
  point yields **0** auto hops (manual picks still work).
- **SC-011**: With loop **on** (shuffle on or off), waiting past the advance
  point yields **0** hops; the same track is still current.
- **SC-012**: In **several** consecutive **allowed** shuffle hops with ≥2 entries,
  **0** hops land on the same entry as the previous one; each hop is judged smooth
  (no hard cut) in visual review.

## Assumptions

- “V-Flip” is the visitor-facing name of the jukebox (`jukeboxLabel` in chrome);
  this feature does not rename it.
- Collapsed V-Flip stays compact (vinyl + mute/volume in one box). The track
  name is shown when V-Flip is **open**, not as a permanent ticker beside the
  vinyl.
- Mute/volume is **inside the V-Flip box**, not a second dock control. There is
  one mute/volume instance, visible in both collapsed and open states.
- Removing Lyrics and Track info from the right dock is intentional; those
  surfaces are not kept as duplicates.
- Internal open-panel layout (one scroll column vs. labeled sections vs. tabs)
  is chosen at plan time; all required content MUST be reachable without a
  second HUD icon.
- Open V-Flip MAY grow wider than today’s list-only panel so lyrics and info
  are readable; it MUST still attach to the dock edge and leave the center
  free.
- Desktop / typical laptop is the visual target; phone composition stays
  IDEA-013.
- No new content types: lyrics, dates, and listen links already exist.
- Volume adjustment, already part of today’s mute control, stays with mute
  inside the V-Flip box.
- Mute/volume tooltips reuse the same discoverability pattern as other HUD
  label reveals where practical (anchored near the control; reduced motion still
  shows the hint without travel animation). Native `title` alone is not enough
  if it fails the hover/focus visual check — prefer the site’s HUD label pattern.
- **Load-time defaults**: shuffle **on**, loop **off** — so first visit behaves
  like a player, and loop is the “pin this track” control. Artist MAY override
  those defaults in chrome/content at plan time.
- Shuffle and loop are **visit-only** (reload resets). No new cookies or
  tracking; do not persist these toggles in storage unless a later privacy-
  reviewed preference feature says so.
- **45 seconds** is the dwell for entries with **`hasAudio: false`**, and only
  when shuffle is on and loop is off.
- **Audio entries** (`hasAudio: true`) with playing video: advance after **one
  atmosphere video file duration** (`HTMLMediaElement.duration` once metadata is
  loaded). Today’s catalog uses **short seamless loop beds** (~10–20s); shuffle
  will hop on that interval until the artist ships **full-length** stage videos
  (owner accepted tradeoff).
- If an audio entry is on **poster/fallback** only (duration unknown), fall back
  to **45 seconds** for the advance timer when shuffle is on and loop is off.
- Shuffle order is random with **no immediate repeat**. A full no-repeat bag
  (play everything once before repeating) is allowed but not required in v1.
- Smooth handoff is visual **and** audible when sound is on; muted visits still
  get a smooth visual theme change.
- Shuffle and loop icons/labels follow the same chrome-edit pattern as other
  HUD controls (`009` / constitution III).

## Dependencies

- `002-themed-background-video` — atmosphere, mute show/hide, legal overlay.
- `004-landing-content-layout` — jukebox switch, lyrics following active entry,
  exclusive-open, discography stage button.
- `005-theme-packs` — audio-eligible / glitch gates.
- `007-scheduled-stage-default` — which track is active on load.
- `009-desktop-stage-ui` — icon-first rest state, dock, label reveal, glitch
  hit targets.
- `010-track-catalog` — track name, release date, listen links.
- `008-artist-docs` — artist guide update when HUD surfaces move.

## Out of Scope

- Mobile / small-screen dedicated HUD (IDEA-013)
- New chronological browse-all-tracks panel (already specified in `010`; this
  feature does not add or restyle that list except by removing the Track info
  **icon** from the right dock)
- Third-party players or embeds
- New site routes
- Changing which track is chosen **on first load** (scheduled default from
  `007` still wins; playback modes apply after that)
- Remembering shuffle/loop across visits (v1 is visit-only)
- Landing intro copy or motion (`006`)
- Seravek / primary typeface (IDEA-007)
