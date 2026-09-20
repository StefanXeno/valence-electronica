import { describe, expect, it } from 'vitest';
import { appendDemonicDigit } from './demonic-combo';

describe('appendDemonicDigit', () => {
  it('builds toward 666 and matches on the third 6', () => {
    let buf = '';
    let matched = false;

    ({ next: buf, matched } = appendDemonicDigit(buf, '6'));
    expect(buf).toBe('6');
    expect(matched).toBe(false);

    ({ next: buf, matched } = appendDemonicDigit(buf, '6'));
    expect(buf).toBe('66');
    expect(matched).toBe(false);

    ({ next: buf, matched } = appendDemonicDigit(buf, '6'));
    expect(buf).toBe('666');
    expect(matched).toBe(true);
  });

  it('resets on a non-digit', () => {
    expect(appendDemonicDigit('66', 'a')).toEqual({ next: '', matched: false });
  });

  it('keeps a sliding window so trailing 666 still matches', () => {
    const { next, matched } = appendDemonicDigit('166', '6');
    expect(next).toBe('666');
    expect(matched).toBe(true);
  });
});
