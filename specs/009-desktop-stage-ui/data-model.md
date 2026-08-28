# Data Model: Desktop Stage UI Redesign

**Date**: 2026-08-28 (as-built sync 2026-08-28) | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

This feature adds **presentation-layer** entities only. Jukebox entries, releases, shows,
About, and `site.json` channels are unchanged from feature `004`.

## Entities

### Chrome UI config (`src/content/ui/chrome.md`)

Extended frontmatter on the existing single-file collection.

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `aboutTitle` | string | yes (existing) | Label for About control + a11y name + open inline title |
| `lyricsTitle` | string | yes (existing) | Label for Lyrics control |
| `discographyTitle` | string | yes (existing) | Label for Discography control |
| `tourTitle` | string | yes (existing) | Label for Tour control |
| `jukeboxLabel` | string | yes (existing) | Label for jukebox control |
| `aboutIcon` | string | no (new) | Icon token (`about`) or emoji override |
| `lyricsIcon` | string | no (new) | Icon token or emoji |
| `discographyIcon` | string | no (new) | Icon token or emoji |
| `tourIcon` | string | no (new) | Icon token or emoji |
| `jukeboxIcon` | string | no (new) | Icon token or emoji |
| *(other existing fields)* | — | — | Unchanged (`empty*`, `intro*`, etc.) |

**Validation rules**:

- Icon fields omitted → use shipped default token for that control.
- Icon value matching known token (`about`, `lyrics`, `discography`, `tour`, `jukebox`) →
  render bundled SVG.
- Icon value is a single emoji (non-ASCII, length ≤ 8) → render as text icon.
- Unknown token at build → warn in `astro check` / build log; fall back to default token.

**Artist edit boundary**: Artist MAY change titles and icon emoji/token strings in
`chrome.md`. Artist MUST NOT edit component SVG maps or layout CSS.

---

### HUD layout zones (logical, not a data file)

Fixed desktop zones defined in CSS; not artist-editable.

| Zone | Slot | Content source |
|------|------|----------------|
| `top-left` | Identity | `site.json` → `artist.name`, `artist.tagline` |
| `top-right` | Socials | `site.json` → `channels[]` |
| `dock-left` | Jukebox + mute cluster | Jukebox collection + `chrome.jukeboxLabel` / `jukeboxIcon`; mute from `002` |
| `dock-right` | On-demand triggers | `chrome.*Title` / `*Icon` + panel collections |
| `footer-center` | Legal cluster | `site.json` artist name + `legal` collection |
| `center` | Atmosphere only | Jukebox-driven media/theme |

---

### HUD control (runtime presentation)

Not persisted. Built from chrome + collections at SSR.

| Attribute | Source | Notes |
|-----------|--------|-------|
| `icon` | chrome token/emoji or channel brand SVG | Visible at rest |
| `label` | chrome title or channel name | Hidden at rest; revealed on hover/focus when closed |
| `action` | open panel / toggle jukebox / external link | Unchanged behavior from `004` |
| `data-hud-label` | DOM hook for label-reveal JS | Developer-owned |
| `data-hud-label-anchor` | `above` (dock) or `below` (socials) | Developer-owned |

**State transitions**:

| State | Trigger | Result |
|-------|---------|--------|
| `rest` | default | Icon only; no floating label |
| `label-visible` | hover / keyboard focus (closed only) | Floater shows label anchored above/below control |
| `panel-open` | activate on-demand / jukebox | Inline title beside icon; body visible; floater suppressed |
| `panel-opening` | default-theme open phase 1 | Shell expanded; body collapsed (`is-panel-opening`) |
| `panel-closing` | default-theme close phase 1 | Body collapsed (`is-panel-closing`) |
| `glitch-morph` | glitch theme open/close | Live-safe morph on panel shell |
| `glitch-hover` | glitch theme + closed summary hover | One-shot via `GlitchPress` |

---

### Label reveal floater (runtime DOM)

Ephemeral `#hud-label-reveal` element managed by `label-reveal.ts`.

| Property | Rule |
|----------|------|
| Text | Copy of active control’s `label` |
| Horizontal position | Center of control bounding box (`left` + `translateX(-50%)`) |
| Vertical position | Above control (`anchor=above`) or below (`anchor=below`), `6px` gap |
| Motion | Opacity fade when motion allowed; no center travel |
| Suppression | Skip when parent `<details open>`; hide on panel toggle |
| Lifetime | Removed on pointer leave / blur |

---

### Panel motion (runtime, default theme)

Managed by `src/lib/panel-motion.ts` when `data-hud-glitch="false"`.

| Constant | Value | Purpose |
|----------|-------|---------|
| `SMOOTH_PANEL_PHASE_MS` | 280 | Duration per open/close phase |
| `GLITCH_PANEL_CLOSE_MS` | 280 | Close delay before clearing `open` on glitch theme |

| Class | When | Effect |
|-------|------|--------|
| `is-panel-opening` | Default open phase 1 | Body stays collapsed while shell expands |
| `is-panel-closing` | Default close phase 1 | Body collapses before `open` clears |

---

### Footer cluster (presentation)

| Piece | Source |
|-------|--------|
| Copyright line | `© {year} {site.artist.name}` |
| Legal links | `legal` collection titles + slugs |

**Layout rule**: horizontally centered at bottom; must not overlap dock controls at
1280×800 default scale.

---

## Relationships

```text
chrome.md ──► HUD control labels + icon tokens
site.json ──► identity + social icons (unchanged)
jukebox/*   ──► jukebox list body (unchanged)
about/me    ──► About panel body (unchanged)
releases/*  ──► Discography body (unchanged)
shows/*     ──► Tour body (unchanged)
legal/*     ──► Footer link labels (unchanged)
panel-motion.ts ──► default-theme open/close sequencing
```

## Unchanged from `004`

- Stage catalog entry / jukebox switch semantics
- Exclusive-open panel behavior
- Lyrics follow active entry
- Discography stage button binding
- Schedule boot (`007`)
- Theme pack / `hudGlitch` gate (`005`)

## Out of scope entities

- Track catalog / streaming links (IDEA-021)
- New content collections
- Mobile-specific layout zones (IDEA-013)
