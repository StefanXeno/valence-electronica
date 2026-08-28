import { describe, expect, it } from 'vitest';
import { BERLIN_TIMEZONE, berlinCalendarParts } from './stage-schedule';
import {
  berlinTimeParts,
  buildEligibleSet,
  clampRotationIndex,
  loadTaglinePool,
  matchesTimeRule,
  nextRotationIndex,
  validateTaglinePool,
  type TaglineLine,
  type TaglinePool,
  type TaglineRule,
} from './tagline-pool';

function pool(...lines: TaglineLine[]): TaglinePool {
  return { timezone: BERLIN_TIMEZONE, lines };
}

function onDate(year: number, month: number, day: number) {
  return new Date(Date.UTC(year, month - 1, day, 12));
}

describe('buildEligibleSet', () => {
  it('returns weight-expanded normal lines when no easter egg matches', () => {
    const lines = pool(
      { text: 'Heavy.', weight: 2 },
      { text: 'Light.' },
      { text: 'Spooky.', rules: [{ type: 'date', on: '10-31' }] },
    );
    expect(buildEligibleSet(lines, onDate(2026, 3, 3))).toEqual([
      { text: 'Heavy.' },
      { text: 'Heavy.' },
      { text: 'Light.' },
    ]);
  });

  it('returns all matching easter eggs in file order and excludes normal pool', () => {
    const lines = pool(
      { text: 'Daily.' },
      { text: 'Egg A.', rules: [{ type: 'date', on: '10-31' }] },
      { text: 'Egg B.', rules: [{ type: 'date', on: '10-31' }] },
    );
    expect(buildEligibleSet(lines, onDate(2026, 10, 31))).toEqual([
      { text: 'Egg A.' },
      { text: 'Egg B.' },
    ]);
  });

  it('requires every rule on an easter-egg line to match', () => {
    const lines = pool({
      text: 'Friday night.',
      rules: [
        { type: 'weekday', days: [5] },
        { type: 'time', from: '22:00', to: '04:00' },
      ],
    });
    expect(buildEligibleSet(lines, new Date('2026-01-02T22:00:00Z'))).toEqual([
      { text: 'Friday night.' },
    ]);
    expect(buildEligibleSet(lines, new Date('2026-01-02T11:00:00Z'))).toEqual([]);
  });

  it('matches overnight time windows in Berlin', () => {
    const lines = pool(
      { text: 'Daily.' },
      { text: 'Late night.', rules: [{ type: 'time', from: '22:00', to: '04:00' }] },
    );
    expect(buildEligibleSet(lines, new Date('2026-08-28T21:30:00Z'))).toEqual([
      { text: 'Late night.' },
    ]);
    expect(buildEligibleSet(lines, new Date('2026-08-28T10:00:00Z'))).toEqual([{ text: 'Daily.' }]);
  });
});

describe('rotation helpers', () => {
  it('advances and clamps rotation index', () => {
    expect(nextRotationIndex(0, 3)).toBe(1);
    expect(nextRotationIndex(2, 3)).toBe(0);
    expect(clampRotationIndex(4, 3)).toBe(1);
    expect(clampRotationIndex(-1, 3)).toBe(2);
  });
});

describe('validateTaglinePool', () => {
  const fail = (...lines: TaglineLine[]) => () => validateTaglinePool(pool(...lines));

  it('accepts the shipped pool file', () => {
    expect(() => validateTaglinePool(loadTaglinePool())).not.toThrow();
  });

  it('rejects invalid timezone, text, rules, and weight on easter eggs', () => {
    expect(() => validateTaglinePool({ timezone: 'UTC', lines: [{ text: 'Hi.' }] })).toThrow(/timezone/);
    expect(fail({ text: '   ' })).toThrow(/missing non-empty "text"/);
    expect(fail({ text: 'Hi.', rules: [] })).toThrow(/non-empty array/);
    expect(fail({ text: 'Hi.', rules: [{ type: 'date', on: '13-40' } as TaglineRule] })).toThrow(
      /invalid MM-DD/,
    );
    expect(
      fail({
        text: 'Hi.',
        rules: [{ type: 'range', from: '2026-12-26', to: '2026-12-24' }],
      }),
    ).toThrow(/must not be after/);
    expect(fail({ text: 'Egg.', rules: [{ type: 'date', on: '10-31' }], weight: 2 })).toThrow(
      /not allowed on easter-egg/,
    );
  });
});

describe('berlinTimeParts', () => {
  it('reports Berlin clock values', () => {
    expect(berlinTimeParts(new Date('2026-08-28T21:30:00Z'))).toEqual({ hour: 23, minute: 30 });
    expect(berlinCalendarParts(new Date('2026-08-28T21:30:00Z'))).toMatchObject({
      year: 2026,
      month: 8,
      day: 28,
    });
    expect(matchesTimeRule('22:00', '04:00', { hour: 23, minute: 30 })).toBe(true);
  });
});

describe('formatTagline', () => {
  it('is exported via tagline-pool', async () => {
    const { formatTagline } = await import('./tagline-pool');
    expect(formatTagline('coming for you')).toBe('coming for\u00A0you');
  });
});

describe('tagline rotation interval', () => {
  it('parses valid query seconds and rejects invalid values', async () => {
    const { parseTaglineIntervalSeconds } = await import('./tagline-pool');
    expect(parseTaglineIntervalSeconds('5')).toBe(5);
    expect(parseTaglineIntervalSeconds('3600')).toBe(3600);
    expect(parseTaglineIntervalSeconds('0')).toBeUndefined();
    expect(parseTaglineIntervalSeconds('3601')).toBeUndefined();
    expect(parseTaglineIntervalSeconds('nope')).toBeUndefined();
    expect(parseTaglineIntervalSeconds(null)).toBeUndefined();
  });

  it('resolves production vs dev defaults and overrides', async () => {
    const {
      TAGLINE_ROTATION_MS_DEV_DEFAULT,
      TAGLINE_ROTATION_MS_PRODUCTION,
      resolveTaglineRotationMs,
    } = await import('./tagline-pool');
    expect(resolveTaglineRotationMs({ dev: false })).toBe(TAGLINE_ROTATION_MS_PRODUCTION);
    expect(resolveTaglineRotationMs({ dev: true })).toBe(TAGLINE_ROTATION_MS_DEV_DEFAULT);
    expect(resolveTaglineRotationMs({ dev: true, intervalSeconds: 5 })).toBe(5000);
  });

  it('compares tagline text after typography normalization', async () => {
    const { taglineTextsEqual } = await import('./tagline-pool');
    expect(taglineTextsEqual("Something's coming for you.", "Something's coming for\u00A0you.")).toBe(
      true,
    );
    expect(taglineTextsEqual('Line A.', 'Line B.')).toBe(false);
  });
});
