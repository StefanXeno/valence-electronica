# Feature Specification: Desktop Chrome Polish

**Feature Branch**: `019-desktop-chrome-polish`

**Created**: 2026-09-08

**Status**: As-built (synced to code 2026-09-09)

**Input**: User description: "Basic desktop website UI changes, using the
    mobile website as the visual/interaction reference. (1) Keep the
    mobile-style bar on desktop but omit social icons from that bar —
    socials already sit top-right on desktop. (2) Restyle the bottom-left
    player so it looks more like the mobile player. (3) Desktop open/close
    motion: grow in place; bar left then up; playlist is a view-switch
    (height may grow up only). (4) Legal footer lives in the bar as Info. (5) Operator
    2026-09-08 later: desktop player is always open — no V-Flip toggle;
    show the currently playing **mobile card**; controls left to right
    are Playlist, Shuffle, Play/pause (replaces Loop), Mute (unmute
    reveals the volume slider); Info copyright sits top-right of the
    Info box, baseline-aligned with the Info heading."

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
| **Content bar** | Boxed icon bar: **About**, **Discography**, **Tour**, **Info**. No social icons. Open **Discography** is a **2.5-row** card well (two full cards + peek of the third). Player playlist stays **3** rows. |
| **Info box** | Same as phone: Imprint + Privacy Policy pills; **© Valence** in the **top-right**, **baseline-aligned** with the Info heading. |
| **Bottom-center legal footer** | **Hidden.** Legal lives in Info only. |
| **Bottom-left player** | **Always open.** No V-Flip / vinyl collapse toggle. Always shows the **same now-playing card as phone** (full card, not a name-only row). Toolbar left → right: **Playlist** (soundwave while the jukebox is open — **never both**), **Shuffle**, **Play/pause**, **Mute**. Box width is **static** (sized for the slider). Unmute reveals the slider in reserved space. |
| **Player motion** | Playlist **switches the view** from the currently-playing card to the jukebox card list. **No** width grow, **no** two-stage right-then-up. Height **may** grow **up only** so the list fits, then shrink down on close. Instant or a subtle height-only change. The player chrome itself does not open/close. |
| **Bar motion** | Grow in place: wider left, then taller up. Close shrinks down, then right. **Unchanged** two-stage. |

Desktop keeps a **left / right floor split** (player left, bar right). It
does **not** stack two full-width docks the way the phone does.

## Clarifications

### Session 2026-09-09 (desktop player revisions)

- Q: Keep the desktop playlist two-stage grow/extend (right then up)?
  → A: **No width grow.** Playlist reuses the phone **018 row morph**
  (currently-playing card merges into the list, stays selected and
  in view). Height MAY grow **up only**. Bar two-stage stays.
- Q: Phone header soundwave? → A: **No.** Phone header / title row
  has no wave. Floor pill wave and playlist **card** EQ stay.
- Q: Where does the playing soundwave live on desktop? → A: **Off the
  card.** Put it to the **right of “CURRENTLY PLAYING”** in the header
  row. Hide it (or switch header copy) in the jukebox / playlist view.
  Phone floor soundwave stays.
- Q: Keep HUD hover tooltips on Currently Playing / Jukebox titles?
  → A: **No.** Visitors already see those titles. Keep tooltips on
  other HUD controls (Playlist, Shuffle, Play/pause, Mute, About,
  etc.).
- Q: Playlist button vs soundwave on desktop? → A: **Same toolbar
  slot, two faces.** Closed: Playlist / stacked-notes icon opens the
  jukebox. Open: that control becomes the **soundwave** and returns
  to currently-playing. Header MAY keep the wave in the jukebox view.
  Phone playlist icon stays.
- Q: Does unmute slide the slider / box out? → A: **No.** Size the
  desktop box **once** for the full chrome including the slider.
  Muted: hide the slider in that reserved space. Unmuted: slider
  appears there. **No** width change, **no** push to the right. Phone
  still hides the slider.
- Q: Playlist icon and soundwave stacked in one toolbar slot? → A:
  **Never.** Exclusive swap only. Header wave is CURRENTLY PLAYING
  only (vertically centered with the label, toward the right).
  Jukebox title line has **no** header wave. Active card in the
  jukebox list **does** show the now-playing EQ.
- Q: Box jumps small → large on reload? → A: **No.** First paint MUST
  already be the final desktop width (CSS reserves the slider hole;
  mute slot is not `[hidden]` waiting on JS).
- Q: No-sound track (e.g. Show Me How) hides mute and shrinks the
  box? → A: **No on desktop.** Mute stays; width stays. Disabled is
  OK. Phone MAY still hide mute.
- Q: When the atmosphere video is paused, what does the desktop
  player header say? → A: **Currently pausing**
  (`currentlyPausingLabel`). Playing uses **Currently playing**.
  Phone expanded header stays `currentlyPlayingLabel` (015).
- Q: Is the player playlist a 2.5-row well? → A: **No.** Player
  playlist stays **three** full rows (`018`). The **Discography bar
  panel** is the 2.5-row well (two full cards + a peek of the third).

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
  current **for the bar**). Reinterpreted for the always-open player:
  playlist is a **view-switch** (optionally height-up only). The player
  chrome itself does not open or close. Bar still grows from the
  bottom-right corner. Not a slide. Not slide-then-grow.
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
  name Valence). **T028 follow-up:** © Valence MUST sit on the **same
  baseline / row height** as the Info heading text.
- Q: Do vinyl and the unmute-to-slider stay? → A: **Superseded** by the
  T028 review later this session. Vinyl and Loop stay **out**. The
  unmute-to-slider **returns** on desktop (see below).

### Session 2026-09-08 (T028 visual review)

- Q: Is desktop now-playing a name-only row? → A: **No.** Rest state
  MUST show the **same now-playing card as phone** (title, year/kind,
  listen-on, same card chrome). Reuse `015` / `018` theme-track card
  logic. Do not invent a second card.
- Q: What is the desktop Playlist list? → A: The **phone playlist card
  window** of **background-available** (theme / stage) tracks — same
  set and card as the now-playing card. **Not** the `011` laptop
  TrackInfoPanel / full discography list.
- Q: Does unmute show a slider? → A: **Yes on desktop.** Muted: no
  slider. Unmuted: the **full** volume slider (`011` unmute-to-expand).
  The player box takes more width **to the right** so the slider is
  not clipped (**instant** as of 2026-09-09 — no slide).
  Card width is **dynamic** with that mute+slider cluster.
- Q: Vinyl / Loop / always-open / bar / footer / two-stage grow? → A:
  **Unchanged.** Always-open player; no V-Flip/vinyl/loop; no socials
  in the bar; footer hidden; playlist is a view-switch (height-up
  only if the list needs room); bar grow left-then-up; 1024px; phone
  HUD unchanged.

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
   **When** Discography is open and more than two releases exist,
   **Then** the catalog well shows **two full cards plus a peek of
   the third** (2.5 rows). The player playlist MUST NOT use that
   2.5-row well (it stays three full rows).
6. **Given** a viewport **below 1024px**, **When** the visitor uses the
   phone content dock, **Then** Socials and Info still live in that phone
   bar (this story does not restyle phone).

---

### User Story 2 - Always-open desktop player (Priority: P1)

A visitor on a typical laptop looks at the bottom-left. The player is
**already open**. They see the **same now-playing card as phone** (not
a name-only label). There is **no** V-Flip / vinyl button and **no**
way to collapse the player chrome.

The rest-state header reads **Currently playing**, or **Currently
pausing** while the atmosphere video is paused. The playing soundwave
sits to the right of that header copy (not on the solo card).

The control row, **left to right**, is:

1. **Playlist**
2. **Shuffle**
3. **Play/pause** (this slot replaces Loop)
4. **Mute** (same right-hand slot as today’s mute; unmute shows the
   **full volume slider** in reserved space; box width stays put)

They can turn playlist on to see the **phone-style card window** of
background-available tracks, shuffle, pause or resume the atmosphere
video, and mute or unmute (with slider when unmuted). They cannot loop
a track from this chrome. They cannot open or close the player itself.

**Why this priority**: The owner replaced the old collapsible V-Flip box
with an always-visible player. This is what every laptop visit shows.

**Independent Test**: On ~1280×800 after intro, confirm the bottom-left
player is visible without tapping anything, shows the **full now-playing
card**, and the toolbar reads Playlist → Shuffle → Play/pause → Mute
(Playlist becomes the soundwave while the jukebox is open).
Confirm **0** V-Flip/vinyl buttons and **0** Loop buttons. Confirm the
slider is **hidden while muted** and the **full slider** appears
**instantly** when unmuted (reserved space; **0** box-width change).
Toggle playlist, shuffle, play/pause, and mute.

**Acceptance Scenarios**:

1. **Given** the landing on a viewport **1024px** wide or wider after
   intro, **When** the visitor looks at the bottom-left without
   activating anything, **Then** the player is **already showing**,
   the **now-playing card** is readable (title / year / listen-on),
   and the header reads **Currently playing** (or **Currently
   pausing** if the atmosphere is paused) with the soundwave on that
   header row only.
2. **Given** that player, **When** the visitor reads the control row
   left to right,    **Then** they see **Playlist**, then **Shuffle**, then
   **Play/pause**, then **Mute** — and **no** V-Flip/vinyl control and
   **no** Loop control. **When** playlist is on, that first control
   is the **soundwave** (not the stacked-notes icon).
3. **Given** an audio-eligible track, **When** the visitor unmutes,
   **Then** the **full** volume slider appears **instantly** in the
   already-reserved space to the right of mute. The player box width
   MUST NOT change. Muting hides the slider in that same space.
4. **Given** the atmosphere video is playing, **When** the visitor
   activates Play/pause, **Then** the video pauses (same meaning as the
   phone play/pause control) and activating it again resumes.
5. **Given** a viewport **below 1024px**, **When** the visitor uses the
   phone player, **Then** `015` / `018` stay as specified (this story
   does not restyle phone).

---

### User Story 3 - Playlist view-switch; bar grows in two stages (Priority: P1)

A visitor on a typical laptop opens playlist from the always-visible
player, and opens About / Discography / Tour / Info from the
bottom-right bar. Playlist **switches the view** (currently-playing
card ↔ jukebox list). The bar still uses **two-stage grow in place**.
The whole control MUST NOT slide.

The **player chrome stays put**. Playlist does **not** grow/extend
the box to the right.

**Playlist** (018-style morph on the always-visible bottom-left player)

| Action | Motion |
| ------ | ------ |
| **Open** | The currently-playing card **merges into the list** (same row morph as phone). It stays **selected / now-playing** (EQ on the card) and **in the visible 3-slot window**. Extra cards grow in around it. Height **may** grow **up only**. **No** width grow. |
| **Close** | Reverse: extras collapse; the box returns to the solo currently-playing card. |

**Bottom-right bar** (stays anchored bottom-right)

| Action | Stage 1 | Stage 2 |
| ------ | ------- | ------- |
| **Open / expand** | Grows **wider to the left** | then grows **taller up** |
| **Close / collapse** | Shrinks **down** | then shrinks **right** back to the corner |

Bar stages are **sequential** and **smooth**, not a diagonal, not a
slide, and not slide-then-grow. Playlist MUST NOT reuse that two-stage
width-then-height path.

**Why this priority**: Q2 grow-in-place still applies to the **bar**.
Playlist is a view-switch because the operator rejected the player-side
grow/extend.

**Independent Test**: On ~1280×800, toggle playlist and confirm the
view switches (currently-playing card ↔ jukebox list) with **0**
rightward width grow and **0** two-stage slides. Height may rise up
only. Toolbar stays. Open and close a bar control (including Info) and
watch left-then-up / down-then-right. Confirm nothing slides as a
whole. Reduced motion: both surfaces still toggle without required
travel.

**Acceptance Scenarios**:

1. **Given** the always-open player on a viewport **1024px** wide or
   wider, **When** the visitor turns playlist on, **Then** the box
   **switches** to the jukebox card list — **not** a two-stage
   wider-right then taller-up grow, **not** a slide, **not** opening
   the whole player from a closed pill. Height MAY grow **up only**.
2. **Given** playlist is on, **When** the visitor turns playlist off,
   **Then** the box **switches** back to the currently-playing card
   (track + toolbar still visible). Height MAY shrink down. **No**
   leftward width shrink.
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
  Two-stage **bar** travel MUST NOT be required. Playlist view-switch
  stays instant.
- **Mid-motion interrupt**: A second playlist or bar toggle while travel
  is running MUST end in a real open or closed state — not a stuck
  half-grown **bar**. Playlist has no in-flight width stage. The
  always-open player chrome MUST remain visible.
- **Resize across 1024px**: Crossing the phone / laptop line MUST tear
  down in-flight desktop **bar** two-stage travel and MUST NOT leave a
  desktop always-open player on the phone HUD (phone still uses the
  `015` / `018` collapsible pill).
- **Intro still showing**: No bar or playlist travel runs on hidden
  chrome.
- **No scripting**: The always-open player chrome and the collapsed bar
  still paint. Playlist view-switch and bar grow are not required.
  Native disclosure MAY still reveal Info / legal links.
- **Glitch theme**: Existing glitch flavor MAY still play on HUD
  controls **and** MUST overlay the Currently Playing ↔ Playlist
  morph (including height WAAPI) plus the bar two-stage grow. It MUST
  NOT invert or skip the required direction order when motion is
  allowed. Other themes stay smooth-only.
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
- **No slide**: Bar MUST grow or shrink in place. Playlist MUST NOT
  slide or two-stage-widen; height MAY change **up / down only**.
- **No audio / mute chrome**: If the catalog has **no** audio-eligible
  tracks, mute is not mounted and the row is Playlist → Shuffle →
  Play/pause. If mute **is** mounted, desktop MUST keep that chrome
  (and the reserved slider width) on **no-sound** tracks — disabled
  is OK. MUST NOT shrink the box. Phone MAY still hide mute on
  fallback / no-audio as today.
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
  Valence) in the **top-right** of the open Info box, **aligned to
  the same row height / baseline as the Info heading text**. German
  legal markdown titles remain on the overlay.
- **FR-003a**: On viewports **1024px and wider**, the always-visible
  **bottom-center legal footer** MUST be **hidden**. Legal MUST live
  in the Info box only.
- **FR-004**: On those viewports, the **bottom-left player MUST be
  always open**. There MUST be **no** V-Flip / vinyl button and **no**
  collapse/expand toggle for the player chrome. The **currently
  playing** face MUST be the **same theme-track card as phone** (full
  card, not a name-only row), visible without opening anything.
- **FR-004a**: The desktop player control row MUST be, left to right:
  **Playlist / now-playing toggle**, **Shuffle**, **Play/pause**,
  **Mute** (when mute is mounted). **Playlist closed:** that first
  control is the Playlist (stacked-notes) icon and opens the jukebox.
  **Playlist open:** the **same slot** shows the **soundwave** and
  returns to the currently-playing view. Labels MUST match the face
  (Playlist vs Currently playing). Play/pause occupies the slot that
  is Loop on today’s laptop toolbar. Loop MUST NOT appear. Vinyl MUST
  NOT appear. Phone MUST keep the Playlist icon in that slot.
- **FR-004b**: Mute on desktop MUST stay in that right-hand slot
  whenever the catalog mounted mute (at least one audio-eligible
  track). The player box width MUST be that full chrome **on first
  paint** (SSR/CSS reserves the slider hole — not after JS). **Muted:**
  the slider MUST NOT be visible, but the reserved width MUST remain.
  **Unmuted:** the **full** slider MUST appear in that space. Mute /
  unmute / **no-sound track changes** MUST NOT change box width, MUST
  NOT hide the mute control, and MUST NOT animate
  `--jukebox-slider-extra`. A no-sound track MAY disable mute. Phone
  still hides the slider and MAY hide mute when there is no audio.
- **FR-004c**: Opening Playlist on desktop MUST show the **phone
  playlist card window** of **background-available** theme/stage
  tracks (same card logic as the rest-state now-playing card). It MUST
  NOT use the `011` laptop TrackInfoPanel / full discography list.
- **FR-005**: Shuffle, play/pause, mute, playlist membership (theme /
  stage tracks), and discography stage actions MUST keep their
  existing meaning (`011` / `015` as applicable). Play/pause MUST
  pause or resume the atmosphere video the same way the phone control
  does. This feature MUST NOT change phone playback rules. Desktop
  MUST NOT expose a Loop control; loop remains off on desktop.
- **FR-006**: On viewports **1024px and wider**, turning **playlist**
  on MUST reuse the phone (`018`) playlist **row morph**: the
  currently-playing card becomes a list row, stays **selected** (EQ
  badge), and stays **in the visible playlist window**. Extra cards
  grow in around it. It MUST NOT grow or extend the box to the right,
  MUST NOT run a two-stage width-then-height morph, and MUST NOT
  slide. Height MAY grow **up only**. Turning playlist off MUST
  reverse that morph back to the solo card. Reduced motion MAY snap.
  Phone playlist motion (`015` / `018`) is unchanged except the
  phone **header** MUST NOT show a soundwave (floor wave + card EQ
  stay).
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
  or an in-flight desktop **bar** grow on the phone docks.
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
  Play/pause / Mute (not vinyl / loop); the volume slider is desktop
  chrome **only while unmuted** (constitution VII).
- **FR-015**: The landing MUST remain usable from 320px width with no
  horizontal scrolling. Visual success for **this** feature is a
  typical laptop (~1280×800).
- **FR-016**: New motion MUST stay justified as necessary for the
  named **bar** two-stage path (constitution IV). Desktop playlist
  MUST NOT add a second two-stage sequencer. When scripting is
  unavailable, the always-open player and collapsed bar still paint.
- **FR-017**: On the desktop currently-playing view, the playing
  soundwave MUST sit on the **right** of the header row, **vertically
  centered** with the header copy. That copy MUST be
  `currentlyPlayingLabel` while the atmosphere is playing, and
  `currentlyPausingLabel` (**Currently pausing**) while it is paused.
  The wave MUST NOT appear on the rest-state solo card. In
  the jukebox / playlist view: **no** soundwave on the V-Flip /
  jukebox **title** line; the first toolbar control MUST be the
  soundwave (see FR-004a); the **active** theme-track card MUST show
  the now-playing EQ badge. Other cards MUST NOT show a wave.
- **FR-018**: HUD hover tooltips MUST NOT appear on the currently-
  playing or jukebox / playlist **header titles**. Other HUD controls
  (Playlist, Shuffle, Play/pause, Mute, About, etc.) keep their
  labels.
- **FR-019**: The desktop **Discography** bar panel MUST use a
  **2.5-row** card well (two full release cards + a peek of the
  third, plus the two gaps). The desktop **player playlist** MUST
  stay a **three**-row window (`018`). MUST NOT apply the 2.5-row
  well to the player playlist.

### Key Entities

- **Desktop content bar**: Boxed icon bar, bottom-right. About (if
  present), Discography, Tour, Info. No Socials. Discography open
  well is **2.5** theme-track-style catalog cards (peek of the next).
- **Info (in-bar)**: Desktop legal home. Open box: © Valence
  **top-right**; Imprint / Privacy Policy pills → existing overlay.
- **Top-right socials**: Only social-icon home on viewports 1024px+.
- **Always-open desktop player**: Bottom-left player chrome that does
  not collapse. Shows the phone now-playing **card** plus the toolbar.
  Rest header: Currently playing / Currently pausing.
- **Player toolbar**: Left → right: Playlist, Shuffle, Play/pause,
  Mute (if mounted). No vinyl. No loop. Volume slider only when unmuted.
- **Playlist surface**: Phone-style **card window** of background-
  available tracks. Desktop: view-switch + optional height-up only.
- **Two-stage grow / shrink**: **Bar only.** Width first, then height,
  from the bottom-right corner. Reverse on close. Not a slide.
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
  **full now-playing card** (not a name-only row), header copy is
  **Currently playing** (or **Currently pausing** when paused) with
  the wave on that header only, and the toolbar is
  **Playlist → Shuffle → Play/pause → Mute** at rest (**soundwave**
  in the Playlist slot while the jukebox is open). **0** V-Flip/vinyl
  buttons, **0** Loop buttons, **0** ways to collapse the player
  chrome. **0** sliders while muted; **1** full slider when unmuted
  (**0** box-width changes; **0** slider slides).
- **SC-003**: On ~1280×800, a reviewer can toggle playlist **3 times**
  and report **0** rightward width grows, **0** two-stage
  right-then-up / down-then-left playlist morphs, **0** slides, and
  **0** cases where the always-open **card** + toolbar disappear.
  Each open **switches** to the jukebox list and the first toolbar
  control becomes the **soundwave**; each close **switches** back to
  currently-playing and restores the Playlist icon. Height MAY change
  **up / down only**.
  Playlist cards are the phone theme-track cards (background-available
  set), not the `011` laptop list.
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
  + artist name) in the **top-right**, **on the same row height as the
  Info heading**, plus both legal pills; each pill opens the existing
  overlay. At rest: **0** always-visible bottom-center legal footer
  clusters.
- **SC-011**: On ~1280×800 with more than two releases, opening
  Discography shows a **2.5-row** well (two full cards + peek of the
  third). Opening the player playlist still shows **three** full
  theme-track rows, not 2.5.

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
  desktop player is always open. Vinyl and Loop stay **out**. The
  T028 review **restored** unmute-to-slider on desktop.
- Playlist contents on desktop are the **phone theme-track card
  window** (`015` / `018` card logic; background-available / stage
  tracks only). The `011` laptop TrackInfoPanel list is **not** the
  desktop playlist.
- “Currently playing” on desktop is the **full phone now-playing
  card**, not a name-only row.
- Play/pause is the existing phone **atmosphere video** play/pause
  (`015`), brought onto desktop in the old Loop slot.
- Mute is a toggle. The desktop box is sized for the slider. Unmute
  shows the **full** `011` slider in reserved space; mute hides it.
  Device/OS volume remains available.
- Loop stays **off** on desktop with no visitor control. Shuffle still
  hops when on. Phone loop remains absent as today.
- Handle-drag and the phone handle-idle nod are **not** required on
  desktop.
- Exclusive-open among About / Discography / Tour / Info stays.
  Playlist MAY stay open while a content panel is open.
- Two-stage **grow in place** (Q2) still applies to the **bar**.
  Desktop playlist is a **view-switch** + optional height-up only.
- Breakpoint stays **below 1024px = phone**, **1024px and up = laptop**.
- Intro (`006`) still hides chrome until dismissed.
- Artist guide must stop saying laptop legal is the footer and laptop
  player is vinyl / loop (slider is unmute-only on laptop).
- Visual review is **operator-led**. Agents do not install browser
  automation or add packages for this feature.

## Dependencies

- `015-mobile-stage-hud` — bar, Info copyright placement, play/pause
  meaning (phone itself stays unchanged).
- `018-player-animation-polish` — phone player sheet stays on phone.
- `009-desktop-stage-ui` — identity, socials, labels; this spec hides
  the desktop footer and replaces the left player chrome.
- `011-vflip-now-playing` — shuffle / track-pick / mute-eligibility
  meaning; this spec **removes** vinyl and loop from desktop chrome
  and **keeps** the unmute-to-slider (T028).
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
- Showing the volume slider while **muted**
- Using the `011` laptop TrackInfoPanel list as the desktop playlist
  (desktop playlist is the phone theme-track **card** window)
- Sliding the whole player or bar, or slide-then-grow
- Two-stage **width-then-height** grow on desktop playlist (bar
  two-stage stays)
- Opening/closing the whole desktop player chrome (it stays open)
- Spec shrink or overhaul of `015` / `009` / `011` (IDEA-025)
- New routes, embeds, cookies, or new artist-editable files
- Landing intro copy (`006`)
- A dedicated tablet-only third layout
