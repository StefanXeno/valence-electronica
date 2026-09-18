/**
 * Mirror mute UI state onto the jukebox mute slot.
 *
 * Expand CSS lives in Jukebox.astro and must match a same-scope node
 * (`.jukebox__tool--mute[data-sound='on']`). Nesting `:global(...)` inside
 * `:has()` survives into the built stylesheet as an invalid pseudo-class and
 * never matches — do not use that pattern.
 */
export type MuteSlotSound = 'on' | 'off';

export function muteSlotSoundAttr(muted: boolean): MuteSlotSound {
  return muted ? 'off' : 'on';
}

export function applyMuteSlotSound(
  slot: HTMLElement | null | undefined,
  muted: boolean,
): void {
  if (!slot) return;
  slot.dataset.sound = muteSlotSoundAttr(muted);
}
