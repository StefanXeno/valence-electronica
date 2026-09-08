# Feature Specification: Desktop Chrome Polish

**Feature Branch**: `019-desktop-chrome-polish`

**Created**: 2026-09-08

**Status**: Draft

**Input**: User description: "Basic desktop website UI changes, using the
    mobile website as the visual/interaction reference. (1) Keep the
    mobile-style bar on desktop but omit social icons from that bar —
    socials already sit top-right on desktop. (2) Restyle the bottom-left
    player so it looks more like the mobile player. (3) Desktop open/close
    motion: grow in place; bar left then up; player-side grow right then
    up. (4) Legal footer lives in the bar as Info. (5) Operator
    2026-09-08 later: desktop player is always open — no V-Flip toggle;
    show the currently playing track; controls left to right are
    Playlist, Shuffle, Play/pause (replaces Loop), Mute; Info copyright
    sits top-right of the Info box like mobile."

## Design Direction *(basic)*

Desktop / typical laptop (viewport width **1024px and up**) today uses the
`009` / `011` laptop HUD: identity and **socials on the top edge**, V-Flip
as a boxed vinyl cluster **bottom-left**, on-demand icons **bottom-right**,
legal as an **always-visible bottom-center footer**. Phone (below 1024px)
uses the `015` / `018` stacked docks: a growing **content bar** (About,
Discography, Tour, Socials, Info) above a floor-pinned **player pill**.
On phone the landing footer is **hidden**; legal lives in **Info**.

This feature is the parked **IDEA-024** follow-up from `018`: lift the
**mobile visual and interaction language** onto desktop, with desktop-only
differences. It does **not** change the phone HUD.

| Desktop zone | After this feature |
| ------------ | ------------------ |
| **Top-right socials** | Stay. They remain the only social-icon home on desktop. |
| **Content bar** | Boxed icon bar: **About**, **Discography**, **Tour**, **Info**. No social icons. |
| **Info box** | Same as phone: Imprint + Privacy Policy pills; **© Valence** (copyright + artist name) in the **top-right** of the open Info box. |
| **Bottom-center legal footer** | **Hidden.** Legal lives in Info only. |
| **Bottom-left player** | **Always open.** No V-Flip / vinyl collapse toggle. Always shows the **currently playing track**. Toolbar left → right: **Playlist**, **Shuffle**, **Play/pause**, **Mute**. |
| **Player motion** | Playlist (the expandable player surface) **grows in place** from that always-visible player: wider right, then taller up. Close shrinks down, then left. The player chrome itself does not open/close. |
| **Bar motion** | Grow in place: wider left, then taller up. Close shrinks down, then right. |

Desktop keeps a **left / right floor split** (player left, bar right). It
does **not** stack two full-width docks the way the phone does.

## Clarifications

### Session 2026-09-08

- Q: Does the desktop bar include Info / legal, or does legal stay in the
  always-visible bottom-center footer? → A: **Legal lives in the bar.**
  Same Info treatment as phone (circled-i control; open sheet holds © plus
  Imprint / Privacy Policy pills that open the existing legal overlay).
  The always-visible bottom-center footer is **hidden** on desktop so the
  same copyright and legal links are not shown twice. Socials stay
  **out** of the bar (top-right only).
- Q: When the desktop player is closed, and when it is open, which
  controls and content should it show? → A: **Superseded** by the
  always-open player clarification later this session. The earlier
  “restyle only / closed vinyl toolbar / open V-Flip list / keep loop
  and slider” answer is **not** current.
- Q: When the desktop player opens “to the right, then up” (and the bar
  opens “to the left, then up”), should each box grow from its corner,
  or should the whole control slide? → A: **Grow in place** (still
  current). Reinterpreted for the always-open player: the **playlist
  surface** grows from the always-visible player; the player chrome
  itself does not open or close. Bar still grows from the bottom-right
  corner. Not a slide. Not slide-then-grow.
- Q: Is the desktop player a collapsible V-Flip box, or always open?
  → A: **Always open.** Remove the V-Flip / vinyl button. There is no
  collapse/expand toggle for the player chrome. Desktop has the space,
  so the player stays in the open position and always shows the
  **currently playing track**.
- Q: What is the desktop player control row, left to right? → A:
  **Playlist**, then **Shuffle**, then **Play/pause** (replaces Loop),
  then **Mute** in the same right-hand slot as today’s mute. No Loop
  button. No vinyl button.
- Q: Where does copyright sit in desktop Info? → A: **Top-right corner
  of the open Info box**, same as the phone Info sheet (`©` + artist
  name Valence).
- Q: Do vinyl and the unmute-to-slider stay? → A: **No, not in this
  desktop player chrome.** Mute is a **simple on/off toggle** in that
  slot. No vinyl disc UI. No volume slider expanding from unmute.
  Visitors use the mute toggle and device/OS volume. Loop stays off on
  desktop because there is no Loop control.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Desktop bar without socials, with legal Info (Priority: P1)

A visitor on a typical laptop sees the mobile-style content bar on the
desktop stage: a boxed row of matching circular icons for **About**,
**Discography**, **Tour**, and **Info**. **Social icons are not in that
bar.** They already appear in the **top-right** corner.

Opening Info grows the bar. The open Info box shows **copyright Valence
in the top-right corner** (same as phone) plus English **Imprint** and
**Privacy Policy** pills that open the existing legal overlay. There is
**no** always-visible bottom-center legal footer.

Opening About, Discography, Tour, or Info grows from that bar. Closing
returns to the icon row. Socials stay reachable only from the top-right.

**Why this priority**: Duplicated socials or a missing legal home would
be the most obvious desktop mistakes.

**Independent Test**: On ~1280×800 with bar panels closed, confirm a
boxed content bar with About (if content exists), Discography, Tour, and
Info; no social icons in the bar; top-right socials still there; no
bottom-center footer. Open Info and confirm © Valence top-right plus
Imprint / Privacy Policy pills.

**Acceptance Scenarios**:

1. **Given** the landing on a viewport **1024px** wide or wider with all
   bar panels closed, **When** the visitor looks at the floor chrome,
   **Then** they see a boxed content bar on the bottom-right with
   **About** (if content exists), **Discography**, **Tour**, and **Info**,
   and **no** social / platform icons in that bar.
2. **Given** that rest state, **When** the visitor looks at the top-right,
   **Then** the existing social / platform icons are still there.
3. **Given** that rest state, **When** the visitor looks at the bottom
   center, **Then** there is **no** always-visible copyright / Impressum /
   Datenschutzerklärung footer cluster.
4. **Given** the content bar is visible, **When** the visitor opens Info,
   **Then** the bar expands and the Info box shows **© Valence** (or
   `© {year} {artist name}`) in the **top-right** of that box, plus
   English **Imprint** and **Privacy Policy** pills that open the
   existing legal overlay.
5. **Given** the content bar is visible, **When** the visitor opens About,
   Discography, or Tour, **Then** the bar expands to show that content
   and still does **not** insert social icons into the open bar.
6. **Given** a viewport **below 1024px**, **When** the visitor uses the
   phone content dock, **Then** Socials and Info still live in that phone
   bar (this story does not restyle phone).

---

### User Story 2 - Always-open desktop player (Priority: P1)

A visitor on a typical laptop looks at the bottom-left. The player is
**already open**. They see **what is currently playing**. There is **no**
V-Flip / vinyl button and **no** way to collapse the player chrome.

The control row, **left to right**, is:

1. **Playlist**
2. **Shuffle**
3. **Play/pause** (this slot replaces Loop)
4. **Mute** (same right-hand slot as today’s mute; on/off only)

They can turn playlist on to see the track list, shuffle, pause or resume
the atmosphere video, and mute or unmute. They cannot loop a track from
this chrome. They cannot open or close the player itself.

**Why this priority**: The owner replaced the old collapsible V-Flip box
with an always-visible player. This is what every laptop visit shows.

**Independent Test**: On ~1280×800 after intro, confirm the bottom-left
player is visible without tapping anything, shows the current track, and
the toolbar reads Playlist → Shuffle → Play/pause → Mute. Confirm **0**
V-Flip/vinyl buttons, **0** Loop buttons, and **0** volume sliders.
Toggle playlist, shuffle, play/pause, and mute.

**Acceptance Scenarios**:

1. **Given** the landing on a viewport **1024px** wide or wider after
   intro, **When** the visitor looks at the bottom-left without
   activating anything, **Then** the player is **already showing** and
   the **currently playing track** is readable.
2. **Given** that player, **When** the visitor reads the control row
   left to right, **Then** they see **Playlist**, then **Shuffle**, then
   **Play/pause**, then **Mute** — and **no** V-Flip/vinyl control and
   **no** Loop control.
3. **Given** an audio-eligible track, **When** the visitor uses Mute,
   **Then** sound toggles on or off in that same right-hand slot and
   **no** volume slider appears.
4. **Given** the atmosphere video is playing, **When** the visitor
   activates Play/pause, **Then** the video pauses (same meaning as the
   phone play/pause control) and activating it again resumes.
5. **Given** a viewport **below 1024px**, **When** the visitor uses the
   phone player, **Then** `015` / `018` stay as specified (this story
   does not restyle phone).

---

### User Story 3 - Playlist and bar grow in two stages (Priority: P1)

A visitor on a typical laptop opens playlist from the always-visible
player, and opens About / Discography / Tour / Info from the
bottom-right bar. When motion is allowed, each expand is a **smooth
two-stage grow in place**, and each close is the **exact reverse
shrink**. The whole control MUST NOT slide.

The **player chrome stays put**. Only the **playlist surface** (or
another expandable player surface) grows from that always-visible
player.

**Playlist** (grows from the always-visible bottom-left player)

| Action | Stage 1 | Stage 2 |
| ------ | ------- | ------- |
| **Open** | Grows **wider to the right** | then grows **taller up** |
| **Close** | Shrinks **down** | then shrinks **left** back to the always-open player |

**Bottom-right bar** (stays anchored bottom-right)

| Action | Stage 1 | Stage 2 |
| ------ | ------- | ------- |
| **Open / expand** | Grows **wider to the left** | then grows **taller up** |
| **Close / collapse** | Shrinks **down** | then shrinks **right** back to the corner |

The two stages are **sequential** and **smooth**, not a diagonal, not a
slide, and not slide-then-grow.

**Why this priority**: Q2 grow-in-place still applies; the player-side
path now means playlist, because the player itself no longer opens or
closes.

**Independent Test**: On ~1280×800 with motion allowed, toggle playlist
and watch it grow wider right then taller up from the always-visible
player (close shrinks down then left). The always-visible track +
toolbar stay. Open and close a bar control (including Info) and watch
left-then-up / down-then-right. Confirm nothing slides as a whole.
Reduced motion: both surfaces still toggle without required travel.

**Acceptance Scenarios**:

1. **Given** the always-open player on a viewport **1024px** wide or
   wider and motion is allowed, **When** the visitor turns playlist on,
   **Then** the playlist surface **grows in place** from that player:
   **wider to the right, then taller up** — not a slide, not opening
   the whole player from a closed pill.
2. **Given** playlist is on and motion is allowed, **When** the visitor
   turns playlist off, **Then** the playlist surface **shrinks in
   place**: **down, then left**, back to the always-open player (track
   + toolbar still visible).
3. **Given** the bottom-right bar is at rest and motion is allowed,
   **When** the visitor expands About, Discography, Tour, or Info,
   **Then** the bar **grows in place**: **wider to the left, then
   taller up**.
4. **Given** a bottom-right control is expanded and motion is allowed,
   **When** the visitor closes it, **Then** the bar **shrinks in
   place**: **down, then right**.
5. **Given** reduced motion, a keyboard, or a screen reader, **When**
   the visitor toggles playlist or a bar control, **Then** they still
   reach both states without required travel animation.
6. **Given** a viewport **below 1024px**, **When** the visitor opens or
   closes the phone player or content dock, **Then** phone motion from
   `015` / `018` is unchanged.

---

### User Story 4 - The rest of the stage still works (Priority: P2)

A visitor still reaches identity, top-right socials, legal via Info,
intro, shuffle/play-pause/mute meaning, and discography stage actions.
Crossing the phone / laptop line does not leave a mixed HUD. The center
stays atmosphere.

**Why this priority**: Proves this is desktop chrome polish, not a new
site or a phone rewrite.

**Independent Test**: Walk intro dismiss, top-right social, Info → legal
overlay, a discography stage action, and a resize across 1023px / 1024px.

**Acceptance Scenarios**:

1. **Given** the intro is showing on a laptop viewport, **When** the
   visitor has not dismissed it, **Then** this feature’s bar and player
   stay hidden the same way today’s chrome does.
2. **Given** the landing on a laptop viewport, **When** the visitor wants
   Imprint or Privacy Policy, **Then** they open **Info** and use the
   English HUD pills to get the existing legal overlay.
3. **Given** the visitor resizes across **1023px / 1024px**, **When** the
   crossing settles, **Then** they get a coherent phone HUD or a
   coherent desktop HUD — not a half-morphed mix.
4. **Given** the center of a laptop viewport with playlist and bar
   panels closed, **When** the visitor scans it, **Then** it is still
   atmosphere only (the always-open player stays on the periphery).

---

### Edge Cases

- **Reduced motion**: Playlist and bar open/close MUST still work.
  Two-stage travel MUST NOT be required.
- **Mid-motion interrupt**: A second playlist or bar toggle while travel
  is running MUST end in a real open or closed state — not a stuck
  half-grown playlist or bar. The always-open player chrome MUST remain
  visible.
- **Resize across 1024px**: Crossing the phone / laptop line MUST tear
  down in-flight desktop two-stage travel and MUST NOT leave a desktop
  always-open player on the phone HUD (phone still uses the `015` /
  `018` collapsible pill).
- **Intro still showing**: No bar or playlist travel runs on hidden
  chrome.
- **No scripting**: The always-open player chrome and the collapsed bar
  still paint. Playlist grow and bar grow are not required. Native
  disclosure MAY still reveal Info / legal links.
- **Glitch theme**: Existing glitch flavor MAY still play on HUD
  controls. It MUST NOT invert or skip the required direction order
  when motion is allowed.
- **Very wide monitors / 320px**: Desktop polish is judged on ~1280×800.
  The page MUST still load from 320px without horizontal scroll.
- **Many social channels**: Top-right socials wrap or stay compact.
  They MUST NOT reappear in the desktop bar.
- **Missing About**: About stays hidden. Remaining bar icons (including
  Info) stay boxed.
- **Legal overlay open**: Overlay behavior from `002` stays. That
  interaction MUST NOT collapse the Info sheet behind it.
- **Exclusive-open among content**: Opening About, Discography, Tour, or
  Info still closes the other content panel. The always-open player
  stays visible. Playlist MAY stay independently open (`011` spirit)
  unless a later clarification changes that.
- **No duplicate legal**: Desktop MUST NOT show both Info-in-bar and
  the old bottom-center footer at once.
- **No slide**: Playlist and bar MUST grow or shrink in place.
- **No audio / mute hidden**: If mute is not mounted (no audio-eligible
  catalog, same mount rule as today), the row is Playlist → Shuffle →
  Play/pause. Layout MUST NOT leave a dead vinyl or loop gap.
- **Loop without a control**: On desktop, loop stays **off**. Shuffle
  and stay rules from `011` run as if loop is off. Phone is unchanged.
- **Play/pause vs fallback**: If atmosphere video cannot play, Play/pause
  MUST NOT pretend the visitor paused (same spirit as phone `015`).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When viewport width is **1024px or wider**, the landing
  MUST present a **mobile-style content bar** on the desktop floor
  (boxed icon bar, grow-from-the-bar open). It MUST NOT be a
  scaled-down copy of the phone **stacked** two-dock layout.
- **FR-002**: That desktop content bar MUST **omit social / platform
  icons**. Socials MUST remain only in the **top-right** cluster on
  desktop.
- **FR-003**: The desktop content bar’s icon set MUST be: About (if
  content exists), Discography, Tour, and **Info**. Info MUST match
  the phone Info sheet (`015`): circled-i (existing `info` chrome
  icon), English **Imprint** / **Privacy Policy** pills that open the
  existing legal overlay, and **copyright** (`©` + artist name
  Valence) in the **top-right corner of the open Info box**. German
  legal markdown titles remain on the overlay.
- **FR-003a**: On viewports **1024px and wider**, the always-visible
  **bottom-center legal footer** MUST be **hidden**. Legal MUST live
  in the Info box only.
- **FR-004**: On those viewports, the **bottom-left player MUST be
  always open**. There MUST be **no** V-Flip / vinyl button and **no**
  collapse/expand toggle for the player chrome. The **currently
  playing track** MUST be visible without opening anything.
- **FR-004a**: The desktop player control row MUST be, left to right:
  **Playlist**, **Shuffle**, **Play/pause**, **Mute** (when mute is
  mounted). Play/pause occupies the slot that is Loop on today’s
  laptop toolbar. Loop MUST NOT appear. Vinyl MUST NOT appear.
- **FR-004b**: Mute on desktop MUST be a **simple on/off toggle** in
  that same right-hand slot. A volume **slider** MUST NOT expand from
  unmute. Fine loudness is the device/OS volume.
- **FR-005**: Shuffle, play/pause, mute, playlist membership (theme /
  stage tracks), and discography stage actions MUST keep their
  existing meaning (`011` / `015` as applicable). Play/pause MUST
  pause or resume the atmosphere video the same way the phone control
  does. This feature MUST NOT change phone playback rules. Desktop
  MUST NOT expose a Loop control; loop remains off on desktop.
- **FR-006**: When motion is allowed on viewports **1024px and wider**,
  turning **playlist** on MUST **grow in place** from the always-visible
  player in two sequential stages: first **wider to the right**, then
  **taller up**. Turning playlist off MUST **shrink in place**:
  **down**, then **left**, back to the always-open player. The player
  chrome MUST stay visible. The whole player MUST NOT slide. A
  diagonal shortcut MUST NOT replace the two stages.
- **FR-007**: When motion is allowed on viewports **1024px and wider**,
  expanding bottom-right bar controls (including Info) MUST **grow in
  place** in two sequential stages: first **wider to the left**, then
  **taller up**. Closing them MUST **shrink in place**: **down**, then
  **right**. The whole bar MUST NOT slide.
- **FR-008**: Reduced motion MUST still complete playlist toggle and
  bar open/close without required travel animation.
- **FR-009**: Keyboard and screen-reader visitors MUST still read the
  current track, use Playlist / Shuffle / Play/pause / Mute, and open
  each bar control (including Info → Imprint / Privacy Policy) without
  a pointer and without drag.
- **FR-010**: Rapid or overlapping input MUST leave playlist and each
  bar panel in a coherent open or closed end state matching the last
  committed action. The always-open player MUST NOT disappear.
- **FR-011**: Crossing **1023px / 1024px** MUST NOT leave a mixed HUD
  or an in-flight desktop playlist grow on the phone docks.
- **FR-012**: Viewports **below 1024px** MUST keep the `015` / `018`
  phone HUD. This feature MUST NOT change phone layout or phone motion.
- **FR-013**: Identity (top), top-right socials, intro hide/show,
  discography stage action, and existing chrome-editable strings MUST
  keep their roles except where this spec changes the desktop player
  chrome, lifts a socials-free content bar, and moves desktop legal
  into Info.
- **FR-014**: This feature MUST NOT add routes, third-party embeds,
  cookies, tracking, or new artist-editable files. Artist-facing docs
  MUST be updated in the same change set: laptop legal is Info (not
  the footer); laptop player is always-open Playlist / Shuffle /
  Play/pause / Mute (not vinyl / loop / slider) (constitution VII).
- **FR-015**: The landing MUST remain usable from 320px width with no
  horizontal scrolling. Visual success for **this** feature is a
  typical laptop (~1280×800).
- **FR-016**: New motion MUST stay justified as necessary for the
  named two-stage paths (constitution IV). When scripting is
  unavailable, the always-open player and collapsed bar still paint.

### Key Entities

- **Desktop content bar**: Boxed icon bar, bottom-right. About (if
  present), Discography, Tour, Info. No Socials.
- **Info (in-bar)**: Desktop legal home. Open box: © Valence
  **top-right**; Imprint / Privacy Policy pills → existing overlay.
- **Top-right socials**: Only social-icon home on viewports 1024px+.
- **Always-open desktop player**: Bottom-left player chrome that does
  not collapse. Shows the currently playing track plus the toolbar.
- **Player toolbar**: Left → right: Playlist, Shuffle, Play/pause,
  Mute (if mounted). No vinyl. No loop. No volume slider.
- **Playlist surface**: The expandable list that grows from the
  always-open player (grow in place, right then up).
- **Two-stage grow / shrink**: Width first, then height, from the
  surface’s floor corner. Reverse on close. Not a slide.
- **Laptop viewport**: Width **1024px and up**. Review ~1280×800.
- **Phone viewport**: Width **below 1024px**. Out of visual scope here.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On ~1280×800 with bar panels closed, a reviewer reports
  **0** social icons inside the desktop content bar, **1** Info icon
  in that bar, About / Discography / Tour present as specified, and
  **1** unchanged top-right social cluster.
- **SC-002**: On the same viewport after intro, a reviewer reports the
  bottom-left player is **visible without a click**, shows the
  **currently playing track**, and the toolbar is **Playlist → Shuffle
  → Play/pause → Mute**. **0** V-Flip/vinyl buttons, **0** Loop
  buttons, **0** volume sliders, **0** ways to collapse the player
  chrome.
- **SC-003**: With motion allowed on ~1280×800, a reviewer can toggle
  playlist **3 times** and report **0** opens that are not grow-in-place
  wider-right then taller-up from the always-open player, **0** closes
  that are not shrink-down then left, **0** slides, and **0** cases
  where the always-open track + toolbar disappear.
- **SC-004**: With motion allowed on ~1280×800, a reviewer can expand
  and collapse a bottom-right bar control **3 times** (at least once
  Info) and report **0** expands that are not grow-in-place wider-left
  then taller-up, **0** collapses that are not shrink-down then right,
  and **0** slides.
- **SC-005**: With reduced motion, the same reviewer completes playlist
  toggle and one bar open/close in under **15 seconds** with **0**
  required travel animations.
- **SC-006**: Keyboard-only on a laptop viewport can still: read the
  current track, toggle playlist / shuffle / play-pause / mute, open
  and close About or Discography, open Info, follow a top-right social,
  and reach Imprint / Privacy Policy from Info.
- **SC-007**: On a ~390×844 phone viewport, a side-by-side check against
  current `015` / `018` finds **0** intentional layout or motion
  changes.
- **SC-008**: At **1023px** the phone HUD is in effect; at **1024px**
  the desktop HUD from this spec is in effect. **0** mixed leftover
  states after a resize settle.
- **SC-009**: No new third-party embeds, cookies, or tracking.
- **SC-010**: On ~1280×800, opening Info shows **© Valence** (copyright
  + artist name) in the **top-right** of the Info box plus both legal
  pills; each pill opens the existing overlay. At rest: **0**
  always-visible bottom-center legal footer clusters.

## Assumptions

- This feature **is IDEA-024**. It is **not** an update to `018`. Phone
  player polish stays `018`.
- “The bar” is the mobile-style content dock on desktop **bottom-right**.
- Socials stay **out** of the bar because they already sit top-right.
- **Legal lives in Info**; footer hidden (locked earlier this session).
  Copyright in the Info box is the phone treatment: `© {year} {artist}`
  with artist name **Valence**, **top-right**.
- Desktop keeps a **left / right floor split**.
- **Q1 “restyle only / closed vs open V-Flip” is superseded.** The
  desktop player is always open. Vinyl, Loop, and unmute-to-slider are
  **out of this desktop player chrome**.
- Playlist contents on desktop reuse the existing laptop **theme-track
  list** from `011` (not the phone `018` three-row window) unless a
  later clarification copies the phone playlist layout.
- “Currently playing track” means the visitor-facing track name is
  always readable; a card treatment is allowed if it still fits the
  always-open player, but is not required.
- Play/pause is the existing phone **atmosphere video** play/pause
  (`015`), brought onto desktop in the old Loop slot.
- Mute is on/off only. Unmute restores a usable level without a slider
  (device/OS volume is the loudness control, same idea as phone).
- Loop stays **off** on desktop with no visitor control. Shuffle still
  hops when on. Phone loop remains absent as today.
- Handle-drag and the phone handle-idle nod are **not** required on
  desktop.
- Exclusive-open among About / Discography / Tour / Info stays.
  Playlist MAY stay open while a content panel is open.
- Two-stage **grow in place** (Q2) still applies. Player-side path =
  **playlist surface**, not opening/closing the player chrome. Duration
  and easing are plan-time.
- Breakpoint stays **below 1024px = phone**, **1024px and up = laptop**.
- Intro (`006`) still hides chrome until dismissed.
- Artist guide must stop saying laptop legal is the footer and laptop
  player is vinyl / loop / slider.
- Visual review is **operator-led**. Agents do not install browser
  automation or add packages for this feature.

## Dependencies

- `015-mobile-stage-hud` — bar, Info copyright placement, play/pause
  meaning (phone itself stays unchanged).
- `018-player-animation-polish` — phone player sheet stays on phone.
- `009-desktop-stage-ui` — identity, socials, labels; this spec hides
  the desktop footer and replaces the left player chrome.
- `011-vflip-now-playing` — shuffle / track-pick / mute-eligibility
  meaning; this spec **removes** vinyl, loop, and the volume slider
  from desktop chrome.
- `002-themed-background-video` — legal overlay; play/pause of the
  atmosphere video.
- `006-landing-intro` — chrome hidden until intro is dismissed.
- `004-landing-content-layout` — About / Discography / Tour content.
- `008-artist-docs` — guide currently says laptop legal is the footer
  and describes the vinyl V-Flip box.

## Out of Scope

- Phone / below-1024px HUD layout or motion (`015` / `018`)
- Putting social icons in the desktop bar
- Keeping a **duplicate** always-visible bottom-center legal footer
- Changing the legal overlay itself (`002`) or legal markdown
- A V-Flip / vinyl collapse toggle on desktop
- A Loop button or loop-on behavior on desktop
- A volume slider or unmute-to-slider expansion on desktop
- Copying the phone `018` three-row playlist onto desktop (unless a
  later clarification asks for it)
- Sliding the whole player or bar, or slide-then-grow
- Opening/closing the whole desktop player chrome (it stays open)
- Spec shrink or overhaul of `015` / `009` / `011` (IDEA-025)
- New routes, embeds, cookies, or new artist-editable files
- Landing intro copy (`006`)
- A dedicated tablet-only third layout
