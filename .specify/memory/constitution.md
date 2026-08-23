<!--
Sync Impact Report
==================
Version change: 1.0.0 → 1.1.0
Modified principles: none renamed
Added sections:
  - Core Principles VII. Artist-Facing Change Documentation
Removed sections: none
Follow-up TODOs:
  - Author or promote a dedicated artist guide (beyond README "Editing content")
    when implementing this principle as a feature
-->

# Valence Artist Website Constitution

## Core Principles

### I. Static-First Delivery

Every deployable artifact MUST consist of prerendered static files (HTML, CSS, JS, assets).
The site MUST NOT depend on servers, databases, serverless functions, or any other runtime
backend. Features that cannot be delivered statically are out of scope and MUST be rejected
or redesigned.

Rationale: The project exists to run with zero infrastructure effort; any runtime dependency
breaks that promise permanently.

### II. Zero-Cost, Zero-Ops Publishing

Hosting and CI MUST run on free tiers (GitHub Pages, GitHub Actions). Publishing MUST be
fully automated: merging to `main` is the only manual step required to release. A failed
build or deployment MUST never take the live site down; the last successful version stays
online. Paid services or accounts require explicit approval by the project owner.

Rationale: Neither the developer nor the artist should ever have to operate or pay for
infrastructure.

### III. Content-Code Separation

All user-facing content (artist info, taglines, platform links, releases, gigs, legal texts)
MUST live in structured content or data files, separate from layout and logic. Updating or
replacing a piece of content (including placeholders) MUST require a change in exactly one
place and MUST NOT require touching components, styles, or build configuration.

Rationale: The artist must eventually be able to maintain content himself without
programming knowledge.

### IV. Lightweight by Default

Client-side JavaScript MUST NOT be shipped unless a feature is impossible without it; any
exception MUST be justified in the feature's plan. Pages MUST use semantic HTML, MUST be
responsive from 320px viewport width up without horizontal scrolling, and MUST remain usable
on an average mobile connection in under 2 seconds. Accessibility basics (sufficient
contrast, alt texts, keyboard navigation) are mandatory, not optional polish.

Rationale: Fans arrive on mobile via social media links; speed and accessibility directly
decide whether they stay.

### V. Privacy & Legal Compliance

The site MUST NOT include tracking, analytics, or cookies by default. Any third-party embed
(e.g. streaming players) MUST be explicitly approved by the project owner and reflected in
the privacy policy before going live. An Impressum and a Datenschutzerklärung MUST be
reachable from every page, as required by German law.

Rationale: The site represents a German artist publicly; legal compliance failures create
personal liability for him.

### VI. Simplicity & Spec-Driven Change

Every feature MUST follow the spec-kit workflow (specify → plan → tasks → implement) before
implementation. Solutions MUST be the simplest that satisfy the spec (YAGNI); speculative
features, premature abstractions, and dependencies not required by an approved plan are
forbidden.

Rationale: A small hobby project stays maintainable only if scope and complexity are
guarded at every step.

### VII. Artist-Facing Change Documentation

The project MUST maintain artist-facing documentation that states, in plain language:

1. What the artist MAY change himself (content files, data files, media assets, and any
   other approved edit surfaces).
2. What the artist MUST NOT change (layout, components, styles, build config, theme-pack
   registry, and other developer-owned surfaces).
3. How to preview changes locally and how a change reaches the live site.

When a feature adds or removes an artist-editable surface, that feature's plan and
implementation MUST update the artist-facing documentation in the same change set. The
documentation MUST be accurate enough that the artist can perform routine updates without
asking a developer which files to touch.

Rationale: Content-code separation only works if the artist knows the safe edit boundary;
undocumented surfaces force developer involvement for every content change.

## Additional Constraints

- All repository artifacts — code, comments, file names, branch names, commit messages,
  documentation, and specs — MUST be written in English.
- Website content language is English (the artist's audience and existing platform presence
  are international); German is used only where legally required (Impressum,
  Datenschutzerklärung).
- Commit messages MUST follow the Conventional Commits format.
- Feature branches MUST be named `NNN-short-name` in English, matching the spec directory.

## Development Workflow

- `main` MUST always be deployable; all work happens on feature branches.
- A feature's spec and plan MUST exist and pass their quality checklists before
  implementation starts.
- Implementation PRs/merges MUST be verified against the acceptance scenarios of the spec
  they implement.

## Governance

This constitution supersedes all other practices in this repository. Amendments are made by
editing this file with a semantic version bump (MAJOR: principle removals or redefinitions;
MINOR: new or materially expanded principles/sections; PATCH: clarifications) and an updated
Sync Impact Report. Every feature plan MUST include a constitution compliance check;
violations MUST be either resolved or explicitly justified and approved by the project owner
before implementation.

**Version**: 1.1.0 | **Ratified**: 2026-08-07 | **Last Amended**: 2026-08-23
