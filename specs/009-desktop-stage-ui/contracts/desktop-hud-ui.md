# Contract: Desktop HUD UI (visitor-facing)

**Date**: 2026-08-28 | **Plan**: [../plan.md](../plan.md) | **Spec**: [../spec.md](../spec.md)

**Supersedes for desktop**: layout rows in
[`specs/004-landing-content-layout/contracts/stage-ui.md`](../../004-landing-content-layout/contracts/stage-ui.md).
All non-layout behavior in `stage-ui.md` (jukebox switch, discography, tour, exclusive-open,
glitch enable gate) remains authoritative unless amended below.

**Visual target**: typical laptop (~1280px+). Phone polish is IDEA-013; page MUST still load
at 320px.

## Layout (desktop)

Chrome scale: `--hud-scale: 1.5` (unchanged unless plan tasks tune dock spacing).

| Zone | Contract |
|------|----------|
| Center | Atmosphere only. No panel bodies, labels, or lists in the middle. |
| Top-left | Identity: artist name + tagline from `site.json`. Compact; not a hero block. |
| Top-right | Social channels: equal-sized brand icons (~2.5rem × `--hud-scale`). Labels off at rest; platform name via `aria-label`. |
| Bottom dock | Single horizontal rail above footer. **Left segment:** jukebox icon trigger. **Right segment:** About (if content exists), Lyrics, Discography, Tour — icon triggers in a **horizontal row**, not a vertical stack. |
| Mute | Bottom-right, trailing the dock when active entry has looping video + audio. Same mute contract as `002`. Must not cover footer cluster. |
| Footer | **Bottom center:** `© {year} {artist}` then Impressum and Datenschutzerklärung. Transparent background; no bar. Legal overlay behavior unchanged from `002`. |

On-demand and jukebox **panel bodies** expand from the dock edge (max ~20–28rem scaled),
scroll internally, never as a centered sheet.

## Icon-first controls (at rest)

| Control | At rest | Label source |
|---------|---------|--------------|
| Jukebox | Icon only (vinyl token default) | `chrome.jukeboxLabel` |
| About | Icon only (if About exists) | `chrome.aboutTitle` |
| Lyrics | Icon only | `chrome.lyricsTitle` |
| Discography | Icon only | `chrome.discographyTitle` |
| Tour | Icon only | `chrome.tourTitle` |
| Socials | Platform brand icon | channel `label` / `aria-label` |

Full text titles MUST NOT show on closed triggers. Accessible names MUST remain available
to assistive tech (visually hidden text or `aria-label`).

Optional icon override via `chrome.*Icon` — see [data-model.md](../data-model.md).

## Label reveal

| Input | Behavior |
|-------|----------|
| Pointer hover on HUD icon control | Floating label appears; animates toward viewport horizontal center when motion allowed |
| Keyboard-visible focus | Same as hover |
| `prefers-reduced-motion: reduce` | Label appears near control (fade); no center travel |
| Pointer leave / blur | Label removed |
| No scripting | Native disclosure still works; label reveal MAY degrade to `title` tooltip or visually hidden text only |

Label text MUST reflect chrome content after rebuild without code changes.

## Jukebox (unchanged logic, new chrome)

| Action | Result |
|--------|--------|
| Idle | Icon trigger only; song list hidden |
| Open | List at dock left segment; morph animation like mute |
| Select entry | Same as `stage-ui.md` jukebox table |
| Schedule / default | Unchanged (`007`) |

## On-demand panels (unchanged logic, new chrome)

| Region | Empty / hide rules |
|--------|-------------------|
| About | Hidden if no body (unchanged) |
| Lyrics | Always shown; empty state unchanged |
| Discography / Tour | Always shown; empty states unchanged |

Exclusive-open: unchanged from `stage-ui.md`.

## Glitch (`data-hud-glitch` only)

When `data-hud-glitch` is not `true`, no glitch on HUD (unchanged).

| Target | Treatment |
|--------|-----------|
| Socials, legal, mute | Unchanged from `003` / `004` |
| Jukebox trigger + options | Unchanged treatments |
| **Dock panel triggers (`<details>` summary)** | Hover + click glitch use **live-safe** keyframes (no `clip-path` on hit target) |
| **Hit target during glitch** | Full summary/trigger bounding box MUST remain clickable and keyboard-activatable (FR-008) |

Amendment to `003`: dock `<details>` summaries are live-safe glitch targets like jukebox/mute.

## Accessibility

- All dock icons keyboard reachable in logical order: jukebox → on-demand row → mute → footer.
- Sufficient contrast over atmosphere (existing scrim tokens).
- Label reveal is decorative; activation MUST NOT depend on seeing the floating label.

## Spec maintenance rule

Any future **layout or HUD composition change** MUST update this contract and the feature
spec (`009` or successor) before implementation — not CSS-only drive-by edits.

## Out of scope

- Mobile dedicated HUD (IDEA-013)
- Track info / streaming links (IDEA-021)
- New routes or embeds
