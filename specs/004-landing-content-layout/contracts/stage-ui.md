# Contract: Stage UI (visitor-facing)

**Date**: 2026-08-14 (as-built sync 2026-08-24) | **Plan**: [../plan.md](../plan.md) | **Spec**: [../spec.md](../spec.md)

Behavior contract for the landing HUD as built. Complements `002` atmosphere UI
(mute, reduced motion, legal overlay) and `003` glitch. Glitch on HUD chrome runs
only while `html[data-hud-glitch='true']` (pack `hudGlitch` — feature `005`).

Visual target: **typical laptop**. Phone/small-screen composition is deferred
(IDEA-013). The page MUST still load on small viewports.

## Layout

Chrome scale: `--hud-scale: 1.5`.

| Zone | Contract |
|------|----------|
| Center | Atmosphere only. No About, lyrics, lists, or jukebox **body** in the middle. |
| Identity | Persistent compact chrome: name + hook from `site.json` only. Top-left. Not a huge centered title. Location/description are not shown here. |
| Socials | Persistent compact chrome: existing channels as **equal-sized icons only** (~2.5rem × `--hud-scale` circles). Top-right. Visible labels off; names via `aria-label`. Active links: new tab + `glitch-hit` when glitch enabled. Inactive: non-link icon + coming-soon accessible name. |
| Jukebox | Persistent compact chrome. Bottom-left. **Collapsed vinyl-record control** at rest (same family as mute). Song list only while open (`<details>`). Always present, including with one entry. Accessible name from chrome `jukeboxLabel` (shipped: `V-Flip`). |
| On-demand | About, Lyrics, Discography, Tour. Bottom-right cluster of disclosure controls. Closed on load. |
| Legal footer | Transparent, bottom-left cluster: `© {year} Valence` then Impressum / Datenschutzerklärung. No bar. Overlay from `002` unchanged. |
| Mute | Existing `002` control, bottom-right **below** the on-demand cluster; not covered by panels; hidden when the active entry has no looping video with audio. |
| Landing intro | Feature `006` portal overlay on `/` only — not part of persistent HUD chrome. |

On-demand panels expand along the edge (~20–28rem max scaled), scroll internally if
long, never as a centered opaque sheet.

## Jukebox

| Action | Result |
|--------|--------|
| Idle | Vinyl icon only; list hidden. |
| Open / close | Morph like mute; list appears along the bottom-left edge. |
| Load / reload | SSR / no-JS: static `default: true` entry. With JS: feature `007` schedule may select today’s entry on boot. Visitor picks are **not** remembered. |
| Select another entry | Active id, atmosphere media, `data-theme`, `data-hud-glitch`, lyrics, and mute visibility update **without** full document reload. |
| Pack `loopingVideo` + video sources | Looping `<video>` plays (muted until unmute). Mute control shown when pack also allows audio and entry `hasAudio`. |
| Pack without looping video, or no sources | Pause/clear video; static poster; `data-bg-state=fallback`; mute hidden. |
| Mute was off | Stays muted after switch when the new entry has audio. |
| Mute was on and new entry plays video with audio | Stays unmuted unless the environment blocks it. |
| Reduced motion | No looping video; static poster/theme still follow the active entry. |
| Missing label or poster | Entry omitted at build; if it was default, another valid entry or static fallback. Poster-only entries are valid. |

## Glitch (`data-hud-glitch` only)

When `data-hud-glitch` is not `true`, no glitch animations (including leftover classes).

| Target | Treatment |
|--------|-----------|
| Active socials, legal links, legal overlay exit, mute | Existing `003` hits. |
| Jukebox collapsed vinyl | Continuous hover glitch. |
| Jukebox expand / collapse | Morph like mute. |
| Jukebox option buttons (list open) | `glitch-hit`. |
| On-demand `<details>` | Whole box is the hit. **Closed:** hover glitch. **Open:** no hover. **Click summary:** glitch the box. Body clicks inside an open panel do not glitch. |

Deep per-theme type/motion packs (IDEA-002) stay out of scope.

## Discography

| Action | Result |
|--------|--------|
| Open region | List of valid releases (title, year, optional kind). Empty → `emptyReleases` copy; control still there. |
| Follow `url` | New tab. Jukebox unchanged. |
| Stage button (bound row) | Same as selecting that jukebox entry. |
| No `jukeboxId` or invalid id | No stage button. |
| Bound row already active | Button stays visible, pressed/current state, click is a no-op. |

## Tour

Upcoming shows only (Europe/Berlin, soonest first). Empty folder or no upcoming
rows → `emptyShows`. Control stays. No “collection does not exist” warning.
v1 ships at least one clearly marked EXAMPLE show.

## About / Lyrics

| Region | Empty behavior |
|--------|----------------|
| About | Control **hidden** if no body |
| Lyrics | Control stays; shows `emptyLyrics` when body empty / instrumental |

Lyrics always follow the **active** jukebox entry (including after a stage-button switch).

## On-demand exclusive open

When scripting is available: at most one of About / Lyrics / Discography / Tour is
expanded at a time (all breakpoints). Opening one closes the others. Toggle the
open control to close it.

Without scripting: `<details>` still open and close; more than one MAY be open.

## Accessibility

- All persistent and on-demand controls are keyboard reachable.
- Jukebox options, social icons, and the stage button have accessible names from
  chrome/content labels.
- Sufficient contrast over atmosphere (existing scrim tokens).
- Reduced motion: no extra panel theater; disclosures still work.

## Out of scope (do not implement here)

- Dedicated phone / small-screen HUD (IDEA-013)
- Third-party embeds
- Extra routes (`/lyrics`, `/tour`, …)
- Remembering jukebox picks across reload
- Deep per-theme type/motion packs
- Glitch when pack `hudGlitch` is false
