import { getCollection, getEntry } from 'astro:content';

import { resolveHudIcon, type HudIconToken } from './hud-icons';

export interface UiChrome {
  aboutTitle: string;
  lyricsTitle: string;
  discographyTitle: string;
  tourTitle: string;
  stageButtonLabel: string;
  emptyLyrics: string;
  emptyReleases: string;
  emptyShows: string;
  jukeboxLabel: string;
  socialsLabel: string;
  comingSoon: string;
  ticketLabel: string;
  introLead: string;
  introName: string;
  jukeboxIcon: HudIconToken;
  jukeboxIconEmoji?: string;
  aboutIcon: HudIconToken;
  aboutIconEmoji?: string;
  lyricsIcon: HudIconToken;
  lyricsIconEmoji?: string;
  discographyIcon: HudIconToken;
  discographyIconEmoji?: string;
  tourIcon: HudIconToken;
  tourIconEmoji?: string;
  trackInfoTitle: string;
  trackInfoIcon: HudIconToken;
  trackInfoIconEmoji?: string;
  releasedLabel: string;
  emptyTrackLinks: string;
  shuffleLabel: string;
  loopLabel: string;
  shuffleIcon: HudIconToken;
  shuffleIconEmoji?: string;
  loopIcon: HudIconToken;
  loopIconEmoji?: string;
  shuffleDefault: boolean;
  loopDefault: boolean;
  unmuteTooltip: string;
  muteTooltip: string;
  volumeSliderTooltip: string;
}

const CHROME_FALLBACK: UiChrome = {
  aboutTitle: 'About me',
  lyricsTitle: 'Lyrics',
  discographyTitle: 'Discography',
  tourTitle: 'Tour',
  stageButtonLabel: 'Play on V-Flip',
  emptyLyrics: 'Lyrics not available',
  emptyReleases: 'No releases yet',
  emptyShows: 'No upcoming dates',
  jukeboxLabel: 'V-Flip',
  socialsLabel: 'Socials',
  comingSoon: 'coming soon',
  ticketLabel: 'Tickets',
  introLead: "Hi I'm",
  introName: 'Valence',
  jukeboxIcon: 'jukebox',
  aboutIcon: 'about',
  lyricsIcon: 'lyrics',
  discographyIcon: 'discography',
  tourIcon: 'tour',
  trackInfoTitle: 'Track info',
  trackInfoIcon: 'info',
  releasedLabel: 'Released',
  emptyTrackLinks: 'No streaming links yet',
  shuffleLabel: 'Shuffle',
  loopLabel: 'Loop',
  shuffleIcon: 'shuffle',
  loopIcon: 'loop',
  shuffleDefault: true,
  loopDefault: false,
  unmuteTooltip: 'Unmute',
  muteTooltip: 'Mute',
  volumeSliderTooltip: 'Drag to adjust volume',
};

export interface ReleaseItem {
  id: string;
  title: string;
  year: number;
  kind?: string;
  url?: string;
  jukeboxId?: string;
}

export interface ShowItem {
  id: string;
  date: Date;
  city: string;
  venue: string;
  ticketUrl?: string;
}

export async function getChrome(): Promise<UiChrome> {
  const entry = await getEntry('ui', 'chrome');
  if (!entry) {
    console.warn('[stage] missing src/content/ui/chrome.md; using fallback labels');
    return CHROME_FALLBACK;
  }
  return {
    aboutTitle: entry.data.aboutTitle?.trim() || CHROME_FALLBACK.aboutTitle,
    lyricsTitle: entry.data.lyricsTitle?.trim() || CHROME_FALLBACK.lyricsTitle,
    discographyTitle: entry.data.discographyTitle?.trim() || CHROME_FALLBACK.discographyTitle,
    tourTitle: entry.data.tourTitle?.trim() || CHROME_FALLBACK.tourTitle,
    stageButtonLabel: entry.data.stageButtonLabel?.trim() || CHROME_FALLBACK.stageButtonLabel,
    emptyLyrics: entry.data.emptyLyrics?.trim() || CHROME_FALLBACK.emptyLyrics,
    emptyReleases: entry.data.emptyReleases?.trim() || CHROME_FALLBACK.emptyReleases,
    emptyShows: entry.data.emptyShows?.trim() || CHROME_FALLBACK.emptyShows,
    jukeboxLabel: entry.data.jukeboxLabel?.trim() || CHROME_FALLBACK.jukeboxLabel,
    socialsLabel: entry.data.socialsLabel?.trim() || CHROME_FALLBACK.socialsLabel,
    comingSoon: entry.data.comingSoon?.trim() || CHROME_FALLBACK.comingSoon,
    ticketLabel: entry.data.ticketLabel?.trim() || CHROME_FALLBACK.ticketLabel,
    introLead: entry.data.introLead?.trim() || CHROME_FALLBACK.introLead,
    introName: entry.data.introName?.trim() || CHROME_FALLBACK.introName,
    ...(() => {
      const jukebox = resolveHudIcon(entry.data.jukeboxIcon, 'jukebox');
      const about = resolveHudIcon(entry.data.aboutIcon, 'about');
      const lyrics = resolveHudIcon(entry.data.lyricsIcon, 'lyrics');
      const discography = resolveHudIcon(entry.data.discographyIcon, 'discography');
      const tour = resolveHudIcon(entry.data.tourIcon, 'tour');
      const trackInfo = resolveHudIcon(entry.data.trackInfoIcon, 'info');
      const shuffle = resolveHudIcon(entry.data.shuffleIcon, 'shuffle');
      const loop = resolveHudIcon(entry.data.loopIcon, 'loop');
      return {
        jukeboxIcon: jukebox.token,
        jukeboxIconEmoji: jukebox.emoji,
        aboutIcon: about.token,
        aboutIconEmoji: about.emoji,
        lyricsIcon: lyrics.token,
        lyricsIconEmoji: lyrics.emoji,
        discographyIcon: discography.token,
        discographyIconEmoji: discography.emoji,
        tourIcon: tour.token,
        tourIconEmoji: tour.emoji,
        trackInfoIcon: trackInfo.token,
        trackInfoIconEmoji: trackInfo.emoji,
        shuffleIcon: shuffle.token,
        shuffleIconEmoji: shuffle.emoji,
        loopIcon: loop.token,
        loopIconEmoji: loop.emoji,
      };
    })(),
    trackInfoTitle: entry.data.trackInfoTitle?.trim() || CHROME_FALLBACK.trackInfoTitle,
    releasedLabel: entry.data.releasedLabel?.trim() || CHROME_FALLBACK.releasedLabel,
    emptyTrackLinks: entry.data.emptyTrackLinks?.trim() || CHROME_FALLBACK.emptyTrackLinks,
    shuffleLabel: entry.data.shuffleLabel?.trim() || CHROME_FALLBACK.shuffleLabel,
    loopLabel: entry.data.loopLabel?.trim() || CHROME_FALLBACK.loopLabel,
    shuffleDefault: entry.data.shuffleDefault ?? CHROME_FALLBACK.shuffleDefault,
    loopDefault: entry.data.loopDefault ?? CHROME_FALLBACK.loopDefault,
    unmuteTooltip: entry.data.unmuteTooltip?.trim() || CHROME_FALLBACK.unmuteTooltip,
    muteTooltip: entry.data.muteTooltip?.trim() || CHROME_FALLBACK.muteTooltip,
    volumeSliderTooltip:
      entry.data.volumeSliderTooltip?.trim() || CHROME_FALLBACK.volumeSliderTooltip,
  };
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

export async function getAboutEntry() {
  const entry = await getEntry('about', 'me');
  if (!entry || !entry.body?.trim()) return undefined;
  return entry;
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

function dateKey(value: Date): number {
  return Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
}

export async function getValidReleases(): Promise<ReleaseItem[]> {
  const raw = await getCollection('releases');
  const items: ReleaseItem[] = [];
  for (const entry of raw) {
    if (entry.id.startsWith('__empty__')) continue;
    const title = entry.data.title?.trim();
    const year = entry.data.year;
    if (!title || typeof year !== 'number') {
      console.warn(`[stage] omitted release "${entry.id}" (missing title or year)`);
      continue;
    }
    items.push({
      id: entry.id,
      title,
      year,
      kind: entry.data.kind?.trim() || undefined,
      url: isHttpUrl(entry.data.url) ? entry.data.url : undefined,
      jukeboxId: entry.data.jukeboxId?.trim() || undefined,
    });
  }
  return items.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
}

export async function getUpcomingShows(): Promise<ShowItem[]> {
  const raw = await getCollection('shows');
  const today = dateKey(berlinToday());
  const items: ShowItem[] = [];
  for (const entry of raw) {
    if (entry.id.startsWith('__empty__')) continue;
    const { date, city, venue, ticketUrl } = entry.data;
    if (!date || !city?.trim() || !venue?.trim()) {
      console.warn(`[stage] omitted show "${entry.id}" (missing date, city, or venue)`);
      continue;
    }
    if (dateKey(date) < today) continue;
    items.push({
      id: entry.id,
      date,
      city: city.trim(),
      venue: venue.trim(),
      ticketUrl: isHttpUrl(ticketUrl) ? ticketUrl : undefined,
    });
  }
  return items.sort((a, b) => a.date.getTime() - b.date.getTime());
}
