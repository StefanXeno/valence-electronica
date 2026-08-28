# Contract: Desktop HUD UI (visitor-facing)

**Date**: 2026-08-28 (as-built sync 2026-08-28) | **Plan**: [../plan.md](../plan.md) | **Spec**: [../spec.md](../spec.md)

**Supersedes for desktop**: layout rows in
[`specs/004-landing-content-layout/contracts/stage-ui.md`](../../004-landing-content-layout/contracts/stage-ui.md).
**Amended by** [`specs/011-vflip-now-playing/contracts/vflip-player-ui.md`](../../011-vflip-now-playing/contracts/vflip-player-ui.md)
for left-cluster jukebox shell (mute inside V-Flip), open player anatomy, and right-dock
icons (About, Discography, Tour only — no Lyrics / Track info dock icons).

**Visual target**: typical laptop (~1280px+). Phone polish is IDEA-013; page MUST still load
at 320px.

## Layout (desktop)

Chrome scale: `--hud-scale: 1.5` (unchanged unless plan tasks tune dock spacing).

| Zone | Contract |
|------|----------|
| Center | Atmosphere only. No panel bodies, labels, or lists in the middle. |
| Top-left | Identity: artist name + tagline from `site.json`. Compact; tagline single line (`nowrap`). |
| Top-right | Social channels: equal-sized brand icons (~2.5rem × `--hud-scale`). Labels off at rest; platform name via `aria-label`. |
| Bottom dock | Single horizontal rail above footer. **Left cluster:** V-Flip shell (toolbar: vinyl, shuffle, loop, mute when eligible). **Right segment:** About (if content exists), Discography, Tour — icon triggers in a **horizontal row**, not a vertical stack. |
| Mute | **Inside the V-Flip shell** when the active entry has looping video + audio. Same mute contract as `002`. Must not cover footer cluster. |
| Footer | **Bottom center:** `© {year} {artist}` then Impressum and Datenschutzerklärung. Transparent background; no bar. Legal overlay behavior unchanged from `002`. Identity block and copyright line MAY use `glitch-hit` when glitch is enabled. |

On-demand and jukebox **panel bodies** expand from the dock edge, scroll internally, never as a
centered sheet.

| Panel | Open width (scaled) | Notes |
|-------|---------------------|-------|
| On-demand (About, Discography, Tour) | `min(18rem × --hud-scale, viewport − insets)` | Wide enough for long titles (e.g. “Discography”) |
| Jukebox (V-Flip) | `min(22rem × --hud-scale, viewport − insets)` | Open drawer: panel title + track list with inline info. See `011` contract. |

Open headers use even inset `--stage-panel-inset` / jukebox padding (`0.65rem × --hud-scale`
for panels; jukebox panel padding separate).

## Icon-first controls (at rest)

| Control | At rest | Label source |
|---------|---------|--------------|
| Jukebox (V-Flip) | Icon only (vinyl token default) when collapsed | `chrome.jukeboxLabel` |
| About | Icon only (if About exists) | `chrome.aboutTitle` |
| Discography | Icon only | `chrome.discographyTitle` |
| Tour | Icon only | `chrome.tourTitle` |
| Socials | Platform brand icon | channel `label` / `aria-label` |

Full text titles MUST NOT show on **closed** triggers. Accessible names MUST remain available
to assistive tech (visually hidden text or `aria-label`).

Optional icon override via `chrome.*Icon` — see [data-model.md](../data-model.md).

## Label reveal

Floating `#hud-label-reveal` managed by `label-reveal.ts`. Labels do **not** travel toward
viewport center; they anchor adjacent to the control.

| Control group | Anchor | Position |
|---------------|--------|----------|
| Dock icons (jukebox, on-demand summaries) | `data-hud-label-anchor="above"` | Horizontally centered on control; above trigger (`6px` gap) |
| Social links | `data-hud-label-anchor="below"` | Horizontally centered on control; below icon (`6px` gap) |

| Input | Behavior |
|-------|----------|
| Pointer hover on **closed** HUD icon control | Floating label appears at anchored position |
| Keyboard-visible focus | Same as hover |
| Parent `<details>` open | Label reveal **suppressed** (inline open header shows title) |
| `prefers-reduced-motion: reduce` | Same anchored position; no travel animation |
| Pointer leave / blur | Label removed |
| Panel opens while label visible | Label hidden immediately |
| No scripting | Native disclosure still works; degradation to visually hidden / `aria-label` only |

Label text MUST reflect chrome content after rebuild without code changes.

## Open panel headers

When jukebox or an on-demand panel is **open**, the readable title appears **inline next to
the icon** in the summary row (not as a separate heading row below).

| Property | Rule |
|----------|------|
| Layout | Icon in fixed-size cell + title beside it (`flex`, start-aligned) |
| Title size | `18px × --hud-scale` — slightly smaller than the `22px` icon glyph |
| Open accent | When panel is open, title label uses `--color-accent-alt` with matching text-shadow; icon gets parallel drop-shadow (same treatment for jukebox panel title and on-demand panels) |
| Jukebox vinyl | Icon stays in a fixed `var(--control-size)` anchor cell; box expands to the right and upward without moving the vinyl |
| Padding | Even inset around open header row (panels: `--stage-panel-inset`) |

## Panel open / close motion

Motion differs by theme pack glitch capability (`data-hud-glitch`).

### Default theme (`data-hud-glitch="false"`, motion allowed)

Two-phase eased animation (`280ms` per phase, `cubic-bezier(0.4, 0, 0.2, 1)`). Open is the
**reverse** of close:

| Phase | Open | Close |
|-------|------|-------|
| 1 | Shell expands (`width`, `border-radius`); body stays collapsed (`is-panel-opening`) | Body collapses (`is-panel-closing`) |
| 2 | Body expands after phase 1 | `open` cleared; shell shrinks to icon |

Implemented in `src/lib/panel-motion.ts`. Jukebox vinyl cell does not animate position during
shell transition.

### Glitch theme (`data-hud-glitch="true"`, motion allowed)

Unchanged morph glitch on open/close (jukebox + on-demand panels):

| Target | Hover (closed) | Open / close |
|--------|----------------|--------------|
| Jukebox vinyl toggle | Continuous glitch (`data-glitch-live`) | Morph glitch on `<details>` (`data-jukebox`) |
| On-demand summary | One-shot hover glitch via `GlitchPress` (same pattern as social links) | Morph glitch on `<details>` (`data-stage-panel`) |

Close waits for morph duration (~`280ms`) before clearing `open`.

### Reduced motion

Instant open/close; no phased or glitch morph animation.

## Jukebox (V-Flip — see `011` for full contract)

| Action | Result |
|--------|--------|
| Idle | Toolbar: vinyl + shuffle + loop + mute (when eligible); drawer hidden |
| Open | Drawer: panel title + track list; same toolbar at bottom |
| Select entry | Same as `stage-ui.md` jukebox table; inline info on selected row |
| Schedule / default | Unchanged (`007`) |

## On-demand panels (unchanged logic, new chrome)

| Region | Empty / hide rules |
|--------|-------------------|
| About | Hidden if no body (unchanged) |
| Discography / Tour | Always shown; empty states unchanged |

Lyrics and Track info are **not** right-dock panels (see `011`).

Exclusive-open: unchanged from `stage-ui.md`.

Markup: `data-stage-panel` on `<details>`; `glitch-hit` on `<summary>` only.

## Glitch (`data-hud-glitch` only)

When `data-hud-glitch` is not `true`, no glitch on HUD (unchanged). Panel motion uses smooth
CSS transitions (see above).

| Target | Treatment |
|--------|-----------|
| Socials, legal, footer copyright | One-shot hover/focus/press via `GlitchPress` |
| Mute | Continuous hover when muted; morph on toggle (`data-glitch-live`) |
| Jukebox vinyl toggle | Continuous hover when collapsed (`data-glitch-live`); morph on open/close |
| Jukebox option buttons | One-shot while list open |
| On-demand summary (closed) | One-shot hover/focus via `GlitchPress` on `.glitch-hit` summary |
| On-demand + jukebox open/close morph | Live-safe keyframes on `[data-stage-panel]` / `[data-jukebox].is-glitching` (no `clip-path` dead zones) |
| **Hit target during glitch** | Full summary/trigger bounding box MUST remain clickable and keyboard-activatable (FR-008) |
| Open panel summary hover | No floating label; no hover glitch on open panel body |

Amendment to `003`: dock panel summaries use live-safe morph on the panel shell; summary
hover uses standard `GlitchPress` one-shot pattern when closed.

## Accessibility

- Keyboard order: identity → socials → jukebox (vinyl → shuffle → loop → mute when visible) → on-demand row → footer.
- Sufficient contrast over atmosphere (existing scrim tokens).
- Label reveal is decorative; activation MUST NOT depend on seeing the floating label.
- Open inline titles supplement visually hidden accessible names on summaries.

## Spec maintenance rule

Any future **layout or HUD composition change** MUST update this contract and the feature
spec (`009` or successor) before implementation — not CSS-only drive-by edits.

## Cross-reference: track info (010)

Per-track release date and streaming links live in jukebox frontmatter (`sortDate`,
`listenLinks`, `themeId`). On desktop, track info appears **inline on the selected V-Flip
list row** (not a separate dock panel). See
[`specs/011-vflip-now-playing/contracts/vflip-player-ui.md`](../../011-vflip-now-playing/contracts/vflip-player-ui.md)
and [`specs/010-track-catalog/contracts/track-catalog-content.md`](../../010-track-catalog/contracts/track-catalog-content.md).

## Out of scope

- Mobile dedicated HUD (IDEA-013)
- New routes or embeds
