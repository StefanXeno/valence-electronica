/**
 * Remembers that the visitor found the hidden player (035). First-party UX flag only.
 * Like `readAchievementState()`, blocked storage reads as "not discovered" so private-mode
 * visitors start with a clean stage; discovery then lasts for the page load only.
 */

export const PLAYER_DISCOVERED_STORAGE_KEY = 've-player-discovered';

export function isPlayerDiscovered(storage: Storage | undefined = globalThis.localStorage): boolean {
  try {
    return storage?.getItem(PLAYER_DISCOVERED_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function markPlayerDiscovered(storage: Storage | undefined = globalThis.localStorage): void {
  try {
    storage?.setItem(PLAYER_DISCOVERED_STORAGE_KEY, '1');
  } catch {
    /* blocked storage — discovery lasts for this page load */
  }
}
