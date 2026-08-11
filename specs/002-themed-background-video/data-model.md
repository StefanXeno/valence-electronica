# Data Model: Themed Background Video

**Date**: 2026-08-10 | **Plan**: [plan.md](./plan.md)

Atmospheric media and basic themes live in flat files (constitution III), separate from
the artist profile in `site.json`.

## Entity: BackgroundConfig

File: `src/data/background.json` — exactly one instance.

| Field | Type | Required | Description / Validation |
|-------|------|----------|--------------------------|
| `defaultVideoId` | string | yes | Must match a `videos[].id` in the same file |
| `videos` | BackgroundVideo[] | yes | Non-empty; at least the default entry must resolve |

## Entity: BackgroundVideo

Embedded in `background.json` under `videos`.

| Field | Type | Required | Description / Validation |
|-------|------|----------|--------------------------|
| `id` | string | yes | Stable identity (slug); unique within `videos` |
| `title` | string | no | Operator-facing label (not required on-page in this feature) |
| `sources` | MediaSource[] | yes | At least one playable source (MP4 required for v1) |
| `poster` | string (site path) | yes | Still/poster path under `public/` (e.g. `/images/posters/default.webp`) |
| `themeId` | string | yes | Must match a theme pack id defined in CSS (`data-theme`) |
| `hasAudio` | boolean | yes | `true` → mute control may be shown while playing; `false` → control hidden |

This feature shows only the video whose `id === defaultVideoId`. Extra entries may exist
for future switcher work but have no visitor-facing picker here (FR-011).

## Entity: MediaSource

| Field | Type | Required | Description / Validation |
|-------|------|----------|--------------------------|
| `src` | string (site path) | yes | Path under `public/` (e.g. `/videos/default.mp4`) |
| `type` | string | yes | MIME type, e.g. `video/mp4` or `video/webm` |

## Entity: VisualTheme (basic)

Not a JSON document — a named CSS pack keyed by `themeId`.

| Aspect | Rule |
|--------|------|
| Identity | `themeId` string referenced by `BackgroundVideo.themeId` |
| Application | Set `data-theme="{themeId}"` on `<html>` from the **default** video |
| Scope | Color and surface tokens only (bg, surface, text, muted, accent, border, scrim) |
| Fallback | Unknown `themeId` → fall back to a documented `default` pack so the page never ships unstyled |

Deep typography/motion packs are out of scope (IDEA-002).

## Entity: LegalPanel (presentation)

Not stored as its own content file — presentation wrapper around existing `LegalPage`
entries (`src/content/legal/*.md` from feature 001).

| Aspect | Rule |
|--------|------|
| Routes | `/legal/{slug}` remain shareable (SSR open + History API sync) |
| Chrome | Near-fullscreen panel, margins on all sides, X exit (accessible name “Exit”) |
| Shell | Prerendered in `LegalOverlay` on every page via `Base`; landing content under panel |
| Atmosphere | Same default video theme + media layer as landing |
| Motion | CSS enter animation when motion allowed; skipped/minimized for reduced motion |
| No-JS | Footer/Exit hard-navigate; panels still render on `/legal/{slug}` |

## Relationships

- `BackgroundConfig` 1 → n `BackgroundVideo`
- `BackgroundConfig.defaultVideoId` → exactly one `BackgroundVideo.id`
- `BackgroundVideo.themeId` → one `VisualTheme` pack in CSS
- `LegalPage` (001) presented via `LegalPanel` over the atmosphere of the default video

## State (visitor session, ephemeral)

| State | Meaning |
|-------|---------|
| Playing + muted | Default when motion allowed, video can play, audio off |
| Playing + unmuted | After user activates unmute (`hasAudio` only) |
| Fallback | Reduced motion, load error, or autoplay blocked — poster/solid theme, no mute control |

No persistence (`localStorage` / cookies) in this feature.
