# Contract: Track Catalog Content

**Date**: 2026-08-28 | **Plan**: [plan.md](./plan.md) | **Data model**: [../data-model.md](../data-model.md)

Maintainer-facing contract. Extends `specs/004-landing-content-layout/contracts/stage-content.md`
jukebox section. Do not rename jukebox filename slugs without developer help.

## Extended `src/content/jukebox/<id>.md`

```markdown
---
label: Nightmare
sortDate: 2024-10-31
themeId: nightmare-crimson
hasAudio: true
poster: /images/posters/nightmare.jpg
default: true
sources:
  - src: /videos/nightmare.mp4
    type: video/mp4
blurb: Optional one-line hook for catalog / track info
listenLinks:
  - platform: bandcamp
    url: https://valenceelectronica.bandcamp.com/
  - platform: youtube
    url: https://www.youtube.com/watch?v=example
credits:
  - role: Producer
    name: Valence
mentions: Optional thank-you line or short prose
---

Lyrics body (unchanged — still owned by jukebox file).
```

### Rules

| Field | Rule |
|-------|------|
| `label` | Required (existing). Shown in jukebox and catalog title. |
| `sortDate` | **Required for catalog.** ISO date (`2025-06-01`). Missing → entry omitted from catalog with build warning; stage still works. |
| `blurb` | Optional. One short line. |
| `listenLinks` | Optional. `platform` must be one of: `bandcamp`, `spotify`, `youtube`, `soundcloud`, `tidal`. `url` must be `https://` (or `http://`). Invalid rows omitted + warned. |
| `credits` | Optional. Each row needs `role` and `name`. Invalid rows omitted + warned. |
| `mentions` | Optional. Plain string. |
| Body | Lyrics only (unchanged). |

### Initial content (ship)

All four jukebox files MUST gain `sortDate` and placeholder or real metadata:

| id | label (existing) |
|----|------------------|
| `nightmare` | Nightmare |
| `taking-over` | Taking Over |
| `show-me-how` | Show ME How |
| `example-cyan` | Example Cyan |

## Extended `src/content/ui/chrome.md`

Add:

```yaml
catalogTitle: Tracks
catalogIcon: catalog
nowPlayingLabel: Track info
nowPlayingIcon: info
emptyCatalog: No tracks yet
```

Rules:

- `catalogTitle` / `nowPlayingLabel` — change labels here, not in components.
- `catalogIcon` / `nowPlayingIcon` — token id or single emoji override (same as other HUD icons).

## Outbound links (visitor)

- Listen links render as text links with platform name.
- `target="_blank"` + `rel="noopener noreferrer"`.
- No embeds, no autoplay widgets.

## Catalog-only tracks (no stage clip)

For discography entries **without** a V-Flip stage file, use
[`specs/014-discography-only-tracks/contracts/tracks-content.md`](../../014-discography-only-tracks/contracts/tracks-content.md)
(`src/content/tracks/`).
