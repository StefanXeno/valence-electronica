# Data Model: Landing Stage

**Date**: 2026-08-14 | **Plan**: [plan.md](./plan.md)

Visitor-facing stage copy lives in Markdown collections (constitution III). Identity and
channels stay in `site.json`. Atmospheric media fields move from `background.json` into
the jukebox collection.

## Entity: UiChrome

File: `src/content/ui/chrome.md` — exactly one instance (frontmatter; body unused).

| Field | Type | Required | Description / Validation |
|-------|------|----------|--------------------------|
| `aboutTitle` | string | yes | On-demand control label |
| `lyricsTitle` | string | yes | On-demand control label |
| `discographyTitle` | string | yes | On-demand control label |
| `tourTitle` | string | yes | On-demand control label |
| `stageButtonLabel` | string | yes | Discography row button (bound releases only) |
| `emptyLyrics` | string | yes | Instrumental / missing lyrics |
| `emptyReleases` | string | yes | Shown when no valid releases |
| `emptyShows` | string | yes | Shown when no upcoming shows |

If this file is missing or a field is empty, use the English literals from the contract
as last-resort fallbacks (so the stage still renders). Operators should still edit this
file, not components.

## Entity: Artist profile (existing)

File: `src/data/site.json` `artist` — name, tagline (hook), location, description (seo/
legacy). Stage identity chrome uses **name + tagline**. About prose is **not** this
description; it is the About collection.

## Entity: AboutPage

File: `src/content/about/me.md`

| Field | Type | Required | Description / Validation |
|-------|------|----------|--------------------------|
| body | Markdown | yes to show | Short bio. Empty or missing file → hide About control |

## Entity: JukeboxEntry

Files: `src/content/jukebox/<id>.md` — `<id>` is the stable slug (do not rename casually).

| Field | Type | Required | Description / Validation |
|-------|------|----------|--------------------------|
| `label` | string | yes | Visitor-facing jukebox label |
| `themeId` | string | yes | CSS pack id; unknown → `default` pack |
| `hasAudio` | boolean | yes | Mute control may show while this entry is playing |
| `poster` | string | yes | Site path under `public/` |
| `sources` | MediaSource[] | yes | At least one `video/mp4` |
| `default` | boolean | no | Exactly one should be `true`; resolver picks one valid default |
| body | Markdown | no | Lyrics. Empty → lyrics empty-state copy |

Logical omit (FR-020): drop the entry if `label` empty, `sources` unusable, or `poster`
empty. If the omitted entry was default, use another valid entry; if none remain, keep
static/themed fallback so the page is not blank.

### MediaSource

Same as `002`: `{ src: string, type: string }` with `video/mp4` required for v1.

## Entity: Release

Files: `src/content/releases/<slug>.md`

| Field | Type | Required | Description / Validation |
|-------|------|----------|--------------------------|
| `title` | string | yes | Visitor-facing title |
| `year` | number | yes | Four-digit year |
| `kind` | string | no | e.g. `single`, `ep`, `album` |
| `url` | string (URL) | no | Listen/store; omit link if missing |
| `jukeboxId` | string | no | If it matches a valid jukebox id → show stage button |

Omit if `title` or `year` missing. Sort: `year` descending, then title.

Shipped examples: Example Single (2024, bound), Example EP (2025, unbound).

## Entity: ShowDate

Files: `src/content/shows/<slug>.md`

| Field | Type | Required | Description / Validation |
|-------|------|----------|--------------------------|
| `date` | date (calendar) | yes | Interpret in Europe/Berlin |
| `city` | string | yes | |
| `venue` | string | yes | |
| `ticketUrl` | string (URL) | no | Omit link if missing |

Omit if `date`, `city`, or `venue` missing. Stage list: `date` ≥ today (Berlin) only,
soonest first. Past dates in files are allowed but not shown as upcoming.

## Relationships

- `JukeboxEntry` 1 → 0..1 lyrics body (same file)
- `Release.jukeboxId` → 0..1 `JukeboxEntry.id` (stage button iff the target is valid)
- `UiChrome` 1 → labels/empty states for all regions
- Active jukebox (ephemeral) → atmosphere media + `data-theme` + lyrics panel
- `site.json` channels → persistent socials chrome (unchanged records)

## State (visitor session, ephemeral)

| State | Meaning |
|-------|---------|
| Active jukebox id | Starts as content default; changes on jukebox pick or stage button; **not** stored; reload restores default |
| Mute | Inherited from `002`; survives jukebox switch when the new entry `hasAudio` and atmosphere is playing |
| On-demand panel | At most one `<details>` open; default all closed |
| About visibility | Hidden when About body empty |

No `localStorage` / cookies / `sessionStorage`.
