# Contract: Background Content & Atmosphere UI

**Date**: 2026-08-10 (as-built sync 2026-08-24) | **Plan**: [../plan.md](../plan.md) | **Data model**: [../data-model.md](../data-model.md)

Maintainer-facing contract for atmospheric media. Stable so operators can swap clips and
basic themes without editing layout components (constitution III).

## Catalog source (as-built)

> **`src/data/background.json` is removed.** The atmosphere catalog lives in the jukebox
> collection (`src/content/jukebox/*.md`), owned by feature `004`. Helpers in
> `src/lib/background.ts` load usable entries and the static fallback (`default: true`).
> Full frontmatter rules: [`specs/004-landing-content-layout/contracts/stage-content.md`](../../004-landing-content-layout/contracts/stage-content.md).

This feature still owns the **atmosphere behavior** contract below (mute, reduced motion,
legal panel, History API). Theme capabilities (looping video, mute eligibility, HUD glitch)
are owned by [`specs/005-theme-packs/contracts/theme-packs.md`](../../005-theme-packs/contracts/theme-packs.md).

### Shipped sample media

| Role | Path |
|------|------|
| Nightmare loop (MP4) | `public/videos/nightmare.mp4` |
| Nightmare poster | `public/images/posters/nightmare.jpg` |
| Cyan still (SVG) | `public/images/posters/placeholder-cyan.svg` |

## Theme packs (`src/styles/themes.css`)

> **Superseded for capabilities** by [`specs/005-theme-packs/contracts/theme-packs.md`](../../005-theme-packs/contracts/theme-packs.md).
> Color tokens remain in CSS; looping video, mute, and HUD glitch are driven by
> `src/lib/theme-packs.ts` (`data-theme`, `data-hud-glitch` on `<html>`).

Each basic pack overrides color/surface tokens only, for example:

```css
[data-theme="nightmare-crimson"] {
  --color-bg: …;
  --color-surface: …;
  --color-text: …;
  --color-text-muted: …;
  --color-accent: …;
  --color-accent-alt: …;
  --color-border: …;
  --bg-scrim: …;
}
```

Rules:

- Landing and legal routes MUST set `data-theme` (and `data-hud-glitch`) from the
  **active** jukebox entry’s resolved pack. SSR / no-JS first paint uses the static
  fallback entry (`default: true`); with JS, feature `007` may apply today’s scheduled
  entry on boot.
- Packs MUST keep text readable over video/poster (scrim/overlay tokens allowed).
- No typography or motion-language tokens required in this feature.

## Atmosphere UI contract (visitor-facing)

| Affordance | Contract |
|------------|----------|
| Background video | Full-bleed behind primary content when motion allowed, the active pack allows `loopingVideo`, and playback works; `muted` + loop at start |
| Poster / fallback | Shown for `prefers-reduced-motion`, load failure, blocked autoplay, or packs without looping video |
| Mute control | Present only if pack `audioEligible`, entry `hasAudio`, and video playing; keyboard reachable; accessible name reflects mute/unmute |
| Legal panel | `/legal/{slug}` content in near-fullscreen panel with margins; X Exit returns to landing |
| Legal navigation | With JS: in-page open/close + History API (no full reload from landing); without JS: hard navigation still works |
| Legal motion | Smooth open animation when motion allowed; skipped/minimized when reduced motion preferred |

## Unchanged contracts from 001

- `src/data/site.json` artist/channels/seo shape remains as in
  `specs/001-website-skeleton/contracts/content-schema.md`.
- Legal Markdown collection (`src/content/legal/*.md`) keeps the same frontmatter/`title`
  rules; only presentation chrome changes.
