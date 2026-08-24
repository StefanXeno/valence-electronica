import { describe, expect, it } from 'vitest';
import {
  BERLIN_TIMEZONE,
  berlinCalendarParts,
  loadStageSchedule,
  resolveScheduledDefault,
  validateStageSchedule,
  type ScheduleRule,
  type StageSchedule,
} from './stage-schedule';

const CATALOG = new Set(['nightmare', 'example-cyan', 'aurora']);
const FALLBACK = 'nightmare';

function schedule(...rules: ScheduleRule[]): StageSchedule {
  return { timezone: BERLIN_TIMEZONE, rules };
}

/** Berlin calendar parts for a plain date, avoiding UTC-midnight edge cases. */
function onDate(year: number, month: number, day: number) {
  return berlinCalendarParts(new Date(Date.UTC(year, month - 1, day, 12)));
}

describe('berlinCalendarParts', () => {
  it('reports the Berlin date and ISO weekday', () => {
    expect(onDate(2026, 10, 31)).toEqual({ year: 2026, month: 10, day: 31, weekday: 6 });
  });

  it('uses CET, not UTC, just before midnight in winter', () => {
    // 2026-01-05T23:30Z is already 2026-01-06 in Berlin (UTC+1)
    const parts = berlinCalendarParts(new Date('2026-01-05T23:30:00Z'));
    expect(parts).toMatchObject({ year: 2026, month: 1, day: 6 });
  });

  it('uses CEST during summer daylight saving', () => {
    // 2026-07-05T22:30Z is already 2026-07-06 in Berlin (UTC+2)
    const parts = berlinCalendarParts(new Date('2026-07-05T22:30:00Z'));
    expect(parts).toMatchObject({ year: 2026, month: 7, day: 6 });
  });

  it('maps Sunday to ISO 7 rather than 0', () => {
    expect(onDate(2026, 8, 23).weekday).toBe(7);
  });
});

describe('resolveScheduledDefault', () => {
  it('falls back when no rule matches', () => {
    const result = resolveScheduledDefault(schedule(), onDate(2026, 3, 3), CATALOG, FALLBACK);
    expect(result).toBe(FALLBACK);
  });

  it('matches a recurring MM-DD date in any year', () => {
    const rules = schedule({ type: 'date', on: '10-31', jukeboxId: 'aurora' });
    expect(resolveScheduledDefault(rules, onDate(2026, 10, 31), CATALOG, FALLBACK)).toBe('aurora');
    expect(resolveScheduledDefault(rules, onDate(2031, 10, 31), CATALOG, FALLBACK)).toBe('aurora');
    expect(resolveScheduledDefault(rules, onDate(2026, 11, 1), CATALOG, FALLBACK)).toBe(FALLBACK);
  });

  it('matches a one-off YYYY-MM-DD date only in that year', () => {
    const rules = schedule({ type: 'date', on: '2027-06-01', jukeboxId: 'aurora' });
    expect(resolveScheduledDefault(rules, onDate(2027, 6, 1), CATALOG, FALLBACK)).toBe('aurora');
    expect(resolveScheduledDefault(rules, onDate(2028, 6, 1), CATALOG, FALLBACK)).toBe(FALLBACK);
  });

  it('matches ranges inclusively on both ends', () => {
    const rules = schedule({
      type: 'range',
      from: '2026-12-24',
      to: '2026-12-26',
      jukeboxId: 'aurora',
    });
    expect(resolveScheduledDefault(rules, onDate(2026, 12, 24), CATALOG, FALLBACK)).toBe('aurora');
    expect(resolveScheduledDefault(rules, onDate(2026, 12, 26), CATALOG, FALLBACK)).toBe('aurora');
    expect(resolveScheduledDefault(rules, onDate(2026, 12, 23), CATALOG, FALLBACK)).toBe(FALLBACK);
    expect(resolveScheduledDefault(rules, onDate(2026, 12, 27), CATALOG, FALLBACK)).toBe(FALLBACK);
  });

  it('matches ranges that cross a year boundary as a plain comparison', () => {
    const rules = schedule({
      type: 'range',
      from: '2026-12-30',
      to: '2027-01-02',
      jukeboxId: 'aurora',
    });
    expect(resolveScheduledDefault(rules, onDate(2027, 1, 1), CATALOG, FALLBACK)).toBe('aurora');
  });

  it('matches weekday rules on ISO day numbers', () => {
    const rules = schedule({ type: 'weekday', days: [5], jukeboxId: 'aurora' });
    // 2026-08-21 is a Friday
    expect(resolveScheduledDefault(rules, onDate(2026, 8, 21), CATALOG, FALLBACK)).toBe('aurora');
    expect(resolveScheduledDefault(rules, onDate(2026, 8, 22), CATALOG, FALLBACK)).toBe(FALLBACK);
  });

  describe('precedence', () => {
    const all = schedule(
      { type: 'weekday', days: [1, 2, 3, 4, 5, 6, 7], jukeboxId: 'aurora' },
      { type: 'range', from: '2026-12-24', to: '2026-12-26', jukeboxId: 'example-cyan' },
      { type: 'date', on: '12-25', jukeboxId: 'nightmare' },
    );

    it('prefers a date rule over range and weekday', () => {
      expect(resolveScheduledDefault(all, onDate(2026, 12, 25), CATALOG, FALLBACK)).toBe(
        'nightmare',
      );
    });

    it('prefers a range rule over weekday', () => {
      expect(resolveScheduledDefault(all, onDate(2026, 12, 24), CATALOG, FALLBACK)).toBe(
        'example-cyan',
      );
    });

    it('falls through to weekday when nothing more specific matches', () => {
      expect(resolveScheduledDefault(all, onDate(2026, 5, 5), CATALOG, FALLBACK)).toBe('aurora');
    });
  });

  it('skips rules pointing at ids missing from the catalog', () => {
    const rules = schedule(
      { type: 'date', on: '10-31', jukeboxId: 'deleted-clip' },
      { type: 'weekday', days: [1, 2, 3, 4, 5, 6, 7], jukeboxId: 'aurora' },
    );
    expect(resolveScheduledDefault(rules, onDate(2026, 10, 31), CATALOG, FALLBACK)).toBe('aurora');
  });

  it('uses the first matching rule when several are equally specific', () => {
    const rules = schedule(
      { type: 'date', on: '10-31', jukeboxId: 'aurora' },
      { type: 'date', on: '10-31', jukeboxId: 'example-cyan' },
    );
    expect(resolveScheduledDefault(rules, onDate(2026, 10, 31), CATALOG, FALLBACK)).toBe('aurora');
  });
});

describe('validateStageSchedule', () => {
  const ok = (rule: ScheduleRule) => () => validateStageSchedule(schedule(rule), CATALOG);
  const check = (rule: ScheduleRule) => expect(ok(rule));

  it('accepts the shipped schedule against its own catalog', () => {
    expect(() =>
      validateStageSchedule(loadStageSchedule(), new Set(['nightmare', 'example-cyan'])),
    ).not.toThrow();
  });

  it('rejects a non-Berlin timezone', () => {
    expect(() =>
      validateStageSchedule({ timezone: 'UTC', rules: [] }, CATALOG),
    ).toThrow(/timezone must be/);
  });

  it('rejects an unknown jukebox id', () => {
    check({ type: 'date', on: '10-31', jukeboxId: 'ghost' }).toThrow(/unknown jukebox id/);
  });

  it('rejects a blank jukebox id', () => {
    check({ type: 'date', on: '10-31', jukeboxId: '  ' }).toThrow(/missing type or jukeboxId/);
  });

  it('rejects an unknown rule type', () => {
    check({ type: 'season', jukeboxId: 'aurora' } as unknown as ScheduleRule).toThrow(
      /unknown rule type/,
    );
  });

  describe('date rules', () => {
    it('accepts both MM-DD and YYYY-MM-DD', () => {
      check({ type: 'date', on: '02-29', jukeboxId: 'aurora' }).not.toThrow();
      check({ type: 'date', on: '2028-02-29', jukeboxId: 'aurora' }).not.toThrow();
    });

    it('rejects a malformed date string', () => {
      check({ type: 'date', on: '31.10.', jukeboxId: 'aurora' }).toThrow(/invalid date format/);
    });

    it('rejects day 31 in a 30-day month', () => {
      check({ type: 'date', on: '04-31', jukeboxId: 'aurora' }).toThrow(/invalid MM-DD/);
    });

    it('rejects February 30 and month 13', () => {
      check({ type: 'date', on: '02-30', jukeboxId: 'aurora' }).toThrow(/invalid MM-DD/);
      check({ type: 'date', on: '13-01', jukeboxId: 'aurora' }).toThrow(/invalid MM-DD/);
    });

    it('rejects February 29 in a non-leap year', () => {
      check({ type: 'date', on: '2027-02-29', jukeboxId: 'aurora' }).toThrow(/invalid YYYY-MM-DD/);
    });
  });

  describe('range rules', () => {
    it('rejects a range whose start is after its end', () => {
      check({
        type: 'range',
        from: '2026-12-26',
        to: '2026-12-24',
        jukeboxId: 'aurora',
      }).toThrow(/must not be after/);
    });

    it('accepts a single-day range', () => {
      check({
        type: 'range',
        from: '2026-12-24',
        to: '2026-12-24',
        jukeboxId: 'aurora',
      }).not.toThrow();
    });

    it('requires both bounds', () => {
      check({ type: 'range', from: '2026-12-24', jukeboxId: 'aurora' } as unknown as ScheduleRule)
        .toThrow(/requires "from" and "to"/);
    });

    it('rejects MM-DD bounds', () => {
      check({ type: 'range', from: '12-24', to: '12-26', jukeboxId: 'aurora' }).toThrow(
        /invalid YYYY-MM-DD/,
      );
    });
  });

  describe('weekday rules', () => {
    it('accepts ISO days 1 through 7', () => {
      check({ type: 'weekday', days: [1, 7], jukeboxId: 'aurora' }).not.toThrow();
    });

    it('rejects day 0, mirroring the JS Date footgun', () => {
      check({ type: 'weekday', days: [0], jukeboxId: 'aurora' }).toThrow(/ISO integers/);
    });

    it('rejects day 8 and non-integers', () => {
      check({ type: 'weekday', days: [8], jukeboxId: 'aurora' }).toThrow(/ISO integers/);
      check({ type: 'weekday', days: [1.5], jukeboxId: 'aurora' }).toThrow(/ISO integers/);
    });

    it('rejects an empty day list', () => {
      check({ type: 'weekday', days: [], jukeboxId: 'aurora' }).toThrow(/non-empty/);
    });
  });
});
