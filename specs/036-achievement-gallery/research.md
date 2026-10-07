# Research: Achievement Gallery

**Feature**: `036-achievement-gallery` | **Date**: 2026-10-07

No `NEEDS CLARIFICATION` remained in the Technical Context. The decisions below settle
the design choices the spec left to planning.

## R1 — Registry format and location

- **Decision**: One JSON data file, `src/data/achievements.json`, holding an ordered
  `achievements` array in plain text for the artist. Only build-time code imports it
  (`src/lib/achievements-registry.ts`): it validates the file and serializes a client
  payload into a `data-achievement-registry` attribute on the toast root (present on every
  page). Client modules never import the JSON; they read the payload from the DOM (see R11
  for how secret entries are encoded in it).
- **Rationale**: The toast fires client-side and needs the copy at runtime, but a direct
  JSON import would put secret copy into the bundle as plain text (FR-018). Array order is
  the tile order (spec: fixed, artist-defined order), so no separate `order` number can
  drift or collide. The tagline pool already taught the artist this shape, and the artist
  guide already documents editing a JSON file in `src/data/`.
- **Alternatives considered**:
  - *Astro content collection (`file()` loader)*: gives Zod errors for free, but its data
    only exists at build time; the client toast would still need a serialized copy in the
    DOM. Two paths for one piece of data.
  - *Fields in `src/content/ui/chrome.md`*: flat frontmatter keys (`rubTitle`, `rubSub`,
    `rubHint`, …) do not express order or a per-entry secret flag without key soup.
  - *Explicit `order` field*: rejected; array order is simpler and cannot conflict.

## R2 — Achievement identity and storage keys

- **Decision**: Storage key is always `ve-achievement-{id}`. Ids at launch: `rub`,
  `infinite-spin`, `player-found`, `demonic-combo`. Three ids equal their existing key
  suffix; the secret one moves from `why-are-you-rubbing` to the neutral `rub` (the id and
  key would otherwise spell out the secret title, FR-018). A one-time migration on boot
  (`migrateLegacyKeys`) copies `ve-achievement-why-are-you-rubbing` to `ve-achievement-rub`
  and removes the old key; the legacy key literal is stored encoded like secret copy (R11).
  The code keeps one constant list of ids it can unlock (`KNOWN_ACHIEVEMENT_IDS`); trigger
  modules unlock by id.
- **Rationale**: Keeps every visitor's progress (FR-011), removes the four scattered key
  constants, and one rule (`ve-achievement-` + id) instead of a mapping table. `rub` reveals
  nothing the gesture module (`track-rub.ts`) does not already reveal.
- **Alternatives considered**: Keeping `why-are-you-rubbing` — zero migration, but the id
  appears in code, HTML attributes, and DevTools storage, defeating FR-018. A permanent
  id → key map — more moving parts than a one-shot migration.

## R3 — "Storage unavailable" vs "unlocked"

- **Decision**: Split the two semantics that `hasAchievement()` currently conflates.
  `readAchievementState(storage)` returns `{ available: false }` when storage throws or is
  missing, else `{ available: true, unlocked: Set<id> }`. The toast keeps its "blocked ⇒ never
  toast" behavior via `shouldToast(id)`; the gallery and icon use `readAchievementState` and
  stay hidden when `available` is false. Storage is passed in (default
  `globalThis.localStorage`) so the logic is unit-testable, like `player-discovery.ts`.
- **Rationale**: FR-012 / SC-004. Blocked storage must never show four unlocked tiles.
- **Alternatives considered**: Probing with a write/remove test key — unnecessary; a failed
  `getItem` is already the signal, and probing writes would add a storage key (FR-015).

## R4 — Gallery surface and exclusivity

- **Decision**: New body-level component `AchievementGallery.astro` rendered in
  `Base.astro` (so it exists on the landing and on every overlay route, where unlocks can
  also happen). It holds the trophy button and a `role="dialog"` panel styled like the rub
  panel. While open it sets `html.achievement-gallery-open`.
  - Opening the gallery dispatches the existing `stage-overlay-close` event (closes content
    overlay and phone menu) and closes any open rub panel.
  - The stage player already collapses on `<html>` class changes; its `isOverlayOpen()` /
    `collapseForOverlay()` learn the new class, so the player leaves `full` when the gallery
    opens.
  - The gallery closes itself on `player-state-change` to `full`, on the legal overlay
    becoming visible, and on `site-nav-menu-open`.
- **Rationale**: Reuses the three exclusivity signals that already exist; no new global
  coordinator.
- **Alternatives considered**: A central "surface manager" — cleaner on paper, but it would
  touch every surface for a four-tile panel (Principle VI).

## R5 — Toast becomes activatable

- **Decision**: The visual card becomes a `<button>`; the polite live region moves to the
  separate screen-reader span so announcements stay single. Toast root keeps
  `pointer-events: none`; the card button gets `pointer-events: auto`. Hide timers pause on
  `pointerenter`/`focusin` and restart on `pointerleave`/`focusout`. Since the root carries
  `hidden` when gone, it leaves the Tab order automatically; it never calls `focus()`.
  Activating it hides the toast and opens the gallery. The "Achievement unlocked" eyebrow
  moves to chrome.
- **Rationale**: FR-006 and the clarified focus rule (no focus theft, Tab-reachable only
  while visible).

## R6 — Unlock signal and icon pulse

- **Decision**: `unlockAchievement(id)` (replaces `maybeUnlockAchievement`) persists, shows
  the toast, then dispatches `achievement-unlocked` (`detail: { id }`) on `document`. The
  gallery listens: reveals the icon if hidden, plays a one-shot pulse via the existing
  `playElementGlitch` when `prefersGlitchMotion()`, and refreshes tiles and counter in place.
- **Rationale**: Keeps trigger modules ignorant of the gallery; one event, one listener.

## R7 — Trophy icon

- **Decision**: Add a `trophy` token to `HudIcon.astro` / `hud-icons.ts` (first-party inline
  SVG, 24×24, `currentColor`), overridable via chrome `achievementsIcon` like the other HUD
  icons. Positioned bottom-right with the player's gap variables so it mirrors the vinyl.
  Hidden during the landing intro via the existing `html[data-intro-pending]` /
  `html[data-intro-active]` attributes.

## R8 — Glyphs

- **Decision**: Registry `glyph` is one of `vinyl`, `infinite`, `demonic`, `code` (new `</>` mark for Coder; the existing `rub`
  token is renamed `vinyl` — it already draws the vinyl and is reused by player-found).
  Toast and gallery tiles render glyphs from one shared component (`AchievementGlyph.astro`)
  instead of the toast's inline copies.

## R9 — Reset control (dev / preview only)

- **Decision**: Extract `isPreviewBuild()` from `Base.astro` into `src/lib/url.ts`. The reset
  button is rendered only when `import.meta.env.DEV || isPreviewBuild()`; on the live build it
  is absent from the HTML (FR-013, SC-006). Reset removes all `ve-achievement-{id}` keys for
  known ids plus `ve-player-discovered`, closes the gallery, hides the icon. A reload then
  shows the newcomer stage.
- **Rationale**: Build-time gating means no dead code path or hidden button on live.

## R11 — Obfuscating secret achievements (FR-018, SC-007)

- **Decision**:
  - In the client payload (R1), secret entries carry `title` and `subtitle` encoded with
    `encodeObfuscated(text)` = Base64 of the UTF-8 bytes, string-reversed, and an `enc: 1`
    flag. `decodeObfuscated` reverses it via `atob` + `TextDecoder`. Non-secret entries stay
    plain. Locked secret entries carry no hint at all.
  - The gallery renders the unlocked variant only for non-secret tiles. Secret tiles render
    only the secret placeholder; on unlock (boot or `achievement-unlocked`) the script fills
    a shared unlocked template with decoded copy and the glyph cloned from a glyph template.
  - The toast shell contains no default copy.
  - The legacy storage key literal used by `migrateLegacyKeys` is stored encoded too.
  - Build check: `scripts/check-secrets.mjs` (Node, no dependencies) greps `dist/`
    case-insensitively for each secret entry's full title, full subtitle, and every title
    word of ≥4 letters, and fails on any hit (SC-007). Subtitle words are not checked one by
    one: they share ordinary words ("song", "discography") with the rest of the site.
- **Rationale**: Stops view-source, DevTools Elements, and bundle text search from
  spoiling the secret, at a few lines of code. Reversal on top of Base64 defeats the
  "paste into a Base64 decoder" reflex; anything stronger is pointless while the gesture
  code is readable.
- **Alternatives considered**: Real encryption keyed by the gesture — impossible, the
  gesture carries no secret value. Plain Base64 only — common Base64 prefixes of English
  text are recognizable; reversal costs nothing.

## R12 — "Coder" achievement (source readers)

- **Decision**: A page cannot detect view-source, and DevTools-open detection is unreliable
  (false positives, breaks with browser updates). Instead, `SourceNote.astro` emits one HTML
  comment in `Base.astro` between `</main>` and `<Footer />` — after the stage and player
  markup, before footer, overlays, and gallery, so it sits mid-document on every page. It
  tells readers to type "coder". `coder-combo.ts` listens like the 666 combo; the
  keydown-buffer logic is extracted into `key-combo.ts` and shared (letters
  case-insensitive, ~1.6 s gap, ignored in text fields and with modifiers). The comment
  text is a developer note in markup, not visitor UI, so it stays in the component (one
  shared `CODER_WORD` constant keeps comment and listener in sync) rather than in
  `chrome.md`.
- **Rationale**: Rewards actually reading the source; works for view-source and DevTools;
  not shareable as a plain link.
- **Alternatives considered**: URL hash only — trivially shared; console message — misses
  view-source readers; DevTools detection — unreliable.

## R13 — Hash triggers for phones (`#coder`, `#666`)

- **Decision**: `key-combo.ts` gains `bindHashCombo(word, onMatch)`: checks
  `location.hash` (decoded, lowercased, without `#`) on boot and on `hashchange`; on match it
  calls `onMatch` and strips the hash with
  `history.replaceState(history.state, '', pathname + search)` — keeping the legal/content
  overlay's history state intact. `coder-combo.ts` and `demonic-combo.ts` each register both
  the keyboard and the hash trigger with the same `onMatch`. Hash combos bind after
  `initStagePlayer()` so the `stage-select` listener for `#666` exists. The source comment
  adds "On a phone? Add #coder to the URL."
- **Rationale**: Only path that works on touch without colliding with existing tap
  gestures (logo → home, 3 taps → player hint). Same handler as typing, so behavior cannot
  diverge. Closes the `032` "666 is keyboard-only" gap for free.
- **Alternatives considered**: Tap gestures on the wordmark or stage — collide with
  existing gestures and can trigger by accident; query string (`?666`) — would need a
  reload to strip and is more likely to be cached/logged by link previews.

## R10 — Locked-tile motion

- **Decision**: Locked "???" and secret tiles get a slow ambient glitch only when
  `prefersGlitchMotion()` (theme pack opts into glitch and no reduced motion), using the
  existing `createContinuousGlitch` pattern. Otherwise static. Panel entrance follows the
  rub panel (fade/slide; none under reduced motion).
