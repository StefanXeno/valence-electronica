export type HudIconToken = 'jukebox' | 'about' | 'lyrics' | 'discography' | 'tour';

const KNOWN: HudIconToken[] = ['jukebox', 'about', 'lyrics', 'discography', 'tour'];

/** True when the chrome value is an emoji override rather than a token id. */
export function isEmojiIcon(value: string): boolean {
  return /[^\x00-\x7F]/.test(value.trim());
}

export function resolveHudIcon(
  value: string | undefined,
  fallback: HudIconToken,
): { token: HudIconToken; emoji?: string } {
  if (!value?.trim()) return { token: fallback };
  const trimmed = value.trim();
  if (isEmojiIcon(trimmed)) return { token: fallback, emoji: trimmed };
  if (KNOWN.includes(trimmed as HudIconToken)) return { token: trimmed as HudIconToken };
  console.warn(`[stage] unknown HUD icon token "${trimmed}"; using "${fallback}"`);
  return { token: fallback };
}
