---
name: add-theme
description: Add a new stage theme (jukebox entry + looping video, music loop, poster, cover, colour pack) from raw files dropped in tmp/. Use when the operator says they put a song's video / wav / artwork into tmp/ and wants it on the site, or asks for a new theme / main theme / stage loop.
argument-hint: "Song name, and optionally: main theme yes/no, raw file names in tmp/"
user-invocable: true
---

# Add a stage theme

Turns raw material in `tmp/` (gitignored) into a finished stage theme: a jukebox entry
with a looping music video, its own colour pack, poster, cover and song metadata.
Reference implementation: commit `feat(stage): WannaCry (Valence Flip) as the landing theme`
(`git log --grep WannaCry`).

Arguments: `$ARGUMENTS`

Follow `.claude/rules/operator-workflow.md`: no package installs, no browser automation.
Everything below runs on what is already there (`ffmpeg` with libsvtav1/libx264/libopus,
ImageMagick `magick`, stdlib `python3 -I`). Commit only, never push.

## 0. Inventory

```bash
ls -la tmp/
python3 -I .claude/skills/add-theme/scripts/analyze_video.py "tmp/<loop>.mp4" --bpm 120   # bpm is a placeholder for now
```

Typical drop: a `… Website Loop.mp4` (often with a **silent** audio track), a master
`.wav`, and square artwork (`.png`). The operator may call the artwork "poster", but in
this codebase:

| Codebase field | What it is | Source |
|---|---|---|
| `poster` | 16:9 still shown before the video plays / as fallback | first frame of the loop |
| `cover` | square artwork in the discography and player | the artwork PNG |

Look at the artwork and a contact sheet of the video before deciding anything:

```bash
magick "tmp/<art>.png" -resize 600x600 <scratch>/art.png
ffmpeg -v error -y -i "tmp/<loop>.mp4" -vf "fps=1/2,scale=384:-1,tile=5x2" -frames:v 1 <scratch>/contact.png
```

## 1. Song facts (web)

Search for the release before writing the entry. Good sources, in order:

1. `https://valenceelectronica.bandcamp.com/music` → the track page (title, release date,
   credits, tags). SoundCloud and YouTube pages do not render for WebFetch.
2. For a remix / flip: the original's Wikipedia page or press (original artists, label,
   concept) — used for `credits` and the `blurb`.
3. Only add `listenLinks` you actually verified. List the missing platforms in the final
   report so the operator can add them.

## 2. Find the loop

```bash
python3 -I .claude/skills/add-theme/scripts/analyze_song.py "tmp/<master>.wav"
python3 -I .claude/skills/add-theme/scripts/analyze_video.py "tmp/<loop>.mp4" --bpm <BPM>
```

- `analyze_song.py` gives BPM (snapped to an integer when close), the downbeat phase,
  a per-bar table (F = full band, L = sub-bass dB) and drop candidates.
- `analyze_video.py` tells how many bars the video spans (website loops are usually cut
  to exactly 8 or 16 bars) and lists hard cuts with their bar position.

Then rank seams — **this decides the loop**, not the video's cuts:

```bash
python3 -I .claude/skills/add-theme/scripts/find_seam.py "tmp/<master>.wav" \
  --bpm <BPM> --downbeat <downbeat phase> --loop-bars <video bars>
```

Rules (learned on WannaCry, where the first version was audibly looping):

- The audio loop is its own loop; it does **not** need to follow the video's dramaturgy
  (operator: video and audio looping independently is fine, nobody notices). Do not put
  a drop on a video cut at the cost of the seam.
- Never wrap from a drop back into a build-up / pre-drop part — the energy and melody
  change gives the loop away. Loop *inside* one loud section.
- Pick the lowest score among loud rows (sub-bass near the drop level). Score ≲ 1 is
  smooth; the rejected WannaCry build→drop loop scored 2.7, the shipped one 0.79.
- Half-length sections played twice (`--bars 8 --repeat 2` for a 16-bar video) often win:
  drops repeat 8-bar phrases, so the wrap equals a transition the song itself makes.
- Prefer starts on 4/8-bar phrase boundaries of the drop when scores are close.
- `--start` must be the exact downbeat (no offsets to line up with video cuts — that put
  a pre-phrase bass gap at every WannaCry wrap).
- Compare the sub-bass right after the loop's start downbeat with the song's real
  continuation after the loop end. If the end bar rings over (bass sustaining into the
  next bar) but the start bar does not (it follows a gap in the song), find the first hit
  after the downbeat (5 ms peak scan) and set `--seam-hold` + `--xfade` to end just
  before it (WannaCry: hit at 155 ms → `--seam-hold 0.115 --xfade 0.035`).

The build script makes the audio sample-exact for each codec (no AAC/Opus end padding,
which would be a short silence at every browser loop) and stretches the video by a few
ms to the same length; it prints `decoded … expected …` — both must match.

Check the wrap of the final file (level before/after and the biggest sample step at the
seam vs. a typical step; no trailing silence):

```bash
python3 -I - <<'PY'
import array, math, subprocess
for p in ('public/videos/<slug>.mp4', 'public/videos/<slug>-av1.mp4'):
    a = array.array('h'); a.frombytes(subprocess.run(['ffmpeg','-v','error','-i',p,'-vn','-ac','1','-ar','48000','-f','s16le','-'], capture_output=True).stdout)
    db = lambda x: 20*math.log10(max(1, math.sqrt(sum(v*v for v in x)/len(x)))/32768)
    n = len(a); wrap = a[n-4800:] + a[:4800]; hp = [abs(wrap[i]-wrap[i-1]) for i in range(1, len(wrap))]
    print(p, 'last 2s %.1f dB -> first 2s %.1f dB' % (db(a[-96000:]), db(a[:96000])),
          '| seam step', max(hp[4752:4848]), 'vs 99th pct', sorted(hp)[int(len(hp)*.99)])
PY
```

## 3. Build the media

```bash
python3 -I .claude/skills/add-theme/scripts/build_theme_media.py \
  --slug <slug> --video "tmp/<loop>.mp4" --audio "tmp/<master>.wav" \
  --bpm <BPM> --bars <N> [--repeat 2] --start <seconds> [--seam-hold s --xfade s] \
  --cover "tmp/<art>.png"
```

It writes `public/videos/<slug>-av1.mp4` (AV1/Opus), `public/videos/<slug>.mp4`
(H.264/AAC fallback), `public/images/posters/<slug>.jpg`, `public/images/covers/<slug>.webp`
and prints the exact `sources:` block for the jukebox entry.

Size targets: the stage video sits under a ~70 % scrim, so compress hard. Look at the
result (extract a frame from a busy and a calm moment and Read the PNG) and tune:

- Busy glitch / particle footage (WannaCry): 960 px, AV1 CRF 50 ≈ 3.4 MB, H.264 CRF 31 ≈ 4.2 MB for 22 s.
- Calm footage: try `--width 1280 --av1-crf 40 --h264-crf 28`; aim for ≤ ~150 KB/s.
- Keep the AV1 file first in `sources` — browsers without AV1 skip to the H.264 file via the
  `codecs=` type.

Do not commit anything from `tmp/`.

## 4. Colour pack

Sample the artwork (and the poster frame) rather than guessing:

```bash
magick "tmp/<art>.png" -crop 30x60+X+Y -resize 1x1\! -format "%[hex:p{0,0}]\n" info:   # point samples
magick "tmp/<art>.png" -alpha off +dither -colors 10 -format %c histogram:info: | sort -rn
```

All packs are dark with light text: take the dominant hue of artwork + video for a very
dark `--color-bg`, a recognisable artwork colour for `--color-accent`, a second artwork
colour for `--color-accent-alt`, and a scrim that tints toward the bg. Name the pack by
colour mood (`ransom-blue`, `acid-lime`, …), not by song. Reusing an existing pack is fine
if it already fits.

Files (all three, same id):

1. `src/lib/theme-packs.ts` — add to `ThemePackId`, `PACK_CSS_THEME_IDS`, `THEME_PACKS`
   (`loopingVideo: true`, `audioEligible: true`; `hudGlitch: true` only for glitchy themes).
2. `src/styles/themes.css` — `[data-theme='<id>'] { … }` with a comment saying what it was
   sampled from. Insert before `html[data-stage-crossfade='smooth']`.
3. `docs/artist-guide.md` — row in the theme-pack table.

## 5. Content

`src/content/jukebox/<slug>.md` (slug = file name = id; never rename later):

```yaml
---
label: <Title as released>            # e.g. "WannaCry (Valence Flip)"
sortDate: <YYYY-MM-DD release date>
kind: Single
blurb: <one line hook>
themeId: <pack id>
hasAudio: true
poster: /images/posters/<slug>.jpg
cover: /images/covers/<slug>.webp
default: true                          # only when it becomes the main theme
credits:                               # remixes / flips: the original artists
  - role: Artist
    name: <Original Artist(s)>
listenLinks:
  - platform: bandcamp
    url: https://valenceelectronica.bandcamp.com/track/<…>
sources:                               # paste from the build script output
  - src: /videos/<slug>-av1.mp4
    type: video/mp4; codecs="av01.0.04M.08, opus"
  - src: /videos/<slug>.mp4
    type: video/mp4
---

Lyrics not on stage yet.
```

**Main theme** (first visit lands on it): move `default: true` — exactly one jukebox
entry may have it, so delete it from the previous default. Update
"(today: …)" in `docs/stage-schedule.md`. Schedule rules in `src/data/stage-schedule.json`
still win on their days; mention the active ones to the operator.

If the song id is used in `src/data/stage-schedule.json`, add it to the catalog set in
the "accepts the shipped schedule" test in `src/lib/stage-schedule.test.ts`.

## 6. Extras worth offering

Only where they fit the song; say what you added:

- A tagline in `src/data/tagline-pool.json` quoting or riffing on the song (existing
  examples: "I feel it taking over...", "A fu**ing nightmare…").
- A yearly schedule rule for a date tied to the song (WannaCry → `05-12`, the 2017 attack).
- `hudGlitch` for glitch-heavy visuals.

Keep the JSON formatting as is (`"days": [5]` on one line) — re-serialising with
`json.dumps(indent=2)` expands arrays, so restore them or edit textually.

## 7. Verify and commit

```bash
npm test
npm run build          # astro check + build + secrets check; must show 0 errors / 0 warnings
grep -o '<source[^>]*>' dist/index.html     # main theme: new sources are in the landing HTML
```

Browser/visual checks (loop seam, colours, glitch): do not automate. Tell the operator what
to look at on `npm run dev` (`/?replay-intro` replays the intro) and on `/pre-release/`
after they push.

One commit, Conventional style like the history
(`feat(stage): <Song> as the landing theme` / `feat(stage): <Song> stage theme`), body with
loop math (BPM, bars × repeat, start, seam score), media sizes, pack colours and extras. Do not push.

Final report to the operator (German): what was added, the loop choice and why, file
sizes, theme colours, verified facts with sources, and what is missing (unverified
platform links, real lyrics).
