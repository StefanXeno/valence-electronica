import { describe, expect, it } from 'vitest';
import {
  applyDragHeight,
  dragFaceOpenPx,
  pickSoloOpenPx,
  playlistStackPx,
  plausibleRowPx,
  resolvePlaylistGapPx,
  sheetProgress,
} from './player-sheet';

describe('sheetProgress', () => {
  it('is 1 at the open cap used for that face', () => {
    expect(sheetProgress(260, 56, 260)).toBe(1);
    expect(sheetProgress(56, 56, 260)).toBe(0);
    expect(sheetProgress(158, 56, 260)).toBe(0.5);
  });

  it('maps a full solo stop to ~0.57 when the denom is the three-row sheet', () => {
    const collapsed = 56;
    const solo = 272;
    const playlist = 438;
    const progress = sheetProgress(solo, collapsed, playlist);
    expect(progress).toBeCloseTo(0.565, 2);
    expect(sheetProgress(solo, collapsed, solo)).toBe(1);
  });
});

describe('dragFaceOpenPx', () => {
  it('uses solo for drag-open and three-row only on the playlist face', () => {
    expect(dragFaceOpenPx(false, 270, 440)).toBe(270);
    expect(dragFaceOpenPx(true, 270, 440)).toBe(440);
  });
});

describe('applyDragHeight', () => {
  it('is 1:1 inside the cap and rubber-bands only past it', () => {
    expect(applyDragHeight(200, 56, 270, 0.78, 40)).toBe(200);
    expect(applyDragHeight(40, 56, 270, 0.78, 40)).toBe(56);
    expect(applyDragHeight(300, 56, 270, 0.78, 40)).toBe(270 + Math.min(30 * 0.78, 40));
  });
});

describe('playlistStackPx', () => {
  it('is chrome + three rows + two gaps', () => {
    expect(playlistStackPx(100, [80, 80, 80], 8)).toBe(100 + 240 + 16);
    expect(playlistStackPx(100, [80], 8)).toBe(100 + 240 + 16);
  });
});

describe('resolvePlaylistGapPx', () => {
  it('uses the token when solo CSS has zeroed computed gap', () => {
    expect(resolvePlaylistGapPx(8.8, 0, 8.8)).toBe(8.8);
  });

  it('falls back to computed gap, then the rem fallback', () => {
    expect(resolvePlaylistGapPx(0, 12, 8.8)).toBe(12);
    expect(resolvePlaylistGapPx(0, 0, 8.8)).toBe(8.8);
    expect(resolvePlaylistGapPx(Number.NaN, 0, 0)).toBe(0);
  });
});

describe('pickSoloOpenPx', () => {
  it('prefers shrink-wrap so a card-to-transport gap is not dropped', () => {
    expect(pickSoloOpenPx(56, 240, 268, 500)).toBe(268);
  });

  it('falls back to exact when wrap is a collapsed stub', () => {
    expect(pickSoloOpenPx(56, 240, 50, 500)).toBe(240);
  });
});

describe('plausibleRowPx', () => {
  it('rejects sheet-tall clone measurements', () => {
    expect(plausibleRowPx(680, 88, 200)).toBe(88);
    expect(plausibleRowPx(90, 88, 200)).toBe(90);
    expect(plausibleRowPx(0, 88, 200)).toBe(88);
  });
});
