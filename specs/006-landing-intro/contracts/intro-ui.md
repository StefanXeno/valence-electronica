# Contract: Landing Intro UI

**Feature**: `006-landing-intro` | **Date**: 2026-08-22 (updated 2026-08-23)

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

## Visual contract — white portal

The intro is a **white sheet over the live landing**. The site (atmosphere + stage HUD)
stays rendered underneath; only pointer interaction is gated until reveal completes.

| Element | Treatment |
|---------|-----------|
| `.landing-intro__sheet` (or equivalent) | Full-viewport **opaque white** field |
| `.landing-intro__lead` | Opaque dark text on white; **fade-in ~0.55 s ease-out**, then **fade out from ~45% of zoom phase**; **not** the zoom target |
| `.landing-intro__name` | **Portal cut-out** — letterforms are **holes in the white sheet** showing the site through. MUST NOT render as solid black (or opaque) ink on white |
| Zoom motion | Applied to the **name cut-out only** — `scale` from the **center of the name** until the hole fills the viewport (camera moves **into** Valence) |

### Layout

- Greeting block is **viewport-centered** (horizontal and vertical), with the name on the
  second line and the lead above it.
- Zoom transform origin is the **center of the name**, not the top-left HUD identity block.

### Anti-patterns (do not ship)

- Hiding the entire `.page-shell` or stage with `opacity: 0` while the intro runs (breaks
  the portal — nothing visible through the cut-out).
- Solid filled name text on the white sheet.
- Zoom that drifts off-center during the scale animation.

## Playback flag

| Item | Value |
|------|-------|
| Storage API | `localStorage` |
| Key | `valence-intro-seen` |
| Set value | `"1"` |
| Purpose | UX preference — intro already seen/skipped |

Not analytics. Mention in privacy policy when IDEA-009 is completed.

## Demo replay (development only)

| Signal | Behavior |
|--------|----------|
| `replay-intro` query (presence) | Force intro on this load if motion allowed and `introName` non-empty — **dev builds only** |
| `/dev/intro` route (optional) | Clear playback flag and redirect to `/?replay-intro` — **dev builds only** |
| Combined with reduce-motion | Intro suppressed (reduce wins) |
| Production build | Query and dev route MUST be ignored / MUST NOT exist |

Example (local dev): `/valence-electronica/?replay-intro`

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

Prerender overlay on landing only. Suggested structure:

```html
<div class="landing-intro" data-landing-intro hidden>
  <div class="landing-intro__cutout">
    <div class="landing-intro__sheet"></div>
    <!-- name cut-out: mask or blend technique — see research.md R9–R12 -->
    <p class="landing-intro__name" aria-label="Valence">Valence</p>
  </div>
  <p class="landing-intro__lead">Hi I'm</p>
</div>
```

Suggested root markers:

- `html[data-intro-pending]` before script hydrates (optional, prevents FOUC click)
- `html[data-intro-active]` while intro runs
- Remove attributes and overlay when done

## Out of scope

- Intro audio
- Cross-tab sync of playback flag
- Cookie-based storage
- Opaque filled name text
- Aligning the intro zoom terminus with the top-left HUD identity position (separate polish)
