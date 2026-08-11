# Data Model: UI Glitch Interactions

**Date**: 2026-08-12 | **Plan**: [plan.md](./plan.md)

This feature has **no persistent content document**. Behavior is defined by a closed set of
UI hit targets and ephemeral client-side treatment state. Theme tint reuses `002`
`data-theme` color tokens (accent/text) — not a new theme pack schema.

## Entity: GlitchHitTarget (closed set)

Not stored in JSON — markup identity on the live page.

| Kind | Where | Marker / notes | Triggers allowed |
|------|-------|----------------|------------------|
| Active channel link | `Channels.astro` | Only `status: active` links; never placeholders | One-shot hover, keyboard-visible focus, press |
| Legal footer link | `Footer.astro` | Impressum / privacy links | One-shot hover, keyboard-visible focus, press |
| Legal exit | `LegalPanel.astro` | Exit control back to landing | One-shot hover, keyboard-visible focus, press |
| Mute button | `MuteControl.astro` | Toggle only — **not** the volume slider | Continuous pointer hover; keyboard-visible focus one-shot; **no** separate press glitch (morph owns click) |

### Explicitly out of set

| Element | Rule |
|---------|------|
| Volume slider | No glitch on hover/focus/press/drag |
| Placeholder channel chips | No glitch |
| Hero text, headings, non-interactive chrome | No glitch |
| Any future control | Out of scope until spec amendment (FR-011) |

## Entity: GlitchTreatment

Ephemeral visual disturbance applied to one hit target (or mute shell for morph).

| Aspect | Rule |
|--------|------|
| One-shot | Brief; completes in under 1 s; non-looping while idle (SC-004) |
| Continuous mute hover | Allowed only on mute button while pointer remains over it; ends on pointer-out |
| Mute morph | Expand/collapse shell treatment on unmute/mute click; replaces press glitch for that click |
| Visual character | Displacement / tear / color-fringing style; tinted by existing theme accent/text tokens |
| Intensity | Soft bar ~≤3 distinct flashes/sec; no large full-viewport flashes; owner-approved (FR-012) |
| Concurrency | At most one active treatment per control; press supersedes hover/focus (FR-013) |

## Entity: MotionPreference

| Aspect | Rule |
|--------|------|
| Source | Visitor/OS `prefers-reduced-motion` |
| When reduce | No hover, focus, press, continuous mute hover, or mute morph glitch (FR-006) |
| Layout | Mute may still change compact ↔ expanded for clarity without glitch language |

## Relationships

- Each `GlitchHitTarget` → 0..1 active `GlitchTreatment` at a time
- Mute button → continuous hover treatment **or** morph treatment per stacking/special rules;
  never a stacked press + morph on the same click; morph supersedes continuous hover on
  unmute/mute click; continuous may resume only if pointer still over mute after morph
- `GlitchTreatment` tint → existing `VisualTheme` tokens from feature `002` (`--color-accent`,
  `--color-text`, etc.)

## State (visitor session, ephemeral)

| State | Meaning |
|-------|---------|
| Idle | Resting appearance; no glitch classes |
| One-shot active | Hover, keyboard-visible focus, or press treatment playing |
| Continuous mute hover | Pointer over mute button; glitch sustained until leave |
| Mute morph active | Shell expand/collapse glitch after mute/unmute |
| Reduced motion | All glitch states forbidden; controls remain usable |

No persistence (`localStorage` / cookies) in this feature (FR-007).
