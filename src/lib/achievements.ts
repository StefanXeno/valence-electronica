/**
 * Achievement registry, unlock state, and gallery tile logic (036).
 *
 * Pure apart from the default `localStorage` / `document` arguments, so it is unit-testable.
 * Never import `src/data/achievements.json` here: client bundles include this module, and the
 * JSON holds secret copy in plain text. Build-time code loads the JSON through
 * `achievements-registry.ts` and hands the browser an obfuscated payload instead.
 */

import { PLAYER_DISCOVERED_STORAGE_KEY } from './player-discovery';

export const KNOWN_ACHIEVEMENT_IDS = [
  'taking-over',
  'infinite-spin',
  'player-found',
  'demonic-combo',
  'coder',
] as const;
export type AchievementId = (typeof KNOWN_ACHIEVEMENT_IDS)[number];

export const ACHIEVEMENT_GLYPHS = ['vinyl', 'infinite', 'demonic', 'code'] as const;
export type AchievementGlyph = (typeof ACHIEVEMENT_GLYPHS)[number];

export type Achievement = {
  id: AchievementId;
  title: string;
  subtitle: string;
  glyph: AchievementGlyph;
  secret: boolean;
  hint?: string;
};

const STORAGE_PREFIX = 've-achievement-';
/** Where the payload lives in the DOM (toast root, present on every page). */
export const REGISTRY_ATTR = 'data-achievement-registry';

export function achievementStorageKey(id: AchievementId): string {
  return `${STORAGE_PREFIX}${id}`;
}

function isKnownId(value: unknown): value is AchievementId {
  return typeof value === 'string' && (KNOWN_ACHIEVEMENT_IDS as readonly string[]).includes(value);
}

function filled(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Validate `achievements.json`; throws with the entry position and id on the first problem. */
export function validateAchievementRegistry(raw: unknown): Achievement[] {
  const fail = (message: string): never => {
    throw new Error(`[achievements] src/data/achievements.json: ${message}`);
  };

  const list = (raw as { achievements?: unknown } | null)?.achievements;
  if (!Array.isArray(list) || list.length === 0) fail('"achievements" must be a non-empty list');

  const seen = new Set<AchievementId>();
  const result = (list as unknown[]).map((entry, index) => {
    const e = (entry ?? {}) as Record<string, unknown>;
    const where = `entry ${index + 1} ("${String(e.id ?? '?')}")`;
    if (!isKnownId(e.id)) {
      fail(`${where}: unknown id; known ids are ${KNOWN_ACHIEVEMENT_IDS.join(', ')}`);
    }
    const id = e.id as AchievementId;
    if (seen.has(id)) fail(`${where}: duplicate id`);
    seen.add(id);
    if (!filled(e.title)) fail(`${where}: "title" is missing or empty`);
    if (!filled(e.subtitle)) fail(`${where}: "subtitle" is missing or empty`);
    if (!(ACHIEVEMENT_GLYPHS as readonly unknown[]).includes(e.glyph)) {
      fail(`${where}: "glyph" must be one of ${ACHIEVEMENT_GLYPHS.join(', ')}`);
    }
    const secret = e.secret === true;
    if (!secret && !filled(e.hint)) fail(`${where}: "hint" is required unless "secret" is true`);
    return {
      id,
      title: (e.title as string).trim(),
      subtitle: (e.subtitle as string).trim(),
      glyph: e.glyph as AchievementGlyph,
      secret,
      ...(secret ? {} : { hint: (e.hint as string).trim() }),
    };
  });

  for (const id of KNOWN_ACHIEVEMENT_IDS) {
    if (!seen.has(id)) fail(`missing an entry for "${id}" (the site can unlock it)`);
  }
  return result;
}

// --- Obfuscation (secret copy) -------------------------------------------------------------
// Not protection: keeps secret copy out of view-source and text search only.

function bytesToBinary(bytes: Uint8Array): string {
  let out = '';
  for (const byte of bytes) out += String.fromCharCode(byte);
  return out;
}

export function encodeObfuscated(text: string): string {
  return btoa(bytesToBinary(new TextEncoder().encode(text))).split('').reverse().join('');
}

export function decodeObfuscated(encoded: string): string {
  const binary = atob(encoded.split('').reverse().join(''));
  return new TextDecoder().decode(Uint8Array.from(binary, (char) => char.charCodeAt(0)));
}

type ClientEntry = {
  id: AchievementId;
  glyph: AchievementGlyph;
  secret: boolean;
  title: string;
  subtitle: string;
  hint?: string;
  enc?: 1;
};

/** Build → browser payload: secret title/subtitle obfuscated, secret hints dropped. */
export function toClientPayload(list: Achievement[]): string {
  const entries: ClientEntry[] = list.map((a) =>
    a.secret
      ? {
          id: a.id,
          glyph: a.glyph,
          secret: true,
          enc: 1,
          title: encodeObfuscated(a.title),
          subtitle: encodeObfuscated(a.subtitle),
        }
      : { id: a.id, glyph: a.glyph, secret: false, title: a.title, subtitle: a.subtitle, hint: a.hint },
  );
  return JSON.stringify(entries);
}

export function parseClientPayload(json: string): Achievement[] {
  const entries = JSON.parse(json) as ClientEntry[];
  return entries.map(({ enc, ...entry }) =>
    enc === 1
      ? {
          ...entry,
          title: decodeObfuscated(entry.title),
          subtitle: decodeObfuscated(entry.subtitle),
        }
      : entry,
  );
}

let cached: Achievement[] | null = null;

/** Client: the registry decoded from the DOM payload (cached after the first read). */
export function getAchievements(root: ParentNode = document): Achievement[] {
  if (cached) return cached;
  const json = root.querySelector(`[${REGISTRY_ATTR}]`)?.getAttribute(REGISTRY_ATTR);
  if (!json) return [];
  try {
    cached = parseClientPayload(json);
  } catch (error) {
    console.error('[achievements] invalid registry payload', error);
    return [];
  }
  return cached;
}

export function getAchievement(id: AchievementId): Achievement | undefined {
  return getAchievements().find((a) => a.id === id);
}

// --- Unlock state ----------------------------------------------------------------------------

export type AchievementState =
  | { available: false }
  | { available: true; unlocked: Set<AchievementId> };

function defaultStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

/** Unlike the toast guard, blocked storage reads as "unavailable", never as "unlocked". */
export function readAchievementState(storage: Storage | undefined = defaultStorage()): AchievementState {
  if (!storage) return { available: false };
  try {
    const unlocked = new Set<AchievementId>();
    for (const id of KNOWN_ACHIEVEMENT_IDS) {
      if (storage.getItem(achievementStorageKey(id)) === '1') unlocked.add(id);
    }
    return { available: true, unlocked };
  } catch {
    return { available: false };
  }
}

/** Persist an unlock; true only for a first unlock with working storage. */
export function markUnlocked(id: AchievementId, storage: Storage | undefined = defaultStorage()): boolean {
  if (!storage) return false;
  try {
    const key = achievementStorageKey(id);
    if (storage.getItem(key) === '1') return false;
    storage.setItem(key, '1');
    return true;
  } catch {
    return false;
  }
}

/** Toast guard: no toast when already unlocked or when storage is blocked (no spam). */
export function shouldToast(id: AchievementId, storage: Storage | undefined = defaultStorage()): boolean {
  const state = readAchievementState(storage);
  return state.available && !state.unlocked.has(id);
}

/** Dev/preview only: back to the newcomer state (achievements + hidden-player discovery). */
export function resetProgress(storage: Storage | undefined = defaultStorage()): void {
  if (!storage) return;
  try {
    for (const id of KNOWN_ACHIEVEMENT_IDS) storage.removeItem(achievementStorageKey(id));
    storage.removeItem(PLAYER_DISCOVERED_STORAGE_KEY);
  } catch {
    /* blocked storage — nothing to reset */
  }
}

// --- Gallery view ----------------------------------------------------------------------------

export type TileView =
  | { kind: 'unlocked'; achievement: Achievement }
  | { kind: 'locked'; id: AchievementId; hint: string }
  | { kind: 'secret'; id: AchievementId };

export function tileViews(list: Achievement[], state: AchievementState): TileView[] {
  return list.map((achievement) => {
    if (state.available && state.unlocked.has(achievement.id)) return { kind: 'unlocked', achievement };
    if (achievement.secret) return { kind: 'secret', id: achievement.id };
    return { kind: 'locked', id: achievement.id, hint: achievement.hint ?? '' };
  });
}

export function countFound(list: Achievement[], state: AchievementState): number {
  if (!state.available) return 0;
  return list.filter((a) => state.unlocked.has(a.id)).length;
}

export function formatCounter(template: string, found: number, total: number): string {
  return template.replaceAll('{found}', String(found)).replaceAll('{total}', String(total));
}
