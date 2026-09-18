# Data Model: Site Nav & Fan-First Chrome

**Date**: 2026-09-18 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

Extends existing UI chrome and site identity. No runtime database.
Tour shows continue to live in `src/content/shows/*.md`. Channels stay in
`src/data/site.json`.

## Entity: PrimaryNavItem

Visitor-facing primary destinations in the top band.

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `id` | enum | yes | `home` \| `shop` \| `tour` \| `contact` |
| `label` | string | yes | Content-editable label from chrome (`homeTitle`, etc.) |
| `kind` | enum | yes | `stage` \| `merch` \| `shows` \| `contact` |
| `href` | string | yes | In-page target (`#stage`, `#tour`, …) or external URL for Shop when configured |
| `external` | boolean | yes | `true` only when Shop has a configured store URL |
| `emptyState` | string? | no | Soft empty copy when destination has no content (Shop Coming soon, empty Tour, incomplete Contact) |

**Rules**:

- All four items MUST always render in primary nav (FR-001 / FR-004).
- Shop with unset store URL: `external=false`, opens Coming soon panel —
  never omit the item, never 404 the site.
- Labels MUST NOT be hardcoded only in components (constitution III).

## Entity: SiteShop (new / extended on site data)

| Field | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `shopUrl` | string (URL) | no | unset | External merch store (Bandcamp/Shopify/etc.) |
| `shopComingSoon` | string | no | chrome `comingSoon` / dedicated copy | Body for soft empty state when `shopUrl` unset |

**Storage decision**: Prefer `src/data/site.json` under a `shop` object
(or top-level `shopUrl`) so the artist edits one site file; labels stay in
`chrome.md`. See [research.md](./research.md) R2 / R8.

## Entity: SiteContact (new)

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `headline` | string | no | Contact panel title override |
| `body` | string (markdown/plain) | no | Fan-facing contact instructions |
| `email` | string | no | Mailto target when present |
| `links` | `{ label, url }[]` | no | Extra contact outbound links |

Incomplete contact → honest empty/incomplete UI; never site-wide 404
(FR-005 edge case).

**Storage decision**: Small structured block in `site.json` and/or
`src/content/contact/index.md` — implementer picks one place; artist guide
documents the single edit surface (constitution VII).

## Entity: UiChrome (extended)

File: `src/content/ui/chrome.md` (+ schema in `src/content.config.ts`)

| Field | Type | Required | Default | Description |
| ----- | ---- | -------- | ------- | ----------- |
| `homeTitle` | string | no | `Home` | Primary nav label |
| `shopTitle` | string | no | `Shop` | Primary nav label |
| `tourTitle` | string | no | `Tour` | Already exists — reuse for nav + panel |
| `contactTitle` | string | no | `Contact` | Primary nav label |
| `shopComingSoonTitle` | string | no | `Coming soon` | Shop empty-state heading |
| `shopComingSoonBody` | string | no | soft copy | Shop empty-state body |
| `contactEmpty` | string | no | honest incomplete copy | Contact empty/incomplete state |
| `aboutTitle` | string | no | existing | Secondary entry label |
| `discographyTitle` | string | no | existing | Secondary entry label |
| `infoTitle` / legal pills | string | no | existing | Legal path labels (FR-011) |
| `socialsLabel` / `socialsIcon` | | | existing | Mobile Links / side socials a11y |

Existing player / jukebox chrome fields remain owned by `021` / prior
specs — do not redefine here.

## Entity: SideSocialLink

Derived from existing `site.json` → `channels[]` (`id`, `label`, `url`,
`status`).

| Rule | Value |
| ---- | ----- |
| Active channels | Shown in laptop side zone and phone Links pattern |
| Inactive / missing URL | Omitted (existing channel rules) |
| Mount count | Exactly **one** `Channels` tree (preserve `015` park pattern) |

## Entity: SecondaryContentEntry

About, Discography, Info/legal — still content-backed; **not** primary
circular side chrome.

| Entry | Content source | Rest chrome |
| ----- | -------------- | ----------- |
| About | `src/content/about/me.md` | Quiet text / secondary link |
| Discography | catalog / discography components | Quiet text / secondary link |
| Legal / Info | existing legal overlay + chrome pills | Reachable via Contact or explicit legal entry (FR-011) |

## Entity: TopNavLayout (presentation)

Visit-only CSS/DOM state — no persistence.

| Concern | Rule |
| ------- | ---- |
| Breakpoint | Phone ≤1023px; laptop ≥1024px |
| Narrow phone | Menu wraps or uses overflow control; no page horizontal scroll |
| Open panels | Top nav remains usable; center stage focus when panels close |
| No-JS | Primary `href`s still work |

## Validation

- `shopUrl` if present MUST be absolute `http(s)` URL.
- Nav label strings MUST be non-empty after trim (fallback to defaults).
- Shows empty list → Tour still opens with `emptyShows`.
- Legal overlay entry points MUST remain present after circular dock removal.
