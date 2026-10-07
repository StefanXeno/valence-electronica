import { describe, expect, it } from 'vitest';
import registryJson from '../data/achievements.json';
import {
  achievementStorageKey,
  countFound,
  decodeObfuscated,
  encodeObfuscated,
  formatCounter,
  KNOWN_ACHIEVEMENT_IDS,
  markUnlocked,
  migrateLegacyKeys,
  parseClientPayload,
  readAchievementState,
  resetProgress,
  shouldToast,
  tileViews,
  toClientPayload,
  validateAchievementRegistry,
  type Achievement,
} from './achievements';
import { PLAYER_DISCOVERED_STORAGE_KEY } from './player-discovery';

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    get length() {
      return map.size;
    },
    clear: () => map.clear(),
    getItem: (key) => map.get(key) ?? null,
    key: (index) => [...map.keys()][index] ?? null,
    removeItem: (key) => void map.delete(key),
    setItem: (key, value) => void map.set(key, value),
  };
}

function blockedStorage(): Storage {
  const fail = () => {
    throw new Error('SecurityError');
  };
  return { length: 0, clear: fail, getItem: fail, key: fail, removeItem: fail, setItem: fail };
}

function validEntries() {
  return [
    { id: 'rub', title: 'Secret Title', subtitle: 'Secret sub.', glyph: 'vinyl', secret: true },
    { id: 'infinite-spin', title: 'Infinite', subtitle: 'Spin.', glyph: 'infinite', hint: 'Circles.' },
    { id: 'player-found', title: 'Found it!', subtitle: 'Player.', glyph: 'vinyl', hint: 'Knock.' },
    { id: 'demonic-combo', title: 'Demonic', subtitle: '666.', glyph: 'demonic', hint: 'Numbers.' },
    { id: 'coder', title: 'Coder', subtitle: 'Source.', glyph: 'code', hint: 'Fine print.' },
  ];
}

const LEGACY_RUB_KEY = 've-achievement-why-are-you-' + 'rubbing';

describe('validateAchievementRegistry', () => {
  it('accepts the shipped registry', () => {
    const list = validateAchievementRegistry(registryJson);
    expect(list.map((a) => a.id)).toEqual(['rub', 'infinite-spin', 'player-found', 'demonic-combo', 'coder']);
    expect(list[0].secret).toBe(true);
    expect(list[0].hint).toBeUndefined();
  });

  it('keeps array order as tile order', () => {
    const entries = validEntries().reverse();
    expect(validateAchievementRegistry({ achievements: entries }).map((a) => a.id)).toEqual(
      entries.map((e) => e.id),
    );
  });

  it.each([
    ['an empty list', { achievements: [] }, /non-empty/],
    ['a missing list', {}, /non-empty/],
    ['an unknown id', { achievements: [...validEntries(), { ...validEntries()[1], id: 'nope' }] }, /"nope".*unknown id/],
    ['a duplicate id', { achievements: [...validEntries(), validEntries()[1]] }, /"infinite-spin".*duplicate/],
    [
      'a missing known id',
      { achievements: validEntries().filter((e) => e.id !== 'coder') },
      /missing an entry for "coder"/,
    ],
    ['an empty title', { achievements: validEntries().map((e, i) => (i === 1 ? { ...e, title: ' ' } : e)) }, /entry 2.*"title"/],
    ['a missing subtitle', { achievements: validEntries().map((e, i) => (i === 2 ? { ...e, subtitle: undefined } : e)) }, /"player-found".*"subtitle"/],
    ['a bad glyph', { achievements: validEntries().map((e, i) => (i === 3 ? { ...e, glyph: 'star' } : e)) }, /"demonic-combo".*"glyph"/],
    ['a non-secret entry without hint', { achievements: validEntries().map((e, i) => (i === 1 ? { ...e, hint: '' } : e)) }, /"infinite-spin".*"hint"/],
  ])('rejects %s', (_label, raw, message) => {
    expect(() => validateAchievementRegistry(raw)).toThrow(message);
  });
});

describe('obfuscation', () => {
  it.each(['Why are you rubbing?!', 'Grüße aus Augsburg', 'Spin 🔁 forever', ''])('round-trips %j', (text) => {
    expect(decodeObfuscated(encodeObfuscated(text))).toBe(text);
  });

  it('does not contain the plain text', () => {
    expect(encodeObfuscated('Secret Title').toLowerCase()).not.toContain('secret');
  });
});

describe('client payload', () => {
  const list = validateAchievementRegistry({ achievements: validEntries() });

  it('keeps secret copy and hints out of the payload', () => {
    const payload = toClientPayload([
      { ...list[0], hint: 'should never ship' } as Achievement,
      ...list.slice(1),
    ]);
    expect(payload).not.toContain('Secret Title');
    expect(payload).not.toContain('Secret sub.');
    expect(payload).not.toContain('should never ship');
    expect(payload).toContain('Fine print.');
  });

  it('decodes back to the registry', () => {
    expect(parseClientPayload(toClientPayload(list))).toEqual(list);
  });
});

describe('unlock state', () => {
  it('reads unlocked ids and ignores unknown keys', () => {
    const storage = memoryStorage({
      [achievementStorageKey('coder')]: '1',
      've-achievement-removed-egg': '1',
      [achievementStorageKey('rub')]: '0',
    });
    expect(readAchievementState(storage)).toEqual({ available: true, unlocked: new Set(['coder']) });
  });

  it('treats blocked or missing storage as unavailable, never unlocked', () => {
    expect(readAchievementState(blockedStorage())).toEqual({ available: false });
    expect(readAchievementState(undefined)).toEqual({ available: false });
  });

  it('marks a first unlock only once', () => {
    const storage = memoryStorage();
    expect(markUnlocked('rub', storage)).toBe(true);
    expect(markUnlocked('rub', storage)).toBe(false);
    expect(storage.getItem('ve-achievement-rub')).toBe('1');
    expect(markUnlocked('rub', blockedStorage())).toBe(false);
  });

  it('only toasts new unlocks with working storage', () => {
    expect(shouldToast('coder', memoryStorage())).toBe(true);
    expect(shouldToast('coder', memoryStorage({ [achievementStorageKey('coder')]: '1' }))).toBe(false);
    expect(shouldToast('coder', blockedStorage())).toBe(false);
  });

  it('resets exactly the achievement keys and the player discovery', () => {
    const initial: Record<string, string> = { unrelated: 'keep', [PLAYER_DISCOVERED_STORAGE_KEY]: '1' };
    for (const id of KNOWN_ACHIEVEMENT_IDS) initial[achievementStorageKey(id)] = '1';
    const storage = memoryStorage(initial);
    resetProgress(storage);
    expect(storage.length).toBe(1);
    expect(storage.getItem('unrelated')).toBe('keep');
    expect(() => resetProgress(blockedStorage())).not.toThrow();
  });
});

describe('migrateLegacyKeys', () => {
  it('moves the legacy rub key', () => {
    const storage = memoryStorage({ [LEGACY_RUB_KEY]: '1' });
    migrateLegacyKeys(storage);
    expect(storage.getItem('ve-achievement-rub')).toBe('1');
    expect(storage.getItem(LEGACY_RUB_KEY)).toBeNull();
  });

  it('is a no-op without the legacy key', () => {
    const storage = memoryStorage();
    migrateLegacyKeys(storage);
    expect(storage.length).toBe(0);
  });

  it('removes the legacy key when both exist', () => {
    const storage = memoryStorage({ [LEGACY_RUB_KEY]: '1', 've-achievement-rub': '1' });
    migrateLegacyKeys(storage);
    expect(storage.getItem(LEGACY_RUB_KEY)).toBeNull();
    expect(storage.getItem('ve-achievement-rub')).toBe('1');
  });

  it('survives blocked storage', () => {
    expect(() => migrateLegacyKeys(blockedStorage())).not.toThrow();
  });
});

describe('gallery view', () => {
  const list = validateAchievementRegistry({ achievements: validEntries() });

  it('maps tiles to unlocked, locked, and secret', () => {
    const state = readAchievementState(memoryStorage({ [achievementStorageKey('player-found')]: '1' }));
    expect(tileViews(list, state).map((t) => t.kind)).toEqual([
      'secret',
      'locked',
      'unlocked',
      'locked',
      'locked',
    ]);
    expect(tileViews(list, state)[1]).toEqual({ kind: 'locked', id: 'infinite-spin', hint: 'Circles.' });
  });

  it('shows an unlocked secret like any other tile', () => {
    const state = readAchievementState(memoryStorage({ [achievementStorageKey('rub')]: '1' }));
    expect(tileViews(list, state)[0]).toEqual({ kind: 'unlocked', achievement: list[0] });
  });

  it('shows nothing as unlocked when storage is unavailable', () => {
    const views = tileViews(list, { available: false });
    expect(views.some((t) => t.kind === 'unlocked')).toBe(false);
    expect(countFound(list, { available: false })).toBe(0);
  });

  it('formats the counter', () => {
    expect(formatCounter('{found} / {total} found', 2, 5)).toBe('2 / 5 found');
    expect(formatCounter('Found: {found}', 0, 5)).toBe('Found: 0');
  });
});
