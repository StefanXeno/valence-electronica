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
| `jukeboxLabel` | string | yes | Accessible name for the vinyl control |
| `socialsLabel` | string | yes | Nav accessible name (icons have per-channel labels) |
| `comingSoon` | string | yes | Appended to inactive channel accessible names |
| `ticketLabel` | string | yes | Tour row ticket link text |

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
| `hasAudio` | boolean | no | Hint; mute only shows if this is true **and** the entry actually plays looping video |
| `poster` | string | yes | Site path under `public/` (required for a usable entry) |
| `sources` | MediaSource[] | no | Optional. Looping video plays only when `themeId` is `nightmare-crimson` **and** at least one usable source exists |
| `default` | boolean | no | Exactly one should be `true`; resolver picks one valid default |
| body | Markdown | no | Lyrics. Empty → lyrics empty-state copy |

Logical omit (FR-020): drop the entry if `label` or `poster` is empty. Poster-only
entries (no `sources`) are valid stills. If the omitted entry was default, use another
valid entry; if none remain, keep static/themed fallback so the page is not blank.

Shipped examples: `placeholder-loop` (Nightmare, MP4 + audio, default), `example-cyan`
(cyan-pulse, static SVG poster, no sources, no mute).

### MediaSource

Same as `002`: `{ src: string, type: string }`. When present, v1 uses `video/mp4`.

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

Shipped example: `example-augsburg.md` (2026-12-05, Augsburg, Example Venue, Bandcamp
ticket URL), clearly marked EXAMPLE. Zero files in the folder is a valid empty
catalog (`emptyShows`); the collection must still exist in the content store.

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
| Mute | Inherited from `002`; survives jukebox switch when the new entry plays looping video with audio; hidden for static stills |
| On-demand panel | At most one `<details>` open; default all closed |
| About visibility | Hidden when About body empty |

No `localStorage` / cookies / `sessionStorage`.
