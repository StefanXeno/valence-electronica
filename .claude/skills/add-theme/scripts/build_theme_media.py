#!/usr/bin/env python3
"""Build every public/ asset for a stage theme from the raw files in tmp/.

    python3 -I .claude/skills/add-theme/scripts/build_theme_media.py \\
        --slug wannacry \\
        --video "tmp/WannaCry Website Loop.mp4" \\
        --audio "tmp/wannacry Master2.wav" \\
        --bpm 175 --bars 8 --repeat 2 --start 78.549 \\
        --cover "tmp/WannaCry Version 2.png"

Writes (relative to the repo root, or --out):
  public/videos/<slug>-av1.mp4        AV1 + Opus, first <source>
  public/videos/<slug>.mp4            H.264 + AAC fallback (Safari without AV1)
  public/images/posters/<slug>.jpg    first frame of the loop
  public/images/covers/<slug>.webp    square cover, 1400 px

Audio: `--bars` bars of the master from `--start` (pick both with find_seam.py), played
`--repeat` times, with a short crossfade at the seam into the audio just before `--start`
(click-free, rhythmically continuous). Each file's audio is resampled to a sample count
that fills whole codec frames (no end padding = no silence at the browser's loop point),
and the video is stretched by the same few ms. Omit --audio to keep the video's own
audio track; pass --no-audio for a silent loop.

Defaults match what shipped for WannaCry: 960x540, light denoise, AV1 CRF 50,
H.264 CRF 31. Stage video sits under a ~70 % scrim, so this is visually lossless there.
Calmer footage can go lower (better) on both CRFs for the same size.
"""
import argparse
import array
import os
import subprocess
import tempfile
import wave


def run(cmd):
    subprocess.run(cmd, check=True)


def probe_float(path, entry, stream='v:0'):
    out = subprocess.run(
        ['ffprobe', '-v', 'error', '-select_streams', stream, '-show_entries', entry, '-of', 'csv=p=0', path],
        check=True, capture_output=True, text=True,
    ).stdout.strip().split('\n')[0]
    if '/' in out:
        n, d = out.split('/')
        return int(n) / int(d)
    return float(out)


def decoded_samples(path):
    pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vn', '-ac', '1', '-ar', '48000',
                          '-f', 's16le', '-'], check=True, capture_output=True).stdout
    return len(pcm) // 2


def build_loop_wav(audio, start, length, xfade, workdir, repeat=1):
    seg = os.path.join(workdir, 'seg.wav')
    pre = min(xfade, start)
    run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{start - pre:.6f}', '-t', f'{length + pre:.6f}',
         '-i', audio, '-ac', '2', '-c:a', 'pcm_s16le', seg])
    with wave.open(seg) as w:
        sr = w.getframerate()
        data = array.array('h')
        data.frombytes(w.readframes(w.getnframes()))
    ch = 2
    n_pre = int(round(pre * sr))
    head, body = data[:n_pre * ch], data[n_pre * ch:]
    frames = len(body) // ch
    # Fade the loop's tail into the audio that precedes `start`: at the wrap the
    # listener hears exactly what the master plays right before the loop start.
    for i in range(n_pre):
        g = i / n_pre
        for c in range(ch):
            j = (frames - n_pre + i) * ch + c
            body[j] = int(body[j] * (1 - g) + head[i * ch + c] * g)
    body = body * repeat
    loop = os.path.join(workdir, 'loop.wav')
    with wave.open(loop, 'wb') as o:
        o.setnchannels(ch)
        o.setsampwidth(2)
        o.setframerate(sr)
        o.writeframes(body.tobytes())
    return loop, sr, frames * repeat / sr


# Encoder delay and frame size at 48 kHz (ffmpeg's native aac, libopus). An audio track of
# k * frame - delay samples needs no end padding, so the decoded track is exactly that long.
# Any padding would be heard as a short silence each time the browser loops the video.
CODEC_FRAMING = {'aac': (1024, 0), 'opus': (960, 312)}


def gapless_samples(codec, target_len):
    frame, delay = CODEC_FRAMING[codec]
    return round((target_len * 48000 + delay) / frame) * frame - delay


def fit_loop_wav(loop, sr, loop_len, samples, workdir, tag):
    """Resample the loop to exactly `samples` at 48 kHz.

    asetrate shifts tempo and pitch by the same tiny factor (~0.1 % = 2 cents): inaudible,
    artefact-free, and the loop stays bar-exact."""
    factor = loop_len / (samples / 48000)
    out = os.path.join(workdir, f'loop-{tag}.wav')
    run(['ffmpeg', '-v', 'error', '-y', '-i', loop, '-af',
         f'asetrate={sr}*{factor:.9f},aresample=48000,atrim=end_sample={samples},apad=whole_len={samples}',
         '-c:a', 'pcm_s16le', out])
    print(f'{tag}: audio loop {loop_len:.4f}s -> {samples} samples = {samples / 48000:.5f}s (rate x{factor:.6f})')
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--slug', required=True)
    ap.add_argument('--video', required=True)
    ap.add_argument('--audio', help='song master (wav); omit to keep the video audio')
    ap.add_argument('--no-audio', action='store_true')
    ap.add_argument('--bpm', type=float)
    ap.add_argument('--bars', type=int, default=16)
    ap.add_argument('--start', type=float, help='loop start in the master, seconds')
    ap.add_argument('--repeat', type=int, default=1,
                    help='play the --bars section this many times (e.g. --bars 8 --repeat 2 for a 16-bar video)')
    ap.add_argument('--xfade', type=float, default=0.03,
                    help='seconds of crossfade at the seam into the audio just before --start')
    ap.add_argument('--cover', help='square artwork (png/jpg)')
    ap.add_argument('--width', type=int, default=960)
    ap.add_argument('--av1-crf', type=int, default=50)
    ap.add_argument('--h264-crf', type=int, default=31)
    ap.add_argument('--denoise', default='hqdn3d=2:1.5:3:2.5', help="'' to disable")
    ap.add_argument('--out', default='.')
    args = ap.parse_args()

    if args.audio and (args.bpm is None or args.start is None):
        ap.error('--audio needs --bpm and --start')

    videos = os.path.join(args.out, 'public/videos')
    posters = os.path.join(args.out, 'public/images/posters')
    covers = os.path.join(args.out, 'public/images/covers')
    for d in (videos, posters, covers):
        os.makedirs(d, exist_ok=True)

    vdur = probe_float(args.video, 'stream=duration')
    nframes = round(vdur * probe_float(args.video, 'stream=r_frame_rate'))
    height = round(args.width * 9 / 16 / 2) * 2
    vf = f'scale={args.width}:{height}:flags=lanczos' + (f',{args.denoise}' if args.denoise else '')

    av1 = os.path.join(videos, f'{args.slug}-av1.mp4')
    h264 = os.path.join(videos, f'{args.slug}.mp4')
    encoders = [
        (av1, 'opus', ['-c:v', 'libsvtav1', '-preset', '3', '-crf', str(args.av1_crf), '-g', '96'],
         ['-c:a', 'libopus', '-b:a', '96k']),
        (h264, 'aac', ['-c:v', 'libx264', '-preset', 'veryslow', '-crf', str(args.h264_crf),
                       '-profile:v', 'high', '-g', '48'],
         ['-c:a', 'aac', '-b:a', '128k']),
    ]

    with tempfile.TemporaryDirectory() as work:
        if args.audio:
            loop, sr, loop_len = build_loop_wav(
                args.audio, args.start, args.bars * 240 / args.bpm, args.xfade, work, args.repeat)
        for out, acodec, vcodec, acodec_args in encoders:
            if args.no_audio:
                inputs, maps, vlen, aargs = [], ['-map', '0:v:0', '-an'], vdur, []
            elif args.audio:
                samples = gapless_samples(acodec, vdur)
                wav = fit_loop_wav(loop, sr, loop_len, samples, work, acodec)
                inputs, maps, vlen, aargs = ['-i', wav], ['-map', '0:v:0', '-map', '1:a:0'], samples / 48000, acodec_args
            else:
                inputs, maps, vlen, aargs = [], ['-map', '0:v:0', '-map', '0:a:0?'], vdur, acodec_args
            # Stretch the video by the same few milliseconds so both tracks end together:
            # same frames, exact rational frame rate (frames / audio length).
            rate = f'{nframes * 48000}/{round(vlen * 48000)}'
            run(['ffmpeg', '-v', 'error', '-y', '-i', args.video, *inputs, *maps,
                 '-vf', f'{vf},setpts=PTS*{vlen / vdur:.9f}', '-r', rate, '-video_track_timescale', '48000',
                 '-pix_fmt', 'yuv420p', '-map_metadata', '-1', '-movflags', '+faststart',
                 *vcodec, *aargs, out])

        frame = os.path.join(work, 'poster.png')
        run(['ffmpeg', '-v', 'error', '-y', '-i', args.video, '-frames:v', '1',
             '-vf', f'scale={args.width}:{height}:flags=lanczos', frame])
        poster = os.path.join(posters, f'{args.slug}.jpg')
        run(['magick', frame, '-strip', '-sampling-factor', '4:2:0', '-interlace', 'JPEG',
             '-quality', '76', poster])

    outputs = [av1, h264, poster]
    if args.audio:
        for out, acodec, _, _ in encoders:
            got = decoded_samples(out)
            want = gapless_samples(acodec, vdur)
            print(f"{os.path.basename(out)}: decoded {got} samples, expected {want}"
                  f"{'' if got == want else '  <-- MISMATCH: the loop will gap'}")
    if args.cover:
        cover = os.path.join(covers, f'{args.slug}.webp')
        run(['magick', args.cover, '-background', 'white', '-alpha', 'remove', '-alpha', 'off',
             '-resize', '1400x1400>', '-strip', '-define', 'webp:method=6', '-quality', '82', cover])
        outputs.append(cover)

    level = probe_float(av1, 'stream=level')
    print()
    for p in outputs:
        print(f'{os.path.getsize(p) / 1e6:6.2f} MB  {p}')
    print('\njukebox sources:')
    print(f'  - src: /videos/{args.slug}-av1.mp4')
    print(f'    type: video/mp4; codecs="av01.0.{int(level):02d}M.08{"" if args.no_audio else ", opus"}"')
    print(f'  - src: /videos/{args.slug}.mp4')
    print('    type: video/mp4')


if __name__ == '__main__':
    main()
