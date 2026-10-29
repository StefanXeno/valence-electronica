#!/usr/bin/env python3
"""Build every public/ asset for a stage theme from the raw files in tmp/.

    python3 -I .claude/skills/add-theme/scripts/build_theme_media.py \\
        --slug wannacry \\
        --video "tmp/WannaCry Website Loop.mp4" \\
        --audio "tmp/wannacry Master2.wav" \\
        --bpm 175 --bars 16 --start 155.349 \\
        --cover "tmp/WannaCry Version 2.png"

Writes (relative to the repo root, or --out):
  public/videos/<slug>-av1.mp4        AV1 + Opus, first <source>
  public/videos/<slug>.mp4            H.264 + AAC fallback (Safari without AV1)
  public/images/posters/<slug>.jpg    first frame of the loop
  public/images/covers/<slug>.webp    square cover, 1400 px

Audio: `--bars` bars of the master from `--start`, a short crossfade at the seam with
the audio just before `--start` (so the wrap is click-free and rhythmically continuous),
then resampled by a tiny factor so it lasts exactly as long as the video. Omit --audio to
keep the video's own audio track; pass --no-audio for a silent loop.

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


def build_loop_wav(audio, start, length, xfade, target_len, workdir):
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
    loop = os.path.join(workdir, 'loop.wav')
    with wave.open(loop, 'wb') as o:
        o.setnchannels(ch)
        o.setsampwidth(2)
        o.setframerate(sr)
        o.writeframes(body.tobytes())
    factor = (frames / sr) / target_len
    out = os.path.join(workdir, 'loop48.wav')
    # asetrate shifts pitch by the same tiny factor (~0.1 % = 2 cents): inaudible, artefact-free.
    run(['ffmpeg', '-v', 'error', '-y', '-i', loop, '-af',
         f'asetrate={sr}*{factor:.8f},aresample=48000', '-c:a', 'pcm_s16le', out])
    print(f'audio loop {frames / sr:.4f}s -> {target_len:.4f}s (rate x{factor:.6f})')
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
    ap.add_argument('--xfade', type=float, default=0.03)
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
    height = round(args.width * 9 / 16 / 2) * 2
    vf = f'scale={args.width}:{height}:flags=lanczos' + (f',{args.denoise}' if args.denoise else '')

    with tempfile.TemporaryDirectory() as work:
        if args.no_audio:
            amap = []
        elif args.audio:
            length = args.bars * 240 / args.bpm
            loop = build_loop_wav(args.audio, args.start, length, args.xfade, vdur, work)
            amap = ['-i', loop, '-map', '0:v:0', '-map', '1:a:0']
        else:
            amap = ['-map', '0:v:0', '-map', '0:a:0?']

        common_in = ['ffmpeg', '-v', 'error', '-y', '-i', args.video, *amap, '-vf', vf,
                     '-pix_fmt', 'yuv420p', '-map_metadata', '-1', '-movflags', '+faststart',
                     '-t', f'{vdur:.6f}']
        if args.no_audio:
            common_in += ['-an']
        av1 = os.path.join(videos, f'{args.slug}-av1.mp4')
        h264 = os.path.join(videos, f'{args.slug}.mp4')
        run([*common_in, '-c:v', 'libsvtav1', '-preset', '3', '-crf', str(args.av1_crf), '-g', '96',
             *([] if args.no_audio else ['-c:a', 'libopus', '-b:a', '96k']), av1])
        run([*common_in, '-c:v', 'libx264', '-preset', 'veryslow', '-crf', str(args.h264_crf),
             '-profile:v', 'high', '-g', '48',
             *([] if args.no_audio else ['-c:a', 'aac', '-b:a', '128k']), h264])

        frame = os.path.join(work, 'poster.png')
        run(['ffmpeg', '-v', 'error', '-y', '-i', args.video, '-frames:v', '1',
             '-vf', f'scale={args.width}:{height}:flags=lanczos', frame])
        poster = os.path.join(posters, f'{args.slug}.jpg')
        run(['magick', frame, '-strip', '-sampling-factor', '4:2:0', '-interlace', 'JPEG',
             '-quality', '76', poster])

    outputs = [av1, h264, poster]
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
