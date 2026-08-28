# Contract: Track Catalog UI (visitor-facing)

**Date**: 2026-08-28 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

Extends `specs/009-desktop-stage-ui/contracts/desktop-hud-ui.md` dock row. Jukebox,
mute, exclusive-open, glitch, and label-reveal rules unchanged unless noted below.

## Dock layout (additions)

| Zone | Contract |
|------|----------|
| Left cluster | Order: **jukebox** → **now-playing info** (when catalog has active track) → **mute** (when visible). Info control is icon-only at rest. |
| Right segment | Order unchanged; **Tracks** icon added after Tour (or before Lyrics — implement as last icon in row unless owner reorders in plan review). |

Recommended icon order (right segment): About (if any), Lyrics, **Tracks**, Discography, Tour.

## Track catalog panel

| Property | Rule |
|----------|------|
| Trigger | Icon + `chrome.catalogTitle`; same `<details>` pattern as other on-demand panels |
| Open width | Same as other on-demand panels: `min(18rem × --hud-scale, viewport − insets)` |
| Body | Scrollable list of all catalog tracks, one row per track |
| Row content | Title + year (from `sortDate`); optional blurb truncated with ellipsis |
| Sort | Newest `sortDate` first; tie → title A–Z |
| Empty | `chrome.emptyCatalog` if no valid catalog rows |
| Exclusive open | Opening catalog closes other panels (existing `data-stage-panels` rule) |

Rows are **not** jukebox switches in v1 — catalog is browse-only; staging still via jukebox
or discography stage button.

## Now-playing info control

| Property | Rule |
|----------|------|
| Visibility | Shown when landing has at least one catalog track |
| At rest | Icon only; `chrome.nowPlayingLabel` via visually hidden + `aria-label` |
| Label reveal | `data-hud-label-anchor="above"` when closed |
| Activate | Click or keyboard activates popover |
| Popover content | Title (catalog); optional blurb; listen links (if any); credits list; mentions |
| Popover position | Anchored to info control, peripheral (above or beside cluster), does not cover center stage |
| Close | Escape, outside click, jukebox switch, or second activate on control |
| Active track | Matches current jukebox / atmosphere id; fallback title = jukebox `label` if catalog row missing |
| Reduced motion | No new looping animation; instant show/hide acceptable |

## Glitch scope

| Target | Treatment |
|--------|-----------|
| Catalog panel summary | `glitch-hit` one-shot hover/focus; morph on open/close |
| Now-playing info button | `glitch-hit` one-shot; no continuous hover |
| Popover content | No glitch (read-only links/text) |

## Keyboard

- Tab order: jukebox → now-playing info → mute → on-demand row (includes catalog).
- Popover traps focus while open; Escape closes and returns focus to info control.

## Amendments to `009` desktop contract

Add to icon-at-rest table:

| Control | At rest | Label source |
|---------|---------|--------------|
| Tracks catalog | Icon only | `chrome.catalogTitle` |
| Now-playing info | Icon only | `chrome.nowPlayingLabel` |
