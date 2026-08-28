# Data Model: Codebase Hardening & Quality Pass

**Date**: 2026-08-28 | **Plan**: [plan.md](./plan.md)

No new persistence files. This feature completes rendering of existing jukebox fields and
hardens runtime stage state. Entities below are logical views of data already in the repo.

## Entity: JukeboxTrackDetail (visitor-facing slice)

**Source**: `src/content/jukebox/<id>.md` frontmatter + `src/content/ui/chrome.md` labels.

| Field | Type | Required | Shown in V-Flip detail when |
|-------|------|----------|-----------------------------|
| `id` | string (slug) | yes | Always (via list selection) |
| `label` | string | yes | Track list button |
| `sortDate` | Date | no* | `sortDate` present → release line |
| `listenLinks` | ListenLink[] | no | Any valid links → link row |
| `blurb` | string | no | Trimmed non-empty |
| `credits` | Credit[] | no | Any valid credit rows |
| `mentions` | string | no | Trimmed non-empty |

\*Required for discography elsewhere; track detail omits release line when absent.

### Credit row

| Field | Type | Required |
|-------|------|----------|
| `role` | string | yes |
| `name` | string | yes |

Invalid credit rows omitted at parse time with build warning (existing `parseCredits`).

### ListenLink

Unchanged from `010` — `platform` + `url`; invalid rows omitted with warning.

### Body (markdown)

Lyrics — **not rendered** in v1. Retained in content for future feature.

## Entity: StageHandoff (runtime, client)

Managed in `src/lib/stage-switch.ts` after hardening.

| Field | Description |
|-------|-------------|
| `activeId` | Current jukebox / atmosphere id |
| `handoffGeneration` | Monotonic counter; stale async work compares before DOM writes |
| `crossfadeInFlight` | Optional flag for debugging; generation supersedes |
| `activeVideoEl` | Current `[data-bg-video]` with metadata listener bound |

### State transitions

```text
select(id)
  → increment handoffGeneration
  → set activeId = id
  → syncStageUi(activeId)  // immediate UI for track list / detail visibility
  → crossfadeStageEntry(...)
       → if generation stale at end: return (no restartClock)
       → else: syncStageUi + restartClock on active video only
```

## Entity: TaglinePresentation (CSS view)

**Source**: `Hero.astro` `.tagline` + `tagline-pool.json` / `site.json` fallback.

| Constraint | Rule |
|------------|------|
| Max width | 100% of identity column |
| Overflow | `ellipsis` at all breakpoints |
| Motion | Unchanged from `012` rotator |

## Removed / deprecated

| Item | Action |
|------|--------|
| `releases` content collection | Remove from `content.config.ts` |
| `getValidReleases()` | Delete |
| `getValidCatalogTracks()` | Delete if unused |
| `LyricsPanel.astro` | Delete |
| `data-lyrics-for` DOM sync | Remove from `syncStageUi` |

## Documentation surfaces (not new entities)

| File | Updates |
|------|---------|
| `docs/artist-guide.md` | `blurb`, `credits`, `mentions`, lyrics-not-shown |
| `README.md` | Dev-only intro replay |
| `src/content/about/me.md` + `site.json` | Location aligned (operator edit) |
