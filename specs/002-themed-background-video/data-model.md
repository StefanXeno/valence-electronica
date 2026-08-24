# Data Model: Themed Background Video

**Date**: 2026-08-10 (as-built sync 2026-08-24) | **Plan**: [plan.md](./plan.md)

Atmospheric media lives in flat files (constitution III), separate from the artist profile
in `site.json`. The original `background.json` catalog was **superseded by feature `004`**
(jukebox Markdown collection). This document records the as-built runtime shapes produced
by `src/lib/background.ts`.

## Entity: BackgroundConfig (runtime)

Resolved at build/request time by `getBackgroundConfig()` — **not** a standalone JSON file.

| Field | Type | Required | Description / Validation |
|-------|------|----------|--------------------------|
| `defaultVideoId` | string | yes | Static fallback: jukebox entry with `default: true`, else first usable entry |
| `schedule` | StageSchedule | yes | From `src/data/stage-schedule.json` (feature `007`); validated against usable ids |
| `videos` | BackgroundVideo[] | yes | Usable jukebox entries only (invalid rows omitted with warn) |

## Entity: BackgroundVideo (runtime)

Derived from `src/content/jukebox/<id>.md` (see `004` data model for frontmatter).

| Field | Type | Required | Description / Validation |
|-------|------|----------|--------------------------|
| `id` | string | yes | Collection entry id (filename slug) |
| `title` | string | no | Same as `label` for operator-facing use |
| `label` | string | yes | Visitor-facing jukebox label |
| `sources` | MediaSource[] | yes | May be empty (poster-only). Usable sources need `src` + `type` |
| `poster` | string (site path) | yes | Still/poster under `public/` |
| `themeId` | ThemePackId | yes | Resolved via `resolveThemeId` (unknown → `default`) |
| `hasAudio` | boolean | yes | True only if entry claims audio **and** has usable sources |
| `lyricsEmpty` | boolean | yes | True when Markdown body is empty |

Usable entry rule: non-empty `label` and `poster`. Extra jukebox entries are visitor-
selectable via the jukebox (feature `004`); this feature’s original scope had no picker.

## Entity: MediaSource

| Field | Type | Required | Description / Validation |
|-------|------|----------|--------------------------|
| `src` | string (site path) | yes | Path under `public/` (e.g. `/videos/nightmare.mp4`) |
| `type` | string | yes | MIME type, e.g. `video/mp4` |

## Entity: VisualTheme (basic)

Not a JSON document — a named CSS pack keyed by `themeId`. Capabilities and completeness
rules live in feature `005` (`src/lib/theme-packs.ts` + `src/styles/themes.css`).

| Aspect | Rule |
|--------|------|
| Identity | `themeId` string on the active jukebox entry |
| Application | Set `data-theme="{themeId}"` and `data-hud-glitch` on `<html>` from the resolved pack |
| Scope (this feature) | Color and surface tokens (bg, surface, text, muted, accent, border, scrim) |
| Fallback | Unknown/incomplete `themeId` → full `default` pack |

Deep typography/motion packs are out of scope (IDEA-002).

## Entity: LegalPanel (presentation)

Not stored as its own content file — presentation wrapper around existing `LegalPage`
entries (`src/content/legal/*.md` from feature 001).

| Aspect | Rule |
|--------|------|
| Routes | `/legal/{slug}` remain shareable (SSR open + History API sync) |
| Chrome | Near-fullscreen panel, margins on all sides, X exit (accessible name “Exit”) |
| Shell | Prerendered in `LegalOverlay` on every page via `Base`; landing content under panel |
| Atmosphere | Same active-entry theme + media layer as landing |
| Motion | CSS enter animation when motion allowed; skipped/minimized for reduced motion |
| No-JS | Footer/Exit hard-navigate; panels still render on `/legal/{slug}` |

## Relationships

- `BackgroundConfig` 1 → n `BackgroundVideo` (from jukebox collection)
- `BackgroundConfig.defaultVideoId` → exactly one usable `BackgroundVideo.id` (static fallback)
- `BackgroundVideo.themeId` → one complete `ThemePack` (registry + CSS)
- `LegalPage` (001) presented via `LegalPanel` over the landing atmosphere

## State (visitor session, ephemeral)

| State | Meaning |
|-------|---------|
| Playing + muted | Default when motion allowed, pack allows video, video can play, audio off |
| Playing + unmuted | After user activates unmute (`hasAudio` + pack `audioEligible` only) |
| Fallback | Reduced motion, load error, autoplay blocked, or pack without looping video — poster/solid theme, no mute control |

No persistence (`localStorage` / cookies) in **this** feature. (Landing intro flag is
feature `006`; jukebox picks are not stored.)
