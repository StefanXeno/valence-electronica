/**
 * Easter egg (036): source readers find a comment (`SourceNote.astro`) telling them to type
 * "coder" — or, on a phone, to add `#coder` to the URL. Either unlocks the Coder achievement.
 */

import { unlockAchievement } from './achievement-toast';
import { bindHashCombo, bindKeyCombo } from './key-combo';

/** The word in the source comment and the one the listener waits for — keep them one. */
export const CODER_WORD = 'coder';

function unlockCoder() {
  unlockAchievement('coder');
}

/** Bind once per page. */
export function initCoderCombo(): void {
  if (typeof document === 'undefined') return;
  if (document.documentElement.dataset.coderComboInit === '1') return;
  document.documentElement.dataset.coderComboInit = '1';
  bindKeyCombo(CODER_WORD, unlockCoder);
  bindHashCombo(CODER_WORD, unlockCoder);
}
