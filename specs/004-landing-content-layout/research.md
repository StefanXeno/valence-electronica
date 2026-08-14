# Research: Landing Stage (Peripheral Content & Jukebox)

**Date**: 2026-08-14 | **Plan**: [plan.md](./plan.md)

All Technical Context unknowns for this feature were resolved as follows.

## R1: Where content lives (legal-page editing model)

- **Decision**: New Astro content collections as Markdown, same family as
  `src/content/legal/`:
  - `src/content/jukebox/<id>.md` — song label, media, theme, default flag; **body = lyrics**
  - `src/content/about/me.md` — About bio (body)
  - `src/content/releases/<slug>.md` — discography row
  - `src/content/shows/<slug>.md` — one show
  - `src/content/ui/chrome.md` — region titles, empty states, stage-button label (frontmatter)
  - `src/data/site.json` — unchanged role (name, tagline, location, channels, seo)
- **Rationale**: Spec FR-012 / SC-011 require a non-programmer to edit words like
  Impressum. One file per song keeps lyrics + jukebox identity in **exactly one place**.
  Chrome strings must not stay hard-coded in components (`Listen & Follow` today).
- **Alternatives considered**: Keep/extend `background.json` for songs (JSON is worse for
  lyrics and splits label from verses); a CMS/login (breaks I/II); YAML-only lists without
  Markdown bodies (worse for About/lyrics prose).

## R2: Migrate `background.json` into the jukebox collection

- **Decision**: Move each `videos[]` entry into `src/content/jukebox/<id>.md`.
  `src/lib/background.ts` (and atmosphere) read the collection. Delete
  `src/data/background.json` once migration is complete. Filename slug = stable `id`.
  `default: true` on exactly one file; if none or several, pick the first valid id and
  warn at build (do not fail the whole site).
- **Rationale**: Otherwise jukebox label + lyrics would live apart from media (two edits
  for one song, violates “one place”). 002 already allowed extra `videos[]` unused by UI.
- **Alternatives considered**: Dual-write JSON + Markdown (drift); generate JSON at build
  (extra moving part); keep JSON for media only (two files per song).

## R3: HUD composition (edges, not a wireframe freeze)

- **Decision**: Full-viewport stage shell. Persistent compact chrome:
  - **Identity** (name + hook) — top-left
  - **Socials** — top-right
  - **Jukebox** — bottom-left
  - **On-demand cluster** (About, Lyrics, Discography, Tour) — bottom-right
  Footer legal stays a thin bottom edge; mute control keeps its current `002` slot and
  must not be covered. Center has no primary content block. Landing `main` drops the
  `42rem` column max-width.
- **Rationale**: Spec leaves exact edges to plan as long as center stays free and
  persistent vs on-demand holds. Corners keep chrome tappable on 320px without stacking
  into a document.
- **Alternatives considered**: Always-visible thin panels for all six regions (too much
  chrome, fights free center); stacked mobile document (rejected in spec).

## R4: On-demand panels (native disclosure + justified exclusive-open JS)

- **Decision**: Native `<details>` / `<summary>` for each on-demand region. **When
  scripting is available, at most one open at a time on all breakpoints** (spec MUST on
  small screens; spec MAY allow several on laptop — this feature still exclusive-everywhere
  as YAGNI). Exclusive-open: a tiny first-party listener that closes other `<details>`
  when one opens (no npm). Close = toggle the open summary again. Panels expand along the
  edge (max ~20–28rem), never as a centered modal. Legal overlay remains the only
  near-fullscreen reading surface. **Without scripting**, disclosures still open/close;
  more than one MAY be open (documented degradation, same idea as `002` legal overlay).
- **Rationale**: HTML disclosure stays usable if JS is blocked. Exclusive-on-phone is a
  spec MUST *when scripting works*; a few lines of first-party JS are justified under
  constitution IV (see plan Complexity Tracking). Applying exclusive-open on desktop too
  avoids a second layout mode.
- **Alternatives considered**: `<dialog>` (tends to feel modal/centered); radio-button
  accordion (awkward to close); CSS-only exclusive (brittle); multiple open on desktop as
  a required mode (extra CSS/JS for little gain); claiming panels need zero JS while still
  shipping a listener (rejected — that lied in the IV gate).

## R5: In-session jukebox switch (justified client JS)

- **Decision**: Prerender all valid jukebox entries (sources, poster, themeId, hasAudio,
  lyrics HTML) into the page. A small first-party script sets the active id for this
  load: swap `<video>` sources + poster, set `document.documentElement.dataset.theme`,
  show the matching lyrics node, dispatch the existing `bg-state-change` so mute chrome
  follows `hasAudio` + playing. **No `sessionStorage` / cookies.** Reload uses the
  default entry again.
- **Rationale**: Spec requires mute to survive a switch and lyrics to follow, without
  remembering across reload. Full document navigation would reset unmute and feel like a
  page load.
- **Alternatives considered**: Query-param `?track=` (reload; fights unmute continuity);
  third-party player (V); storing last pick (rejected in clarify).

## R6: Invalid / incomplete content items (omit, don’t blank)

- **Decision**: Collection schemas keep fields optional enough that a missing required
  value does **not** fail `astro build`. `src/lib/stage.ts` drops items that fail the
  *logical* required set (e.g. show without `city` or `date`; release without `title`;
  jukebox without usable sources). Warn in the build log. Completely unparseable Markdown
  may still fail the build (“another reason” in FR-020) — last good live version stays.
  Empty About file/body → hide About control. Empty releases/shows arrays → empty-state
  copy from `ui/chrome.md`, control still visible.
- **Rationale**: Owner chose skip-item over fail-closed for a missing city. Non-programmer
  should not take down the landing with one bad row.
- **Alternatives considered**: Strict Zod that fails CI (rejected); silent skip without
  guide mention (rejected — FR-019 must explain it).

## R7: Example catalog to ship

- **Decision**:
  - Jukebox: keep `placeholder-loop` as `default: true` (existing NIGHTMARE temp clip +
    `nightmare-crimson`). Add a second example entry that **reuses the same MP4/poster**
    with `themeId: cyan-pulse` and example lyrics so switching is demonstrable without a
    second video file.
  - Releases: “Example Single” (2024, single, `jukeboxId` = default entry) and
    “Example EP” (2025, EP, no `jukeboxId`).
  - About: short clearly marked placeholder bio so the About control is visible.
  - Shows: ship **none** so the required empty state is the default until real dates exist.
  - Mark example copy with an obvious EXAMPLE/placeholder line in the Markdown.
- **Rationale**: FR-015 requires ≥2 releases (bound + unbound). SC-003 needs ≥2 jukebox
  entries. Sharing one MP4 is honest placeholder, not a second asset pipeline.
- **Alternatives considered**: Two distinct video files (no second asset yet); shipping
  fake tour dates (empty state is the harder, required path).

## R8: Discography stage button when already active

- **Decision**: Keep the button visible; set `aria-pressed="true"` (or equivalent current
  state); click is a **no-op** (no media restart, mute unchanged). Not hidden (avoids
  layout jump).
- **Rationale**: Spec allowed hidden / inactive / no-op; no-op + pressed is the smallest
  consistent control.
- **Alternatives considered**: Hide button (layout shift); disable without state (worse
  for AT).

## R9: Glitch set stays closed

- **Decision**: Do not add `glitch-hit` to jukebox, stage button, or panel summaries.
  Existing channel/legal/mute targets unchanged (`003`).
- **Rationale**: Spec assumption: new controls are not automatically glitch targets.
- **Alternatives considered**: Glitch everything new (requires amending `003`).
