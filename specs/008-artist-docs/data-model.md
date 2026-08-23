# Data Model: Artist Change Documentation

**Date**: 2026-08-23 | **Plan**: [plan.md](./plan.md)

Conceptual model for the documentation system (not a runtime database).

## Entities

### Artist-facing guide (hub)

| Attribute | Description |
|-----------|-------------|
| Path | `docs/artist-guide.md` (canonical) |
| Audience | Artist (non-programmer); developer reads maintenance note |
| Authority | Authoritative for edit boundaries and publish flow vs README |
| Sections | See [contracts/artist-guide.md](./contracts/artist-guide.md) |

### Editable surface

| Attribute | Description |
|-----------|-------------|
| Name | Human label (e.g. “Channels / site info”) |
| Path | Repo path(s) to edit |
| Controls | What changes on the public site |
| Rules | Critical constraints (stable ids, formats, links to topic guides) |
| themeId note | For jukebox: may set only to listed complete pack ids |

### Developer-owned surface

| Attribute | Description |
|-----------|-------------|
| Name | Human label |
| Path | Example paths (components, styles, theme-pack registry, build, CI) |
| Reason | Why artist must not edit |

### Topic-specific operator guide

| Attribute | Description |
|-----------|-------------|
| Path | e.g. `docs/stage-schedule.md` |
| Owns | Deep how-to for one surface |
| Hub relation | Linked from hub inventory; must not contradict hub paths |

### Publish path (documented process)

| Stage | Actor | Target | Mechanism |
|-------|-------|--------|-----------|
| Content PR | Artist (default) | `pre-release` | GitHub web (primary) or local git (secondary) |
| Promote | Artist and/or developer | `main` | Normal GitHub PR `pre-release` → `main` (docs only) |
| Live deploy | Automation | GitHub Pages | On successful build of `main` |

## Relationships

```text
Artist-facing guide
  ├── lists many Editable surfaces
  ├── lists many Developer-owned surfaces
  ├── links to Topic-specific operator guides
  ├── documents Publish path (2 stages + optional local preview)
  └── contains Maintainer note → future features MUST update hub

README
  └── points to Artist-facing guide (not a second full inventory)
```

## Validation rules (documentation)

1. Every artist-editable content/data/media root present at ship time appears as an
   Editable surface (SC-004).
2. `themeId` selection is an Editable-surface rule on jukebox; pack authoring is
   Developer-owned.
3. No Editable surface path may also be listed as safe under Developer-owned without
   explicit “read-only / do not edit” wording.
4. Topic guides linked from the hub must use the same paths for the same surfaces.
5. Publish path must not instruct merging routine content PRs directly into `main`.

## State transitions

None at runtime. Document lifecycle: draft → reviewed against contract → merged with
feature; thereafter updated in same change set as surface changes (Principle VII).
