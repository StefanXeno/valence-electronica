# Data Model: UI Glitch Interactions

**Date**: 2026-08-12 (as-built sync 2026-08-24) | **Plan**: [plan.md](./plan.md)

This feature has **no persistent content document**. Behavior is defined by a closed set of
UI hit targets and ephemeral client-side treatment state. Theme tint reuses active pack
color tokens (`data-theme`); enable gate is pack `hudGlitch` → `data-hud-glitch` (feature
`005`), not a hard-coded Nightmare theme id.

## Entity: GlitchHitTarget (closed set, as-built)

Not stored in JSON — markup identity on the live page.

| Kind | Where | Marker / notes | Triggers allowed |
|------|-------|----------------|------------------|
| Active channel link | `Channels.astro` | Only `status: active` links; never placeholders | One-shot hover, keyboard-visible focus, press |
| Legal footer link | `Footer.astro` | Impressum / privacy links | One-shot hover, keyboard-visible focus, press |
| Legal exit | `LegalPanel.astro` | X Exit control back to landing (overlay from `002`) | One-shot hover, keyboard-visible focus, press |
| Mute button | `MuteControl.astro` | Toggle only — **not** the volume slider; `data-glitch-live` | Continuous pointer hover while muted; keyboard-visible focus one-shot; **no** separate press glitch (morph owns click) |
| Jukebox vinyl toggle | `Jukebox.astro` | Collapsed vinyl; `data-glitch-live` | Continuous pointer hover while collapsed; morph on expand/collapse |
| Jukebox option | `Jukebox.astro` | Buttons in open list | One-shot hover, keyboard-visible focus, press |
| On-demand panel | `StagePanels.astro` | `<details class="glitch-hit">` | Closed: hover one-shot; click summary glitches box; open: no hover |

### Explicitly out of set

| Element | Rule |
|---------|------|
| Volume slider | No glitch on hover/focus/press/drag |
| Placeholder channel chips | No glitch |
| Hero text, headings, non-interactive chrome | No glitch |
| Any future control | Out of scope until spec amendment (FR-011) |

## Entity: GlitchTreatment

Ephemeral visual disturbance applied to one hit target (or mute/jukebox shell for morph).

| Aspect | Rule |
|--------|------|
| One-shot | Brief; completes in under 1 s; non-looping while idle (SC-004) |
| Continuous hover | Mute (while muted) **or** collapsed jukebox vinyl; ends on pointer-out (and unmute for mute) |
| Mute / jukebox morph | Expand/collapse shell treatment; replaces press glitch for that click |
| Visual character | Displacement / tear / color-fringing style; tinted by existing theme accent/text tokens |
| Intensity | Soft bar ~≤3 distinct flashes/sec; no large full-viewport flashes; owner-approved (FR-012) |
| Concurrency | At most one active treatment per control; press supersedes hover/focus (FR-013) |
| Enable gate | Treatments only apply when `document.documentElement.dataset.hudGlitch === 'true'` |

## Entity: MotionPreference

| Aspect | Rule |
|--------|------|
| Source | Visitor/OS `prefers-reduced-motion` |
| When reduce | No hover, focus, press, continuous hover, or morph glitch (FR-006) |
| Layout | Mute / jukebox may still change compact ↔ expanded for clarity without glitch language |

## Relationships

- Each `GlitchHitTarget` → 0..1 active `GlitchTreatment` at a time
- Mute button → continuous hover **or** morph per stacking rules; never stacked press +
  morph on the same click
- Jukebox vinyl → continuous hover while collapsed **or** morph on open/close
- `GlitchTreatment` tint → existing theme tokens (`--color-accent`, `--color-text`, etc.)
- Enable → theme pack `hudGlitch` capability (`005`)

## State (visitor session, ephemeral)

| State | Meaning |
|-------|---------|
| Idle | Resting appearance; no glitch classes |
| One-shot active | Hover, keyboard-visible focus, or press treatment playing |
| Continuous hover | Pointer over mute (muted) or collapsed vinyl; sustained until leave |
| Morph active | Shell expand/collapse glitch after mute/unmute or jukebox open/close |
| Reduced motion / glitch off | All glitch states forbidden; controls remain usable |

No persistence (`localStorage` / cookies) in this feature (FR-007).
