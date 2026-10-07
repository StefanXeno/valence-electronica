/**
 * Easter egg: type 666 (or open the page with `#666`) → switch to the Nightmare stage,
 * unlock achievement, and crank HUD glitch intensity for the rest of the page session.
 */

import { unlockAchievement } from './achievement-toast';
import { appendComboKey, bindHashCombo, bindKeyCombo } from './key-combo';

/** Must match `STAGE_SELECT_EVENT` in stage-switch.ts (avoid importing that module here). */
const STAGE_SELECT_EVENT = 'stage-select';

export const NIGHTMARE_STAGE_ID = 'nightmare';
/** `dataset` key → `data-glitch-wild` on `<html>`. */
export const GLITCH_WILD_ATTR = 'glitchWild';

const TARGET = '666';

/** Pure helper — append a digit char; returns whether the combo just completed. */
export function appendDemonicDigit(
  current: string,
  digit: string,
  target = TARGET,
): { next: string; matched: boolean } {
  return appendComboKey(current, digit, target);
}

export function isWildGlitchActive(): boolean {
  return document.documentElement.dataset[GLITCH_WILD_ATTR] === 'true';
}

export function enableWildGlitch(): void {
  document.documentElement.dataset[GLITCH_WILD_ATTR] = 'true';
}

/** Gallery switch (036): calm the stage again without a reload. */
export function disableWildGlitch(): void {
  delete document.documentElement.dataset[GLITCH_WILD_ATTR];
}

function unlockDemonicCombo() {
  unlockAchievement('demonic-combo');
}

export function switchToNightmare(): void {
  document.dispatchEvent(
    new CustomEvent(STAGE_SELECT_EVENT, { detail: { id: NIGHTMARE_STAGE_ID } }),
  );
}

function fireDemonicCombo() {
  enableWildGlitch();
  switchToNightmare();
  unlockDemonicCombo();
}

/** Bind once per page. */
export function initDemonicCombo(): void {
  if (typeof document === 'undefined') return;
  if (document.documentElement.dataset.demonicComboInit === '1') return;
  document.documentElement.dataset.demonicComboInit = '1';
  bindKeyCombo(TARGET, fireDemonicCombo);
  // Phones have no hardware keyboard: `#666` in the URL does the same (036).
  bindHashCombo(TARGET, fireDemonicCombo);
}
