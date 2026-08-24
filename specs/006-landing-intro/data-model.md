# Data Model: Landing Intro

**Feature**: `006-landing-intro` | **Date**: 2026-08-22 (updated 2026-08-23)

## Content — UI chrome (`src/content/ui/chrome.md`)

| Field | Type | Required | Default / behavior |
|-------|------|----------|-------------------|
| `introLead` | string | no | `"Hi I'm"` — first line above the name |
| `introName` | string | no* | `"Valence"` — second line; portal cut-out; zoom target |

\*Intro sequence runs only when `introName` is non-empty after trim. Empty name → no intro
(FR-015). `introLead` MAY be empty while name is set (name-only intro), but default ships
both lines.

Existing chrome fields unchanged.

## Presentation rules (not content fields)

| Rule | Applies to |
|------|------------|
| Portal cut-out (holes in white sheet showing site behind) | `introName` only |
| Full-viewport white sheet during intro | overlay |
| Primary zoom animation from name center | `introName` only (`.landing-intro__portal-svg`) |
| Lead fade-in ~0.55 s; fade out during zoom | `introLead` (`.landing-intro__lead`) |

## Client state — playback flag

| Key | Storage | Values | Set when |
|-----|---------|--------|----------|
| `valence-intro-seen` | `localStorage` | `"1"` | Intro completes or skipped |

**Read rules**:

- Missing or unreadable → treat as first visit (play intro if motion + name OK).
- `replay-intro` query present **and build is development** → ignore flag for **starting**
  intro on this load only. Production MUST ignore the query.

**Write rules**:

- Set on natural completion and on skip.
- Never sent to server; not personal data.

## DOM / document attributes (runtime)

| Attribute / class | Host | Meaning |
|-------------------|------|---------|
| `data-intro-pending` | `<html>` | Optional: intro will play; gate clicks before hydration |
| `data-intro-active` | `<html>` | Intro running; HUD pointer-events gated |
| `data-landing-intro` | overlay root | Intro layer; click target for skip |
| `.landing-intro__cutout` | wrapper | Portal SVG group |
| `.landing-intro__portal-svg` | white field + mask | Full-viewport opaque white with name cut-outs |
| `.landing-intro__portal-text` | mask text | Letterforms punched through the white sheet |
| `.landing-intro__lead` | first line | Lead text (e.g. “Hi I'm”) |
| `.visually-hidden` | a11y name | Same string as portal text for screen readers |

## State machine (landing, scripting available)

```text
LOAD → check reduce-motion? → yes → IDLE (landing visible)
     → check introName empty? → yes → IDLE
     → check flag + !dev-replay? → seen → IDLE
     → INTRO_PLAYING → (complete | skip) → set flag → IDLE
```

**IDLE**: overlay removed or never mounted; stage fully interactive.

## Validation

- `introLead` / `introName`: plain strings in Zod schema (optional).
- No build failure if fields missing (defaults in loader or component).
