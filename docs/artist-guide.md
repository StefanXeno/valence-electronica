# Artist guide — what you can change

This guide is for **you** (Valence) to update the public website without touching layout
or code. It is the **authoritative** list of what you may edit and what you must leave to
the developer. The [README](../README.md) points here; if anything conflicts, **this guide
wins**.

---

## What you may change

Each item below is a **content surface** — a file or folder you can edit yourself. Change
the file, open a pull request into `pre-release`, and merge it (see [How to publish](#how-to-publish-primary)).

### Site identity and channels

**File:** [`src/data/site.json`](../src/data/site.json)

**Controls:** Artist name, tagline, short description, location, SEO title, and social /
streaming links (Bandcamp, SoundCloud, YouTube, etc.).

**Tips:**

- Under `channels`, set `"status": "active"` with a `"url"` for a real link.
- Set `"status": "placeholder"` to show a “coming soon” chip without a link.
- Set `"seo": { "indexable": true }` when you are ready for search engines to index the site
  (keep `false` while the site is still private / under construction).

**Do not break:** Channel `id` values are stable references — do not rename them without
developer help.

---

### Jukebox entries (stage records, lyrics, media)

**Folder:** [`src/content/jukebox/`](../src/content/jukebox/)

**Controls:** Each Markdown file is one stage record (atmosphere, theme, lyrics). The
filename slug is the stable id (e.g. `nightmare.md` → `nightmare`).

**Frontmatter you may edit:**

- `label` — name shown in the jukebox (required)
- `themeId` — visual mood (see [Theme packs](#theme-packs-selection-only); use only listed ids)
- `hasAudio` — whether mute/unmute applies
- `default: true` — exactly **one** usable entry should have this (static fallback when no
  schedule rule matches)
- `poster` (required), `sources` — paths to images/video under `public/`, always starting with
  `/` (see [Media assets](#media-assets))
- `sortDate` — release date shown in **Track info** and used for **Discography** year (ISO
  date, e.g. `2025-06-01`). Required for both panels; omit → track still works on stage but
  is hidden from discography and track-info release line
- `kind` — optional release type in discography (e.g. `single`, `ep`, `album`)
- `inDiscography` — optional; set `false` to hide from discography while keeping `sortDate`
  for track info
- `themeId` — visual mood for this track on stage; ties the release to its theme pack (see
  [Theme packs](#theme-packs-selection-only))
- `listenLinks` — optional outbound links (`platform`: `bandcamp`, `spotify`, `youtube`,
  `soundcloud`, or `tidal`; `url` must start with `https://`). Used in Track info; discography
  title link uses Bandcamp first, then Spotify, then other platforms

**Body:** Lyrics for that record (leave empty for instrumentals).

**Do not break:** Do not rename the file slug (`nightmare`, `infinite`, etc.) unless a
developer updates every reference (releases, schedule, etc.).

---

### About (bio)

**File:** [`src/content/about/me.md`](../src/content/about/me.md)

**Controls:** Short artist bio. An empty or missing body hides the About control on the site.

---

### Discography

**Source:** Same files as jukebox — [`src/content/jukebox/`](../src/content/jukebox/). One
Markdown file per release/track. No separate `releases/` folder.

**What appears in the Discography panel:**

- Every jukebox file with a `sortDate` (unless `inDiscography: false`)
- **Title** ← `label`
- **Year** ← year from `sortDate`
- **Kind** ← optional `kind` (e.g. `single`, `ep`)
- **Title link** ← first `listenLinks` URL (Bandcamp preferred, then Spotify, etc.)
- **Play on V-Flip** ← automatic when the file is a valid stage entry (poster + optional video)

**Example EP without a stage clip:** use a jukebox file with `poster` only and no `sources`.

---

### Releases folder (deprecated)

The folder [`src/content/releases/`](../src/content/releases/) is **no longer used** by the
site. Edit jukebox files instead. You can delete old release files after migrating any data
into the matching jukebox entry.

---

### Shows (upcoming dates)

**Folder:** [`src/content/shows/`](../src/content/shows/)

**Controls:** Gig rows: `date`, `city`, `venue` (all required), optional `ticketUrl`. Past dates
(Europe/Berlin) are hidden automatically.

**Tips:**

- A row missing `date`, `city`, or `venue` **fails the build** and names the file — nothing
  disappears silently. Fix the file and push again.
- `ticketUrl` must be a full address including `https://`.
- You can ship with no show files — the site shows empty-state copy.

---

### UI chrome (labels and intro copy)

**File:** [`src/content/ui/chrome.md`](../src/content/ui/chrome.md)

**Controls:** Region titles, empty-state strings, jukebox/social labels, stage-button label,
landing intro copy (`introLead`, `introName`), and optional **HUD icon overrides**
(`jukeboxIcon`, `aboutIcon`, `lyricsIcon`, `discographyIcon`, `tourIcon`, `trackInfoIcon`,
`shuffleIcon`, `loopIcon`).

**V-Flip player chrome (optional):**

- `shuffleLabel` / `loopLabel` — transport toggle labels (default: Shuffle / Loop)
- `shuffleDefault` — `true` (default) or `false` for load-time shuffle
- `loopDefault` — `false` (default) or `true` for load-time loop
- `unmuteTooltip` / `muteTooltip` — mute button hint when collapsed or open
- `volumeSliderTooltip` — hint on the volume slider (default: Drag to adjust volume)

**Track info in V-Flip (optional):**

- `trackInfoTitle` — section heading inside open V-Flip (default: Track info)
- `releasedLabel` — label before the release date (default: Released)
- `emptyTrackLinks` — when a track has no `listenLinks`
- `lyricsTitle` / `emptyLyrics` — lyrics section heading and empty copy inside V-Flip

**Icon overrides (optional):**

- Leave an `*Icon` field out to use the default pictogram for that control.
- Set a **token** to pick a built-in icon: `jukebox`, `about`, `lyrics`, `discography`,
  `tour`, `catalog`, `info`, `shuffle`, or `loop`.
- Set a **single emoji** (e.g. `lyricsIcon: "🎤"`) to show that character instead of the
  default pictogram.

**Do not break:** Region title fields still control readable labels and accessibility.
Lyrics and track info appear **inside open V-Flip**, not as separate right-dock icons.

**Shuffle timing:** When shuffle is on and loop is off, the stage advances after **one full
atmosphere video file length** for audio entries (`hasAudio: true`). Entries with no audio
advance after **45 seconds**. Today’s short loop-bed mp4s hop on file length until you ship
longer stage videos.

**Label reveal (visitor-facing):** Dock icons show a floating label **above** the control on
hover/focus. Mute/volume inside V-Flip uses the same floater for tooltips. Social icons show
the label **below**.

---

### Legal pages

**Folder:** [`src/content/legal/`](../src/content/legal/)

**Files:** `imprint.md` (Impressum), `privacy.md` (Datenschutzerklärung)

**Controls:** Legally required texts for a German public presence. Write the content in
**German** where the law requires it; this guide stays in English.

**Important:** Both files are currently placeholders. **Replace them with real information
before you promote the site publicly.** This is not legal advice — ask a lawyer if you are
unsure what to include.

---

### Stage schedule (landing default by date)

**File:** [`src/data/stage-schedule.json`](../src/data/stage-schedule.json)

**Controls:** Which jukebox entry is the **landing default** on given dates, ranges, or
weekdays (Europe/Berlin calendar).

**Deep how-to:** [`docs/stage-schedule.md`](stage-schedule.md) — use that guide for rule
syntax and examples. Here: edit **only** this JSON file to retime defaults; run
`npm run check` after edits.

---

### Tagline pool (rotating subtext)

**File:** [`src/data/tagline-pool.json`](../src/data/tagline-pool.json)

**Controls:** Short hooks under the Valence wordmark. The site rotates through **normal**
lines every **60 seconds** (fade out, then fade in). **Easter-egg** lines with schedule
rules can replace the normal pool on matching days or times (Europe/Berlin).

**Fallback:** If nothing matches, the site shows `artist.tagline` from
[`src/data/site.json`](../src/data/site.json) (also used when JavaScript is off).

**Rule syntax:** [`specs/012-rotating-tagline/contracts/tagline-pool.md`](../specs/012-rotating-tagline/contracts/tagline-pool.md)

**Tips:**

- Normal line: `{ "text": "Your hook." }` — optional `"weight": 2` for more airtime per cycle.
- Easter egg: add `"rules": [ … ]` (date, range, weekday, and/or time windows).
- Keep hooks short (one line on desktop). Run `npm run check` after edits.

---

### Media assets

**Folders:**

- [`public/images/`](../public/images/) — posters and stills (e.g. `public/images/posters/`)
- [`public/videos/`](../public/videos/) — looping background videos

**Controls:** Files referenced from jukebox frontmatter (`poster`, `sources`).

**Tips:**

- Use paths like `/images/posters/nightmare.jpg` or `/videos/nightmare.mp4` in jukebox Markdown.
- Prefer reasonably sized images and compressed video. **Oversized or wrong-format media
  slows the site down** for fans on mobile — when in doubt, ask the developer to optimize.
- Common formats: JPEG/WebP/SVG for posters; MP4 for video.

---

## Theme packs (selection only)

You may set `themeId` on a jukebox entry to any **complete** pack below. Each id has
matching registry and CSS in the codebase — do not invent new ids.

| `themeId` | Mood (short) |
|-----------|----------------|
| `default` | Neutral fallback |
| `nightmare-crimson` | Red / horror loop (video + audio + HUD glitch) |
| `cyan-pulse` | Cyan still / pulse (no video loop) |
| `electric-cyan` | Teal glitch loop (video + audio) |
| `acid-lime` | Lime / acid loop (video + audio) |

**Developer only:** Creating or editing theme packs (`src/lib/theme-packs.ts`,
`src/styles/themes.css`). Ask the developer for a new visual mood.

Unknown or incomplete `themeId` values warn at build and fall back to `default` at runtime.

---

## What you must not change

These are **developer-owned**. Editing them can break the build or the live site.

| Area | Examples | Why |
|------|----------|-----|
| Layout and components | `src/components/`, `src/layouts/` | Page structure and behavior |
| Styles and effects | `src/styles/`, `src/styles/glitch.css` | Visual system and animations |
| Theme pack registry | `src/lib/theme-packs.ts`, theme CSS in `src/styles/themes.css` | Capabilities and colors tied to code |
| App logic under `src/lib/` | `background.ts`, `stage*.ts`, `glitch.ts`, `intro.ts`, … | Stage, schedule, glitch, intro helpers (not content) |
| Build and config | `astro.config.mjs`, `package.json`, `tsconfig.json` | Tooling and deploy settings |
| CI / deploy | `.github/workflows/` | Automated build and GitHub Pages |
| Specs and plans | `specs/`, `.specify/` | Developer workflow (not artist content) |

---

## Stable ids — do not rename casually

Without developer help, **do not rename**:

- Jukebox **filename slugs** (`nightmare.md`, etc.)
- **`themeId`** values (only pick from the table above)
- **`jukeboxId`** on releases or schedule rules
- Legal **file slugs** (`imprint.md`, `privacy.md`)
- Channel **`id`** values in `site.json`

Renaming breaks links between content files until a developer updates all references.

---

## Integration vs release

Two different steps — easy to confuse:

| Term | Branch | What it means |
|------|--------|----------------|
| **Integration** | `pre-release` | Your content PR lands here. CI runs; **the public site does not change yet**. |
| **Release (go live)** | `main` | Merging here deploys to the **live** public site (GitHub Pages). |

Constitution rule: only **`main`** updates what fans see. If a build fails, the **last
successful live version stays online**.

### Seeing your changes before release

A few minutes after your PR lands on `pre-release`, your changes appear at the **preview
address**:

`https://stefanxeno.github.io/valence-electronica/pre-release/`

That page is the `pre-release` branch — it is your rehearsal stage. It is hidden from
Google and is **not** what fans see. The live address stays unchanged until `main` is
updated.

If the preview shows an old version or a “404”, the last `pre-release` build failed. Check
the red ✗ in the Actions tab, or ask the developer.

---

## How to edit (primary)

Use the **GitHub website** — no install required.

1. Open the repository on GitHub.
2. Navigate to the file you need (see [What you may change](#what-you-may-change)).
3. Click the pencil (**Edit this file**).
4. Make your changes.
5. Choose **Commit changes…** and commit to a **new branch** (not directly to `pre-release`
   unless you know what you are doing).
6. Continue to [How to publish](#how-to-publish-primary) to open a pull request.

---

## How to publish (primary)

Goal: merge your content into **`pre-release`** (integration).

1. After committing to a branch, GitHub offers **Compare & pull request** — open it.
2. Set the **base** branch to **`pre-release`** (not `main` for routine content).
3. Describe what you changed in plain language.
4. Create the pull request.
5. When checks pass (if shown), **Merge pull request** into `pre-release`.

You do **not** need the developer for this step on routine content updates.

**Normal path is not** opening content PRs directly into `main`. Content goes to
`pre-release` first.

---

## How to go live (secondary)

When integrated content on `pre-release` should become **public**:

1. Open a **new pull request** on GitHub.
2. Set **base** to **`main`** and **compare** to **`pre-release`**.
3. Review the diff (content-only changes you expect).
4. Merge when ready.

Either **you or the developer** may perform this merge — whichever you agree on.

**If the build fails after merging to `main`:** the live site keeps showing the **last
good deployed version**. Fix the issue on a branch → PR to `pre-release` again, or ask the
developer for help. Integration on `pre-release` alone never changed the live site.

There is no special “promote button” in this repo — just a normal GitHub PR from
`pre-release` to `main`.

---

## Optional: local preview

If you want to **see changes on your computer** before publishing (recommended for big
updates, but not required):

**Requires:** Node.js 22+ (LTS) installed locally.

```bash
git clone <repository-url>
cd valence-electronica
npm install          # once
npm run dev          # site at http://localhost:4321/valence-electronica/
npm run check        # validate content (same as CI)
```

Edit files locally, refresh the browser, then commit and push your branch and follow the
[publish steps](#how-to-publish-primary).

Skipping local preview is OK — you rely on GitHub/CI feedback after merge. If the build
fails, ask the developer.

---

## When to ask the developer

- Stuck on GitHub, branches, or pull requests (including `pre-release` → `main`).
- Build or deploy fails and you are not sure why.
- You want a **new theme pack** or layout/visual change.
- You need to **rename ids** or add a feature that is not in [What you may change](#what-you-may-change).
- Media needs heavy compression or a new format.

Routine text, links, shows, releases, jukebox lyrics, schedule rules, and channel updates
should not require the developer if you follow this guide.

---

## Topic guides

Some areas have a **deeper how-to** (this hub stays the inventory; details live there):

| Topic | Guide |
|-------|--------|
| Stage schedule rules | [`docs/stage-schedule.md`](stage-schedule.md) |
| Tagline pool (rotating subtext) | [`specs/012-rotating-tagline/contracts/tagline-pool.md`](../specs/012-rotating-tagline/contracts/tagline-pool.md) |

When a topic guide and this hub mention the same file, use the **same path** — the topic
guide owns step-by-step detail.

---

## Maintainer note (for developers and future you)

When **any feature** adds, removes, or moves an artist-editable surface, **update this
guide in the same change set** (project constitution Principle VII). Otherwise the safe-edit
map drifts and you will need the developer for every small update again.
