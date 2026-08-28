# Research: Codebase Hardening & Quality Pass

**Date**: 2026-08-28 | **Plan**: [plan.md](./plan.md)

## R1 — Overlapping stage crossfades

**Decision**: **Latest-wins with generation token** in `initStageSwitch` / `select()`.

**Rationale**: `crossfadeStageEntry()` is async (~720–1000 ms). Rapid clicks today fire
multiple concurrent crossfades; `activeId` updates immediately but video layers and
`data-theme` can desync. A monotonic `handoffGeneration` incremented on each `select()` lets
in-flight work detect staleness and exit before mutating DOM or calling `restartClock()`.

**Alternatives considered**:

- **Queue** (FIFO pending ids) — rejected; visitors expect the last click to win, not a
  delayed playlist of skipped picks.
- **Ignore clicks while busy** — rejected; feels broken on fast interaction.
- **Instant cut (no crossfade on interrupt)** — rejected; harsher than canceling the outgoing
  animation and starting fresh.

## R2 — `loadedmetadata` on idle video buffer

**Decision**: **Listen only on the active `[data-bg-video]` element**; rebind after
`swapAtmosphereVideos()`.

**Rationale**: Today `initStageSwitch` attaches `loadedmetadata` once to the first
`[data-bg-video]`. After swap, that node becomes the idle buffer; `resetVideoBuffer()` calls
`load()` and fires spurious metadata events that restart shuffle dwell timers.

**Alternatives considered**:

- **Ignore all metadata unless `event.target === activeVideo`** — lighter but still attaches
  to wrong node; rebind is clearer.
- **Debounce `restartClock()`** — masks symptom; does not fix wrong-element binding.

## R3 — Corrupt `data-stage-catalog` JSON

**Decision**: **try/catch in `bootStageSwitch()`** with `console.error` and early return;
SSR atmosphere + legal links remain usable.

**Rationale**: `JSON.parse` on corrupt deploy artifact currently throws and prevents drawer
boot, mute wiring, and stage sync — unacceptable for a static site where HTML still renders.

**Alternatives considered**:

- **Validate at build only** — insufficient; runtime corruption or manual DOM edit still possible.

## R4 — Tagline overflow at 320px

**Decision**: **Two-line wrap** on `.tagline` — `-webkit-line-clamp: 2` (with fallback),
`overflow: hidden`, `max-width: 100%`; drop strict `white-space: nowrap`.

**Rationale**: Operator chose wrap over ellipsis (session 2026-08-28). Shows more copy on
320px while staying within identity column; may add one line of vertical chrome — acceptable
for narrow viewports.

**Alternatives considered**:

- **Single-line ellipsis** — rejected by operator; less readable on long pool lines.
- **Smaller font only** — does not fix very long strings.

## R5 — Track detail metadata in V-Flip

**Decision**: Extend **`TrackInfoPanel.astro`** frontmatter mapping to include `blurb`,
`credits` (via `parseCredits`), and `mentions` from jukebox collection entries. Reuse
`src/lib/catalog-tracks.ts` parsers — do not duplicate.

**Rationale**: Schema and parsers already exist (`010`); only the Astro template omits fields.
`syncStageUi` already toggles `[data-track-info-for]` per active id.

**Alternatives considered**:

- **Restore separate now-playing popover** — rejected per spec clarifications (`011` model).
- **New component** — rejected; YAGNI.

## R6 — Orphan `releases` collection

**Decision**: **Remove** `releases` collection from `src/content.config.ts` and delete
unused `getValidReleases()` in `src/lib/stage.ts`.

**Rationale**: Discography is jukebox-derived (`getDiscographyFromJukebox`). Empty
`src/content/releases/` triggers build warning every run. Artist guide already states no
separate releases folder.

**Alternatives considered**:

- **Add empty `src/content/releases/`** — silences warning but keeps dead schema and confuses
  artists (guide says jukebox-only).

## R7 — Dead lyrics UI

**Decision**: **Delete** `src/components/LyricsPanel.astro`; remove `data-lyrics-for` branch
from `syncStageUi`; **remove** `lyricsTitle` / `emptyLyrics` from ui schema, `chrome.md`,
and `UiChrome`. Jukebox markdown bodies may still hold lyrics for a future spec.

**Rationale**: `011` explicitly deferred in-drawer lyrics. Operator chose to remove dead
chrome keys now rather than document unused fields.

## R8 — Unused `getValidCatalogTracks`

**Decision**: **Remove** export if still uncalled after `TrackInfoPanel` uses collection
directly; keep `parseCredits` / `parseListenLinks` as shared helpers with existing tests.

**Rationale**: `TrackInfoPanel` already reads jukebox via `getCollection`; duplicating through
`getValidCatalogTracks` adds indirection without benefit unless unified later.

## R9 — Unit test targets

**Decision**: Add `src/lib/theme-packs.test.ts` and `src/lib/stage.test.ts` (vitest) covering:

- `resolveThemePack` unknown / incomplete id → `default`
- `applyThemeAttributes` / HUD glitch flag
- `getUpcomingShows` Berlin today cutoff + sort order
- `berlinToday` edge (mockable via injecting dates in show entries)

**Rationale**: Pure functions, same pattern as `stage-schedule.test.ts` and
`tagline-pool.test.ts`. `stage-switch.ts` integration left manual per spec scope.

## R10 — Location consistency

**Decision**: **Content edit by operator** — align `site.json` `artist.location` with
`about/me.md` prose. Implementation adds no invented address; quickstart includes a checklist
item for operator to pick canonical city.

**Rationale**: Spec forbids code-side invention of personal data.

## R11 — `011` manual QA close-out

**Decision**: Execute `specs/011-vflip-now-playing/quickstart.md` during this feature;
file fixes under `013` for any failures; check off `011` tasks T017, T021, T026, T033, T037,
T040, T042, T043, T048 when pass recorded in `013` quickstart notes.

**Rationale**: FR-012; avoids shipping hardening on top of unverified playback UX.
