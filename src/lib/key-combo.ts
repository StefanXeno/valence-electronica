/**
 * Typed-word easter eggs (036): a rolling key buffer per word, plus the same trigger from a
 * URL hash so phones without a hardware keyboard can fire it (`#666`, `#coder`).
 * Extracted from the 666 combo; `demonic-combo.ts` and `coder-combo.ts` both build on it.
 */

/** Max gap between keys before a buffer resets. */
export const COMBO_KEY_GAP_MS = 1600;

/** Keys that never count and never reset a buffer (Shift for capitals, etc.). */
const NEUTRAL_KEYS = new Set(['Shift', 'CapsLock']);

function sameClass(char: string, target: string): boolean {
  return /^\d+$/.test(target) ? /^\d$/.test(char) : /^\p{L}$/u.test(char);
}

/**
 * Pure: append one key to a word buffer. Keys outside the word's character class (digits for
 * `666`, letters for `coder`) reset it; letters match case-insensitively; the window slides,
 * so a trailing match still counts.
 */
export function appendComboKey(
  current: string,
  key: string,
  target: string,
): { next: string; matched: boolean } {
  if (key.length !== 1) return { next: '', matched: false };
  const char = key.toLowerCase();
  if (!sameClass(char, target)) return { next: '', matched: false };
  const next = (current + char).slice(-target.length);
  return { next, matched: next === target };
}

function isTypingContext(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

/** Shared keydown guard: no repeats, no Ctrl/Meta/Alt chords, nothing typed into fields. */
export function isComboKeyEvent(event: KeyboardEvent): boolean {
  if (event.defaultPrevented || event.repeat) return false;
  if (event.ctrlKey || event.metaKey || event.altKey) return false;
  return !isTypingContext(event.target);
}

/** Listen for `target` typed anywhere on the page; each word keeps its own buffer. */
export function bindKeyCombo(target: string, onMatch: () => void): void {
  let buffer = '';
  let lastKeyAt = 0;

  document.addEventListener(
    'keydown',
    (event) => {
      if (!isComboKeyEvent(event) || NEUTRAL_KEYS.has(event.key)) return;

      const now = performance.now();
      if (now - lastKeyAt > COMBO_KEY_GAP_MS) buffer = '';
      lastKeyAt = now;

      const { next, matched } = appendComboKey(buffer, event.key, target);
      buffer = matched ? '' : next;
      if (matched) onMatch();
    },
    true,
  );
}

/** Pure: does a `location.hash` value name `word`? (decoded, case-insensitive) */
export function hashMatches(hash: string, word: string): boolean {
  const raw = hash.replace(/^#/, '');
  if (!raw) return false;
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    /* malformed escape — compare as-is */
  }
  return decoded.trim().toLowerCase() === word.toLowerCase();
}

/**
 * Fire `onMatch` when the URL hash names `word` — on load and on `hashchange` — then drop the
 * hash without a reload or a new history entry. The current history state is kept so content
 * overlays (which store their own state) stay intact.
 */
export function bindHashCombo(word: string, onMatch: () => void): void {
  const check = () => {
    if (!hashMatches(window.location.hash, word)) return;
    history.replaceState(history.state, '', window.location.pathname + window.location.search);
    onMatch();
  };

  window.addEventListener('hashchange', check);
  // Module scripts (stage player included) have all run by DOMContentLoaded, so a
  // `#666` stage switch finds its listener.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', check, { once: true });
  } else {
    window.setTimeout(check, 0);
  }
}
