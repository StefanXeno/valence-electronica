#!/usr/bin/env python3
"""Tempo, downbeat grid and per-bar energy for a song master.

Pure stdlib + ffmpeg (no numpy), so it runs without installing anything.

    python3 -I analyze_song.py "tmp/Song Master.wav" [--bpm 175] [--video-bars 16]

Prints:
  * BPM estimate (onset autocorrelation, refined over 16 beats)
  * downbeat phase: the beat offset where most section changes land
  * one row per bar: full-band and sub-bass (<120 Hz) loudness in dB
  * drop candidates: bars where the sub-bass jumps after quieter bars
"""
import argparse
import array
import math
import subprocess
import sys

SR = 11025


def decode(path, extra_filter=None):
    af = ['-af', extra_filter] if extra_filter else []
    raw = subprocess.run(
        ['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', *af, '-ar', str(SR), '-f', 's16le', '-'],
        check=True, capture_output=True,
    ).stdout
    a = array.array('h')
    a.frombytes(raw[: len(raw) // 2 * 2])
    return a


def rms_env(a, hop):
    out = []
    for i in range(len(a) // hop):
        seg = a[i * hop:(i + 1) * hop:2]
        out.append(math.sqrt(sum(v * v for v in seg) / max(1, len(seg))))
    return out


def onset(env):
    o = [max(0.0, env[i] - env[i - 1]) for i in range(1, len(env))]
    m = sum(o) / len(o)
    return [x - m for x in o]


def autocorr(o, lag):
    n = len(o) - lag
    return sum(o[i] * o[i + lag] for i in range(n)) / n


def estimate_bpm(a):
    hop = 110  # ~10 ms
    fps = SR / hop
    o = onset(rms_env(a, hop))
    coarse = max(
        ((autocorr(o, lag), 60 * fps / lag) for lag in range(int(fps * 60 / 200), int(fps * 60 / 70) + 1)),
    )[1]
    # Fold into the 120–200 range most club tempos live in.
    while coarse < 120:
        coarse *= 2
    lo, hi = coarse * 0.96, coarse * 1.04
    beats = 16
    best = max(
        (autocorr(o, lag), 60 * fps * beats / lag)
        for lag in range(int(fps * 60 * beats / hi), int(fps * 60 * beats / lo) + 1)
    )
    return best[1]


def db(seg):
    if not seg:
        return -99.0
    r = math.sqrt(sum(v * v for v in seg) / len(seg))
    return 20 * math.log10(max(r, 1) / 32768)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('audio')
    ap.add_argument('--bpm', type=float, help='skip detection and use this tempo')
    ap.add_argument('--video-bars', type=int, default=16, help='loop length to suggest windows for')
    args = ap.parse_args()

    full = decode(args.audio)
    low = decode(args.audio, 'lowpass=f=120,lowpass=f=120')
    dur = len(full) / SR
    bpm = args.bpm or estimate_bpm(full)
    if not args.bpm and abs(bpm - round(bpm)) < 0.15:
        bpm = float(round(bpm))  # DAW projects almost always run at an integer tempo
    beat = 60 / bpm
    print(f'duration {dur:.3f}s  bpm {bpm:.2f}  beat {beat:.4f}s  bar {4 * beat:.4f}s')

    # Beat phase at 1 ms resolution: where onsets line up best with the grid.
    hop = 11
    f = SR / hop
    o = [max(0.0, x) for x in onset(rms_env(full, hop))]
    B = beat * f
    phase = max(
        (sum(o[int(p / 10 + k * B)] for k in range(int((len(o) - 1 - p / 10) / B))), p / 10 / f)
        for p in range(int(B * 10))
    )[1]

    # Downbeat = the beat offset (0–3) where the sub-bass changes most from beat to beat.
    beats_low = []
    t = phase
    while t + beat < dur:
        beats_low.append(db(low[int(t * SR):int((t + beat) * SR):3]))
        t += beat
    jumps = [0.0] * 4
    for k in range(1, len(beats_low)):
        jumps[k % 4] += abs(beats_low[k] - beats_low[k - 1])
    shift = max(range(4), key=lambda i: jumps[i])
    downbeat = phase + shift * beat
    print(f'beat phase {phase:.4f}s  downbeat phase {downbeat:.4f}s (beat offset {shift})')
    print()

    bar = 4 * beat
    rows = []
    b = 0
    while downbeat + (b + 1) * bar <= dur:
        t0 = downbeat + b * bar
        s0, s1 = int(t0 * SR), int((t0 + bar) * SR)
        rows.append((b, t0, db(full[s0:s1:3]), db(low[s0:s1:3])))
        b += 1
    for i in range(0, len(rows), 4):
        print(' | '.join(f'{r[0]:3d} {r[1]:7.2f}s F{r[2]:6.1f} L{r[3]:6.1f}' for r in rows[i:i + 4]))

    print('\ndrop candidates (sub-bass +8 dB over the previous two bars):')
    for i in range(2, len(rows)):
        before = max(rows[i - 1][3], rows[i - 2][3])
        half = args.video_bars // 2
        if rows[i][3] - before >= 8 and rows[i][1] - half * bar >= 0:
            print(
                f'  bar {rows[i][0]:3d} at {rows[i][1]:7.3f}s  (+{rows[i][3] - before:.1f} dB)'
                f'  -> {args.video_bars}-bar window with the drop in the middle starts at'
                f' {rows[i][1] - half * bar:7.3f}s'
            )


if __name__ == '__main__':
    sys.exit(main())
