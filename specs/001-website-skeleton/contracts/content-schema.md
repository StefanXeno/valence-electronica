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
    { "label": "Bandcamp", "url": "https://valenceelectronica.bandcamp.com/", "status": "active" },
    { "label": "Spotify", "status": "placeholder" },
    { "label": "SoundCloud", "status": "placeholder" },
    { "label": "Instagram", "status": "placeholder" }
  ]
}
```

Rules:

- `channels[].url` is mandatory for `status: "active"`, ignored for `"placeholder"`.
- Removing an entry hides it; changing `status` to `"placeholder"` shows "coming soon".
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
