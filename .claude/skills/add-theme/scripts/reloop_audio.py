#!/usr/bin/env python3
"""Give an existing stage video a seamless music loop, without re-encoding the picture.

    python3 -I .claude/skills/add-theme/scripts/reloop_audio.py \\
        --stage public/videos/taking-over.mp4 \\
        --audio "tmp/Taking Over Loop + Music.mp4" \\
        --bpm 145 --start 39.743 --bars 8 --repeat 7

The video stream is copied bit for bit. Its timestamps are rescaled so it lasts exactly
as long as the new audio loop (e.g. 30 s = 18.75 bars of video played as 18 bars:
x0.96, 24 -> 25 fps), so pick a loop length close to the video's length in bars
(analyze_video.py). The AAC track has a gapless sample count (no end padding) and is at
most one AAC frame (21 ms) longer than the video; the last frame holds for that long.

--audio can be the master wav or any file with the music (e.g. the stage mp4 itself or
the "Loop + Music" source). Take the best-quality source available.
"""
import argparse
import math
import os
import shutil
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from build_theme_media import build_loop_wav, decoded_samples, parse_segments, probe_float, run  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--stage', required=True, help='existing public/videos/<slug>.mp4 (rewritten in place)')
    ap.add_argument('--audio', required=True, help='music source (wav / mp4)')
    ap.add_argument('--bpm', type=float, required=True)
    ap.add_argument('--start', type=float, help='loop start (downbeat), seconds in --audio')
    ap.add_argument('--bars', type=int, default=8)
    ap.add_argument('--segments', help="'start_s:bars,start_s:bars' instead of --start/--bars")
    ap.add_argument('--repeat', type=int, default=1)
    ap.add_argument('--xfade', type=float, default=0.06)
    ap.add_argument('--seam-hold', type=float, default=0.0)
    ap.add_argument('--bitrate', default='128k')
    ap.add_argument('--max-speed-change', type=float, default=0.05,
                    help='refuse to retime the video by more than this fraction')
    args = ap.parse_args()
    if args.start is None and not args.segments:
        ap.error('--start or --segments is required')

    vdur = probe_float(args.stage, 'stream=duration')
    with tempfile.TemporaryDirectory() as work:
        loop, sr, loop_len = build_loop_wav(
            args.audio, parse_segments(args), args.xfade, work, args.repeat, args.seam_hold)
        speed = loop_len / vdur
        if abs(speed - 1) > args.max_speed_change:
            sys.exit(f'loop is {loop_len:.3f}s but the video {vdur:.3f}s (x{speed:.3f}); pick another length')
        samples = math.ceil(loop_len * 48000 / 1024) * 1024  # whole AAC frames: no end padding
        wav = os.path.join(work, 'loop48.wav')
        factor = loop_len / (samples / 48000)
        run(['ffmpeg', '-v', 'error', '-y', '-i', loop, '-af',
             f'asetrate={sr}*{factor:.9f},aresample=48000,atrim=end_sample={samples},apad=whole_len={samples}',
             '-c:a', 'pcm_s16le', wav])
        out = os.path.join(work, 'out.mp4')
        run(['ffmpeg', '-v', 'error', '-y', '-itsscale', f'{speed:.9f}', '-i', args.stage, '-i', wav,
             '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', args.bitrate,
             '-map_metadata', '-1', '-movflags', '+faststart', out])
        got = decoded_samples(out)
        shutil.move(out, args.stage)

    new_v = probe_float(args.stage, 'stream=duration')
    print(f'video {vdur:.4f}s -> {new_v:.4f}s (x{speed:.5f}), audio loop {loop_len:.4f}s -> '
          f'{samples} samples = {samples / 48000:.4f}s (rate x{factor:.6f})')
    print(f'decoded {got} samples, expected {samples}' + ('' if got == samples else '  <-- MISMATCH: the loop will gap'))
    print(f'{os.path.getsize(args.stage) / 1e6:.2f} MB  {args.stage}')


if __name__ == '__main__':
    main()
