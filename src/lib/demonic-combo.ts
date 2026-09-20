/**
 * Easter egg: type 666 → switch to the Nightmare stage, unlock achievement,
 * and crank HUD glitch intensity for the rest of the page session.
 */

import { maybeUnlockAchievement } from './achievement-toast';

/** Must match `STAGE_SELECT_EVENT` in stage-switch.ts (avoid importing that module here). */
const STAGE_SELECT_EVENT = 'stage-select';

export const NIGHTMARE_STAGE_ID = 'nightmare';
export const ACHIEVEMENT_DEMONIC_COMBO_STORAGE_KEY = 've-achievement-demonic-combo';
/** `dataset` key → `data-glitch-wild` on `<html>`. */
export const GLITCH_WILD_ATTR = 'glitchWild';

const TARGET = '666';
/** Max gap between digit keys before the buffer resets. */
const KEY_GAP_MS = 1600;

let buffer = '';
let lastKeyAt = 0;

function isTypingContext(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  if (target.closest('input, textarea, select, [contenteditable="true"]')) return true;
  return false;
}

/** Pure helper — append a digit char; returns whether the combo just completed. */
export function appendDemonicDigit(
  current: string,
  digit: string,
  target = TARGET,
): { next: string; matched: boolean } {
  if (!/^\d$/.test(digit)) return { next: '', matched: false };
  const next = (current + digit).slice(-target.length);
  return { next, matched: next === target };
}

export function isWildGlitchActive(): boolean {
  return document.documentElement.dataset[GLITCH_WILD_ATTR] === 'true';
}

export function enableWildGlitch(): void {
  document.documentElement.dataset[GLITCH_WILD_ATTR] = 'true';
}

function unlockDemonicCombo() {
  maybeUnlockAchievement({
    storageKey: ACHIEVEMENT_DEMONIC_COMBO_STORAGE_KEY,
    title: 'Demonic Combination',
    sub: 'Unleash the Nightmare by 666',
    glyph: 'demonic',
  });
}

function switchToNightmare() {
  document.dispatchEvent(
    new CustomEvent(STAGE_SELECT_EVENT, { detail: { id: NIGHTMARE_STAGE_ID } }),
  );
}

function onKeyDown(event: KeyboardEvent) {
  if (event.defaultPrevented) return;
  if (event.ctrlKey || event.metaKey || event.altKey) return;
  if (isTypingContext(event.target)) return;
  if (event.repeat) return;

  const digit = event.key.length === 1 && /\d/.test(event.key) ? event.key : null;

  if (!digit) {
    buffer = '';
    return;
  }

  const now = performance.now();
  if (now - lastKeyAt > KEY_GAP_MS) buffer = '';
  lastKeyAt = now;

  const { next, matched } = appendDemonicDigit(buffer, digit);
  buffer = next;
  if (!matched) return;

  buffer = '';
  enableWildGlitch();
  switchToNightmare();
  unlockDemonicCombo();
}

/** Bind once per page. */
export function initDemonicCombo(): void {
  if (typeof document === 'undefined') return;
  if (document.documentElement.dataset.demonicComboInit === '1') return;
  document.documentElement.dataset.demonicComboInit = '1';
  document.addEventListener('keydown', onKeyDown, true);
}
