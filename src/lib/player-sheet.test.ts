import { describe, expect, it } from 'vitest';
import {
  applyDragHeight,
  DISCOG_PANEL_ROW_GAP_REM,
  DISCOG_PANEL_WINDOW_SLOTS,
  dragFaceOpenPx,
  pickSoloOpenPx,
  playlistStackPx,
  playlistViewportPx,
  morphBoxPx,
  PLAYLIST_ROW_GAP_REM,
  PLAYLIST_WINDOW_SLOTS,
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

describe('playlistViewportPx', () => {
  it('is three rows + two gaps for the player playlist', () => {
    expect(PLAYLIST_WINDOW_SLOTS).toBe(3);
    expect(playlistViewportPx([80, 80, 80], 8, PLAYLIST_WINDOW_SLOTS)).toBe(240 + 16);
    expect(playlistViewportPx([80], 8, PLAYLIST_WINDOW_SLOTS)).toBe(240 + 16);
  });

  it('is 2.5 rows + two gaps for the Discography bar panel', () => {
    expect(DISCOG_PANEL_WINDOW_SLOTS).toBe(2.5);
    expect(DISCOG_PANEL_ROW_GAP_REM).toBe(0.75);
    // 80 + 80 + 40 + 8 + 8
    expect(playlistViewportPx([80, 80, 80], 8, DISCOG_PANEL_WINDOW_SLOTS)).toBe(216);
    expect(playlistViewportPx([80], 8, DISCOG_PANEL_WINDOW_SLOTS)).toBe(216);
  });
});

describe('PLAYLIST_ROW_GAP_REM', () => {
  it('is the settled theme-track gap, not the page discog 0.75rem', () => {
    expect(PLAYLIST_ROW_GAP_REM).toBe(0.55);
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

describe('morphBoxPx', () => {
  it('keeps chrome and only swaps the track well', () => {
    // 280 box, 120 solo well → 3-slot 360 well = 520. Close is the reverse.
    expect(morphBoxPx(280, 120, 360)).toBe(520);
    expect(morphBoxPx(520, 360, 120)).toBe(280);
    expect(morphBoxPx(280, 120, 216)).toBe(376);
    expect(morphBoxPx(376, 216, 120)).toBe(280);
  });

  it('does not go negative when a well is missing', () => {
    expect(morphBoxPx(200, 0, 80)).toBe(280);
    expect(morphBoxPx(200, 240, 0)).toBe(0);
  });
});
