/**
 * Mirror mute UI state onto the jukebox mute slot.
 *
 * Expand CSS lives in Jukebox.astro and must match a same-scope node
 * (`.jukebox__tool--mute[data-sound='on']`). Nesting `:global(...)` inside
 * `:has()` survives into the built stylesheet as an invalid pseudo-class and
 * never matches — do not use that pattern.
 *
 * Muted layout: slot is `--control-size` (same as other tools). Unmuted: slot
 * `flex: 0 0 auto` sized to speaker + gap + fixed slider — never flex-grow.
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
