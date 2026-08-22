# Contract: Theme Packs

**Date**: 2026-08-22 | **Plan**: [../plan.md](../plan.md) | **Data model**: [../data-model.md](../data-model.md)

Maintainer-facing contract for visual/motion theme packs. Operators bind packs via jukebox
`themeId`; developers define packs here. Stable across refactors (constitution III for
content; developer-maintained packs).

## Overview

A **theme pack** has two parts — both are required for a **complete** pack:

1. **Registry entry** (`src/lib/theme-packs.ts`) — id + capabilities.
2. **CSS token block** (`src/styles/themes.css`) — color/surface variables for `[data-theme='…']`.

Until both exist, the id is **incomplete**. Per Option A (FR-005 / FR-006), jukebox entries
bound to an incomplete or unknown id receive the full **`default`** pack at runtime; the
build emits a warning. Never mix capabilities from one pack with colors from another.

Jukebox Markdown references the pack by id:

```yaml
---
label: NIGHTMARE (temp loop)
themeId: nightmare-crimson
hasAudio: true
poster: /images/posters/placeholder-loop.jpg
sources:
  - src: /videos/placeholder-loop.mp4
    type: video/mp4
default: true
---
```

## Registry shape (`src/lib/theme-packs.ts`)

Each pack MUST declare:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Stable slug; used in jukebox `themeId` and `data-theme` |
| `capabilities.loopingVideo` | boolean | Allow looping `<video>` when entry has `sources` |
| `capabilities.audioEligible` | boolean | Allow mute control when video plays and entry `hasAudio` |
| `capabilities.hudGlitch` | boolean | Enable HUD glitch motion (v1: only Nightmare) |

Example (conceptual — implementation uses a typed const map):

```typescript
{
  id: 'nightmare-crimson',
  capabilities: {
    loopingVideo: true,
    audioEligible: true,
    hudGlitch: true,
  },
}
```

Rules:

- **`default`** pack MUST exist, MUST be complete (registry + CSS), and acts as fallback for
  unknown or incomplete `themeId` values.
- Unknown jukebox `themeId` → build warning `[theme] unknown themeId "…"; using default` +
  full `default` pack at runtime (FR-006).
- Registry entry without CSS block → build warning `[theme] pack "…" incomplete (missing
  CSS); using default` + full `default` pack at runtime.
- Capability decisions MUST NOT be duplicated elsewhere (no `'nightmare-crimson'` string
  checks for video/glitch/audio in components).

## CSS token block (`src/styles/themes.css`)

Each registered pack id (except `default`, which shares `:root`) SHOULD have:

```css
[data-theme='nightmare-crimson'] {
  --color-bg: #080000;
  --color-surface: rgb(28 6 6 / 82%);
  --color-border: #5c1212;
  --color-text: #f7efef;
  --color-text-muted: #c4a0a0;
  --color-accent: #a00000;
  --color-accent-alt: #e85a5a;
  --bg-scrim: rgb(6 0 0 / 72%);
}
```

Rules:

- Tokens MUST keep text readable over atmosphere (FR-010).
- Optional typography/motion tokens MAY be added later without changing jukebox files.
- Do not put capability booleans in CSS as the source of truth — use the registry.

## HTML application

On SSR and on jukebox switch, `<html>` MUST receive attributes from **`resolveThemePack()`**
(the single resolver — see data model):

| Attribute | Source |
|-----------|--------|
| `data-theme` | Complete pack → pack `id`; unknown/incomplete → `default` |
| `data-hud-glitch` | `'true'` if resolved pack has `capabilities.hudGlitch`, else `'false'` |

When fallback to `default` occurs, both attributes reflect the **default** pack (typically
`data-theme="default"`, `data-hud-glitch="false"`).

`glitch.css` gates animation reset rules on `data-hud-glitch`, not on pack id strings.

## Capability matrix (shipped v1)

| Pack id | Looping video | Audio / mute | HUD glitch |
|---------|---------------|--------------|------------|
| `default` | no | no | no |
| `nightmare-crimson` | yes (if entry has sources) | yes (if entry `hasAudio`) | yes |
| `cyan-pulse` | no | no | no |

Reduced motion and playback failure still force poster fallback regardless of
`loopingVideo` (inherited from `002`).

## Checklist: add a new theme pack

1. Choose a new stable id (kebab-case, e.g. `violet-drift`).
2. Add registry entry in `src/lib/theme-packs.ts` with all three capability flags set
   intentionally (default all `false` unless the art direction needs more).
3. Add `[data-theme='violet-drift'] { … }` token block in `themes.css` (copy `default`
   tokens as starting point; tune contrast over a sample poster).
4. Confirm the pack is **complete** (steps 2 and 3 both done) before binding content.
5. Set `themeId: violet-drift` on one or more jukebox Markdown files.
6. Run `npm run check && npm run build`; fix warnings (incomplete packs warn and fall back
   to `default` until fixed).
7. Manual validation ([quickstart.md](../quickstart.md)):
   - Switch to the entry; confirm colors apply.
   - If `loopingVideo: false`, confirm poster-only + mute hidden.
   - If `hudGlitch: false`, confirm HUD stays still.
   - Enable `prefers-reduced-motion`; confirm no glitch.
8. Optional: add example poster under `public/images/posters/`.

Estimated time target: under 5 minutes for steps 1–4 when copying an existing pack (SC-001).

## Unchanged operator rules (from 004)

- Do **not** rename jukebox ids or `themeId` values without updating registry + CSS.
- `hasAudio` stays on the jukebox entry; it combines with pack `audioEligible`.
- Poster-only entries remain valid (`sources` omitted or empty).

## Cross-references

- Jukebox content: [specs/004-landing-content-layout/contracts/stage-content.md](../../004-landing-content-layout/contracts/stage-content.md)
- Original color packs: [specs/002-themed-background-video/contracts/background-content.md](../../002-themed-background-video/contracts/background-content.md) (theme section superseded by this contract for capabilities)
- Glitch hit targets: [specs/003-ui-glitch/contracts/glitch-ui.md](../../003-ui-glitch/contracts/glitch-ui.md) (enable gate only)
