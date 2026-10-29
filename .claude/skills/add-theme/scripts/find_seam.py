#!/usr/bin/env python3
"""Rank loop start points by how seamless the wrap sounds.

    python3 -I find_seam.py "tmp/Song Master.wav" --bpm 175 --downbeat 0.5311 --loop-bars 16

`--bpm` / `--downbeat` come from analyze_song.py. For every start bar S it scores two
loop shapes that fill `--loop-bars`:

  * one section of `--loop-bars` bars
  * half as many bars played twice (`--bars N/2 --repeat 2` in build_theme_media.py)

Score = how different the music is across the wrap (lower is better, ~1 or below is hard
to hear): the bars the song itself plays after the loop end are compared with the loop's
first bars ("fwd"), and the bars before the end with the bars before the start ("bwd",
which is what the seam crossfade blends in). Per beat it compares a 12-tone chroma
(harmony / melody) and four band levels (sub, low-mid, high-mid, air).

Prefer the best score among loud sections (sub-bass column close to the drop level); a
musically "wrong" seam (drop jumping back into a build-up) is what makes a loop obvious.
"""
import argparse
import array
import math
import subprocess

SR = 8000


def decode(path, flt=None):
    af = ['-af', flt] if flt else []
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', *af, '-ar', str(SR), '-f', 's16le', '-'],
                         capture_output=True, check=True).stdout
    a = array.array('h')
    a.frombytes(raw[: len(raw) // 2 * 2])
    return a


def features(path, bpm, downbeat):
    full = decode(path)
    bands = [decode(path, f) for f in ('lowpass=f=120,lowpass=f=120', 'bandpass=f=400:width_type=o:w=2',
                                  'bandpass=f=2000:width_type=o:w=2', 'highpass=f=6000')]
    beat = 60 / bpm
    coef = [2 * math.cos(2 * math.pi * 440 * 2 ** ((m - 69) / 12) / SR) for m in range(36, 84)]
    feats = []
    k = 0
    while downbeat + (k + 1) * beat < len(full) / SR:
        s0, s1 = int((downbeat + k * beat) * SR), int((downbeat + (k + 1) * beat) * SR)
        chroma = [0.0] * 12
        seg = full[s0:s1]
        for n, c in enumerate(coef):  # Goertzel per note, folded to pitch classes
            q1 = q2 = 0.0
            for x in seg:
                q1, q2 = c * q1 - q2 + x, q1
            chroma[n % 12] += q1 * q1 + q2 * q2 - c * q1 * q2
        norm = math.sqrt(sum(v * v for v in chroma)) or 1
        levels = []
        for b in bands:
            part = b[s0:s1:2]
            levels.append(20 * math.log10(max(1, math.sqrt(sum(v * v for v in part) / len(part))) / 32768))
        feats.append(([v / norm for v in chroma], levels))
        k += 1
    return feats


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('audio')
    ap.add_argument('--bpm', type=float, required=True)
    ap.add_argument('--downbeat', type=float, required=True, help='downbeat phase from analyze_song.py')
    ap.add_argument('--loop-bars', type=int, default=16, help='bars the video lasts')
    ap.add_argument('--top', type=int, default=10)
    args = ap.parse_args()

    F = features(args.audio, args.bpm, args.downbeat)
    bar = 240 / args.bpm

    def dist(i, j):
        (ca, la), (cb, lb) = F[i], F[j]
        cos = sum(x * y for x, y in zip(ca, cb))
        return (1 - cos) * 4 + sum(abs(x - y) for x, y in zip(la, lb)) / len(la) / 3

    def seam(S, L, w=8):
        s, e = 4 * S, 4 * (S + L)
        if s - w < 0 or e + w > len(F):
            return None
        fwd = sum(dist(e + i, s + i) for i in range(w)) / w
        bwd = sum(dist(e - w + i, s - w + i) for i in range(w)) / w
        return (fwd + bwd) / 2, fwd, bwd

    for L, rep in ((args.loop_bars, 1), (args.loop_bars // 2, 2)):
        if L < 1:
            continue
        rows = []
        for S in range(len(F) // 4):
            r = seam(S, L)
            if r:
                sub = sum(F[i][1][0] for i in range(4 * S, 4 * (S + L))) / (4 * L)
                rows.append((r[0], S, r[1], r[2], sub))
        print(f'\n== --bars {L}' + (f' --repeat {rep}' if rep > 1 else '') + '  (lower score = smoother wrap)')
        for sc, S, fwd, bwd, sub in sorted(rows)[: args.top]:
            print(f'  score {sc:.3f}  bar {S:3d}  start {args.downbeat + S * bar:8.3f}s'
                  f'  (fwd {fwd:.2f} bwd {bwd:.2f})  sub-bass {sub:6.1f} dB')


if __name__ == '__main__':
    main()
