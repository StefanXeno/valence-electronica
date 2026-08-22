# Quickstart & Validation: Theme Pack System

**Date**: 2026-08-22 | **Plan**: [plan.md](./plan.md)

## Prerequisites

- Node.js 22+ (LTS) and npm
- Feature branch `005-theme-packs` with implementation complete
- At least two jukebox entries on different themes (Nightmare + cyan example from `004`)

## Local development

```bash
npm install
npm run dev       # http://localhost:4321/valence-electronica/
```

## Quality gates (same as CI)

```bash
npm run check
npm run build
npm run preview
```

Build output should not contain unknown-theme warnings for shipped jukebox files. Introduce
a deliberate typo in a local jukebox `themeId` to confirm `[theme] unknown themeId` warns,
full `default` pack applies (`data-theme="default"`), and the page still builds. Optionally
add a registry row without CSS to confirm `[theme] pack "…" incomplete (missing CSS); using
default`.

## Validation scenarios (map to spec)

1. **US1 — coherent pack on switch**: Open jukebox; switch Nightmare ↔ Example Cyan.
   Expect: each pack’s colors apply fully; Nightmare → loop + mute available; Cyan →
   poster only, mute hidden; **no** mixed crimson/cyan tokens on one screen.
2. **US1 — Nightmare glitch**: On Nightmare, hover closed on-demand panels and vinyl;
   expect glitch. Switch to Cyan; same controls stay still (FR-008).
3. **US2 — registry audit (SC-006)**: From repo root:

   ```bash
   rg "nightmare-crimson" src --glob '!**/theme-packs.ts' --glob '!**/themes.css'
   ```

   Expect: **no matches** in capability logic (only comments/strings in theme-packs registry
   definition and CSS selectors are allowed). `GLITCH_THEME_ID` / `VIDEO_THEME_ID` removed.

4. **US2 — unknown or incomplete themeId**: Set a jukebox entry `themeId: does-not-exist`,
   build. Expect: `[theme] unknown themeId` warning; full **default** presentation
   (`data-theme="default"`, default colors, no glitch); site builds. Optional: registry row
   without CSS → `[theme] pack "…" incomplete (missing CSS); using default`.
5. **US3 — reduced motion**: Enable `prefers-reduced-motion` in devtools; switch all entries.
   Expect: poster fallback; **zero** glitch motion on any pack (SC-004).
6. **US1 — Nightmare parity (SC-003)**: Compare against `pre-release` (or note pre-migration):
   palette, loop, unmute/mute, glitch on HUD — unchanged on Nightmare default entry.
7. **SC-005 — readability**: On laptop, open About + lyrics on each shipped theme; text
   readable over atmosphere.
8. **FR-012 — maintainer doc**: Follow [contracts/theme-packs.md](./contracts/theme-packs.md)
   checklist to describe adding a hypothetical fourth pack without opening component files.

## HTML capability attribute check

Inspect `<html>` while switching:

| Active pack | `data-theme` | `data-hud-glitch` |
|-------------|--------------|-------------------|
| Nightmare | `nightmare-crimson` | `true` |
| Cyan | `cyan-pulse` | `false` |
| Unknown or incomplete → default | `default` | `false` |

## Reference

- Data shape: [data-model.md](./data-model.md)
- Maintainer contract: [contracts/theme-packs.md](./contracts/theme-packs.md)
- Registry decisions: [research.md](./research.md)
