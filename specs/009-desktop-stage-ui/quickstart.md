# Quickstart: Desktop Stage UI Redesign

**Date**: 2026-08-28 (as-built sync 2026-08-28) | **Plan**: [plan.md](./plan.md) | **Contract**: [contracts/desktop-hud-ui.md](./contracts/desktop-hud-ui.md)

Manual validation on a **typical laptop** viewport (~1280×800 or wider). Mobile is not the
visual target (IDEA-013).

## Prerequisites

```bash
npm install
npm run dev
# Open http://localhost:4321/valence-electronica/
```

Use a desktop browser. For reduced-motion scenarios, enable OS “reduce motion”.

---

## 1. Symmetric minimal stage (US1)

1. Load landing; skip or complete intro (`006`).
2. With all panels closed and jukebox collapsed, confirm:
   - Center third of viewport has **no persistent text titles** on HUD controls.
   - On-demand triggers are a **horizontal icon row** on the bottom dock (not a vertical
     text stack on the right).
   - Left cluster (jukebox + mute when visible) and right (four icons) feel comparably weighted.
   - Mute sits **beside** jukebox, not trailing the right segment.

**Pass**: Center reads open; no labeled box stack dominating one corner.

---

## 2. Icon label reveal (US2)

With motion allowed, hover each **closed** dock icon and each active social icon:

1. Icon visible at rest; full title **not** permanently shown.
2. On hover, floating label appears **above** dock icons or **below** social icons (centered
   on the control — does **not** slide to viewport center).
3. Tab to each closed control with keyboard — label reveal fires on focus-visible.
4. Open jukebox or About — hover summary: **no** floating label; inline title beside icon.
5. Edit `src/content/ui/chrome.md` `lyricsTitle`, rebuild, hover Lyrics (closed) — new text shows.

With **reduced motion** enabled: label appears at anchored position without travel animation.

**Pass**: SC-002 + SC-006.

---

## 3. Bottom-center footer (US3)

1. Confirm copyright + Impressum + Datenschutzerklärung are **centered** at bottom.
2. Open Impressum — overlay opens, dismissible, no full reload.
3. Footer does not overlap jukebox/mute cluster at default scale.

**Pass**: SC-003.

---

## 4. Glitch hit targets (US4)

Switch to Nightmare (or any `hudGlitch` pack):

1. Hover a **closed** dock panel icon until glitch runs; **click multiple points** inside the
   trigger box — panel toggles every time.
2. Repeat on jukebox vinyl during glitch (continuous hover when collapsed).
3. Open a panel — morph glitch on open; close — morph on close.
4. Keyboard: focus closed trigger, press Enter during hover glitch — toggles.

**Pass**: SC-004 (0 failed clicks in 5+ tries per control).

---

## 5. Default-theme panel motion

On a pack **without** `hudGlitch` (default theme):

1. Open About (or any on-demand panel) — shell expands first, then body (two smooth beats).
2. Close — body collapses first, then shell shrinks (reverse of open).
3. Open V-Flip — vinyl stays visually anchored while box expands.
4. Enable reduced motion — open/close instant, no phases.

**Pass**: motion matches [desktop-hud-ui.md](./contracts/desktop-hud-ui.md) Panel open/close section.

---

## 6. Regression — `004` behaviors (US5)

Run on desktop after redesign:

| # | Action | Expected |
|---|--------|----------|
| 1 | Open jukebox → pick Example Cyan | Theme/atmosphere/lyrics update; no full reload |
| 2 | Open About | Bio visible in peripheral panel; inline title beside icon |
| 3 | Open Lyrics → switch jukebox | Lyrics follow active entry |
| 4 | Discography → stage button on bound row | Switches jukebox entry |
| 5 | Tour | Upcoming EXAMPLE show or empty copy |
| 6 | Social icon | Opens in new tab |
| 7 | Open Lyrics, then Discography | Only one panel open (exclusive-open) |
| 8 | Remove About body → rebuild | About icon hidden |
| 9 | Open Discography | Full “Discography” title visible inline (18rem panel width) |

**Pass**: SC-005.

---

## 7. Mobile load smoke (FR-013 — not visual target)

At **320px** width (IDEA-013 polish deferred):

1. Page loads without horizontal scroll.
2. Dock icons and footer remain reachable (may look cramped).
3. At least one on-demand panel opens via tap/click.

**Pass**: reachable degradation, not phone polish.

---

## 8. Build gate

```bash
npm run check
npm run build
```

**Pass**: no errors; site builds.

---

## 9. Artist guide (constitution VII)

Confirm `docs/artist-guide.md` documents optional `*Icon` fields in `chrome.md`.

---

## Optional: icon override smoke test

Set in `chrome.md`:

```yaml
lyricsIcon: "🎤"
```

Rebuild; Lyrics trigger shows emoji at rest. Revert after test.

---

## Failure triage

| Symptom | Check |
|---------|--------|
| Dead clicks during glitch | live-safe CSS on `[data-stage-panel].is-glitching`; summary `glitch-hit` + `pointer-events: auto` |
| No hover glitch on dock panels | `glitch-hit` on `<summary>`; `GlitchPress` not treating panel as morph-owned for hover |
| Label stuck on screen | `label-reveal.ts` blur/leave + panel open suppression |
| Label shows while panel open | `show()` skips when `details.open`; inline `.stage-panel__label` |
| Footer not centered | `Footer.astro` positioning |
| Vertical panel stack returned | `StagePanels` horizontal flex |
| Vinyl jumps on V-Flip open | `jukebox__vinyl` fixed-size anchor cell |
| Open/close feels asymmetric on default theme | `panel-motion.ts` + `is-panel-opening` / `is-panel-closing` |
