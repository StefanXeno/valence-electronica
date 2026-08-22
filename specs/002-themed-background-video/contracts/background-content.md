# Contract: Background Content & Atmosphere UI

**Date**: 2026-08-10 | **Plan**: [../plan.md](../plan.md) | **Data model**: [../data-model.md](../data-model.md)

Maintainer-facing contract for atmospheric media. Stable so operators can swap clips and
basic themes without editing layout components (constitution III).

## `src/data/background.json`

```json
{
  "defaultVideoId": "placeholder-loop",
  "videos": [
    {
      "id": "placeholder-loop",
      "title": "NIGHTMARE (temp — first 30s from YouTube, for testing)",
      "themeId": "nightmare-crimson",
      "hasAudio": true,
      "poster": "/images/posters/placeholder-loop.jpg",
      "sources": [
        { "src": "/videos/placeholder-loop.mp4", "type": "video/mp4" }
      ]
    }
  ]
}
```

v1 ships **one** default clip only (no switcher). Current test media:
`public/videos/placeholder-loop.mp4` (~30s, 1280×720, with audio) and
`public/images/posters/placeholder-loop.jpg`, cut from Valence’s *NIGHTMARE* YouTube
download — temporary until a real atmospheric asset replaces it.

Rules:

- `defaultVideoId` MUST equal one `videos[].id` or the build/helper MUST fail fast.
- `videos[].sources` MUST include at least one `video/mp4` entry for baseline support.
- Paths in `poster` and `sources[].src` are site-root paths served from `public/` (honor
  Astro `base` via existing URL helpers when emitting `src`/`poster` attributes).
- `hasAudio: false` ⇒ mute/unmute control MUST NOT be offered.
- `hasAudio: true` ⇒ control MAY be offered only while the video is playing (not in
  reduced-motion or failure fallback).
- Additional `videos[]` entries are allowed but MUST NOT surface a picker in this feature.
- `themeId` MUST reference a **complete** theme pack (registry + CSS). See
  `specs/005-theme-packs/contracts/theme-packs.md` (supersedes capability rules below for
  features `005+`). Unknown or incomplete ids fall back to the full `default` pack.

## Theme packs (`src/styles/themes.css`)

> **Superseded for capabilities** by [`specs/005-theme-packs/contracts/theme-packs.md`](../../005-theme-packs/contracts/theme-packs.md).
> Color tokens remain in CSS; looping video, mute, and HUD glitch are driven by
> `src/lib/theme-packs.ts`.

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

- Landing and legal routes MUST set `data-theme` from the **default** video’s `themeId`.
- Packs MUST keep text readable over video/poster (scrim/overlay tokens allowed).
- No typography or motion-language tokens required in this feature.

## Atmosphere UI contract (visitor-facing)

| Affordance | Contract |
|------------|----------|
| Background video | Full-bleed behind primary content when motion allowed and playback works; `muted` + loop at start |
| Poster / fallback | Shown for `prefers-reduced-motion`, load failure, or blocked autoplay |
| Mute control | Present only if `hasAudio` and video playing; keyboard reachable; accessible name reflects mute/unmute |
| Legal panel | `/legal/{slug}` content in near-fullscreen panel with margins; X Exit returns to landing |
| Legal navigation | With JS: in-page open/close + History API (no full reload from landing); without JS: hard navigation still works |
| Legal motion | Smooth open animation when motion allowed; skipped/minimized when reduced motion preferred |

## Unchanged contracts from 001

- `src/data/site.json` artist/channels/seo shape remains as in
  `specs/001-website-skeleton/contracts/content-schema.md`.
- Legal Markdown collection (`src/content/legal/*.md`) keeps the same frontmatter/`title`
  rules; only presentation chrome changes.
