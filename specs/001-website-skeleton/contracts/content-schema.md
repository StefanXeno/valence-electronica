# Contract: Content Files

**Date**: 2026-08-07 | **Plan**: [../plan.md](../plan.md) | **Data model**: [../data-model.md](../data-model.md)

The site's "interface" to its maintainers is the set of content files. These contracts
must stay stable so that content edits never require code changes (constitution III).

## `src/data/site.json`

```json
{
  "artist": {
    "name": "Valence",
    "tagline": "<one-line hook — placeholder>",
    "description": "<1-3 sentence intro — placeholder>",
    "location": "Augsburg, Germany"
  },
  "seo": {
    "title": "Valence — Electronic Music",
    "indexable": false
  },
  "channels": [
    {
      "id": "bandcamp",
      "label": "Bandcamp",
      "url": "https://valenceelectronica.bandcamp.com/",
      "status": "active"
    },
    {
      "id": "soundcloud",
      "label": "SoundCloud",
      "url": "https://soundcloud.com/valence-music",
      "status": "active"
    },
    {
      "id": "youtube",
      "label": "YouTube",
      "url": "https://www.youtube.com/channel/UCHqAx9AtBYOl1Fw1sJa1IHA",
      "status": "active"
    },
    {
      "id": "instagram",
      "label": "Instagram",
      "url": "https://www.instagram.com/valence_electronica/",
      "status": "active"
    },
    {
      "id": "tiktok",
      "label": "TikTok",
      "url": "https://www.tiktok.com/@valence_electronica",
      "status": "active"
    },
    {
      "id": "spotify",
      "label": "Spotify",
      "url": "https://open.spotify.com/artist/6QmxwTumED1VMmiZ04jEW0",
      "status": "active"
    }
  ]
}
```

Rules:

- `channels[].id` is a stable platform key (lowercase, no spaces). It selects the brand
  mark in `src/components/ChannelIcon.astro`. Known keys: `bandcamp`, `soundcloud`,
  `youtube`, `instagram`, `tiktok`, `spotify`.
- `channels[].url` is mandatory for `status: "active"`, ignored for `"placeholder"`.
- Removing an entry hides it; changing `status` to `"placeholder"` shows "coming soon".
- Activating or editing a known platform is a `site.json`-only change (SC-006). A brand-
  new platform needs a new `id` plus a matching SVG path in `ChannelIcon.astro` if the
  mark is not already mapped.
- Icons are first-party inline SVG (no third-party icon CDN or icon font).
- `seo.indexable: true` is the launch switch (removes the `noindex` robots meta tag).

## `src/content/legal/<slug>.md`

```markdown
---
title: Impressum
---

<!-- PLACEHOLDER — replace with real legal text before launch -->
...
```

Rules:

- Frontmatter `title` is required (build fails otherwise via collection schema).
- Slug (filename) defines the route `/legal/<slug>`; `imprint` and `privacy` are fixed.

## Deployment contract

- Trigger: push to `main`.
- Gates: `astro check` and `astro build` must succeed; otherwise no deployment happens and
  the previous version stays live.
- Output: `dist/` published to GitHub Pages at `https://<owner>.github.io/valence-electronica/`.
