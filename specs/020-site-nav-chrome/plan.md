# Implementation Plan: Site Nav & Fan-First Chrome

**Branch**: `020-site-nav-chrome` | **Date**: 2026-09-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/020-site-nav-chrome/spec.md`

## Summary

Replace the dense circular HUD chrome with a **Nasaya-inspired top band**
(logo + Home • Shop • Tour • Contact), **side socials** on laptop, and
retained **Links** on phone — so fans find merch and tickets in one glance.
Remove circular side / content-dock stacks as primary chrome; keep About,
Discography, and legal as quieter secondary entries.

**Technical approach** (from [research.md](./research.md)):

- New top-nav composition component + CSS band; reuse `Hero` brand assets.
- Content: `shopUrl` + `contact` object in `src/data/site.json` only;
  nav labels in `chrome.md` (no `src/content/contact/`).
- Relocate single `Channels` tree to laptop side; keep phone Links park
  labeled by chrome `socialsLabel` (default **Links**).
- **Remove** `StagePanels` circular pills from primary chrome (not a soft
  demote-in-place); wire Tour/Contact to top nav; About/Discography via
  secondary text row under the top band.
- Contract: [contracts/site-nav-chrome-ui.md](./contracts/site-nav-chrome-ui.md).
- **Do not** implement `021` player UX or `022` stage polish here.
- Sequence: implement **020 before or with** `021`/`022` to avoid designing
  player against doomed circular docks.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 22+ (build tooling only)

**Primary Dependencies**: Astro 7 static output; existing stage, shows,
channels, legal overlay, `015`/`019` docks as baselines being simplified.
**No new npm packages.**

**Storage**: `src/content/ui/chrome.md` (nav labels, empty states,
`socialsLabel`); `src/data/site.json` (`shopUrl`, `contact` object,
`channels[]`); `src/content/shows/*.md` (unchanged shape). Contact is
**not** a separate content collection.

**Testing**: `astro check` + `astro build` in CI; manual
[quickstart.md](./quickstart.md) at 320 / 390 / 1023 / 1024 / 1280.
No automated browser suite required.

**Target Platform**: Static GitHub Pages (`/valence-electronica` base path)

**Project Type**: Single-repo Astro static site

**Performance Goals**: No regression vs constitution IV — usable within 2s
on average mobile; top nav MUST NOT add heavy client frameworks or second
atmosphere stack.

**Constraints**: Static-first (I); free tier (II); labels/URLs in content
(III); JS only for panel/exclusive-open enhancements already justified —
prefer CSS + semantic links for primary nav (IV); no tracking (V);
spec-driven; supersession notes vs `015`/`019` (VI); artist guide update
(VII)

**Scale/Scope**: Landing chrome IA + content fields + artist docs.
Player/jukebox and track atmosphere owned by siblings.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Static-First Delivery | Astro static HTML; Shop outbound link or static Coming soon panel; no backend storefront | PASS |
| II. Zero-Cost, Zero-Ops Publishing | Unchanged Pages + Actions | PASS |
| III. Content-Code Separation | Nav labels, shop URL, contact copy in content/data files | PASS |
| IV. Lightweight by Default | Primary nav is semantic HTML/CSS; existing dock JS may shrink, not grow packages. 320px usable | PASS |
| V. Privacy & Legal Compliance | No new embeds/tracking; Impressum/privacy remain reachable (FR-011) | PASS |
| VI. Simplicity & Spec-Driven Change | Simplifies chrome; defers player/stage to `021`/`022`; YAGNI on in-site cart | PASS |
| VII. Artist-Facing Change Documentation | Plan requires `docs/artist-guide.md` update for nav/shop/contact edit surfaces | PASS |

**Post-design re-check (after Phase 1)**: PASS —
[data-model.md](./data-model.md) and
[contracts/site-nav-chrome-ui.md](./contracts/site-nav-chrome-ui.md) stay
static content + UI behavior; no runtime backend.

## Project Structure

### Documentation (this feature)

```text
specs/020-site-nav-chrome/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── site-nav-chrome-ui.md
├── checklists/
│   └── requirements.md
└── tasks.md              # /speckit-tasks (not created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── pages/
│   └── index.astro                 # Compose top nav + stage; drop circular primary IA
├── components/
│   ├── SiteNav.astro               # NEW: top band logo + Home/Shop/Tour/Contact
│   ├── Hero.astro                  # Brand mark feeds / nests in top band
│   ├── Channels.astro              # Relocate to laptop side; phone Links reuse
│   ├── StagePanels.astro           # Remove from primary chrome (no circular dock IA)
│   ├── TourDates.astro             # Opened from Tour nav
│   ├── ContactPanel.astro          # NEW or adapt: contact from site.json
│   ├── ShopComingSoon.astro        # NEW or shared empty panel for unset shopUrl
│   ├── AboutPanel.astro            # Secondary entry (under top band)
│   ├── Discography.astro           # Secondary entry (under top band)
│   ├── LegalSheet.astro            # Legal path preserved
│   ├── LegalOverlay.astro
│   └── Footer.astro                # Not sole legal path
├── content/
│   ├── ui/chrome.md                # home/shop/tour/contact labels + socialsLabel
│   └── shows/*.md                  # Unchanged show shape
├── data/
│   └── site.json                   # shopUrl + contact{} + channels[]
├── content.config.ts               # Schema for new chrome fields
├── lib/
│   ├── stage.ts                    # getChrome / site helpers for nav + shop
│   └── player-dock.ts              # Adjust phone Links only as needed for 020
├── styles/
│   └── global.css                  # Top band, side socials, remove circle stacks
docs/
└── artist-guide.md                 # Document nav / shop / contact edit surfaces
```

**Structure Decision**: Stay single Astro project. Top nav is a **new
composition layer** on the landing stage; do not add a multi-page app
shell unless tasks later prove single-page panels insufficient.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Client JS for panel open / exclusive-open | Tour/Contact/About sheets already use dock JS patterns | Pure CSS-only for every panel fights existing exclusive-open + phone Links park |

*(Contact stays in `site.json` — locked; no alternate content collection.
No new npm packages. No privileged/runtime backends.)*

## Phase 0 & Phase 1 Outputs

| Artifact | Path | Status |
|----------|------|--------|
| Research | [research.md](./research.md) | Complete |
| Data model | [data-model.md](./data-model.md) | Complete |
| UI contract | [contracts/site-nav-chrome-ui.md](./contracts/site-nav-chrome-ui.md) | Complete |
| Quickstart | [quickstart.md](./quickstart.md) | Complete |

## Cross-feature dependencies

| Spec | Relationship for implementers |
| ---- | ----------------------------- |
| `021-jukebox-easter-egg` | Depends on this chrome IA; do not put V-Flip in top menu |
| `022-stage-artist-polish` | May share breakpoint/chrome tokens; dual video is separate |
| `019` / `015` | Partial supersession for primary circular docks — update callouts in those contracts when implementing |

## Next Step

Run `/speckit-tasks` to produce [tasks.md](./tasks.md) from these
artifacts. Do **not** implement until tasks + analyze gate.
