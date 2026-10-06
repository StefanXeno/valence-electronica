import { describe, expect, it } from 'vitest';
import {
  isPlayerDiscovered,
  markPlayerDiscovered,
  PLAYER_DISCOVERED_STORAGE_KEY,
} from './player-discovery';

function memoryStorage(): Storage {
  const map = new Map<string, string>();
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
  return {
    length: 0,
    clear: fail,
    getItem: fail,
    key: fail,
    removeItem: fail,
    setItem: fail,
  };
}

describe('player discovery', () => {
  it('is not discovered on a fresh browser', () => {
    expect(isPlayerDiscovered(memoryStorage())).toBe(false);
  });

  it('remembers discovery', () => {
    const storage = memoryStorage();
    markPlayerDiscovered(storage);
    expect(storage.getItem(PLAYER_DISCOVERED_STORAGE_KEY)).toBe('1');
    expect(isPlayerDiscovered(storage)).toBe(true);
  });

  it('treats blocked storage as not discovered and never throws', () => {
    const storage = blockedStorage();
    expect(() => markPlayerDiscovered(storage)).not.toThrow();
    expect(isPlayerDiscovered(storage)).toBe(false);
  });

  it('handles a missing storage object', () => {
    expect(isPlayerDiscovered(undefined)).toBe(false);
    expect(() => markPlayerDiscovered(undefined)).not.toThrow();
  });
});
