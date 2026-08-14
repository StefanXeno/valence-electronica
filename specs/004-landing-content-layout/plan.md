# Implementation Plan: Landing Stage (Peripheral Content & Jukebox)

**Branch**: `004-landing-content-layout` | **Date**: 2026-08-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-landing-content-layout/spec.md`

## Summary

Turn the landing page into a **stage HUD**: the center stays atmosphere-only; identity,
jukebox, and socials stay compact persistent chrome; About, lyrics, discography, and tour
open on demand from the edges. All visitor-facing copy (including chrome labels) lives in
Markdown content files in the same editing style as Impressum/privacy. The jukebox is the
visitor-facing theme/song switcher: picking an entry (or the discography stage button when
bound) updates atmosphere + `data-theme` + lyrics for this load only — reload returns to
the content-configured default. No third-party players, no visit memory, no new routes.

**As-built (2026-08-14):** Spec + UI contract are the source of truth. Laptop HUD
slots are frozen; jukebox is a collapsed vinyl control; socials are icon-only;
footer is a transparent left cluster; looping video and glitch are Nightmare-only;
poster-only jukebox entries are valid; visual success is typical laptop (phone HUD
= IDEA-013). Historical plan bullets below that say “no glitch expansion” or
“320px HUD polish” are superseded.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 22+ (LTS) for build tooling only

**Primary Dependencies**: Astro 7 (static output); existing Fontsource Unbounded; existing
first-party atmosphere/mute/legal overlay from `002` and glitch chrome from `003`. No new
npm UI/motion libraries.

**Storage**: Flat files — Astro content collections under `src/content/` (jukebox, about,
releases, shows, ui chrome) plus existing `src/data/site.json` for identity/channels/seo.
Media stays under `public/videos/` and `public/images/posters/`. `src/data/background.json`
is migrated into the jukebox collection (one place per song).

**Testing**: `astro check` + `astro build` as CI gates; manual acceptance walks in
`quickstart.md`. No Playwright suite in this feature (YAGNI).

**Target Platform**: Static hosting on GitHub Pages
(`https://<owner>.github.io/valence-electronica/`)

**Project Type**: Static website (single Astro project at repository root)

**Performance Goals**: Identity + chrome usable within 2 s on an average mobile connection
even while video buffers (constitution IV / inherited SC from `001`/`002`). HUD must not
horizontal-scroll from 320px. Jukebox switch must not full-reload the document (audio
continuity).

**Constraints**: No runtime backend (I); free tier only (II); every visitor-facing string
in content files (III); client JS only for (1) in-session jukebox/theme/lyrics swap and
(2) exclusive-open of on-demand `<details>` when scripting is available (IV — see
Complexity Tracking); no tracking/embeds/cookies (V); YAGNI — no extra pages, no IDEA-002
deep packs, no glitch-set expansion, no sessionStorage (VI)

**Scale/Scope**: One landing stage + existing legal overlay. Ship ≥2 example releases
(one jukebox-bound, one not) and ≥2 jukebox entries (placeholders may share one MP4).
Tour list may ship empty (empty-state is required).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Static-First Delivery | Astro static output; prerendered HTML/CSS/JS/assets; no SSR adapter | PASS |
| II. Zero-Cost, Zero-Ops Publishing | Unchanged GitHub Pages + Actions; omit-invalid-item so a bad date does not blank the site; whole-build failure still keeps last good live version | PASS |
| III. Content-Code Separation | Jukebox, About, lyrics, releases, shows, and chrome strings in Markdown collections; `site.json` keeps identity/channels; components only render | PASS |
| IV. Lightweight by Default | Semantic HTML HUD + CSS positioning; **justified** small first-party JS for (1) swapping the active jukebox entry (video/theme/lyrics/mute) without reload and (2) exclusive-open of on-demand `<details>` when scripting is available (see Complexity Tracking). Native `<details>` remain the panel chrome (work without JS). Responsive from 320px; contrast over atmosphere | PASS (with justified exceptions) |
| V. Privacy & Legal Compliance | No tracking, cookies, or third-party players; legal overlay/footer unchanged; jukebox pick not stored | PASS |
| VI. Simplicity & Spec-Driven Change | Exclusive on-demand panel (one open) on all widths (spec MAY allow more on desktop — not required). No CMS, no new routes, no glitch-target expansion | PASS |

**Post-design re-check (after Phase 1)**: PASS — contracts are file-based Markdown + a UI
behavior contract; client JS is limited to the two documented exceptions; invalid list
items are omitted at build rather than failing the whole catalog.

## Project Structure

### Documentation (this feature)

```text
specs/004-landing-content-layout/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── stage-content.md
│   └── stage-ui.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks — not created by plan)
```

### Source Code (repository root)

```text
src/
├── content.config.ts              # Add collections: jukebox, about, releases, shows, ui
├── content/
│   ├── legal/                     # Unchanged
│   ├── jukebox/<id>.md            # Label, media, theme, default flag; body = lyrics
│   ├── about/me.md                # About bio body; omit file or empty → hide About
│   ├── releases/<slug>.md         # Discography rows
│   ├── shows/<slug>.md            # Tour dates (upcoming only on the stage)
│   └── ui/chrome.md               # Region titles, empty states, stage-button label
├── data/
│   └── site.json                  # Name, tagline, location, channels, seo (unchanged role)
├── lib/
│   ├── background.ts              # Resolve jukebox entries (replace background.json import)
│   ├── stage.ts                   # Filter valid releases/shows; default jukebox; omit broken
│   └── url.ts                     # Unchanged
├── components/
│   ├── Hero.astro                 # Shrink to persistent identity chrome (name + hook)
│   ├── Channels.astro             # Compact persistent socials chrome
│   ├── Jukebox.astro              # Persistent compact selector (NEW)
│   ├── StagePanels.astro          # On-demand About / Lyrics / Discography / Tour (NEW)
│   ├── Discography.astro          # List + optional stage button (NEW)
│   ├── TourDates.astro            # Upcoming list or empty message (NEW)
│   ├── AboutPanel.astro           # About body (NEW)
│   ├── LyricsPanel.astro          # Lyrics for active entry (NEW)
│   ├── BackgroundAtmosphere.astro # Swap sources/poster on jukebox change
│   ├── MuteControl.astro          # Follow active entry hasAudio + playing state
│   ├── Footer.astro               # Stay peripheral; do not cover mute
│   └── …                          # Glitch/legal overlay unchanged
├── styles/
│   ├── global.css                 # Drop landing max-width column; stage HUD slots
│   └── themes.css                 # Existing packs; active theme follows jukebox
├── pages/
│   └── index.astro                # Compose stage chrome, not stacked document
└── layouts/
    └── Base.astro                 # data-theme from default entry at load

public/
├── videos/                        # Unchanged location; drop new files here
└── images/posters/
```

**Structure Decision**: Stay on the single Astro root project. Replace the stacked
`Hero` + `Channels` column with a full-viewport stage shell. Migrate `background.json`
into `src/content/jukebox/` so one Markdown file is the song (label + media + lyrics).
Do not add a second app or CMS.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Client JS to switch jukebox entry (video, `data-theme`, lyrics, mute visibility) without full reload | Spec requires in-session switch with mute surviving, lyrics following, and reload resetting to default (FR-007–009). Full navigation would reload and lose unmute + feel like a document | Pure CSS cannot swap video sources, theme tokens, and lyrics nodes together; query-param navigation would reload and contradict “pick lasts until reload” as an in-session change; third-party players violate V |
| Client JS to keep at most one on-demand `<details>` open (all widths when scripting is available) | FR-004 MUST: at most one expanded on-demand region on small screens when scripting is available. Exclusive on desktop too is YAGNI (one layout mode). Native `<details>` still work if JS is off | Radio-button accordion is awkward to close and worse AT; CSS-only exclusive is brittle; a JS accordion library violates IV/V/VI; skipping exclusive-open fails the phone MUST when scripting works |
