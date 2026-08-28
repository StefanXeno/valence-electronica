# Contract: Tracks Content (Catalog-Only)

**Date**: 2026-08-28 | **Plan**: [plan.md](./plan.md) | **Data model**: [../data-model.md](../data-model.md)

Maintainer-facing contract for **discography-only** songs. Extends
`specs/010-track-catalog/contracts/track-catalog-content.md` field vocabulary without stage
fields. Do not rename filename slugs without developer help.

## When to use

| Goal | Edit surface |
|------|----------------|
| Play on V-Flip + optional Discography row | `src/content/jukebox/<id>.md` |
| Discography only (no stage clip) | `src/content/tracks/<id>.md` |
| Hide from Discography but keep on stage | jukebox + `inDiscography: false` |

## `src/content/tracks/<id>.md`

```markdown
---
label: EXAMPLE — Catalog Only Single
sortDate: 2016-03-15
kind: single
listenLinks:
  - platform: bandcamp
    url: https://example.bandcamp.com/track/example
blurb: Optional; stored for future use — not shown in Discography row v1
credits:
  - role: Producer
    name: Valence
mentions: Optional thank-you line — not shown in Discography row v1
---

Optional artist note in the body (ignored by the site).
```

### Rules

| Field | Rule |
|-------|------|
| Filename slug | Stable **id** — if you later add a jukebox file, use the **same slug** to promote to stage |
| `label` | **Required.** Discography title. |
| `sortDate` | **Required.** ISO date (`2016-03-15`). Missing → entry omitted + build warning. |
| `kind` | Optional. Shown after year in Discography (e.g. `2016 · single`). |
| `listenLinks` | Optional. Same platforms as jukebox: `bandcamp`, `spotify`, `youtube`, `soundcloud`, `tidal`. Invalid rows omitted + warned. |
| `blurb` | Optional. Stored; not rendered in Discography v1. |
| `credits` | Optional. Stored; not rendered in Discography v1. |
| `mentions` | Optional. Stored; not rendered in Discography v1. |
| Body | Ignored. |

### Must NOT include

`poster`, `sources`, `themeId`, `hasAudio`, `default`, `inDiscography` — those belong on
jukebox files only.

## Promotion to stage

1. Create `src/content/jukebox/<same-id>.md` with stage fields (`poster`, `themeId`, etc.).
2. Optionally delete `src/content/tracks/<same-id>.md` to avoid confusion (jukebox row wins
   either way — no duplicate in Discography).
3. Do **not** rename the slug without updating schedule rules and references.

## Initial content (ship)

| id | purpose |
|----|---------|
| `example-catalog-only` | Demonstrates catalog-only row in Discography |

## Outbound links (visitor)

Same as `010`: Discography title links use primary platform priority (Bandcamp → Spotify →
…); `target="_blank"` + `rel="noopener noreferrer"`; no embeds.

## Cross-references

- Jukebox + catalog fields: [`specs/010-track-catalog/contracts/track-catalog-content.md`](../../010-track-catalog/contracts/track-catalog-content.md)
- Stage content (unchanged): [`specs/004-landing-content-layout/contracts/stage-content.md`](../../004-landing-content-layout/contracts/stage-content.md)
