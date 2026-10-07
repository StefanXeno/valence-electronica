import { describe, expect, it } from 'vitest';
import { appendComboKey, hashMatches } from './key-combo';

function typeWord(keys: string[], target: string) {
  let buffer = '';
  let matched = false;
  for (const key of keys) ({ next: buffer, matched } = appendComboKey(buffer, key, target));
  return { buffer, matched };
}

describe('appendComboKey', () => {
  it('matches a typed word case-insensitively', () => {
    expect(typeWord(['c', 'O', 'd', 'E', 'r'], 'coder').matched).toBe(true);
  });

  it('matches digits for a numeric word', () => {
    expect(typeWord(['6', '6', '6'], '666').matched).toBe(true);
  });

  it('resets on a key outside the word class', () => {
    expect(appendComboKey('cod', '6', 'coder')).toEqual({ next: '', matched: false });
    expect(appendComboKey('66', 'c', '666')).toEqual({ next: '', matched: false });
    expect(appendComboKey('cod', 'Enter', 'coder')).toEqual({ next: '', matched: false });
  });

  it('keeps a sliding window so a trailing word still matches', () => {
    expect(typeWord([...'xxcoder'], 'coder').matched).toBe(true);
    expect(typeWord([...'1666'], '666').matched).toBe(true);
  });

  it('keeps separate buffers independent', () => {
    // Typing "coder" never touches a 666 buffer and vice versa — each word owns its state.
    let digits = appendComboKey('', '6', '666').next;
    let letters = appendComboKey('', 'c', 'coder').next;
    digits = appendComboKey(digits, '6', '666').next;
    letters = appendComboKey(letters, 'o', 'coder').next;
    expect(digits).toBe('66');
    expect(letters).toBe('co');
  });
});

describe('hashMatches', () => {
  it.each(['#coder', '#CODER', 'coder', '#%63oder'])('matches %j for coder', (hash) => {
    expect(hashMatches(hash, 'coder')).toBe(true);
  });

  it.each(['#666', '#%36%36%36'])('matches %j for 666', (hash) => {
    expect(hashMatches(hash, '666')).toBe(true);
  });

  it.each(['', '#', '#6666', '#coderx', '#%E0%A4%A', '#tour'])('rejects %j', (hash) => {
    expect(hashMatches(hash, 'coder')).toBe(false);
    expect(hashMatches(hash, '666')).toBe(false);
  });
});
