/**
 * Shared "never start a gesture here" selectors for stage gestures (rub, Infinite spin,
 * hidden player hint). Layered because the rub lives inside discography rows (it may
 * start on the row toggle) while spin and the player hint must ignore all chrome.
 */

/** Outbound links and play controls — no gesture may start here. */
export const OUTBOUND_AND_PLAY_SELECTOR = [
  'a',
  '[data-stage-button]',
  '.discog__listen',
  '.discog__listen-links',
  '.site-nav__menu-portal-listen',
  '.site-nav__menu-portal-listen-links',
  '.site-nav__menu-portal-listen-glyphs',
].join(', ');

/** Every interactive control, including the stage player. */
export const INTERACTIVE_SELECTOR = [
  OUTBOUND_AND_PLAY_SELECTOR,
  'button',
  'input',
  'textarea',
  'select',
  'label',
  'summary',
  '[role="button"]',
  '[data-stage-player]',
  '[data-track-rub-panel]',
  '[data-mute-control]',
  '[data-volume-control]',
  '[data-shuffle-toggle]',
  '[data-bg-play-toggle]',
].join(', ');

/** Navigation and overlay layers that sit above the stage. */
export const CHROME_SELECTOR = [
  '[data-site-nav]',
  '.site-nav',
  '#legal-overlay',
  '[data-track-rub-overlay]',
  '[data-achievement-gallery]',
  '[data-achievement-toggle]',
].join(', ');

/** Stage-only gestures (spin, player hint): ignore controls and chrome layers. */
export const STAGE_GESTURE_IGNORE_SELECTOR = [INTERACTIVE_SELECTOR, CHROME_SELECTOR].join(', ');

export function joinSelectors(...selectors: (string | undefined)[]): string {
  return selectors.filter((part): part is string => Boolean(part?.trim())).join(', ');
}

export function matchesGestureIgnore(target: EventTarget | null, selector: string): boolean {
  if (typeof Element === 'undefined' || !(target instanceof Element)) return false;
  return Boolean(target.closest(selector));
}
