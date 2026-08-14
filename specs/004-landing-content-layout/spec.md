# Feature Specification: Landing Stage (Peripheral Content & Jukebox)

**Feature Branch**: `004-landing-content-layout`

**Created**: 2026-08-14

**Status**: As-built (matches the landing HUD as of 2026-08-14)

**Input**: User description: "Add landing content (lyrics, discography, tour dates,
About me, existing socials, and a theme switcher presented as a jukebox that plays
different songs) and keep the center of the page visually free. Every visible text
must be editable by a non-programmer the same way the legal pages already are."

## Clarifications

HUD slots, jukebox chrome, glitch, atmosphere video, and phone visual success in
the **as-built HUD** session below are authoritative. Earlier answers in this
file still hold unless they conflict with that session.

### Session 2026-08-14

- Q: Which content belongs on the landing page? → A: Lyrics, discography, tour
  dates, About me, existing socials, and a theme switcher. No extra site pages for
  these.
- Q: How should the theme switcher feel? → A: A jukebox. Choosing an entry plays a
  different song and switches the bound visual theme / atmosphere.
- Q: How should the layout treat the middle of the page? → A: The center stays
  visually free at all times so the atmosphere is the stage. Content lives on the
  periphery.
- Q: On a laptop, which peripheral pieces stay visible the whole time, and which
  does a visitor open only when they want them? → A: Identity, jukebox, and
  socials stay visible as compact persistent chrome. About, lyrics, discography,
  and tour open on demand. On a phone, at most one on-demand panel at a time.
- Q: If a discography release has a matching stage clip, what should happen when
  the visitor selects that release? → A: Catalog only — selecting a release does
  not change the jukebox. If that release exists in the jukebox, a small button
  on the row can switch the stage (song + theme) to that entry. Unbound releases
  have no such button. Outbound listen/store links still work.
- Q: After a visitor picks a jukebox entry (or uses the discography stage button),
  should that choice still be there if they reload the page? → A: Each load uses
  the configured default. A jukebox pick lasts only until reload. No visit memory.
- Q: When there are no releases yet, should visitors still see a discography
  control? → A: Always show discography. If empty, show a clear “no releases yet”
  (or similar) message. The shipped content also includes a few clearly marked
  example discography entries so the catalog is demonstrable until real releases
  replace them.
- Q: If the friend saves a content file with a required piece missing (for
  example a tour date without a city), what should happen? → A: Skip the broken
  item and publish the rest (that row/entry simply does not appear). The live
  site never goes blank.
- Q: How strict is “one on-demand panel” on phones, including when scripting is
  off? → A: When scripting is available, small screens MUST show at most one
  on-demand panel. Larger screens MAY show more than one if the center stays
  free; this feature still uses exclusive-open on all widths (YAGNI). Without
  scripting, `<details>` still work; more than one MAY be open (same degradation
  idea as in-page legal overlay). A tiny first-party listener implements
  exclusive-open — no accordion library.

### Session 2026-08-14 (as-built HUD)

- Q: Which edge holds which chrome on a typical laptop? → A: Identity top-left
  (name + hook only). Socials top-right as equal-sized platform icons only.
  Jukebox bottom-left. On-demand About / lyrics / discography / tour bottom-right.
  Mute stays bottom-right below that cluster. Copyright + Impressum /
  Datenschutzerklärung sit together bottom-left as transparent footer chrome
  (no bar).
- Q: How does the jukebox present when idle? → A: Collapsed to a vinyl-record
  control (same family as the mute circle). Opening it expands a compact list
  along that edge; it does not dump the song list in the center.
- Q: Do new HUD controls glitch? → A: Yes, but only while the Nightmare visual
  theme (`nightmare-crimson`) is active. Closed on-demand boxes glitch on hover;
  clicking the control glitches the whole box; hovering an already-open panel
  does not. Jukebox expand/collapse and collapsed-vinyl hover follow the mute
  morph language. Existing `003` targets (active socials, legal links, legal
  exit, mute) keep their treatments, still Nightmare-only. Other themes stay
  still. Deep per-theme type/motion packs (IDEA-002) remain out of scope.
- Q: Does every jukebox entry play the looping atmosphere video? → A: No. The
  looping video (and its unmute audio) belongs to the Nightmare theme. Other
  entries MAY be a static poster only (temporary stills allowed) with no looping
  video and no mute control while they are active.
- Q: Is the phone HUD in scope for this feature’s visual success? → A: No. v1
  is a typical-laptop stage. A dedicated mobile/small-screen composition is
  deferred (IDEA-013). The landing MUST remain reachable on small screens (no
  blank page) but MUST NOT be judged as a finished phone layout in this feature.
- Q: Do example tour dates ship? → A: Yes — at least one clearly marked EXAMPLE
  upcoming show in content, replaceable without a layout rewrite (same spirit as
  example releases and jukebox entries).
- Q: What if a catalog folder has zero Markdown files? → A: Valid empty state.
  Zero files in `shows/`, `releases/`, or `about/` MUST still publish: tour and
  discography show their empty-state copy; About stays hidden if missing. That
  MUST NOT look like a broken content config (Astro’s default glob loader omits
  empty folders from the store and warns on `getCollection`; this feature keeps
  those collections addressable and watches the folder so the first file still
  hot-loads).

### Session 2026-08-14 (content editing)

- Q: Who must be able to change the texts, and how? → A: A friend with no coding
  knowledge. Every visitor-facing text must be changeable the same way Impressum
  and the privacy page already are: open a plain content file, change the words,
  save — never edit layout or program files.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor sees a stage, not a document (Priority: P1)

A visitor opens the site and the middle of the view is open: the cinematic
atmosphere (video or static fallback) is the stage. Compact persistent chrome at
the edges shows who this is (identity), the jukebox, and socials. About, lyrics,
discography, and tour are not sitting open; the visitor opens them when they want
them. Nothing important is parked in the center.

**Why this priority**: The free center is the layout rule for everything else. If
content occupies the middle, the page becomes a brochure over a video and the rest
of this feature fights itself.

**Independent Test**: Open the landing page on a typical laptop. Confirm the
central area is atmosphere-only, identity is obvious from the top-left edge, and
no primary content block sits in the middle. Phone/small-screen visual layout is
out of this feature’s success bar (IDEA-013).

**Acceptance Scenarios**:

1. **Given** a typical laptop view, **When** the visitor opens the landing page,
   **Then** the central area of the screen shows atmosphere only (no About text,
   lyrics, lists, or jukebox body occupying the middle).
2. **Given** a typical laptop view, **When** the visitor looks at the corners,
   **Then** identity is top-left, socials are top-right as icons, the jukebox is a
   collapsed vinyl control bottom-left, and About / lyrics / discography / tour
   are closed controls bottom-right.
3. **Given** the landing page is open, **When** the visitor looks for whose site
   this is, **Then** they can name "Valence" within a few seconds from peripheral
   identity (name and a short hook), without a huge title sitting in the center.
4. **Given** the atmosphere is playing or showing its static fallback, **When**
   content regions are visible at the edges, **Then** those regions stay readable
   and do not cover the center with an opaque sheet.

Phone and other small viewports: the same regions MUST remain reachable. How they
are composed on a phone is **not** specified here (IDEA-013).

---

### User Story 2 - Visitor uses the jukebox to change song and world (Priority: P1)

A visitor sees a jukebox as persistent edge chrome (not hidden behind a menu).
At rest it is a compact vinyl-record control. Opening it lists selectable entries
along that edge. Each selectable entry is a song (and its bound atmosphere/theme).
Choosing a different entry changes what is on the stage and how the page feels.
Only the Nightmare theme uses the looping atmosphere video; other entries may be
a static still. Sound still never starts by itself; the existing mute/unmute
control remains the way to hear audio when the active entry has audio.
Mute/unmute state survives a switch (the site does not force mute again unless
the environment requires it).

**Why this priority**: The jukebox is the interaction that ties songs, lyrics, and
theme together. Without it, lyrics have no “current track” and the theme switcher
has no visitor-facing form.

**Independent Test**: With more than one jukebox entry configured, select a
different entry and confirm atmosphere/theme and current song identity change;
confirm audio stays muted until unmute; confirm mute state is kept across a
switch when audio exists.

**Acceptance Scenarios**:

1. **Given** at least two jukebox entries, **When** the visitor selects a different
   entry, **Then** the active song identity, its bound atmosphere, and its bound
   visual theme update together.
2. **Given** background audio was muted, **When** the visitor selects another
   jukebox entry that has audio, **Then** audio stays muted until they unmute
   (no surprise sound).
3. **Given** the visitor has unmuted, **When** they select another jukebox entry
   that has audio, **Then** playback continues in the unmuted state unless the
   environment blocks it.
4. **Given** only one jukebox entry exists, **When** the visitor sees the jukebox,
   **Then** it still presents the current “record” clearly; there is simply nothing
   else to pick.
5. **Given** the visitor prefers reduced motion, **When** they select a jukebox
   entry, **Then** the bound static atmosphere and theme still update; looping
   video does not start.
6. **Given** the visitor has selected a non-default jukebox entry, **When** they
   reload the landing page, **Then** the stage is the content-configured default
   again (not the last pick).
7. **Given** the active entry is Nightmare with looping video, **When** the visitor
   selects an entry that is a static still (no video sources), **Then** the loop
   stops, the still and that entry’s theme show, and the mute control is hidden
   while that entry is active.

---

### User Story 3 - Visitor reads About and reaches socials at the edge (Priority: P1)

A visitor can open About me on demand from the periphery without covering the
center. Existing listen/follow socials stay visible as persistent **icon** chrome
(equal-sized platform marks; names via accessible labels, not visible text).
Socials already exist; this story is about placing them in the new stage layout,
not inventing new platforms.

**Why this priority**: Identity and “where do I listen/follow?” remain core jobs of
the site. They must survive the layout change.

**Independent Test**: From the landing page, open About me, read a short bio, and
use an existing social/music link; confirm the center stays open and the link
opens in a new tab.

**Acceptance Scenarios**:

1. **Given** About copy exists, **When** the visitor opens About me from the
   periphery, **Then** they can read a short artist bio (more than one sentence)
   without a new page and without filling the center.
2. **Given** About copy is missing, **When** the landing page loads, **Then** the
   About control is hidden and the rest of the stage still works.
3. **Given** the landing page is open, **When** the visitor looks for listen/follow
   links, **Then** the existing socials/channels are visible as persistent icon
   chrome (equal-sized platform marks, accessible names, not hidden behind an extra
   open action) and still open in a new tab.

---

### User Story 4 - Visitor reads lyrics for the current jukebox song (Priority: P2)

A visitor wants the words for what is currently selected in the jukebox. They open
a lyrics region on the periphery and read the lyrics for that song. If the track
has no lyrics (instrumental or not supplied), the region says so instead of looking
broken. Changing the jukebox updates which lyrics are shown.

**Why this priority**: Lyrics are requested content, but they depend on a current
song identity. They are valuable once the jukebox exists; they are not required to
prove the stage layout.

**Independent Test**: Select a jukebox entry that has lyrics and open the lyrics
region; select an instrumental or empty-lyrics entry and confirm a clear empty
state; confirm the center stays open.

**Acceptance Scenarios**:

1. **Given** the active jukebox entry has lyrics, **When** the visitor opens the
   lyrics region, **Then** they see that song’s lyrics (not a dump of every song at
   once).
2. **Given** the active jukebox entry has no lyrics, **When** the visitor opens the
   lyrics region, **Then** they see a clear “instrumental / lyrics not available”
   state, not a blank hole.
3. **Given** lyrics are open, **When** the visitor selects a different jukebox
   entry, **Then** the lyrics region follows the new song.
4. **Given** lyrics are longer than the edge region, **When** the visitor reads
   them, **Then** they can scroll inside that region; the center of the page stays
   free.

---

### User Story 5 - Visitor browses the discography (Priority: P2)

A visitor wants to know what Valence has released. From the periphery they open a
discography list (title, year, kind of release, optional listen/store link). This
is the catalog; browsing or selecting a row does not change the jukebox. If a
release also exists as a jukebox entry, that row shows a small button the visitor
can use to put that song on the stage. Releases without a jukebox entry have no
such button. The catalog can include items that are not playable on the stage.

**Why this priority**: Catalog is core artist-site content, independent of whether
every release has a stage clip. The optional button is an explicit opt-in, not a
hidden second jukebox.

**Independent Test**: Open discography, confirm the shipped example entries (or
later real releases) match the content source, follow an optional outbound link
in a new tab without changing the stage, use the small stage button on a bound
release to switch the jukebox, and confirm an unbound release has no such button.
Temporarily empty the catalog and confirm the control still appears with a clear
empty message. Center stays open.

**Acceptance Scenarios**:

1. **Given** at least one release is configured, **When** the visitor opens
   discography, **Then** they see each release’s title and year (and kind when
   provided) in a peripheral list.
2. **Given** a release has a listen or store link, **When** the visitor activates
   it, **Then** the destination opens in a new tab and the jukebox does not
   change.
3. **Given** a release exists as a jukebox entry, **When** the visitor uses the
   small stage button on that row, **Then** the jukebox switches to that entry
   (song, atmosphere, and theme) with the same mute rules as a jukebox pick.
4. **Given** a release has no jukebox entry, **When** the visitor looks at that
   row, **Then** there is no stage-switch button.
5. **Given** no releases are configured, **When** the visitor opens discography,
   **Then** the discography control is still there and shows a clear “no releases
   yet” (or equivalent) message — not a missing or broken section.
6. **Given** discography is open, **When** the visitor reads a long list, **Then**
   the list scrolls inside its region and the center stays free.

---

### User Story 6 - Visitor checks tour dates (Priority: P2)

A visitor wants to know if they can see Valence live. From the periphery they open
upcoming dates (date, city, venue, optional ticket link). The shipped content
includes at least one clearly marked EXAMPLE show so the list is demonstrable.
If nothing is booked, the region still exists and says that no dates are
announced — so it does not look like a missing page.

**Why this priority**: Tour info is requested, but it can be empty for long
stretches. The empty state is part of the product.

**Independent Test**: With the shipped EXAMPLE upcoming date (or later real
dates), open the region and verify fields and optional ticket links. With zero
dates, confirm the “no dates announced” state. Center stays free.

**Acceptance Scenarios**:

1. **Given** upcoming dates exist, **When** the visitor opens tour dates, **Then**
   they see date, city, and venue for each, ordered soonest first.
2. **Given** a date has a ticket link, **When** the visitor activates it, **Then**
   it opens in a new tab.
3. **Given** no upcoming dates exist, **When** the visitor opens tour dates,
   **Then** they see a clear “no upcoming dates” message rather than a blank or
   missing control.
4. **Given** a date is in the past, **When** the visitor looks at the landing tour
   list, **Then** that date is not shown as an upcoming show.

---

### User Story 7 - A non-programmer can change every visible text (Priority: P1)

A friend of the operator who does not write code can still change every text
visitors see: artist name and hook, About me, lyrics, discography wording, tour
copy, jukebox labels, social labels, region titles (e.g. “About me”, “Lyrics”),
and empty-state sentences (e.g. “no upcoming dates”). They do this the same way
Impressum and the privacy page already work: open a plain content file, change
the words, save. They never open layout or program files. A short guide tells
them which file is which.

**Why this priority**: The landing will keep changing (new verses, new dates, new
wording). If any of that lives in code, only a developer can run the site. The
legal pages already prove the editing model; this feature must use that model for
all new (and relocated) landing copy.

**Independent Test**: Hand the content guide to someone who does not write code.
Have them change an About sentence, a lyric line, a release title, a tour city, a
jukebox label, and a region title. Confirm each change shows on the landing page
and that they did not edit layout or program files.

**Acceptance Scenarios**:

1. **Given** the content files and the short editing guide, **When** a
   non-programmer changes any one visitor-facing text, **Then** that text updates
   on the landing page and no layout or program file needs to change.
2. **Given** placeholder copy or sample dates/releases, **When** real wording
   replaces them, **Then** the layout does not need a rewrite.
3. **Given** region titles and empty-state sentences (not only body copy), **When**
   the non-programmer edits those strings in content, **Then** the chrome on the
   page shows the new words.
4. **Given** two different texts (e.g. About vs. one song’s lyrics), **When** the
   non-programmer updates one of them, **Then** only that piece changes.
5. **Given** one list item is missing a required field (e.g. a tour date without a
   city), **When** the site is published, **Then** that item is omitted, the rest
   of the landing still appears, and the page is not blank.

---

### Edge Cases

- Only one jukebox entry → jukebox still shows the current record; there is
  nothing else to pick (no harmful extra switch).
- Jukebox entry missing a usable label or poster → that entry is omitted;
  another valid entry or the existing static atmosphere fallback is used so the
  page never goes blank. Poster-only entries (no video sources) are valid.
- Non-programmer breaks a content file’s structure (missing required field) →
  that item is omitted; the rest of the landing still publishes; the page must
  not go blank. If the whole publish fails for another reason, the last good
  public version stays online.
- Jukebox entry has no audio, or is not the Nightmare looping-video theme → mute
  control is hidden while that entry is active.
- Instrumental or missing lyrics → lyrics region shows an explicit empty state.
- Empty tour list → “no upcoming dates” message; control remains findable.
  Zero files in `src/content/shows/` is the same visitor state — not a missing
  collection or a config error.
- Empty discography folder (zero files in `src/content/releases/`) → same as an
  empty catalog: control stays, empty-state copy, no config-error warning.
- Very long lyrics, many releases, or many dates → scroll inside the edge region;
  center stays free; with scripting, at most one on-demand region at a time
  (this feature: all widths); persistent chrome stays available.
- Scripting unavailable → on-demand `<details>` still open and close; exclusive
  “one at a time” is not guaranteed; the center should still stay usable.
- Small phone / short landscape view → content MUST stay reachable (no blank
  page). Visual composition for those sizes is **out of scope** (IDEA-013); do
  not treat a cramped laptop HUD on a phone as a finished layout.
- Reduced motion → no looping video; jukebox still changes static atmosphere and
  theme; lyrics/discography/tour/about still work.
- Legal overlay → the existing near-fullscreen legal panel is the exception for
  actually reading Impressum/privacy; after dismiss, the center is free again.
- Mute control → stays peripheral and usable; not covered by expanded regions.
- Missing About copy → About control hidden; other regions unchanged.
- Past tour dates in the content source → not shown as upcoming on the landing.
- Outbound links missing → do not show dead links; omit the link, keep the row.
- Discography row with no jukebox entry → no stage-switch button on that row.
- Discography stage button used while that entry is already active → no harmful
  double-switch (button hidden, inactive, or a no-op); mute and atmosphere stay
  consistent.
- Visitor reloads after picking a non-default jukebox entry → configured default
  is active again; the last pick is not restored.
- Non-programmer leaves a prose file empty → follow the existing empty-region
  rules (hide About; lyrics empty state; etc.); the rest of the stage still works.
- Non-programmer should never need to edit layout or program files to change
  wording, including button/region labels.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The landing page MUST keep the central area of the viewport visually
  free (atmosphere only) on a typical laptop, including while a peripheral content
  region is open. Content MUST live on the edges/corners, not in the middle.
  Visual success for this feature is laptop HUD. Small-screen composition is
  deferred (IDEA-013); the page MUST still load and remain reachable there.
- **FR-002**: Artist identity (name "Valence" and a short hook) MUST be recognizable
  from the periphery within a few seconds and MUST NOT be placed as a large block
  in the center.
- **FR-003**: The landing page MUST provide peripheral access to all of: About me,
  socials (existing channels), lyrics, discography, tour dates, and a jukebox.
  These MUST remain on the same landing page (no new site sections as separate
  pages). Identity, jukebox, and socials MUST remain visible as compact persistent
  chrome. About me, lyrics, discography, and tour dates MUST be on-demand (closed
  until the visitor opens them).
- **FR-004**: On-demand content MUST be reached via compact edge/corner controls.
  Expanding a region MUST happen along the periphery, not as a centered opaque
  sheet. When scripting is available, at most one expanded on-demand region at a
  time (all widths in this feature). Persistent chrome is: identity (name + hook,
  top-left), socials (icon-only, top-right), jukebox (collapsed vinyl control,
  bottom-left). Jukebox song list is visible only while that control is open.
  Without scripting, on-demand disclosures MUST still work; exclusive-open MUST
  NOT be required. Small viewports MUST remain reachable; they are not the visual
  target (IDEA-013).
- **FR-005**: About me MUST present a short artist bio from structured content.
  If About copy is empty, the About control MUST be hidden and the rest of the
  stage MUST still work.
- **FR-006**: Existing social/channel links MUST remain reachable from the
  periphery as equal-sized platform icons (no visible text labels; accessible
  names via `aria-label`) and MUST still open in a new tab. Inactive channels MAY
  show as non-link icons with a coming-soon accessible name. This feature MUST
  NOT require new platforms; it only re-places the list that already exists.
- **FR-007**: The jukebox MUST start collapsed as a vinyl-record control (same
  family as the mute circle). Opening it MUST list selectable song entries from
  structured content along that edge. Selecting an entry MUST set the active song
  identity and MUST update the bound atmosphere and bound visual theme together.
  Looping atmosphere video (and unmute audio) MUST play only for the Nightmare
  theme (`nightmare-crimson`) when that entry has video sources. Other entries
  MUST show a static poster and MUST NOT start the loop. The jukebox is the
  visitor-facing theme switcher for this site. Each fresh load of the landing
  page MUST start from the content-configured default entry; a visitor’s pick
  MUST NOT be remembered across reload.
- **FR-008**: Jukebox audio MUST follow existing mute rules: no sound without a
  visitor unmute; mute/unmute state MUST survive a jukebox switch when the new
  entry has looping video with audio; mute control MUST stay hidden when the
  active entry has no audio, is a static still, or atmosphere is not playing.
- **FR-009**: Lyrics MUST be those of the active jukebox entry only. Long lyrics
  MUST scroll inside the lyrics region. Missing or instrumental lyrics MUST show
  a clear empty state. Changing the jukebox MUST update the lyrics shown.
- **FR-010**: Discography MUST list releases (title, year, optional kind, optional
  outbound listen/store link) from structured content. It is the catalog, not the
  jukebox: selecting a row or following an outbound link MUST NOT change the
  jukebox. If a release is bound to a jukebox entry, that row MUST offer a small
  stage-switch button; activating it MUST switch the jukebox to that entry with
  the same atmosphere, theme, lyrics, and mute behavior as picking it in the
  jukebox. Releases with no jukebox entry MUST NOT show that button. If the
  catalog is empty, the discography control MUST still be available and MUST show
  a clear “no releases yet” (or equivalent) message — it MUST NOT be hidden.
- **FR-011**: Tour dates MUST list upcoming shows only (date, city, venue,
  optional ticket link), soonest first, from structured content. Past dates MUST
  NOT appear as upcoming. When none are upcoming — including when the shows
  folder has zero Markdown files — the region MUST show that no dates are
  announced. That empty folder MUST NOT fail the build or surface a “collection
  does not exist or is empty” error.
- **FR-012**: Every visitor-facing text on the landing stage MUST live in plain
  content files, separate from layout and program files, in the same editing
  style as the existing Impressum and privacy pages (open a file, change the
  words, save). This includes artist identity, About, lyrics, discography
  wording, tour copy, jukebox labels, social labels, region titles,
  empty-state sentences, and the discography stage-switch button label.
  Updating any one text MUST require a change in exactly one content place for
  that text. A non-programmer MUST be able to make that change without editing
  layout or program files.
- **FR-013**: Expanded peripheral regions MUST stay readable over the atmosphere
  and MUST NOT cover the center with an opaque sheet. The existing legal overlay
  is the only allowed near-fullscreen reading surface, and only for Impressum and
  privacy.
- **FR-014**: New controls MUST NOT block mute (when shown) or legal links.
  Copyright and legal links MUST sit together as transparent footer chrome on the
  bottom-left (no opaque bar). Legal overlay open/dismiss behavior MUST keep
  working.
- **FR-015**: This feature MUST ship with a few clearly marked example
  discography entries (at least two) in content files so the catalog is
  demonstrable: at least one bound to a jukebox entry (stage button visible) and
  at least one unbound (no stage button). It MUST also ship at least one clearly
  marked EXAMPLE upcoming show. Placeholder About copy and sample jukebox
  entries (including a poster-only non-Nightmare still) are allowed until real
  material exists. Replacing placeholders MUST NOT require a layout rewrite.
  Example entries MUST be obviously temporary (wording or marking) so they are
  not mistaken for the official catalog.
- **FR-016**: Public landing copy (About, lyrics, release titles, tour labels,
  jukebox labels) MUST be English. German remains only on legally required pages.
- **FR-017**: This feature MUST NOT add third-party streaming embeds, tracking,
  cookies, forms, completed legal texts, required portraits, a new primary
  typeface, or deep per-theme type/motion packs beyond the existing bound visual
  theme. Glitch on HUD chrome (jukebox, on-demand panels, plus existing `003`
  targets) MUST run only while `data-theme` is `nightmare-crimson`. Other themes
  MUST stay still.
- **FR-018**: This feature MUST NOT invent extra site pages (no standalone lyrics
  page, no standalone tour page, no standalone discography page).
- **FR-019**: The project MUST include a short editing guide, aimed at someone who
  does not write code, that names where each kind of landing text lives (identity,
  About, lyrics, discography, tour dates, jukebox labels, socials, region titles,
  empty states) and how to preview a change — in the same spirit as the existing
  content guide for legal pages. The guide MUST also say that an item missing a
  required field is left out of the published page rather than blocking the rest.
- **FR-020**: If a content item is missing a required field, that item MUST be
  omitted and the rest of the landing MUST still publish. The page MUST NOT go
  blank. Zero Markdown files in `shows/`, `releases/`, or `about/` MUST be an
  empty catalog (existing empty-state / hide-About rules), not a missing
  collection. If the whole publish fails for another reason, the last good public
  version MUST stay online.

### Key Entities

- **Landing stage**: The landing viewport treated as a stage: free center
  (atmosphere) plus peripheral regions. Not a scrolling document.
- **Peripheral region**: One edge/corner area or compact control. Frozen laptop
  slots: identity top-left; socials top-right (icons); jukebox bottom-left
  (collapsed vinyl); on-demand cluster bottom-right; mute bottom-right below
  that cluster; copyright + legal links bottom-left as transparent footer (no
  bar). **Persistent chrome** always visible in compact form: identity, collapsed
  jukebox control, socials. **On-demand regions** start closed: About, lyrics,
  discography, tour dates. Expansion stays off-center. Chrome size uses
  `--hud-scale: 1.5` on the laptop HUD.
- **Jukebox entry**: A selectable song/atmosphere item with stable identity,
  visitor-facing label, bound visual theme, poster, optional video sources,
  optional audio (only with Nightmare looping video), and optional lyrics. The
  active entry is “what the stage is playing.”
- **Lyrics**: The words for one jukebox entry (or an explicit instrumental/empty
  state). Always tied to the active entry.
- **Release**: One discography item (title, year, optional kind, optional outbound
  link). May be bound to a jukebox entry; if so, the row may offer a small
  stage-switch button. Binding is optional. Selecting the row itself does not
  switch the stage.
- **Show date**: One upcoming live appearance (date, city, venue, optional ticket
  link). Past dates are not landing-stage upcoming shows.
- **Artist profile**: Name, short hook/tagline, location, About bio.
- **Channel link**: Existing listen/follow socials; placement changes, data model
  stays.
- **Content file**: A plain, non-program file a non-programmer can open and edit,
  in the same family as the existing legal pages. All visitor-facing wording for
  this feature lives in content files; layout/program files only display them.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: On a typical laptop, informal review agrees the central area stays
  atmosphere-only while using About, lyrics, discography, tour dates, socials,
  and the jukebox (legal overlay excepted). Phone visual layout is not a success
  bar for this feature (IDEA-013).
- **SC-002**: A first-time visitor can name the artist within 5 seconds from
  peripheral identity, without a centered title block.
- **SC-003**: With two or more jukebox entries, a visitor can switch song and
  bound theme in under 10 seconds on the first try; audio does not start unless
  they unmute.
- **SC-004**: 100% of testers who open lyrics while switching the jukebox see
  lyrics (or the empty state) follow the active entry — never a mix of two songs.
- **SC-005**: A visitor can find socials, discography, and tour dates in under 20
  seconds each on a first visit, without leaving the landing page. When About
  copy exists, they can find About in under 20 seconds the same way.
- **SC-006**: With zero upcoming shows, 100% of testers understand that no dates
  are announced (not that the section is broken). With zero releases, 100% of
  testers still find discography and understand that no releases are listed yet
  (not that the section is broken).
- **SC-007**: Replacing one About paragraph, one lyrics line, one release title,
  one show city, one jukebox label, or one region title requires editing exactly
  one content place for that item and no layout or program files.
- **SC-008**: On a typical laptop, expanding a region leaves a visible open
  center; mute (when shown) and legal links remain reachable. Small-screen
  visual polish is deferred (IDEA-013); the page MUST still load there.
- **SC-009**: 100% of previously working channel destinations and both legal
  destinations remain reachable after the layout change.
- **SC-010**: At least 80% of informal testers agree the page feels like a stage
  with tools at the edges, not a document covering a video.
- **SC-011**: Using only the short editing guide and content files, a person who
  does not write code can change a chosen visible text and see it on a local
  preview (or the next published version) in under 15 minutes on the first try.
- **SC-012**: After switching away from the default and reloading, 100% of fresh
  landing loads show the content-configured default entry again (not the last
  pick).
- **SC-013**: With one deliberately broken list item (missing a required field)
  and the rest valid, the published landing still loads and shows the valid
  items; the broken item is absent; the page is not blank.

## Assumptions

- The jukebox is this feature’s visitor-facing theme/song switcher. It absorbs the
  intent of IDEA-003 (clip switching) but not arrows/dropdown as the required
  metaphor. Deep type/motion theme packs (IDEA-002) stay out of scope; the existing
  bound visual theme from the atmosphere feature still switches with the entry.
- “Plays different songs” means switching the first-party atmosphere audio bound
  to that entry (the existing unmute model). It does not mean embedding Spotify,
  YouTube, or another third-party player.
- Lyrics are per active jukebox entry, not a full lyrics book of every song at
  once. Discography is the release catalog and may include items with no jukebox
  clip. A small stage-switch button appears only on rows that are bound to a
  jukebox entry; the catalog list itself does not act as a second jukebox.
- Tour dates use a single obvious timezone for display (Europe/Berlin, the
  artist’s home). Exact clock times are optional; calendar date + city + venue is
  enough.
- Laptop HUD slots are frozen as of 2026-08-14 (see as-built clarifications and
  Key Entities). A dedicated phone/small-screen composition is a later idea
  (IDEA-013), not a shrink-the-desktop pass.
- Socials are the already-configured channels; completing additional platforms
  (IDEA-005) is not required here.
- Per-track credits, honorable mentions, and extra listen-link panels (IDEA-006)
  stay a separate idea unless a discography row already has an outbound link.
- Scheduled default clip/theme (IDEA-004), Seravek, intro animation, logo loader,
  completed Impressum/privacy copy, and repo license remain separate.
- Real lyrics, bio, dates, and extra atmosphere clips may still be placeholders
  or samples; the structure must accept real data later. Discography MUST ship
  with at least two clearly marked example releases (one jukebox-bound, one not)
  until the artist replaces them. Suggested placeholder titles for that set:
  “Example Single” (2024, single, bound) and “Example EP” (2025, EP, unbound).
  Tour ships at least one EXAMPLE upcoming show (e.g. Augsburg) until replaced.
  Jukebox v1 examples: Nightmare (`placeholder-loop`, looping video + audio) and
  Example Cyan (`example-cyan`, static poster, no video, no mute).
- Glitch is Nightmare-only. As-built HUD targets: closed on-demand panels glitch
  on hover; click on the control glitches the whole box; open panels do not
  glitch on hover. Jukebox collapsed-vinyl hover and expand/collapse follow the
  mute morph language; option buttons are hit targets when the list is open.
  Existing `003` targets (active socials, legal links, legal exit, mute) keep
  their treatments. Other `data-theme` values stay still. Deep packs (IDEA-002)
  remain out of scope.
- No new tracking, cookies, or visitor accounts. Jukebox picks are not stored;
  each load uses the configured default.
- The site stays a single public landing plus the existing legal overlay.
- “Same way as the legal pages” means the editing experience: plain content files
  a non-programmer can type into, not a new login/CMS (that would break
  static-first / zero-ops). Dropping a new atmosphere media file into a known
  folder is allowed when adding a jukebox clip; changing words still never
  requires touching layout or program files.
- “Every text” means every visitor-facing string, including chrome (region titles
  and empty states), not only long prose. Internal technical keys (stable ids for
  channels or jukebox entries) may stay as-is so existing links and bindings do
  not break; the guide should tell the editor not to rename those keys.
