import { getCollection, getEntry } from 'astro:content';

import { resolveHudIcon, type HudIconToken } from './hud-icons';
import { berlinToday, collectUpcomingShows, type ShowEntryInput } from './stage-upcoming';

export interface UiChrome {
  aboutTitle: string;
  discographyTitle: string;
  tourTitle: string;
  stageButtonLabel: string;
  currentlyPlayingLabel: string;
  emptyReleases: string;
  emptyShows: string;
  jukeboxLabel: string;
  jukeboxPanelTitle: string;
  jukeboxPanelTooltip: string;
  socialsLabel: string;
  comingSoon: string;
  ticketLabel: string;
  introLead: string;
  introName: string;
  jukeboxIcon: HudIconToken;
  jukeboxIconEmoji?: string;
  aboutIcon: HudIconToken;
  aboutIconEmoji?: string;
  discographyIcon: HudIconToken;
  discographyIconEmoji?: string;
  tourIcon: HudIconToken;
  tourIconEmoji?: string;
  trackInfoTitle: string;
  trackInfoIcon: HudIconToken;
  trackInfoIconEmoji?: string;
  releasedLabel: string;
  listenOnLabel: string;
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
  discographyTitle: 'Discography',
  tourTitle: 'Tour',
  stageButtonLabel: 'Play on V-Flip',
  currentlyPlayingLabel: 'Currently playing',
  emptyReleases: 'No releases yet',
  emptyShows: 'No upcoming dates',
  jukeboxLabel: 'V-Flip',
  jukeboxPanelTitle: 'V-Flip aka. Jukebox',
  jukeboxPanelTooltip: 'Pick a track to switch stages—the site theme changes with each one.',
  socialsLabel: 'Socials',
  comingSoon: 'coming soon',
  ticketLabel: 'Tickets',
  introLead: "Hi I'm",
  introName: 'Valence',
  jukeboxIcon: 'jukebox',
  aboutIcon: 'about',
  discographyIcon: 'discography',
  tourIcon: 'tour',
  trackInfoTitle: 'Track info',
  trackInfoIcon: 'info',
  releasedLabel: 'Released',
  listenOnLabel: 'Listen On',
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
    discographyTitle: entry.data.discographyTitle?.trim() || CHROME_FALLBACK.discographyTitle,
    tourTitle: entry.data.tourTitle?.trim() || CHROME_FALLBACK.tourTitle,
    stageButtonLabel: entry.data.stageButtonLabel?.trim() || CHROME_FALLBACK.stageButtonLabel,
    currentlyPlayingLabel:
      entry.data.currentlyPlayingLabel?.trim() || CHROME_FALLBACK.currentlyPlayingLabel,
    emptyReleases: entry.data.emptyReleases?.trim() || CHROME_FALLBACK.emptyReleases,
    emptyShows: entry.data.emptyShows?.trim() || CHROME_FALLBACK.emptyShows,
    jukeboxLabel: entry.data.jukeboxLabel?.trim() || CHROME_FALLBACK.jukeboxLabel,
    jukeboxPanelTitle: entry.data.jukeboxPanelTitle?.trim() || CHROME_FALLBACK.jukeboxPanelTitle,
    jukeboxPanelTooltip:
      entry.data.jukeboxPanelTooltip?.trim() || CHROME_FALLBACK.jukeboxPanelTooltip,
    socialsLabel: entry.data.socialsLabel?.trim() || CHROME_FALLBACK.socialsLabel,
    comingSoon: entry.data.comingSoon?.trim() || CHROME_FALLBACK.comingSoon,
    ticketLabel: entry.data.ticketLabel?.trim() || CHROME_FALLBACK.ticketLabel,
    introLead: entry.data.introLead?.trim() || CHROME_FALLBACK.introLead,
    introName: entry.data.introName?.trim() || CHROME_FALLBACK.introName,
    ...(() => {
      const jukebox = resolveHudIcon(entry.data.jukeboxIcon, 'jukebox');
      const about = resolveHudIcon(entry.data.aboutIcon, 'about');
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
    listenOnLabel: entry.data.listenOnLabel?.trim() || CHROME_FALLBACK.listenOnLabel,
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

export async function getAboutEntry() {
  const entry = await getEntry('about', 'me');
  if (!entry || !entry.body?.trim()) return undefined;
  return entry;
}

export async function getUpcomingShows(): Promise<ShowItem[]> {
  const raw = await getCollection('shows');
  const entries: ShowEntryInput[] = [];

  for (const entry of raw) {
    if (entry.id.startsWith('__empty__')) continue;
    const { date, city, venue, ticketUrl } = entry.data;
    if (!date || !city?.trim() || !venue?.trim()) {
      console.warn(`[stage] omitted show "${entry.id}" (missing date, city, or venue)`);
      continue;
    }
    entries.push({
      id: entry.id,
      date,
      city,
      venue,
      ticketUrl,
    });
  }

  return collectUpcomingShows(entries, berlinToday());
}
