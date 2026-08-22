# Quickstart: Landing Intro

**Feature**: `006-landing-intro`

## Prerequisites

```bash
npm install
npm run dev
```

Open `http://localhost:4321/valence-electronica/` (adjust for your base path).

## Scenarios

### 1 — First visit intro (motion allowed)

1. Open DevTools → Application → Local Storage → delete `valence-intro-seen`.
2. Ensure OS/browser **does not** prefer reduced motion.
3. Load `/`.
4. **Expect**: Two-line greeting — **“Hi I'm”** on the first line, **“Valence”** on its own
   second line. The name is **transparent** (site/atmosphere visible through the letters).
   **Zoom motion targets “Valence” only** (not the lead line). Stage HUD fully interactive
   within ~4 s; jukebox and socials work after reveal.

### 2 — No replay on reload

1. Complete scenario 1 (or skip with Escape).
2. Reload `/`.
3. **Expect**: Landing appears immediately; no intro overlay.

### 3 — Skip with Escape

1. Clear `valence-intro-seen`.
2. Load `/`; press **Escape** during intro.
3. **Expect**: Stage visible immediately; reload skips intro.

### 4 — Skip with click/tap

1. Clear flag; load `/`.
2. Click/tap the intro overlay during animation.
3. **Expect**: Same as scenario 3.

### 5 — Reduced motion

1. Enable “Reduce motion” in OS or DevTools rendering emulation.
2. Clear flag; load `/`.
3. **Expect**: No intro; full landing immediately.

### 6 — Demo replay query

1. With flag set, load `/?replay-intro`.
2. **Expect**: Intro plays once (if motion allowed); after complete/skip, reload without
   query skips intro.

### 7 — Empty name disables intro

1. Temporarily set `introName:` to empty in `chrome.md`.
2. Clear flag; load `/`.
3. **Expect**: No intro. Restore name after test.

### 8 — Legal route unaffected

1. Clear flag; open `/legal/imprint` directly.
2. **Expect**: No intro overlay on legal page.

### 9 — Content edit

1. Change `introLead` and/or `introName` in `chrome.md`; refresh dev server.
2. Clear flag; load `/`.
3. **Expect**: Updated two-line greeting; name still on its own line with transparent
   treatment and name-only zoom.

### 10 — Transparent name check

1. Clear flag; load `/` during intro.
2. **Expect**: Through the “Valence” letterforms you can see the atmosphere (and/or stage
   HUD) behind — not a solid opaque fill.

### 11 — Build gate

```bash
npm run check && npm run build
```

**Expect**: No type or content schema errors.

## Maintainer notes

- **Reset intro locally**: delete `valence-intro-seen` in localStorage or use `?replay-intro`.
- **Privacy**: playback flag is documented in `contracts/intro-ui.md` for future privacy copy.
- **Copy fields**: `introLead` (line 1), `introName` (line 2, required for intro to run).
