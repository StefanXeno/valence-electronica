import scheduleJson from '../data/stage-schedule.json';

export const BERLIN_TIMEZONE = 'Europe/Berlin';

export type BerlinCalendarParts = {
  year: number;
  month: number;
  day: number;
  weekday: number;
};

export type DateScheduleRule = {
  type: 'date';
  on: string;
  jukeboxId: string;
};

export type RangeScheduleRule = {
  type: 'range';
  from: string;
  to: string;
  jukeboxId: string;
};

export type WeekdayScheduleRule = {
  type: 'weekday';
  days: number[];
  jukeboxId: string;
};

export type ScheduleRule = DateScheduleRule | RangeScheduleRule | WeekdayScheduleRule;

export type StageSchedule = {
  timezone: string;
  rules: ScheduleRule[];
};

const ISO_WEEKDAY: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

const EMPTY_SCHEDULE: StageSchedule = { timezone: BERLIN_TIMEZONE, rules: [] };

function ruleLabel(rule: ScheduleRule, index: number): string {
  return `rules[${index}] (${rule.type}, jukeboxId=${rule.jukeboxId})`;
}

function parseMonthDay(value: string, label: string): { month: number; day: number } {
  const match = /^(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`[stage-schedule] ${label}: invalid MM-DD date "${value}"`);
  }
  const month = Number(match[1]);
  const day = Number(match[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error(`[stage-schedule] ${label}: invalid MM-DD date "${value}"`);
  }
  if ((month === 4 || month === 6 || month === 9 || month === 11) && day > 30) {
    throw new Error(`[stage-schedule] ${label}: invalid MM-DD date "${value}"`);
  }
  if (month === 2 && day > 29) {
    throw new Error(`[stage-schedule] ${label}: invalid MM-DD date "${value}"`);
  }
  return { month, day };
}

function parseFullDate(value: string, label: string): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error(`[stage-schedule] ${label}: invalid YYYY-MM-DD date "${value}"`);
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
    throw new Error(`[stage-schedule] ${label}: invalid YYYY-MM-DD date "${value}"`);
  }
  return { year, month, day };
}

function toYmd(parts: Pick<BerlinCalendarParts, 'year' | 'month' | 'day'>): number {
  return parts.year * 10_000 + parts.month * 100 + parts.day;
}

export function berlinCalendarParts(now: Date = new Date()): BerlinCalendarParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: BERLIN_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  });
  const values: Record<string, string> = {};
  for (const part of formatter.formatToParts(now)) {
    if (part.type !== 'literal') values[part.type] = part.value;
  }
  const weekday = ISO_WEEKDAY[values.weekday ?? ''];
  if (!weekday) {
    throw new Error(`[stage-schedule] could not resolve Berlin weekday from "${values.weekday}"`);
  }
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    weekday,
  };
}

function matchesDateRule(on: string, parts: BerlinCalendarParts): boolean {
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

function matchesRangeRule(from: string, to: string, parts: BerlinCalendarParts): boolean {
  parseFullDate(from, 'range.from');
  parseFullDate(to, 'range.to');
  const today = toYmd(parts);
  return today >= toYmd(parseFullDate(from, 'range.from')) && today <= toYmd(parseFullDate(to, 'range.to'));
}

function matchesWeekdayRule(days: number[], parts: BerlinCalendarParts): boolean {
  return days.includes(parts.weekday);
}

function isUsableRule(rule: ScheduleRule, catalogIds: ReadonlySet<string>): boolean {
  return catalogIds.has(rule.jukeboxId);
}

export function resolveScheduledDefault(
  schedule: StageSchedule,
  parts: BerlinCalendarParts,
  catalogIds: ReadonlySet<string>,
  staticFallbackId: string,
): string {
  for (const rule of schedule.rules) {
    if (rule.type !== 'date' || !isUsableRule(rule, catalogIds)) continue;
    if (matchesDateRule(rule.on, parts)) return rule.jukeboxId;
  }
  for (const rule of schedule.rules) {
    if (rule.type !== 'range' || !isUsableRule(rule, catalogIds)) continue;
    if (matchesRangeRule(rule.from, rule.to, parts)) return rule.jukeboxId;
  }
  for (const rule of schedule.rules) {
    if (rule.type !== 'weekday' || !isUsableRule(rule, catalogIds)) continue;
    if (matchesWeekdayRule(rule.days, parts)) return rule.jukeboxId;
  }
  return staticFallbackId;
}

function normalizeSchedule(raw: unknown): StageSchedule {
  if (!raw || typeof raw !== 'object') return EMPTY_SCHEDULE;
  const data = raw as Partial<StageSchedule>;
  const timezone = typeof data.timezone === 'string' ? data.timezone : BERLIN_TIMEZONE;
  const rules = Array.isArray(data.rules) ? (data.rules as ScheduleRule[]) : [];
  return { timezone, rules };
}

export function loadStageSchedule(): StageSchedule {
  return normalizeSchedule(scheduleJson);
}

export function validateStageSchedule(schedule: StageSchedule, usableJukeboxIds: ReadonlySet<string>): void {
  if (schedule.timezone !== BERLIN_TIMEZONE) {
    throw new Error(
      `[stage-schedule] timezone must be "${BERLIN_TIMEZONE}" (got "${schedule.timezone}")`,
    );
  }

  schedule.rules.forEach((rule, index) => {
    const label = ruleLabel(rule, index);
    if (!rule?.type || typeof rule.jukeboxId !== 'string' || !rule.jukeboxId.trim()) {
      throw new Error(`[stage-schedule] ${label}: missing type or jukeboxId`);
    }
    if (!usableJukeboxIds.has(rule.jukeboxId)) {
      throw new Error(`[stage-schedule] ${label}: unknown jukebox id "${rule.jukeboxId}"`);
    }

    switch (rule.type) {
      case 'date':
        if (typeof rule.on !== 'string') {
          throw new Error(`[stage-schedule] ${label}: date rule requires "on"`);
        }
        if (!/^\d{2}-\d{2}$/.test(rule.on) && !/^\d{4}-\d{2}-\d{2}$/.test(rule.on)) {
          throw new Error(`[stage-schedule] ${label}: invalid date format "${rule.on}"`);
        }
        if (/^\d{2}-\d{2}$/.test(rule.on)) parseMonthDay(rule.on, label);
        else parseFullDate(rule.on, label);
        break;
      case 'range': {
        if (typeof rule.from !== 'string' || typeof rule.to !== 'string') {
          throw new Error(`[stage-schedule] ${label}: range rule requires "from" and "to"`);
        }
        const from = parseFullDate(rule.from, `${label}.from`);
        const to = parseFullDate(rule.to, `${label}.to`);
        if (toYmd(from) > toYmd(to)) {
          throw new Error(`[stage-schedule] ${label}: range.from must not be after range.to`);
        }
        break;
      }
      case 'weekday':
        if (!Array.isArray(rule.days) || rule.days.length === 0) {
          throw new Error(`[stage-schedule] ${label}: weekday rule requires non-empty "days"`);
        }
        for (const day of rule.days) {
          if (!Number.isInteger(day) || day < 1 || day > 7) {
            throw new Error(`[stage-schedule] ${label}: weekday days must be ISO integers 1–7`);
          }
        }
        break;
      default:
        throw new Error(`[stage-schedule] ${label}: unknown rule type`);
    }
  });
}
