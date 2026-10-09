# Feature Specification: Achievement Gallery

**Feature Branch**: `036-achievement-gallery`

**Created**: 2026-10-07

**Status**: Draft

**Input**: IDEA-026 (`docs/ideas.md`). A quiet overview of every easter-egg achievement, so
curious fans can see how much they have found. Shaped with the operator on 2026-10-07:
on-stage panel without its own URL, trophy icon bottom-right that appears after the first
find, clickable toast, cryptic hints for locked entries, secret entries that reveal
nothing, one artist-editable registry for all achievement copy.

**Builds on**: `032-easter-eggs` (achievements, toast, storage keys), `026-stage-player`
(hidden player, bottom-left vinyl, panel exclusivity), `027-site-navigation` (content
overlays), `031-glitch-motion` (glitch language, reduced motion).

## Clarifications

### Session 2026-10-07

- Q: Should "Reset achievements" also reset the hidden player's discovery state? → A: Yes — a full newcomer reset: all four achievement keys and the player discovery key.
- Q: How do keyboard users reach the toast? → A: The toast never takes focus on appear; it is reachable by Tab while visible and stays open while focused; the trophy icon is the primary keyboard path.
- Q: Should secret achievements stay hidden from people reading the page source? → A: Yes, as far as a static site allows (option C): the unlocked copy of secret achievements is not in the HTML, is stored encoded (not plain text) in what the browser downloads, and the secret achievement gets a neutral id; the old storage key is migrated once so progress survives. Determined code readers can still decode it; that is accepted.
- Q: (Operator review after the first build) How should the gallery look? → A: Exactly like the V-Flip player, mirrored: a panel that grows out of the trophy corner (bottom-right) with the trophy in its bottom row, not a centered window. The trophy glyph is larger on phones, the reset is an icon button, and the laptop socials move to bottom-center so they no longer collide with the trophy.
- Q: Can visitors control the ultra glitch (wild) mode themselves once they found 666? → A: Yes — a switch "Ultra glitch" on the unlocked Demonic Combination tile. Turning it on also puts Nightmare on stage (like 666); turning it off leaves the stage as is. The setting lasts until reload only (no new storage key).
- Q: (Operator review) Photosensitivity: the ultra glitch mode flickers hard (opacity jumps, red/white fringes, ~180 ms cycles on several surfaces). How do we handle it? → A: Opt-in only — 666 / `#666` unlock the achievement and start Nightmare but no longer start the wild mode; the switch lives in an expandable Demonic Combination tile right under a photosensitive-epilepsy warning; the wild mode was first tamed, then restored to its original intensity at the operator's request (the warning + opt-in are the safeguard). The operator measures Nightmare with a flash-analysis tool; the base Nightmare glitch may be toned down afterwards.
- Q: Add an achievement for looking at the source code? → A: Yes — "Coder" ("Take a look at the source code"), last in the gallery, with a hint (not secret). Since a page cannot detect view-source, an HTML comment hidden mid-document (not at the top) tells readers to type "coder"; typing it unlocks the achievement.
- Q: How do phone users (no hardware keyboard) trigger the typed combos? → A: Each typed combo also works as a URL hash: `#coder` unlocks Coder (the source comment mentions it for phones), and `#666` triggers the full demonic combo. The hash is removed from the address bar right after it fires. Shareable links are accepted.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fan opens the gallery and sees their progress (Priority: P1)

A visitor who has already unlocked at least one achievement sees a small trophy icon in the
bottom-right corner of the stage, mirroring the vinyl in the bottom-left. Activating it
opens a panel over the stage with a counter ("2 / 5 found") and one tile per achievement in
a fixed order. Unlocked tiles show the glyph, title, and subtitle they saw in the toast.
Locked tiles show a "???" placeholder and a short cryptic hint, except secret achievements,
which show only that something exists. The music and stage keep running behind the panel.

**Why this priority**: This is the feature. Without the panel there is nothing to open.

**Independent Test**: In a browser with two achievements unlocked, open the panel via the
icon; confirm the counter, two unlocked tiles with full copy, one locked tile with a hint,
one secret locked tile with neither title nor hint; close via X, Escape, and outside click.

**Acceptance Scenarios**:

1. **Given** at least one achievement is unlocked in this browser, **When** the landing
   loads, **Then** the trophy icon is visible bottom-right with an accessible name and does
   not cover the stage center.
2. **Given** the icon is visible, **When** the visitor activates it (click, tap, Enter, or
   Space), **Then** the gallery panel opens, focus moves into it, and the URL does not
   change.
3. **Given** the panel is open, **When** it renders, **Then** it shows "{found} / {total}
   found" and one tile per registered achievement in registry order.
4. **Given** an unlocked achievement, **When** its tile renders, **Then** it shows glyph,
   title, and subtitle.
5. **Given** a locked, non-secret achievement, **When** its tile renders, **Then** it shows
   a "???" placeholder and the achievement's hint, but neither title, subtitle, nor glyph.
6. **Given** a locked secret achievement, **When** its tile renders, **Then** it shows only
   a placeholder marking it as secret — no title, subtitle, glyph, or hint.
7. **Given** the panel is open, **When** the visitor uses the X control, Escape, or clicks
   outside the panel, **Then** it closes and focus returns to the trophy icon (or to
   wherever it was when the panel opened).
8. **Given** the stage player or a content overlay is open, **When** the gallery opens,
   **Then** the other surface closes first; **and when** the gallery is open and the player
   or an overlay is opened, **Then** the gallery closes.

---

### User Story 2 - The icon appears with the first find (Priority: P1)

A newcomer sees a clean stage with no trophy icon. The moment they unlock their first
achievement, the toast pops up and the trophy icon appears bottom-right with a short
glitch pulse, so they learn where their progress lives. Every later unlock pulses the
icon again. Clicking the toast itself also opens the gallery.

**Why this priority**: Keeps the stage clean for newcomers (artist intent from `026`) while
making the gallery discoverable to exactly the people who care.

**Independent Test**: In a fresh browser, confirm no icon; trigger any achievement; confirm
the icon appears with a pulse, the toast stays open while hovered or focused, and
activating the toast opens the gallery.

**Acceptance Scenarios**:

1. **Given** no achievement is unlocked in this browser, **When** the landing loads,
   **Then** no trophy icon is rendered visibly or reachable by keyboard.
2. **Given** no achievement is unlocked, **When** the first one unlocks, **Then** the icon
   appears without a reload and plays a short pulse.
3. **Given** the icon is already visible, **When** another achievement unlocks, **Then** the
   icon pulses again.
4. **Given** a toast is showing, **When** the visitor hovers or focuses it, **Then** it stays
   open until hover/focus leaves, then follows its normal exit.
5. **Given** a toast is showing, **When** the visitor activates it (click, tap, or Enter
   after tabbing to it), **Then** the toast closes and the gallery opens.
6. **Given** a keyboard user is focused elsewhere, **When** a toast appears, **Then** focus
   does not move; once the toast is gone it is no longer in the Tab order.
7. **Given** reduced motion is preferred, **When** an achievement unlocks, **Then** the icon
   appears without pulse or glitch.

---

### User Story 3 - Artist edits achievement copy in one place (Priority: P2)

The artist wants to tweak a hint, rename an achievement, or reorder the tiles. They open one
content file, change the text, and publish. Toast and gallery both pick up the new copy.

**Why this priority**: Constitution III. Today the rub, Infinite, and 666 copy lives in
code (Known Gap in `032`); the gallery multiplies the places that copy would appear.

**Independent Test**: Change a title, a hint, the `secret` flag, and the order in the
registry file; rebuild; confirm toast and gallery reflect all four changes with no code
edit.

**Acceptance Scenarios**:

1. **Given** the registry entry for an achievement, **When** the artist changes its title or
   subtitle, **Then** both the toast and the gallery tile show the new text after publish.
2. **Given** the registry, **When** the artist reorders entries, **Then** the gallery tiles
   follow the new order.
3. **Given** an entry with `secret` set, **When** the artist removes the flag and adds a
   hint, **Then** the locked tile shows the hint after publish.
4. **Given** a registry entry is missing required copy or names an unknown achievement,
   **When** the site builds, **Then** the build fails with a message naming the entry.
5. **Given** the artist guide, **When** the artist looks up achievements, **Then** it
   explains what each field does, that new achievements need a developer, and that
   achievement ids must not be renamed.

---

### User Story 4 - Operator resets progress while testing (Priority: P3)

While testing on a local dev server or the `/pre-release/` preview, the operator wants to
see the newcomer experience again. The gallery offers a "Reset achievements" control that
clears all achievement progress and the hidden player's discovery for this browser. On the live site the control does not
exist.

**Why this priority**: Testing convenience only; no visitor value.

**Independent Test**: On the preview, unlock an achievement, reset from the gallery, reload;
confirm no icon and the toast shows again on the next unlock. On the live build, confirm
the control is absent from the page.

**Acceptance Scenarios**:

1. **Given** a dev or preview build, **When** the gallery is open, **Then** a reset control
   is shown.
2. **Given** the reset control is used, **When** it completes, **Then** all achievement
   progress and the hidden player's discovery for this browser are cleared, the gallery
   closes, and the icon hides; after a reload the stage is in the newcomer state (no icon,
   hidden player).
3. **Given** the live build, **When** the page is inspected, **Then** no reset control
   exists in the delivered markup.

---

### User Story 5 - A curious coder reads the source (Priority: P3)

A visitor opens the page source (or DevTools) and, somewhere in the middle of the markup,
finds a comment addressed to them: type "coder" on the stage. They do, and the "Coder"
achievement unlocks with the usual toast.

**Why this priority**: A small extra egg for a niche audience; reuses the gallery,
registry, and key-combo pattern.

**Independent Test**: View source of the built landing; find the comment in the middle of
the body (not in the head, not at the start of the body); type `coder` on the stage;
confirm the toast and the unlocked tile.

**Acceptance Scenarios**:

1. **Given** the delivered HTML of any page, **When** a reader scrolls the source, **Then**
   an HTML comment tells them to type "coder"; it is not in `<head>` and not before the
   stage markup.
2. **Given** focus is not in a text field, **When** the visitor types `c o d e r` (any
   case, keys ≤ ~1.6 s apart), **Then** the "Coder" achievement unlocks once.
2a. **Given** a phone, **When** the visitor opens the page with `#coder` in the URL (or adds
   it while on the page), **Then** Coder unlocks and `#coder` disappears from the address
   bar without a reload or a new history entry.
3. **Given** focus is in a text field, or a modifier key is held, **When** the letters are
   typed, **Then** nothing happens.
4. **Given** Coder is locked, **When** the gallery shows it, **Then** its tile shows "???"
   and its hint.

---

### User Story 6 - Fan controls the ultra glitch mode (Priority: P3)

A visitor who unlocked "Demonic Combination" opens the gallery and finds an "Ultra glitch"
switch on that tile. They switch it off to calm the stage, and back on to bring the
Nightmare back.

**Why this priority**: A reward for the 666 find; until now the wild mode could not be
turned off without reloading.

**Independent Test**: Unlock 666 (wild mode on), open the gallery, switch off → glitches
calm down; switch on while another stage plays → Nightmare starts with wild glitches;
reload → mode is off.

**Acceptance Scenarios**:

1. **Given** Demonic Combination is locked, **When** the gallery opens, **Then** no switch
   is shown.
2. **Given** it is unlocked, **When** the visitor expands the tile, **Then** a
   photosensitivity warning and the switch (off until turned on) appear.
3. **Given** the switch is off, **When** the visitor turns it on, **Then** wild mode starts
   and Nightmare goes on stage.
4. **Given** the switch is on, **When** the visitor turns it off, **Then** wild mode stops
   and the stage stays as it is.
5. **Given** any setting, **When** the page reloads, **Then** wild mode is off until 666 or
   the switch turns it on again.

---

### Edge Cases

- **Storage blocked** (private mode, disabled site data): the icon never appears and the
  gallery cannot be opened, so it never claims everything is unlocked. Toasts keep their
  existing behavior (never shown when storage is blocked, `032`).
- **Scripting disabled**: no icon, no gallery; nothing else on the page changes.
- **Prior progress**: visitors who unlocked achievements before this feature shipped see
  the icon on their next visit and their unlocks in the gallery, including the rub
  achievement stored under its old key.
- **Unknown stored keys** (e.g. a removed achievement): ignored; the counter counts only
  registered achievements.
- **Phone widths**: the icon sits bottom-right without colliding with the footer legal
  links, the phone menu, or the player; the panel fits from 320px without horizontal
  scrolling and scrolls internally if needed.
- **Wild mode** (666 combo) or Nightmare theme active: the panel stays readable; locked-tile
  glitch follows the existing glitch rules and stays off under reduced motion.
- **Intro playing**: the icon stays laid out under the intro overlay like the V-Flip, so it
  is already there when the intro ends.
- **Phone menu open**: the icon fades out while the phone menu is open and returns as it
  closes (it would otherwise sit on top of the menu footer).
- **Phones and the typed combos**: phones have no hardware keyboard, so `coder` and `666`
  also work as URL hashes (`#coder`, `#666`). A shared link triggers them for the
  recipient; accepted.
- **Hash on a content route** (e.g. `/tour#666`): works the same; the overlay stays open,
  only the hash is removed.
- **Toast while gallery is open**: an unlock while the panel is open updates the tile and
  counter in place; the toast may still show, and activating it keeps the gallery open.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The site MUST offer an achievement gallery as a panel that grows out of the
  trophy corner, mirroring the V-Flip player (same box, sizes, and open/close motion; trophy
  in the panel's bottom row). It MUST NOT have its own route or change the URL, and MUST
  close via an X control, Escape, and a click/tap outside the panel.
- **FR-002**: The gallery MUST be mutually exclusive with the stage player's open state and
  with content overlays: opening one closes the others.
- **FR-003**: A trophy icon control MUST open the gallery. It MUST sit bottom-right at the
  stage periphery, mirroring the vinyl bottom-left, MUST NOT cover the stage center, and
  MUST have an accessible name from UI chrome.
- **FR-004**: The icon MUST be hidden and unreachable by keyboard until at least one
  registered achievement is unlocked in this browser; it MUST appear without reload on the
  first unlock and then stay on every visit.
- **FR-005**: Each unlock MUST play a short pulse/glitch on the icon; reduced motion MUST
  suppress it.
- **FR-006**: The achievement toast MUST be activatable (pointer and keyboard) and open the
  gallery; hover or focus MUST hold it open; its screen-reader announcement MUST stay. It
  MUST NOT take focus when it appears; it MUST be reachable by Tab only while visible. The
  trophy icon is the primary keyboard path to the gallery.
- **FR-007**: The gallery MUST show a counter "{found} / {total} found" (wording from UI
  chrome) and one tile per registered achievement in registry order. Tile order MUST NOT
  depend on unlock state.
- **FR-008**: Unlocked tiles MUST show glyph, title, and subtitle. Locked tiles MUST show a
  "???" placeholder and the hint. Locked **secret** tiles MUST show only a secret
  placeholder (no title, subtitle, glyph, or hint). Once unlocked, a secret tile MUST look
  like any other unlocked tile.
- **FR-009**: All achievement copy (title, subtitle, hint) plus the `secret` flag, glyph,
  and order MUST come from one artist-editable content file. The toast MUST read its copy
  from the same file; achievement copy hard-coded in code or in separate chrome fields MUST
  be removed. Gesture detection stays in code.
- **FR-010**: The registry MUST be validated at build time: every achievement the code can
  unlock has exactly one entry with title and subtitle; non-secret entries have a hint;
  unknown ids fail the build with a message naming the entry.
- **FR-011**: Prior progress MUST survive. `ve-achievement-infinite-spin`,
  `ve-achievement-player-found`, and `ve-achievement-demonic-combo` stay as they are. The
  secret rub achievement moves to the neutral key `ve-achievement-rub`; on load, an existing
  `ve-achievement-why-are-you-rubbing` value MUST be copied to the new key and the old key
  removed, once.
  *(Superseded 2026-10-09: the rub achievement and this migration are removed.)*
- **FR-012**: The gallery and icon MUST distinguish "storage unavailable" from "unlocked":
  with storage unavailable, the icon MUST stay hidden and the gallery MUST NOT report any
  achievement as unlocked.
- **FR-013**: Dev and preview (`/pre-release/`) builds MUST show a reset control in the
  gallery that resets this browser to the newcomer state: it clears all achievement keys
  and the hidden player's discovery key (`ve-player-discovered`, `026` FR-009). The live
  build MUST NOT ship it The reset is an icon button next to the close control.
- **FR-014**: Reduced motion MUST remove the icon pulse, panel entrance motion, and any
  glitch on locked tiles.
- **FR-015**: The feature MUST NOT add tracking, network requests, accounts, or storage
  beyond the achievement keys (existing ones plus the renamed `ve-achievement-rub`;
  constitution I, V).
- **FR-022**: The unlocked Demonic Combination tile MUST expand (accordion, `aria-expanded`)
  to show a photosensitivity warning (UI chrome, `achievementWildWarning`) and directly
  below it an accessible on/off switch (`role="switch"`, labelled by the chrome label,
  described by the warning) that reflects and sets the ultra glitch mode for the page
  session. Turning it on MUST also put Nightmare on stage; turning it off MUST NOT change
  the stage. No storage is used. A re-locked tile (reset) collapses.
- **FR-023**: The ultra glitch mode MUST be opt-in only: 666 / `#666` (`032` FR-010) MUST
  unlock the achievement and put Nightmare on stage but MUST NOT start it. Its intensity
  stays as in `032` (operator decision: the opt-in switch and the warning are the
  safeguard). Reduced motion keeps disabling it entirely.
- **FR-016a**: On laptop widths the social icons MUST sit bottom-center (labels reveal
  above), so the bottom corners stay free for the vinyl (left) and trophy (right).
- **FR-016**: UI wording that is not per-achievement (icon label, panel title, counter
  template, secret placeholder, close label, reset label) MUST come from UI chrome content.
- **FR-017**: The artist guide MUST document the registry fields, the `secret` flag, the
  rule that ids must not be renamed (it would reset visitors' progress), and that adding a
  new achievement requires a developer.
- **FR-018**: Secret achievements MUST NOT be spoiled by casual source inspection: their
  title and subtitle MUST NOT appear in the delivered HTML before unlock, MUST NOT appear as
  plain text in any delivered file (HTML, JS, CSS), and their id and storage key MUST NOT
  reveal the title. The copy is decoded in the browser only when shown. This is
  obfuscation, not protection; the gesture code itself stays readable.
- **FR-019**: Every page MUST contain one HTML comment addressed to source readers that
  tells them to type "coder". It MUST sit in the middle of the document (inside `<body>`,
  after the stage markup), never in `<head>` or at the top of the body.
- **FR-020**: Typing `coder` (case-insensitive, letters ≤ ~1.6 s apart, not inside a text
  field, no Ctrl/Meta/Alt) MUST unlock the "Coder" achievement (id `coder`, glyph `code`)
  through the shared unlock path. It MUST have no other effect and MUST NOT interfere with
  the 666 combo.
- **FR-021**: Each typed combo MUST also fire from a URL hash, on page load and on
  `hashchange`: `#coder` (case-insensitive) → FR-020; `#666` → the full demonic combo from
  `032` FR-010 (Nightmare on stage, achievement, wild glitch). After firing, the hash MUST
  be removed with a history replace that keeps the current history state, so Back does not
  return to it. The source comment (FR-019) MUST mention the `#coder` path for phones.
  This closes the `032` Known Gap "demonic combo is keyboard-only".

### Initial registry content

Order and copy at launch (hints are drafts; the artist may rewrite them):

| Order | Achievement | Secret | Hint (locked) |
| ----- | ----------- | ------ | ------------- |
| 1 | Taking Over (replaced "Why are you rubbing?!" on 2026-10-09) | yes | — |
| 2 | Infinite | no | *On one track, going in circles is the whole point.* |
| 3 | Found it! | no | *Knock on the stage and someone might answer.* |
| 4 | Demonic Combination | no | *Some numbers wake the Nightmare.* |
| 5 | Coder — *Take a look at the source code* | no | *Real fans read the fine print.* |

Titles and subtitles 1–4 carry over unchanged from today's toasts; Coder is new. Ids: `taking-over`
(was `rub` until 2026-10-09), `infinite-spin`, `player-found`, `demonic-combo`,
`coder`.

### Key Entities

- **Achievement**: stable id (bound to its storage key and the code that unlocks it),
  title, subtitle, hint (optional when secret), secret flag, glyph, order.
- **Unlock state**: per browser, per achievement, from first-party storage; may be
  unavailable.
- **Gallery chrome**: icon label, panel title, counter template, secret placeholder text,
  close and reset labels.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A visitor with at least one unlock reaches the gallery in one action from the
  resting stage, on laptop and phone.
- **SC-002**: In a fresh browser, the trophy icon is absent in 100% of loads until the
  first unlock, and present in 100% of loads afterwards.
- **SC-003**: Changing any achievement title, subtitle, hint, secret flag, or order needs
  edits in exactly one file and zero code files.
- **SC-004**: With storage blocked, 0 achievements are ever shown as unlocked.
- **SC-005**: No horizontal scrolling at 320px with the gallery open; the stage center stays
  free with the icon at rest.
- **SC-006**: The live build contains no reset control and makes no additional network
  requests compared to before the feature.
- **SC-007**: A case-insensitive text search of the built site for a secret achievement's
  full title, full subtitle, or any title word of four or more letters (e.g. "rubbing")
  returns 0 matches.

## Assumptions

- Five achievements at launch: the four existing ones plus Coder (User Story 5).
- The trophy is a first-party inline icon in the same family as the existing HUD icons.
- The "???" and secret placeholders may glitch lightly in the existing glitch language;
  exact treatment is a plan-time decision.
- The gallery panel uses the site's existing panel look (dark, rounded) and follows the
  active theme pack.
- Coder is the only new easter egg in this feature; `#666` is a new trigger for an existing
  one. Out of scope: further new eggs and the wild-mode skip-list bug (remains a Known Gap in
  `032`).
- Work happens on `pre-release` per the operator's branch setup rather than a dedicated
  `036-achievement-gallery` branch.
- When this ships, its behavior folds back into `032-easter-eggs` (and `026` for the icon
  placement), and this folder is deleted (see `specs/README.md`).
