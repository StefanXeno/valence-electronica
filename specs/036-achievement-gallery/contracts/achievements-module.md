# Contract: Achievements module and DOM events

**Feature**: `036-achievement-gallery`

Internal interfaces between trigger modules, toast, gallery, and the stage player. Names
are binding for implementation and tests.

## `src/lib/achievements.ts` (pure, unit-tested; MUST NOT import `achievements.json`)

```ts
export const KNOWN_ACHIEVEMENT_IDS = [
  'rub', 'infinite-spin', 'player-found', 'demonic-combo', 'coder',
] as const;
export type AchievementId = (typeof KNOWN_ACHIEVEMENT_IDS)[number];
export type AchievementGlyph = 'vinyl' | 'infinite' | 'demonic' | 'code';

export type Achievement = {
  id: AchievementId; title: string; subtitle: string;
  glyph: AchievementGlyph; secret: boolean; hint?: string;
};

export function achievementStorageKey(id: AchievementId): string; // `ve-achievement-${id}`
export function validateAchievementRegistry(raw: unknown): Achievement[]; // throws

/** Obfuscation for secret copy (R11): reverse(base64(utf8(text))) and back. */
export function encodeObfuscated(text: string): string;
export function decodeObfuscated(encoded: string): string;

/** Build → browser payload; secret title/subtitle obfuscated, secret hint dropped. */
export function toClientPayload(list: Achievement[]): string;          // JSON string
/** Client: parse + decode `data-achievement-registry` once, cached. */
export function getAchievements(root?: ParentNode): Achievement[];
export function getAchievement(id: AchievementId): Achievement;

/** Boot: move `ve-achievement-why-are-you-rubbing` (literal stored obfuscated) → `ve-achievement-rub`. */
export function migrateLegacyKeys(storage?: Storage): void;

export type AchievementState =
  | { available: false }
  | { available: true; unlocked: Set<AchievementId> };
export function readAchievementState(storage?: Storage): AchievementState;

/** Persist; returns true only on a first unlock with storage available. */
export function markUnlocked(id: AchievementId, storage?: Storage): boolean;
/** Toast guard: false when already unlocked OR storage unavailable (no spam). */
export function shouldToast(id: AchievementId, storage?: Storage): boolean;
/** Dev/preview only: clears all achievement keys + `ve-player-discovered`. */
export function resetProgress(storage?: Storage): void;

export type TileView =
  | { kind: 'unlocked'; achievement: Achievement }
  | { kind: 'locked'; id: AchievementId; hint: string }
  | { kind: 'secret'; id: AchievementId };
export function tileViews(list: Achievement[], state: AchievementState): TileView[];
export function formatCounter(template: string, found: number, total: number): string;
```

## `src/lib/achievements-registry.ts` (build-time only)

```ts
/** Imports src/data/achievements.json, validates, caches. Used only in .astro frontmatter. */
export function loadAchievementRegistry(): Achievement[];
```

Only `.astro` frontmatter imports this module, so the JSON never enters a client bundle.

## `scripts/check-secrets.mjs` (build check)

Reads `src/data/achievements.json`; for each `secret` entry greps every file in `dist/`
(case-insensitive) for the full title, full subtitle, and each title word of ≥4 letters.
Exits non-zero naming the file and match. Chained after `astro build` in the `build`
script in `package.json` (no new dependency).

## `src/lib/key-combo.ts` (pure, unit-tested; extracted from `demonic-combo.ts`)

```ts
/** Rolling buffer for a typed word; case-insensitive; non-matching keys reset it. */
export function appendComboKey(current: string, key: string, target: string):
  { next: string; matched: boolean };
/** Shared keydown guard: ignore repeats, modifiers, and text fields. */
export function isComboKeyEvent(event: KeyboardEvent): boolean;
/** Bind one document keydown listener for `target`; calls onMatch; gap reset ~1.6 s. */
export function bindKeyCombo(target: string, onMatch: () => void): void;
/** Pure: does this `location.hash` value match `word` (decoded, case-insensitive)? */
export function hashMatches(hash: string, word: string): boolean;
/** Initial check after DOMContentLoaded (all module scripts, incl. the stage player, have
 *  run by then) + on `hashchange`: if the hash matches, call onMatch, then strip it via
 *  history.replaceState(history.state, '', pathname + search). */
export function bindHashCombo(word: string, onMatch: () => void): void;
```

`demonic-combo.ts` (`666`) and `coder-combo.ts` (`coder`) both use it, each registering the
keyboard and the hash trigger with one shared `onMatch`. Each keeps its own
buffer, so typing one word never resets the other. `appendDemonicDigit` stays exported as a
thin wrapper so its existing test keeps passing.

## `src/components/SourceNote.astro`

Renders exactly one HTML comment (plain template comment; fall back to `set:html` only if the
build strips it — verified in `dist/`), placed
in `Base.astro` between `</main>` and `<Footer />`:

```html
<!--
  Hey, coder. You found the source.
  Type "coder" anywhere on the stage.
  On a phone? Add #coder to the URL.
-->
```

The word in the comment and in `coder-combo.ts` come from one exported constant
(`CODER_WORD`) so they cannot drift.

## `src/lib/achievement-toast.ts`

```ts
/** Replaces maybeUnlockAchievement({storageKey,title,sub,glyph}). */
export function unlockAchievement(id: AchievementId): void;
```

Behavior: if `!shouldToast(id)` → return. Else `markUnlocked(id)`, show toast with registry
copy, then dispatch `achievement-unlocked`.

Callers after migration: `track-rub.ts` (`rub`), `infinite-spin.ts`
(`infinite-spin`), `stage-player.ts` (`player-found`), `demonic-combo.ts` (`demonic-combo`), `coder-combo.ts` (`coder`).
`infinite-spin.ts`'s early-exit uses `readAchievementState` / `shouldToast` instead of
`hasAchievement`.

## DOM events (on `document`)

| Event | Detail | Fired by | Consumed by |
| ----- | ------ | -------- | ----------- |
| `achievement-unlocked` | `{ id: AchievementId }` | `unlockAchievement` | gallery (show icon, pulse, refresh) |
| `achievement-gallery-open` | — | toast card activation | gallery (open) |
| `stage-overlay-close` *(existing)* | — | gallery on open | legal overlay, phone menu |
| `player-state-change` *(existing, bubbles)* | `{ state }` | stage player | gallery (close on `full`) |

## Document state

- `html.achievement-gallery-open` — set while the gallery is open. `stage-player.ts`
  treats it as an overlay (`isOverlayOpen`, `collapseForOverlay`).
- `[data-achievement-gallery]` (panel) and `[data-achievement-toggle]` (icon) are added to
  `CHROME_SELECTOR` in `gesture-ignore.ts` so no stage gesture starts on them.
