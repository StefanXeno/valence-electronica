# Contract: Landing Intro UI

**Feature**: `006-landing-intro` | **Date**: 2026-08-22

## Scope

Landing page (`/`) only. Legal routes unchanged.

## Content contract

Operators edit `src/content/ui/chrome.md`:

```yaml
introLead: "Hi I'm"
introName: "Valence"
```

- Trim whitespace; empty `introName` disables intro entirely.
- Layout is always **two lines**: lead on line one, name on line two (block/stacked, not
  inline “Hi I'm Valence” on one row).
- `introLead` MAY be empty while `introName` is set; default ships both.

## Visual contract

| Element | Treatment |
|---------|-----------|
| `.landing-intro__lead` | Opaque or normal text; subtler entrance; **not** the zoom target |
| `.landing-intro__name` | **Transparent letterforms** — atmosphere and landing stage MUST remain visible through the name during the intro (stroke/outline or background-clip cut-out; no opaque fill) |
| Zoom motion | Applied to **`.landing-intro__name` only** — scale/transform as if moving into the name |

The overlay MUST NOT use a full opaque scrim that hides the site behind the name line.
Atmosphere and stage content stay perceptible through the transparent name.

## Playback flag

| Item | Value |
|------|-------|
| Storage API | `localStorage` |
| Key | `valence-intro-seen` |
| Set value | `"1"` |
| Purpose | UX preference — intro already seen/skipped |

Not analytics. Mention in privacy policy when IDEA-009 is completed.

## Demo replay

| Query | Behavior |
|-------|----------|
| `replay-intro` (presence) | Force intro on this load if motion allowed and `introName` non-empty |
| Combined with reduce-motion | Intro suppressed (reduce wins) |

Example: `/valence-electronica/?replay-intro`

## Skip

| Input | Action |
|-------|--------|
| `Escape` | End intro immediately; set flag; reveal stage |
| Click/tap on intro overlay | Same |

## Reduced motion

When `prefers-reduced-motion: reduce`:

- Do not show intro overlay or animations.
- Landing stage visible on first paint (after hydration check if needed).

## No-JS degradation

Without scripting:

- No overlay in DOM (or inert); stage content visible from SSR.
- No playback flag write (intro may show again on reload — acceptable degradation).

## HTML surface (implementation hint)

Prerender two-line greeting in overlay. Suggested structure:

```html
<div class="landing-intro">
  <p class="landing-intro__lead">Hi I'm</p>
  <p class="landing-intro__name" aria-label="Valence">Valence</p>
</div>
```

Suggested root markers:

- `html[data-intro-active]` while intro runs
- Remove attribute and overlay when done

## Out of scope

- Intro audio
- Cross-tab sync of playback flag
- Cookie-based storage
- Opaque filled name text
