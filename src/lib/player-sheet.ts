/** Pure phone-player sheet math (drag progress, solo vs 3-row caps). */

export const PLAYLIST_WINDOW_SLOTS = 3;
export const RUBBER = 0.78;
export const OVERSCROLL_PX_MAX = 40;
/** Phone playlist `--discog-row-gap` (Discography `.discog[data-theme-tracks]`). */
export const PLAYLIST_ROW_GAP_REM = 0.55;

/**
 * Settled playlist inter-row gap. Prefer the token — solo CSS zeros computed
 * `gap`, and `parseFloat("calc(...)")` of `--discog-row-gap` is NaN.
 */
export function resolvePlaylistGapPx(
  tokenPx: number,
  computedGapPx: number,
  fallbackPx = 0,
): number {
  if (tokenPx > 0) return tokenPx;
  if (computedGapPx > 0) return computedGapPx;
  return Math.max(0, fallbackPx);
}

/** 0–1 travel from collapsed → the open cap used for this drag/morph. */
export function sheetProgress(px: number, collapsedH: number, openH: number): number {
  const span = Math.max(1, openH - collapsedH);
  return Math.min(1, Math.max(0, (px - collapsedH) / span));
}

/**
 * Drag-open is always the solo sheet. Drag-close from playlist uses the
 * three-row cap. Never divide solo travel by the playlist height (that
 * mapped a full solo stop to ~0.57).
 */
export function dragFaceOpenPx(
  playlistFace: boolean,
  soloOpenH: number,
  playlistOpenH: number,
): number {
  return playlistFace ? playlistOpenH : soloOpenH;
}

/** 1:1 until the open cap; rubber-band only past it. */
export function applyDragHeight(
  rawH: number,
  collapsedH: number,
  openH: number,
  rubber = RUBBER,
  overscrollMax = OVERSCROLL_PX_MAX,
): number {
  if (rawH > openH) {
    return openH + Math.min((rawH - openH) * rubber, overscrollMax);
  }
  if (rawH < collapsedH) return collapsedH;
  return rawH;
}

/** Chrome + exactly `slots` rows + `slots - 1` gaps. */
export function playlistStackPx(
  chromePx: number,
  rowHeights: number[],
  gapPx: number,
  slots = PLAYLIST_WINDOW_SLOTS,
): number {
  const counted = rowHeights.slice(0, slots);
  const typical = counted.find((height) => height > 1) ?? 0;
  while (counted.length < slots) counted.push(typical);
  const rowsH = counted.reduce((sum, height) => sum + Math.max(0, height), 0);
  const gaps = Math.max(0, slots - 1) * Math.max(0, gapPx);
  return chromePx + rowsH + gaps;
}

/**
 * Settled solo height. Prefer the shrink-wrap clone (includes card-to-transport
 * gap). Exact chrome+card undercounts that gap and hops the sheet up at settle.
 */
export function pickSoloOpenPx(
  collapsedH: number,
  exactPx: number,
  wrappedPx: number,
  capPx: number,
): number {
  const min = collapsedH + 8;
  if (wrappedPx > collapsedH + 4 && wrappedPx <= capPx) {
    return Math.max(wrappedPx, min);
  }
  return Math.max(Math.min(Math.max(exactPx, min), capPx), min);
}

/**
 * A playlist/solo row is never a sheet-tall box. Clones that pick up 1fr /
 * 100% viewport must not drive FLIP or sibling height.
 */
export function plausibleRowPx(px: number, typical: number, capPx: number): number {
  const cap = capPx > 1 ? capPx : Number.POSITIVE_INFINITY;
  const bounded = Math.min(Math.max(0, px), cap);
  if (bounded < 1) return typical > 1 ? Math.min(typical, cap) : 0;
  if (typical > 1 && bounded > typical * 1.85) return Math.min(typical, cap);
  return bounded;
}
