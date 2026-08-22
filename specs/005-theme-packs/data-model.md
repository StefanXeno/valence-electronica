# Data Model: Theme Pack System

**Date**: 2026-08-22 | **Plan**: [plan.md](./plan.md)

Theme packs bridge jukebox content (`themeId`) and presentation (CSS + runtime behavior).
Operators bind entries to packs; developers define packs in the registry + CSS.

## Entity: ThemePack

File: `src/lib/theme-packs.ts` — registry map keyed by `id`.

| Field | Type | Required | Description / Validation |
|-------|------|----------|--------------------------|
| `id` | string | yes | Stable slug; matches `[data-theme='…']` in CSS and jukebox `themeId` |
| `capabilities.loopingVideo` | boolean | yes | If true **and** entry has `sources`, atmosphere uses looping `<video>`; else poster fallback |
| `capabilities.audioEligible` | boolean | yes | If true **and** looping video plays **and** entry `hasAudio`, mute control may show |
| `capabilities.hudGlitch` | boolean | yes | If true, HUD glitch motion enabled (v1: only `nightmare-crimson`) |

Optional layers (documented in contract; v1 may omit per-pack overrides):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `typography` | token refs | no | Future display/body overrides; inherit `:root` when absent |
| `motion` | token refs | no | Future ambient/entrance beyond HUD glitch |

## Entity: ThemePackTokens (presentation)

File: `src/styles/themes.css` — not a TS object; keyed by `ThemePack.id`.

| Token | Required | Purpose |
|-------|----------|---------|
| `--color-bg` | yes | Page/atmosphere base |
| `--color-surface` | yes | Panels, chips |
| `--color-border` | yes | Borders |
| `--color-text` | yes | Primary text |
| `--color-text-muted` | yes | Secondary text |
| `--color-accent` | yes | Accent |
| `--color-accent-alt` | yes | Secondary accent |
| `--bg-scrim` | yes | Overlay scrim over atmosphere |

## Entity: CompletePack (validation)

A pack id is **complete** only when **both** exist:

1. A registry row in `src/lib/theme-packs.ts`
2. A CSS token block `[data-theme='{id}']` in `src/styles/themes.css` (for `default`, `:root`
   and/or `[data-theme='default']` satisfies the CSS side)

If either side is missing, the id is **incomplete**. Resolution uses Option A: warn at
build and apply the full **`default`** pack at runtime — capabilities, colors, and
`data-theme="default"`. No split fallback (FR-005).

## Entity: JukeboxEntry (unchanged binding)

File: `src/content/jukebox/<id>.md` — see `specs/004-landing-content-layout/data-model.md`.

| Field | Relationship |
|-------|----------------|
| `themeId` | → `ThemePack.id` (optional in frontmatter; missing → `default`) |

Entry media fields combine with pack capabilities:

| Condition | Atmosphere result |
|-----------|-------------------|
| `loopingVideo` + entry has `sources` + motion allowed | Playing video |
| Otherwise | Poster/static fallback |
| `audioEligible` + playing video + entry `hasAudio` | Mute control may show |
| `hudGlitch` | `data-hud-glitch="true"` on `<html>` |

## Entity: ActiveTheme (runtime)

Ephemeral visitor state; not persisted.

| Aspect | Rule |
|--------|------|
| Driver | Active jukebox entry for this page load |
| SSR default | Default jukebox entry’s resolved pack on first paint |
| Switch | `applyStageEntry` updates `data-theme`, `data-hud-glitch`, video sources, poster |
| Reload | Resets to default entry (unchanged from `004`) |

## Registry: shipped packs (v1 migration)

| `id` | `loopingVideo` | `audioEligible` | `hudGlitch` | Notes |
|------|------------------|-----------------|-------------|-------|
| `default` | false | false | false | Fallback pack; same tokens as `:root` |
| `nightmare-crimson` | true | true | true | Reference full pack; parity with `pre-release` |
| `cyan-pulse` | false | false | false | Poster-only example; calm HUD |

## Relationships

```text
JukeboxEntry.themeId ──► ThemePack (registry)
ThemePack.id ──► ThemePackTokens ([data-theme] in themes.css)
ThemePack.capabilities ──► Atmosphere / mute / glitch behavior
Active jukebox entry ──► ActiveTheme (one pack at a time)
```

## Validation rules

1. `resolveThemePack(raw)` (single resolver — all consumers use this, not ad hoc checks):
   - Empty/missing `themeId` → `default` pack, no warn
   - Unknown id (not in registry) → warn `[theme] unknown themeId "…"; using default`; return
     full `default` pack
   - Registry id without matching CSS block → warn `[theme] pack "…" incomplete (missing
     CSS); using default`; return full `default` pack
   - CSS block without registry row → warn; return full `default` pack
   - Complete id → return that pack; set `data-theme` to pack `id`
2. Registry MUST include `default` entry; `default` MUST be complete (registry + CSS).
3. Duplicate pack ids in registry → build/type error (TS const map).
4. Adding pack **N+1**: add registry row **and** CSS block before any jukebox entry
   references the new id; until complete, entries pointing at it receive full `default`.

## State transitions (theme switch)

```text
[default entry SSR] ──visitor picks entry──► [active pack = resolveThemePack(themeId)]
       ▲                                        │
       └──────────── full page reload ──────────┘
```

Within session: switching entries swaps pack atomically (no mixed tokens). Incomplete or
unknown `themeId` resolves to full `default` for that switch.

## Unchanged entities from prior features

- `BackgroundVideo` / jukebox collection shape (`004`)
- `site.json`, legal content, chrome strings (`001`/`004`)
- Glitch hit-target set (`003`/`004`) — only the **enable gate** moves to pack capability
