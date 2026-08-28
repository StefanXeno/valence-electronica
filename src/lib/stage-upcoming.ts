export type ShowEntryInput = {
  id: string;
  date: Date;
  city: string;
  venue: string;
  ticketUrl?: string;
};

export interface UpcomingShowItem {
  id: string;
  date: Date;
  city: string;
  venue: string;
  ticketUrl?: string;
}

function dateKey(value: Date): number {
  return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
}

function isHttpUrl(value?: string): value is string {
  if (!value?.trim()) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function berlinToday(): Date {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === 'year')?.value);
  const month = Number(parts.find((part) => part.type === 'month')?.value);
  const day = Number(parts.find((part) => part.type === 'day')?.value);
  return new Date(Date.UTC(year, month - 1, day));
}

export function collectUpcomingShows(
  entries: ShowEntryInput[],
  today: Date,
): UpcomingShowItem[] {
  const todayKey = dateKey(today);
  const items: UpcomingShowItem[] = [];

  for (const entry of entries) {
    if (entry.id.startsWith('__empty__')) continue;
    if (!entry.date || !entry.city?.trim() || !entry.venue?.trim()) continue;
    if (dateKey(entry.date) < todayKey) continue;
    items.push({
      id: entry.id,
      date: entry.date,
      city: entry.city.trim(),
      venue: entry.venue.trim(),
      ticketUrl: isHttpUrl(entry.ticketUrl) ? entry.ticketUrl : undefined,
    });
  }

  return items.sort((a, b) => a.date.getTime() - b.date.getTime());
}
