import { getCollection, getEntry } from 'astro:content';

import siteJson from '../data/site.json';
import { resolveHudIcon, type HudIconToken } from './hud-icons';
import { berlinToday, collectUpcomingShows, type ShowEntryInput } from './stage-upcoming';

export { resolveShowTitle } from './stage-upcoming';

export interface UiChrome {
  aboutTitle: string;
  discographyTitle: string;
  tourTitle: string;
  homeTitle: string;
  shopTitle: string;
  contactTitle: string;
  shopComingSoonTitle: string;
  shopComingSoonBody: string;
  contactEmpty: string;
  stageButtonLabel: string;
  currentlyPlayingLabel: string;
  currentlyPausingLabel: string;
  emptyReleases: string;
  emptyShows: string;
  jukeboxLabel: string;
  jukeboxPanelTitle: string;
  jukeboxPanelTooltip: string;
  socialsLabel: string;
  socialsIcon: HudIconToken;
  socialsIconEmoji?: string;
  infoTitle: string;
  infoIcon: HudIconToken;
  infoIconEmoji?: string;
  imprintButton: string;
  privacyButton: string;
  playerExpandLabel: string;
  playerCollapseLabel: string;
  comingSoon: string;
  ticketLabel: string;
  venueInfoLabel: string;
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
  playlistLabel: string;
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

export interface SiteContactLink {
  label: string;
  url: string;
}

export interface SiteContact {
  headline: string;
  body: string;
  email: string;
  links: SiteContactLink[];
}

export interface SiteNavData {
  shopUrl?: string;
  contact: SiteContact;
}

const CHROME_FALLBACK: UiChrome = {
  aboutTitle: 'About me',
  discographyTitle: 'Discography',
  tourTitle: 'Tour',
  homeTitle: 'Home',
  shopTitle: 'Shop',
  contactTitle: 'Contact',
  shopComingSoonTitle: 'Coming soon',
  shopComingSoonBody: 'Merch is on the way. Check back soon.',
  contactEmpty: 'Contact details are not ready yet — check back soon.',
  stageButtonLabel: 'Play on V-Flip',
  currentlyPlayingLabel: 'Currently playing',
  currentlyPausingLabel: 'Currently pausing',
  emptyReleases: 'No releases yet',
  emptyShows: 'No upcoming dates',
  jukeboxLabel: 'V-Flip',
  jukeboxPanelTitle: 'V-Flip aka. Jukebox',
  jukeboxPanelTooltip: 'Pick a track to switch stages—the site theme changes with each one.',
  socialsLabel: 'Links',
  socialsIcon: 'socials',
  infoTitle: 'Info',
  infoIcon: 'info',
  imprintButton: 'Imprint',
  privacyButton: 'Privacy Policy',
  playerExpandLabel: 'Show player controls',
  playerCollapseLabel: 'Hide player controls',
  comingSoon: 'coming soon',
  ticketLabel: 'Tickets',
  venueInfoLabel: 'Information',
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
  playlistLabel: 'Playlist',
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
  title?: string;
  ticketUrl?: string;
  venueUrl?: string;
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
    homeTitle: entry.data.homeTitle?.trim() || CHROME_FALLBACK.homeTitle,
    shopTitle: entry.data.shopTitle?.trim() || CHROME_FALLBACK.shopTitle,
    contactTitle: entry.data.contactTitle?.trim() || CHROME_FALLBACK.contactTitle,
    shopComingSoonTitle:
      entry.data.shopComingSoonTitle?.trim() || CHROME_FALLBACK.shopComingSoonTitle,
    shopComingSoonBody:
      entry.data.shopComingSoonBody?.trim() || CHROME_FALLBACK.shopComingSoonBody,
    contactEmpty: entry.data.contactEmpty?.trim() || CHROME_FALLBACK.contactEmpty,
    stageButtonLabel: entry.data.stageButtonLabel?.trim() || CHROME_FALLBACK.stageButtonLabel,
    currentlyPlayingLabel:
      entry.data.currentlyPlayingLabel?.trim() || CHROME_FALLBACK.currentlyPlayingLabel,
    currentlyPausingLabel:
      entry.data.currentlyPausingLabel?.trim() || CHROME_FALLBACK.currentlyPausingLabel,
    emptyReleases: entry.data.emptyReleases?.trim() || CHROME_FALLBACK.emptyReleases,
    emptyShows: entry.data.emptyShows?.trim() || CHROME_FALLBACK.emptyShows,
    jukeboxLabel: entry.data.jukeboxLabel?.trim() || CHROME_FALLBACK.jukeboxLabel,
    jukeboxPanelTitle: entry.data.jukeboxPanelTitle?.trim() || CHROME_FALLBACK.jukeboxPanelTitle,
    jukeboxPanelTooltip:
      entry.data.jukeboxPanelTooltip?.trim() || CHROME_FALLBACK.jukeboxPanelTooltip,
    socialsLabel: entry.data.socialsLabel?.trim() || CHROME_FALLBACK.socialsLabel,
    infoTitle: entry.data.infoTitle?.trim() || CHROME_FALLBACK.infoTitle,
    imprintButton: entry.data.imprintButton?.trim() || CHROME_FALLBACK.imprintButton,
    privacyButton: entry.data.privacyButton?.trim() || CHROME_FALLBACK.privacyButton,
    playerExpandLabel:
      entry.data.playerExpandLabel?.trim() || CHROME_FALLBACK.playerExpandLabel,
    playerCollapseLabel:
      entry.data.playerCollapseLabel?.trim() || CHROME_FALLBACK.playerCollapseLabel,
    comingSoon: entry.data.comingSoon?.trim() || CHROME_FALLBACK.comingSoon,
    ticketLabel: entry.data.ticketLabel?.trim() || CHROME_FALLBACK.ticketLabel,
    venueInfoLabel: entry.data.venueInfoLabel?.trim() || CHROME_FALLBACK.venueInfoLabel,
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
      const socials = resolveHudIcon(entry.data.socialsIcon, 'socials');
      const info = resolveHudIcon(entry.data.infoIcon, 'info');
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
        socialsIcon: socials.token,
        socialsIconEmoji: socials.emoji,
        infoIcon: info.token,
        infoIconEmoji: info.emoji,
      };
    })(),
    trackInfoTitle: entry.data.trackInfoTitle?.trim() || CHROME_FALLBACK.trackInfoTitle,
    releasedLabel: entry.data.releasedLabel?.trim() || CHROME_FALLBACK.releasedLabel,
    listenOnLabel: entry.data.listenOnLabel?.trim() || CHROME_FALLBACK.listenOnLabel,
    emptyTrackLinks: entry.data.emptyTrackLinks?.trim() || CHROME_FALLBACK.emptyTrackLinks,
    shuffleLabel: entry.data.shuffleLabel?.trim() || CHROME_FALLBACK.shuffleLabel,
    playlistLabel: entry.data.playlistLabel?.trim() || CHROME_FALLBACK.playlistLabel,
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
    const { date, city, venue, title, ticketUrl, venueUrl } = entry.data;
    if (!date || !city?.trim() || !venue?.trim()) {
      console.warn(`[stage] omitted show "${entry.id}" (missing date, city, or venue)`);
      continue;
    }
    entries.push({
      id: entry.id,
      date,
      city,
      venue,
      title,
      ticketUrl,
      venueUrl,
    });
  }

  return collectUpcomingShows(entries, berlinToday());
}

function parseContact(raw: unknown): SiteContact {
  const empty: SiteContact = { headline: '', body: '', email: '', links: [] };
  if (!raw || typeof raw !== 'object') return empty;
  const c = raw as Record<string, unknown>;
  const linksRaw = Array.isArray(c.links) ? c.links : [];
  const links: SiteContactLink[] = [];
  for (const item of linksRaw) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const label = typeof row.label === 'string' ? row.label.trim() : '';
    const url = typeof row.url === 'string' ? row.url.trim() : '';
    if (!label || !url) continue;
    if (!/^https?:\/\//i.test(url)) continue;
    links.push({ label, url });
  }
  return {
    headline: typeof c.headline === 'string' ? c.headline.trim() : '',
    body: typeof c.body === 'string' ? c.body.trim() : '',
    email: typeof c.email === 'string' ? c.email.trim() : '',
    links,
  };
}

/** Shop URL + contact block from site.json (020 single source of truth). */
export function getSiteNavData(): SiteNavData {
  const raw = siteJson as {
    shopUrl?: string;
    contact?: unknown;
  };
  const shopUrl =
    typeof raw.shopUrl === 'string' && /^https?:\/\//i.test(raw.shopUrl.trim())
      ? raw.shopUrl.trim()
      : undefined;
  return {
    shopUrl,
    contact: parseContact(raw.contact),
  };
}

export function isContactComplete(contact: SiteContact): boolean {
  return Boolean(contact.body || contact.email || contact.links.length > 0);
}
