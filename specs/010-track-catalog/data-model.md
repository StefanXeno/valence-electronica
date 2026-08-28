# Data Model: Track Catalog & Song Identity

**Date**: 2026-08-28 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

Track identity lives in **jukebox content files** for v1 (shared id with stage entries).
Lyrics remain in the markdown body. Discography releases unchanged.

## Entity: CatalogTrack (view of JukeboxEntry)

Logical catalog row — sourced from a valid jukebox collection entry with catalog fields.

| Field | Type | Required | Source / validation |
|-------|------|----------|---------------------|
| `id` | string | yes | Jukebox filename slug (stable) |
| `title` | string | yes | `label` frontmatter (trimmed, non-empty) |
| `sortDate` | Date | yes | `sortDate` frontmatter; omit entry + warn if missing/invalid |
| `blurb` | string | no | Short one-line hook |
| `listenLinks` | ListenLink[] | no | Valid rows only; invalid URL/platform omitted + warn |
| `credits` | Credit[] | no | Valid rows only; invalid rows omitted + warn |
| `mentions` | string | no | Trimmed prose |
| `hasStageClip` | boolean | yes | Derived: entry has usable poster (always true if in catalog v1) |
| `jukeboxId` | string | yes | Same as `id` when stage clip exists |

### Sort order

1. `sortDate` descending (UTC calendar day)
2. `title` ascending (`localeCompare`)

## Entity: ListenLink

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `platform` | enum | yes | `bandcamp` \| `spotify` \| `youtube` \| `soundcloud` \| `tidal` |
| `url` | string (URL) | yes | `http:` or `https:` only |

Display label derived from platform token (e.g. “Bandcamp”) in UI — not artist-editable in v1.

## Entity: Credit

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `role` | string | yes | e.g. Producer, Mix, Visuals |
| `name` | string | yes | Person or entity name |

## Entity: JukeboxEntry (extended)

Existing fields unchanged — see `specs/004-landing-content-layout/data-model.md`.

**Added frontmatter** (catalog):

| Field | Type | Required |
|-------|------|----------|
| `sortDate` | date | yes for catalog inclusion |
| `blurb` | string | no |
| `listenLinks` | ListenLink[] | no |
| `credits` | Credit[] | no |
| `mentions` | string | no |

Entries missing `sortDate` remain valid **jukebox/stage** entries but are **omitted from
catalog list** with build warning (atmosphere still works).

## Entity: UiChrome (extended)

File: `src/content/ui/chrome.md`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `catalogTitle` | string | yes | Track catalog panel title + accessible name |
| `catalogIcon` | string | no | HUD icon token or emoji override |
| `nowPlayingLabel` | string | yes | Accessible name for info control (e.g. “Track info”) |
| `nowPlayingIcon` | string | no | Info control icon token or emoji |
| `emptyCatalog` | string | no | If zero catalog rows (should not ship) |

Existing fields unchanged.

## Entity: HudIconToken (extended)

Add token: `catalog` (list / tracks glyph) and `info` (now-playing control).

## Relationships

```text
CatalogTrack (id) ──same id──► JukeboxEntry (stage + lyrics + theme)
Release.jukeboxId ──optional──► JukeboxEntry.id (stage button in discography)
Active jukebox selection ──resolves──► CatalogTrack for now-playing UI
```

## Runtime: ActiveTrackContext (client)

Ephemeral UI state — not persisted.

| State | Description |
|-------|-------------|
| `activeId` | Current jukebox entry id from video/atmosphere + option buttons |
| `popoverOpen` | Info popover visibility |

Updated on jukebox option click and `bg-state-change`; popover closes on switch.
