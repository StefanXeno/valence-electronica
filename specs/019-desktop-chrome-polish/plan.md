# Implementation Plan: Desktop Chrome Polish

**Branch**: `019-desktop-chrome-polish` | **Date**: 2026-09-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/019-desktop-chrome-polish/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

Lift mobile HUD language onto **laptop viewports (1024px and up)** without
changing the phone HUD (`015` / `018`).

- **Content bar** (bottom-right): boxed icons **About**, **Discography**,
  **Tour**, **Info**. No socials (top-right cluster stays). Hide the
  always-visible bottom-center legal footer. Info matches phone: © Valence
  **top-right** of the open box; Imprint / Privacy Policy pills → existing
  overlay.
- **Player** (bottom-left): **always open**. No V-Flip / vinyl toggle.
  Always show the **currently playing** track. Toolbar left → right:
  **Playlist**, **Shuffle**, **Play/pause**, **Mute** (simple toggle).
  Loop, vinyl, and the volume slider are out of desktop chrome.
- **Motion**: grow **in place**, not a slide. Playlist grows from the
  always-open player **right then up** (close **down then left**). Bar
  grows **left then up** (close **down then right**). Sequential stages.

**Technical approach** (from [research.md](./research.md)):

- Reuse the existing one-DOM HUD. Gate new layout with
  `@media (min-width: 1024px)` / `matchMedia('(min-width: 1024px)')`.
- CSS-first: unhide Info, hide footer + vinyl + loop + slider; show
  playlist + play/pause; reorder the toolbar; show now-playing on
  desktop.
- Extend existing `panel-motion.ts` / jukebox + StagePanels JS only
  enough for **true two-stage sequential** grow (width, then height).
  No new npm packages.
- Artist guide update in the same change set (constitution VII).
- Contract: [contracts/desktop-chrome-polish.md](./contracts/desktop-chrome-polish.md)
  supersedes `009` / `011` desktop floor chrome.

## Technical Context

**Language/Version**: TypeScript (strict), Node.js 22+ (build tooling only)

**Primary Dependencies**: Astro 7 static output; as-built `Jukebox.astro`,
`StagePanels.astro`, `Footer.astro`, `MuteControl.astro`,
`panel-motion.ts`, `player-dock.ts`. **No new npm packages.**

**Storage**: None. Visit-only playlist / panel open state (already
exists). No new `chrome.md` fields. No cookies.

**Testing**: `astro check` + `astro build` in CI. Operator
[quickstart.md](./quickstart.md) at 1280×800, 1023 vs 1024, 320.
Do **not** run Playwright / `verify:hud` as a 019 gate. No new Vitest
file unless implement extracts a tiny two-stage helper (YAGNI: prefer
CSS class sequence).

**Target Platform**: Static GitHub Pages (`/valence-electronica` base path)

**Project Type**: Single-repo Astro static site

**Performance Goals**: No regression vs constitution IV — landing usable
within 2s on an average mobile connection. No extra fonts, gesture
libraries, or second HUD tree.

**Constraints**: Static-first (I); free tier (II); no new content fields
(III); justified JS only for sequential two-stage + desktop playlist
wiring (IV); no tracking (V); desktop-only HUD; phone untouched (VI);
artist-guide update required (VII). Locked: always-open player; control
order; no vinyl/loop/slider; Info in bar; footer hidden; grow-in-place
not slide; left/right split.

**Scale/Scope**: Desktop floor chrome + player toolbar + Info + footer
visibility + two-stage motion. Phone docks, 018 playlist window, and
playback hop math stay.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Check | Status |
|-----------|-------|--------|
| I. Static-First Delivery | Astro static HTML; motion / playlist are client enhancements on existing markup | PASS |
| II. Zero-Cost, Zero-Ops Publishing | Unchanged Pages + Actions | PASS |
| III. Content-Code Separation | Reuse `chrome.md` / `site.json` / `legal/`. No new artist fields | PASS |
| IV. Lightweight by Default | **Justified**: extend existing panel / jukebox JS for sequential two-stage grow and to ungating playlist + play/pause on desktop. Hide/show chrome is CSS. No new packages | PASS (with justified exception) |
| V. Privacy & Legal Compliance | No cookies, embeds, tracking. Legal stays reachable via Info → existing overlay (German law) | PASS |
| VI. Simplicity & Spec-Driven Change | One DOM; CSS media queries; no third layout; no 018 three-row on desktop | PASS |
| VII. Artist-Facing Change Documentation | **Must** update `docs/artist-guide.md`: laptop legal is Info; laptop player is always-open Playlist / Shuffle / Play/pause / Mute | PASS |

**Post-design re-check (after Phase 1)**: PASS —
[data-model.md](./data-model.md) is visit-only chrome state;
[contracts/desktop-chrome-polish.md](./contracts/desktop-chrome-polish.md)
is visitor HUD behavior, not a runtime backend. Artist-guide delta is
in scope (quickstart + implement).

## Project Structure

### Documentation (this feature)

```text
specs/019-desktop-chrome-polish/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── desktop-chrome-polish.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 (/speckit-tasks) — not created here
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── Jukebox.astro          # UPDATE — desktop toolbar order; hide vinyl/loop;
│   │                          #          show playlist + play/pause; always-open
│   │                          #          now-playing; playlist grow (not vinyl toggle)
│   ├── StagePanels.astro      # UPDATE — show Info on desktop; two-stage bar grow;
│   │                          #          © top-right on desktop Info box
│   ├── Footer.astro           # UPDATE — hide landing footer at all HUD widths
│   └── MuteControl.astro      # UPDATE — hide slider at ≥1024px (toggle only)
├── lib/
│   ├── panel-motion.ts        # UPDATE — sequential two-stage (width then height)
│   ├── player-dock.ts         # TOUCH only if desktop playlist must not use phone
│   │                          #          exclusive-open / handle paths
│   └── playback.ts            # UNCHANGED — loop stays off; no Loop control
├── styles/
│   └── global.css             # UPDATE — desktop dock / socials stay; do not
│                              #          apply phone stacked docks at ≥1024px
└── docs/
    └── artist-guide.md        # UPDATE — legal + player chrome (constitution VII)

src/content/ui/chrome.md       # UNCHANGED (reuse existing strings)
```

**Structure Decision**: Stay single Astro project. 019 is a **desktop
presentation layer** on the existing HUD DOM, not a second tree.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Extend client JS (`panel-motion` / jukebox) | Spec requires **sequential** two-stage grow (width, then height) and playlist on desktop | Today’s desktop morph often runs width+height together; CSS-only cannot guarantee stage order if a second class is not sequenced. Playlist toggle is already JS and is phone-gated |
| Hide footer on desktop | Spec forbids duplicate legal | Leaving the footer visible duplicates Info |

## Phase 0 & Phase 1 Outputs

| Artifact | Path | Status |
|----------|------|--------|
| Research | [research.md](./research.md) | Complete |
| Data model | [data-model.md](./data-model.md) | Complete |
| UI contract | [contracts/desktop-chrome-polish.md](./contracts/desktop-chrome-polish.md) | Complete |
| Quickstart | [quickstart.md](./quickstart.md) | Complete |

## Implementation Notes

1. **Breakpoint**: Phone rules stay inside `@media (max-width: 1023px)`.
   019 rules live in `@media (min-width: 1024px)` or the default
   (laptop) stylesheet with phone overrides unchanged.
2. **Always-open player**: Do not require the vinyl `data-jukebox-toggle`.
   At ≥1024px the boxed player + now-playing + toolbar paint at rest.
   Playlist `aria-expanded` grows the **list** only.
3. **Toolbar DOM order** (or visual `order` if DOM shuffle is riskier):
   Playlist, Shuffle, Play/pause, Mute. Hide vinyl + loop at ≥1024px.
   Phone CSS that hides vinyl/loop and shows playlist/play stays.
4. **Currently playing**: Reuse `data-now-playing` / existing track
   label on desktop. Do not require the phone solo card or 018
   three-row window.
5. **Playlist list**: Existing laptop `TrackInfoPanel` / theme-track
   list (`011`). Not `018` placeholders / three-slot window.
6. **Two-stage**: Per stage **280ms**,
   `cubic-bezier(0.4, 0, 0.2, 1)` (`SMOOTH_PANEL_PHASE_MS`). Open:
   width, then height. Close: height, then width. Reduced motion:
   instant. Glitch packs MAY overlay morph flavor; they MUST NOT
   invert or skip the direction order.
7. **Mute**: Hide `.volume-control__slider-wrap` at ≥1024px. Keep the
   in-memory unmute level (today’s 0.7 default). Device/OS volume is
   the visitor loudness control.
8. **Loop**: No control; `loopDefault` stays false; do not add a
   desktop way to turn loop on.
9. **Info**: Unhide `.stage-panel--info` at ≥1024px. Keep
   `.stage-panel--socials` hidden. Lift phone copyright header styles
   so desktop Info also pins `© {year} {artist}` top-right.
10. **Footer**: Hide the landing `<footer>` at all widths (phone already
    hides it ≤1023px).
11. **Exclusive-open**: About / Discography / Tour / Info stay exclusive.
    Playlist MAY stay open while a panel is open. Click-outside for
    panels stays as today; do not collapse the always-open player.
12. **Resize**: Crossing 1023/1024 tears down in-flight two-stage and
    phone dock motion (as-built + desktop playlist classes).
13. **Artist guide**: Same PR as the HUD change (FR-014).
14. **Visual QA**: Operator [quickstart.md](./quickstart.md). Agents do
    not install browsers.

## Next

`/speckit-tasks` — do not implement from this plan until tasks exist.
