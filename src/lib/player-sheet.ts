/** Phone sheet + shared playlist viewport math (solo vs 3-row caps). */

/** Phone 018 / desktop player playlist — exactly three rows. */
export const PLAYLIST_WINDOW_SLOTS = 3;
/** Desktop Discography bar panel — two full cards + a peek of the third. */
export const DISCOG_PANEL_WINDOW_SLOTS = 2.5;
/** Page / bar discog `--discog-row-gap` (not the player 0.55rem token). */
export const DISCOG_PANEL_ROW_GAP_REM = 0.75;
export const RUBBER = 0.78;
export const OVERSCROLL_PX_MAX = 40;
/**
 * Playlist `--discog-row-gap` (phone + desktop theme-tracks).
 * Page discog stays 0.75rem — do not let that token drive the morph.
 */
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

/**
 * Visible track well. Fractional `slots` keep a peek of the next card
 * (2.5 = two rows + half of the third + two gaps). Player playlist stays at 3.
 */
export function playlistViewportPx(
  rowHeights: number[],
  gapPx: number,
  slots: number,
): number {
  const count = Number.isFinite(slots) && slots > 0 ? slots : 0;
  if (count <= 0) return 0;
  const typical = rowHeights.find((height) => height > 1) ?? 0;
  const filled = rowHeights.map((height) => (height > 1 ? height : typical));
  const needed = Math.ceil(count);
  while (filled.length < needed) filled.push(typical);
  const whole = Math.floor(count);
  let rowsH = 0;
  for (let i = 0; i < whole; i += 1) {
    rowsH += Math.max(0, filled[i] ?? typical);
  }
  const frac = count - whole;
  if (frac > 0) {
    rowsH += Math.max(0, filled[whole] ?? typical) * frac;
  }
  const gaps = Math.max(0, needed - 1) * Math.max(0, gapPx);
  return rowsH + gaps;
}

/** Chrome + visible well (`slots` rows + `ceil(slots) - 1` gaps). */
export function playlistStackPx(
  chromePx: number,
  rowHeights: number[],
  gapPx: number,
  slots = PLAYLIST_WINDOW_SLOTS,
): number {
  return Math.max(0, chromePx) + playlistViewportPx(rowHeights, gapPx, slots);
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

/**
 * Desktop playlist chrome stays put; only the track well changes.
 * `fromBox - fromSection + destSection` interpolates height with the row morph
 * (same duration/ease) so max-height cannot pop after the cards finish.
 */
export function morphBoxPx(fromBox: number, fromSection: number, destSection: number): number {
  return Math.max(0, fromBox - Math.max(0, fromSection) + Math.max(0, destSection));
}
