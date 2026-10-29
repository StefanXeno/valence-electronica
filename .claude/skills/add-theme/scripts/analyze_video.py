#!/usr/bin/env python3
"""Length, bar fit and hard cuts of a stage loop video.

    python3 -I analyze_video.py "tmp/Song Website Loop.mp4" --bpm 175

Prints the stream facts, how many bars the loop spans at the given tempo, whether the
muxed audio is silent, and every hard cut (scene score >= threshold) with its position
in bars, so a cut can be lined up with a drop in the song.
"""
import argparse
import json
import re
import subprocess


def probe(path):
    out = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', path],
        check=True, capture_output=True, text=True,
    ).stdout
    return json.loads(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video')
    ap.add_argument('--bpm', type=float, required=True)
    ap.add_argument('--threshold', type=float, default=0.4)
    args = ap.parse_args()

    info = probe(args.video)
    v = next(s for s in info['streams'] if s['codec_type'] == 'video')
    num, den = (int(x) for x in v['r_frame_rate'].split('/'))
    fps = num / den
    dur = float(v.get('duration') or info['format']['duration'])
    bar = 240 / args.bpm
    print(f"{v['width']}x{v['height']} {fps:g} fps  {dur:.3f}s = {round(dur * fps)} frames"
          f"  = {dur / bar:.3f} bars at {args.bpm:g} BPM (bar {bar:.4f}s)")
    bars = round(dur / bar)
    print(f'nearest whole loop: {bars} bars = {bars * bar:.6f}s'
          f' (audio rate factor to match the video exactly: {bars * bar / dur:.6f})')

    if any(s['codec_type'] == 'audio' for s in info['streams']):
        vol = subprocess.run(
            ['ffmpeg', '-hide_banner', '-i', args.video, '-map', '0:a:0', '-af', 'volumedetect', '-f', 'null', '-'],
            capture_output=True, text=True,
        ).stderr
        m = re.search(r'max_volume: (-?[\d.]+) dB', vol)
        if m:
            peak = float(m.group(1))
            print(f"muxed audio peak {peak} dB{'  (silent — music must come from the master)' if peak < -80 else ''}")
    else:
        print('no audio stream')

    log = subprocess.run(
        ['ffmpeg', '-hide_banner', '-i', args.video, '-an', '-vf',
         f"scale=320:-1,select='gt(scene,{args.threshold})',showinfo", '-f', 'null', '-'],
        capture_output=True, text=True,
    ).stderr
    cuts = [float(t) for t in re.findall(r'pts_time:([\d.]+)', log)]
    print(f'\nhard cuts (scene > {args.threshold}):')
    for t in cuts:
        print(f'  {t:7.3f}s  frame {round(t * fps):4d}  bar {t / bar:6.2f}')


if __name__ == '__main__':
    main()
