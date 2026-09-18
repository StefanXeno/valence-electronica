# Data Model: Stage Artist Polish

**Date**: 2026-09-18 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

Extends jukebox stage-bed content and theme presentation. Catalog
**membership** model (`010`) unchanged — this feature adds dual-video
obligation and presentation fields for V-Flip-available beds.

## Entity: StageEntryPresentation (jukebox entry extended)

File pattern: `src/content/jukebox/*.md`  
Schema: `src/content.config.ts` (`jukebox` collection)

| Field | Type | Required | Description |
| ----- | ---- | -------- | ----------- |
| `label` | string | yes | Existing |
| `themeId` | ThemePackId | no | Existing — Taking Over brightness may retune pack CSS |
| `hasAudio` | boolean | no | Show me How MUST be true with real music bed (FR-001) |
| `poster` | public path | yes | Existing; may later split per viewport if needed (not required) |
| `sourcesMobile` | MediaSource[] | yes* | Atmosphere sources for ≤1023px |
| `sourcesDesktop` | MediaSource[] | yes* | Atmosphere sources for ≥1024px |
| `centerLogo` | public path | no | When set, show center-stage logo while entry active |
| `listenLinks` | … | no | Existing |

\*For every entry offered as a V-Flip / song-selection stage bed. Incomplete
dual-video → omit from selectable stage and/or fail maintainer validation.

**Migration**: Replace legacy single `sources[]` with both viewport arrays
(content update for nightmare, infinite, taking-over, show-me-how, …).

### Validation rules

- If selectable stage bed: `sourcesMobile.length ≥ 1` AND
  `sourcesDesktop.length ≥ 1`.
- Do **not** treat “only one array filled” as dual-video complete.
- `hasAudio: true` implies playable audio in the **active** viewport’s
  video bed (embedded audio as today).
- `centerLogo` only with owner-approved asset path.

## Entity: ViewportAtmosphereBinding (derived)

| Input | Output |
| ----- | ------ |
| width ≤ 1023px | `sourcesMobile` (+ poster) |
| width ≥ 1024px | `sourcesDesktop` (+ poster) |
| resize across split | Re-resolve and load the other viewport’s sources |
| reduced motion / poster fallback | Still pick the viewport-correct asset identity |

## Entity: BackgroundVideo (loader extended)

`src/lib/background.ts` / catalog JSON embedded for client:

| Field | Change |
| ----- | ------ |
| `sources` | **Deprecated** as sole list — replace with `sourcesMobile` + `sourcesDesktop` (or resolver returns viewport sources) |
| `hasAudio` | Unchanged rule: flag ∧ sources present for eligibility |
| `themeId` | Unchanged |

Client `stage-switch.ts` MUST call a viewport-aware loader — never assume
one shared file for both breakpoints.

## Entity: CenterStageLogo

| Field | Type | Notes |
| ----- | ---- | ----- |
| `src` | public path | From active entry `centerLogo` |
| `visible` | boolean | true only when field set on active entry |
| `blocksChrome` | const false | Pointer-events / layout must leave nav/player usable |

## Entity: ShuffleControlAffordance

| Concern | Rule |
| ------- | ---- |
| Behavior | Existing on/off toggle |
| Visual | New glyph/treatment (HudIcon token and/or chrome `shuffleIcon`) |
| State | Clear `aria-pressed` pressed/unpressed |

## Entity: DecorativeSpriteLayer

| Concern | Rule |
| ------- | ---- |
| Visitor-facing | **Absent** (count zero) |
| Repo assets | May remain unused; no mandatory file purge |

## Entity: ThemeBrightness (Taking Over)

| Concern | Rule |
| ------- | ---- |
| Target | Taking Over active theme/UI reads brighter than pre-change |
| Mechanism | Theme CSS tokens (`themes.css` / pack) — developer-owned surface; document in artist guide that pack CSS is not artist-edited |
| A11y | Contrast for text/controls still sufficient (FR-009) |

## Out of model

- In-product media trim/cut tooling (FR-011)
- Full `005` / `010` redesign beyond dual-video pairing
