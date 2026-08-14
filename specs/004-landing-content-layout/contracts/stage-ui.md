# Contract: Stage UI (visitor-facing)

**Date**: 2026-08-14 | **Plan**: [../plan.md](../plan.md) | **Spec**: [../spec.md](../spec.md)

Behavior contract for the landing HUD. Complements `002` atmosphere UI (mute, reduced
motion, legal overlay) and `003` glitch (closed hit-target set — **do not** add new
glitch targets here).

## Layout

| Zone | Contract |
|------|----------|
| Center | Atmosphere only. No About, lyrics, lists, or jukebox **body** in the middle. |
| Identity | Persistent compact chrome: name + hook. Top-left. Not a huge centered title. |
| Socials | Persistent compact chrome: existing channels. Top-right. New tab for active links. |
| Jukebox | Persistent compact chrome. Bottom-left. Always visible, including with one entry. |
| On-demand | About, Lyrics, Discography, Tour. Bottom-right cluster of disclosure controls. Closed on load. |
| Legal footer | Thin bottom edge; overlay from `002` unchanged. |
| Mute | Existing `002` control; not covered by panels; hidden/disabled per `002` rules using the **active** entry. |

From 320px: no horizontal scroll. Persistent chrome stays visible (compact). On-demand
panels expand along the edge (~20–28rem max), scroll internally if long, never as a
centered opaque sheet.

## Jukebox

| Action | Result |
|--------|--------|
| Load / reload | Active entry = content default. No remembered pick. |
| Select another entry | Active id, atmosphere media, `data-theme`, lyrics, and mute visibility update **without** full document reload. |
| Mute was off | Stays muted after switch. |
| Mute was on and new entry `hasAudio` | Stays unmuted unless the environment blocks it. |
| New entry `hasAudio: false` or not playing | Mute control hidden/disabled (`002`). |
| Reduced motion | No looping video; static poster/theme still follow the active entry. |
| Missing media on an entry | Entry omitted at build; if it was default, another valid entry or static fallback. |

## Discography

| Action | Result |
|--------|--------|
| Open region | List of valid releases (title, year, optional kind). Empty → `emptyReleases` copy; control still there. |
| Follow `url` | New tab. Jukebox unchanged. |
| Stage button (bound row) | Same as selecting that jukebox entry. |
| No `jukeboxId` or invalid id | No stage button. |
| Bound row already active | Button stays visible, pressed/current state, click is a no-op. |

## Tour

Upcoming shows only (Europe/Berlin, soonest first). Empty → `emptyShows`. Control stays.

## About / Lyrics

| Region | Empty behavior |
|--------|----------------|
| About | Control **hidden** if no body |
| Lyrics | Control stays; shows `emptyLyrics` when body empty / instrumental |

Lyrics always follow the **active** jukebox entry (including after a stage-button switch).

## On-demand exclusive open

When scripting is available: at most one of About / Lyrics / Discography / Tour is
expanded at a time (all breakpoints in this feature; spec MUST on small screens).
Opening one closes the others. Toggle the open control to close it.

Without scripting: `<details>` still open and close; more than one MAY be open.

## Accessibility

- All persistent and on-demand controls are keyboard reachable.
- Jukebox options and the stage button have accessible names from chrome/content labels.
- Sufficient contrast over atmosphere (existing scrim tokens).
- Reduced motion: no extra panel theater; disclosures still work.

## Out of scope (do not implement here)

- Glitch on new controls
- Third-party embeds
- Extra routes (`/lyrics`, `/tour`, …)
- Remembering jukebox across reload
- Deep per-theme type/motion packs
