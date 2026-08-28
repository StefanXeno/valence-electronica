import poolJson from '../data/tagline-pool.json';
import { BERLIN_TIMEZONE, berlinCalendarParts, type BerlinCalendarParts } from './stage-schedule';

export type TaglineDateRule = {
  type: 'date';
  on: string;
};

export type TaglineRangeRule = {
  type: 'range';
  from: string;
  to: string;
};

export type TaglineWeekdayRule = {
  type: 'weekday';
  days: number[];
};

export type TaglineTimeRule = {
  type: 'time';
  from: string;
  to: string;
};

export type TaglineRule = TaglineDateRule | TaglineRangeRule | TaglineWeekdayRule | TaglineTimeRule;

export type TaglineLine = {
  text: string;
  weight?: number;
  rules?: TaglineRule[];
};

export type TaglinePool = {
  timezone: string;
  lines: TaglineLine[];
};

export type EligibleTagline = {
  text: string;
};

export type BerlinTimeParts = {
  hour: number;
  minute: number;
};

function lineLabel(index: number, text: string): string {
  const preview = text.length > 40 ? `${text.slice(0, 37)}…` : text;
  return `lines[${index}] ("${preview}")`;
}

function parseMonthDay(value: string, label: string): { month: number; day: number } {
  const match = /^(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`[tagline-pool] ${label}: invalid MM-DD date "${value}"`);
  }
  const month = Number(match[1]);
  const day = Number(match[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error(`[tagline-pool] ${label}: invalid MM-DD date "${value}"`);
  }
  if ((month === 4 || month === 6 || month === 9 || month === 11) && day > 30) {
    throw new Error(`[tagline-pool] ${label}: invalid MM-DD date "${value}"`);
  }
  if (month === 2 && day > 29) {
    throw new Error(`[tagline-pool] ${label}: invalid MM-DD date "${value}"`);
  }
  return { month, day };
}

function parseFullDate(value: string, label: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`[tagline-pool] ${label}: invalid YYYY-MM-DD date "${value}"`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  parseMonthDay(`${match[2]}-${match[3]}`, label);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() + 1 !== month ||
    probe.getUTCDate() !== day
  ) {
    throw new Error(`[tagline-pool] ${label}: invalid YYYY-MM-DD date "${value}"`);
  }
  return { year, month, day };
}

function toYmd(parts: Pick<BerlinCalendarParts, 'year' | 'month' | 'day'>): number {
  return parts.year * 10_000 + parts.month * 100 + parts.day;
}

function parseClock(value: string, label: string): number {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`[tagline-pool] ${label}: invalid time "${value}" (expected HH:MM)`);
  }
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) {
    throw new Error(`[tagline-pool] ${label}: invalid time "${value}"`);
  }
  return hour * 60 + minute;
}

export function berlinTimeParts(now: Date = new Date()): BerlinTimeParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: BERLIN_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const values: Record<string, string> = {};
  for (const part of formatter.formatToParts(now)) {
    if (part.type !== 'literal') values[part.type] = part.value;
  }
  return {
    hour: Number(values.hour),
    minute: Number(values.minute),
  };
}

export function matchesDateRule(on: string, parts: BerlinCalendarParts): boolean {
  if (/^\d{2}-\d{2}$/.test(on)) {
    const { month, day } = parseMonthDay(on, 'date.on');
    return parts.month === month && parts.day === day;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(on)) {
    const full = parseFullDate(on, 'date.on');
    return parts.year === full.year && parts.month === full.month && parts.day === full.day;
  }
  return false;
}

export function matchesRangeRule(from: string, to: string, parts: BerlinCalendarParts): boolean {
  parseFullDate(from, 'range.from');
  parseFullDate(to, 'range.to');
  const today = toYmd(parts);
  return today >= toYmd(parseFullDate(from, 'range.from')) && today <= toYmd(parseFullDate(to, 'range.to'));
}

export function matchesWeekdayRule(days: number[], parts: BerlinCalendarParts): boolean {
  return days.includes(parts.weekday);
}

export function matchesTimeRule(from: string, to: string, time: BerlinTimeParts): boolean {
  const start = parseClock(from, 'time.from');
  const end = parseClock(to, 'time.to');
  const now = time.hour * 60 + time.minute;
  if (start <= end) return now >= start && now <= end;
  return now >= start || now <= end;
}

function matchesRule(
  rule: TaglineRule,
  calendar: BerlinCalendarParts,
  clock: BerlinTimeParts,
): boolean {
  switch (rule.type) {
    case 'date':
      return matchesDateRule(rule.on, calendar);
    case 'range':
      return matchesRangeRule(rule.from, rule.to, calendar);
    case 'weekday':
      return matchesWeekdayRule(rule.days, calendar);
    case 'time':
      return matchesTimeRule(rule.from, rule.to, clock);
    default:
      return false;
  }
}

function lineRulesMatch(line: TaglineLine, calendar: BerlinCalendarParts, clock: BerlinTimeParts): boolean {
  const rules = line.rules ?? [];
  if (rules.length === 0) return false;
  return rules.every((rule) => matchesRule(rule, calendar, clock));
}

function isEasterEggLine(line: TaglineLine): boolean {
  return (line.rules?.length ?? 0) > 0;
}

function expandNormalLines(lines: TaglineLine[]): EligibleTagline[] {
  const expanded: EligibleTagline[] = [];
  for (const line of lines) {
    const text = line.text.trim();
    if (!text) continue;
    const weight = line.weight ?? 1;
    for (let step = 0; step < weight; step += 1) {
      expanded.push({ text });
    }
  }
  return expanded;
}

export function buildEligibleSet(pool: TaglinePool, now: Date = new Date()): EligibleTagline[] {
  const calendar = berlinCalendarParts(now);
  const clock = berlinTimeParts(now);
  const easterEggs: EligibleTagline[] = [];

  for (const line of pool.lines) {
    if (!isEasterEggLine(line)) continue;
    if (lineRulesMatch(line, calendar, clock)) {
      easterEggs.push({ text: line.text.trim() });
    }
  }

  if (easterEggs.length > 0) return easterEggs;

  const normalLines = pool.lines.filter((line) => !isEasterEggLine(line));
  return expandNormalLines(normalLines);
}

export function nextRotationIndex(current: number, length: number): number {
  if (length <= 0) return 0;
  return (current + 1) % length;
}

export function clampRotationIndex(index: number, length: number): number {
  if (length <= 0) return 0;
  return ((index % length) + length) % length;
}

export function formatTagline(text: string): string {
  return text.replace(' for ', ' for\u00A0');
}

export function taglineTextsEqual(a: string, b: string): boolean {
  return formatTagline(a.trim()) === formatTagline(b.trim());
}

export function loadTaglinePool(): TaglinePool {
  if (!poolJson || typeof poolJson !== 'object') {
    throw new Error('[tagline-pool] src/data/tagline-pool.json is missing or invalid');
  }
  const data = poolJson as Partial<TaglinePool>;
  return {
    timezone: typeof data.timezone === 'string' ? data.timezone : BERLIN_TIMEZONE,
    lines: Array.isArray(data.lines) ? (data.lines as TaglineLine[]) : [],
  };
}

function validateRule(rule: TaglineRule, label: string): void {
  switch (rule.type) {
    case 'date':
      if (typeof rule.on !== 'string') {
        throw new Error(`[tagline-pool] ${label}: date rule requires "on"`);
      }
      if (!/^\d{2}-\d{2}$/.test(rule.on) && !/^\d{4}-\d{2}-\d{2}$/.test(rule.on)) {
        throw new Error(`[tagline-pool] ${label}: invalid date format "${rule.on}"`);
      }
      if (/^\d{2}-\d{2}$/.test(rule.on)) parseMonthDay(rule.on, label);
      else parseFullDate(rule.on, label);
      break;
    case 'range': {
      if (typeof rule.from !== 'string' || typeof rule.to !== 'string') {
        throw new Error(`[tagline-pool] ${label}: range rule requires "from" and "to"`);
      }
      const from = parseFullDate(rule.from, `${label}.from`);
      const to = parseFullDate(rule.to, `${label}.to`);
      if (toYmd(from) > toYmd(to)) {
        throw new Error(`[tagline-pool] ${label}: range.from must not be after range.to`);
      }
      break;
    }
    case 'weekday':
      if (!Array.isArray(rule.days) || rule.days.length === 0) {
        throw new Error(`[tagline-pool] ${label}: weekday rule requires non-empty "days"`);
      }
      for (const day of rule.days) {
        if (!Number.isInteger(day) || day < 1 || day > 7) {
          throw new Error(`[tagline-pool] ${label}: weekday days must be ISO integers 1–7`);
        }
      }
      break;
    case 'time':
      if (typeof rule.from !== 'string' || typeof rule.to !== 'string') {
        throw new Error(`[tagline-pool] ${label}: time rule requires "from" and "to"`);
      }
      parseClock(rule.from, `${label}.from`);
      parseClock(rule.to, `${label}.to`);
      break;
    default:
      throw new Error(`[tagline-pool] ${label}: unknown rule type`);
  }
}

export function validateTaglinePool(pool: TaglinePool): void {
  if (pool.timezone !== BERLIN_TIMEZONE) {
    throw new Error(
      `[tagline-pool] timezone must be "${BERLIN_TIMEZONE}" (got "${pool.timezone}")`,
    );
  }

  pool.lines.forEach((line, index) => {
    const label = lineLabel(index, line?.text ?? '');
    if (!line || typeof line.text !== 'string' || !line.text.trim()) {
      throw new Error(`[tagline-pool] ${label}: missing non-empty "text"`);
    }
    if (line.weight !== undefined) {
      if (!Number.isInteger(line.weight) || line.weight < 1) {
        throw new Error(`[tagline-pool] ${label}: weight must be a positive integer`);
      }
      if (isEasterEggLine(line)) {
        throw new Error(`[tagline-pool] ${label}: weight is not allowed on easter-egg lines in v1`);
      }
    }
    if (line.rules !== undefined) {
      if (!Array.isArray(line.rules) || line.rules.length === 0) {
        throw new Error(`[tagline-pool] ${label}: rules must be a non-empty array when present`);
      }
      line.rules.forEach((rule, ruleIndex) => {
        validateRule(rule, `${label}.rules[${ruleIndex}]`);
      });
    }
  });
}

/** Dev-only query key: `?tagline-interval=<seconds>` (ignored in production). */
export const TAGLINE_INTERVAL_QUERY = 'tagline-interval';

export const TAGLINE_ROTATION_MS_PRODUCTION = 15_000;
export const TAGLINE_ROTATION_MS_DEV_DEFAULT = 10_000;

const TAGLINE_INTERVAL_SECONDS_MIN = 1;
const TAGLINE_INTERVAL_SECONDS_MAX = 3600;

export function parseTaglineIntervalSeconds(raw: string | null): number | undefined {
  if (raw === null || raw.trim() === '') return undefined;
  const seconds = Number(raw);
  if (!Number.isFinite(seconds) || seconds < TAGLINE_INTERVAL_SECONDS_MIN) return undefined;
  if (seconds > TAGLINE_INTERVAL_SECONDS_MAX) return undefined;
  return seconds;
}

export function resolveTaglineRotationMs(options: {
  dev: boolean;
  intervalSeconds?: number;
}): number {
  if (!options.dev) return TAGLINE_ROTATION_MS_PRODUCTION;
  if (options.intervalSeconds !== undefined) {
    return Math.round(options.intervalSeconds * 1000);
  }
  return TAGLINE_ROTATION_MS_DEV_DEFAULT;
}

/** Client-only: production is always 15 s; dev defaults to 10 s unless query overrides. */
export function readTaglineRotationMsFromLocation(): number {
  if (typeof window === 'undefined') {
    return resolveTaglineRotationMs({ dev: import.meta.env.DEV });
  }
  if (!import.meta.env.DEV) return TAGLINE_ROTATION_MS_PRODUCTION;

  const seconds = parseTaglineIntervalSeconds(
    new URLSearchParams(window.location.search).get(TAGLINE_INTERVAL_QUERY),
  );
  return resolveTaglineRotationMs({ dev: true, intervalSeconds: seconds });
}
