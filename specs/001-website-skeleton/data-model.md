# Data Model: Website Skeleton for Valence

**Date**: 2026-08-07 | **Plan**: [plan.md](./plan.md)

All content lives in flat files (constitution III). Two sources of truth:

## Entity: Site (artist profile + global flags)

File: `src/data/site.json` — exactly one instance.

| Field | Type | Required | Description / Validation |
|-------|------|----------|--------------------------|
| `artist.name` | string | yes | Stage name, non-empty. Initial value: `"Valence"` |
| `artist.tagline` | string | yes | One-line hook shown in the hero. Placeholder until confirmed |
| `artist.description` | string | yes | 1–3 sentence intro used as meta/OG description (`Base.astro`). **Not** shown in stage Hero chrome (Hero = name + tagline only; About body is separate). |
| `artist.location` | string | no | e.g. `"Augsburg, Germany"` |
| `seo.title` | string | yes | Browser/OG title |
| `seo.indexable` | boolean | yes | `false` → render `<meta name="robots" content="noindex">`; flip to `true` at launch |
| `channels` | ChannelLink[] | yes | See below; may be empty, rendered section hides itself when empty |

## Entity: ChannelLink

Embedded in `site.json` under `channels`.

| Field | Type | Required | Description / Validation |
|-------|------|----------|--------------------------|
| `id` | string | yes | Stable platform key used to pick the brand mark in `ChannelIcon.astro` (e.g. `"bandcamp"`, `"spotify"`). Not visitor-facing copy. |
| `label` | string | yes | Platform name shown to visitors, e.g. `"Bandcamp"` |
| `url` | string (URL) | yes* | Absolute `https://` URL. *Required when `status` is `active` |
| `status` | `"active"` \| `"placeholder"` | yes | `placeholder` entries render as "coming soon" without a link (spec edge case) |

Current entries (all `active` with real URLs): Bandcamp, SoundCloud, YouTube, Instagram,
TikTok, Spotify. Icons are first-party inline SVG keyed by `id` (no icon font / CDN).

**State transition**: `placeholder → active` by filling `url` and switching `status` —
one edit in one file (SC-006). Adding a new platform: append a `channels[]` row with a
new `id`, then add a matching SVG path in `ChannelIcon.astro` if that mark is not already
mapped (presentation chrome; content URL/label stay in `site.json`).

## Entity: LegalPage

Astro content collection `legal`, files in `src/content/legal/*.md`, schema enforced via
Zod in `src/content.config.ts`. Build fails on schema violations (supports FR-008).

| Field | Type | Required | Description / Validation |
|-------|------|----------|--------------------------|
| `title` | string (frontmatter) | yes | Page heading, e.g. `"Impressum"` |
| `body` | Markdown | yes | Legal text; starts as clearly marked placeholder |

Fixed entries: `imprint.md` (Impressum), `privacy.md` (Datenschutzerklärung). Routed as
`/legal/imprint` and `/legal/privacy` (slug = filename).

## Relationships

- `Site` 1 → n `ChannelLink` (composition, same file)
- `LegalPage` entries are independent; the footer links to all entries of the collection.
