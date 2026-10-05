# Contract: Stage Player UI

**Feature**: `035-hidden-stage-player` | **Date**: 2026-10-06

The DOM contract other modules rely on. Visual values are plan-time defaults for
operator review.

## Root

```html
<div class="stage-player" data-stage-player data-player-state="hidden|hint|minimal|full"
     data-stage-catalog="…" data-stage-schedule="…" data-stage-fallback="…"
     data-shuffle-default="true|false" data-loop-default="true|false">
```

- `data-stage-catalog` / `-schedule` / `-fallback` / `-*-default` keep the attributes the
  current `Jukebox.astro` boot passes to `initStageSwitch` (unchanged contract).
- `data-player-state` is the single source for CSS; JS never toggles visibility classes
  directly.

## Parts

| Part | Selector | Visible in | Behavior |
| ---- | -------- | ---------- | -------- |
| Keyboard reveal | `[data-player-reveal]` (button) | hidden (only on focus) | activation → `full` |
| Vinyl | `[data-player-vinyl]` (button) | hint, minimal, full | hint/minimal → `full`; in full: no-op |
| Panel | `[data-player-panel]` (region, `aria-label` = `songsTitle`) | full | — |
| Now playing title | `[data-now-playing]` | full | updated by `syncNowPlayingLabel` |
| Song list | `[data-player-songs]` > `button[data-jukebox-option]` | full | one tap = manual pick; `aria-pressed` = current |
| Shuffle | `[data-shuffle-toggle]` | full | unchanged semantics |
| Play/pause | `[data-bg-play-toggle]` | full | unchanged semantics |
| Mute (+ slider ≥1024px) | `[data-jukebox-mute-slot]` containing `MuteControl` | full | unchanged semantics |
| Close | `[data-player-close]` | full | → `minimal` |

## Events

| Event (document) | Detail | Emitted by | Consumed by |
| ---------------- | ------ | ---------- | ----------- |
| `stage-select` | `{ id }` | any UI | `stage-switch.ts` (existing) |
| `stage-overlay-close` | — | `stage-player.ts` after a `[data-stage-button]` click inside `#legal-overlay` or `[data-site-nav-menu]` | `LegalOverlay.astro` (close like Exit), `SiteNav.astro` (close menu) |
| `player-state-change` | `{ state }` | `stage-player.ts` | optional listeners (e.g. future achievements page) |

## Discography play buttons

- Rendered only when the release has a stage id (`release.jukeboxId`):
  `button.discog__play[data-stage-button="<id>"]` plus a sibling
  `[data-discog-playing="<id>"]` EQ marker (same pattern as today's theme-track list).
- Applies to single cards and nested collection rows in `DiscographyTrackRow.astro` and
  to the phone menu portal in `SiteNav.astro`. Collection-level play buttons are removed.
- `data-discog-play` is removed everywhere.

## Gesture ignore

`gesture-ignore.ts` base selector MUST include `[data-stage-player]`, `[data-site-nav]`,
`#legal-overlay`, `[data-track-rub-overlay]`, `a`, `button`, `input`, `select`,
`textarea`, `label`, `summary`, `[role="button"]`, `[data-stage-button]`,
`.discog__listen`, `.discog__listen-links`.
