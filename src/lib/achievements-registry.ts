/**
 * Build-time loader for `src/data/achievements.json` (036).
 *
 * Import this only from `.astro` frontmatter. A client-side import would bundle the JSON, and
 * with it secret achievement copy in plain text (`scripts/check-secrets.mjs` fails the build
 * if that happens). Client code reads the obfuscated payload via `getAchievements()`.
 */

import registryJson from '../data/achievements.json';
import { validateAchievementRegistry, type Achievement } from './achievements';

let cached: Achievement[] | null = null;

export function loadAchievementRegistry(): Achievement[] {
  cached ??= validateAchievementRegistry(registryJson);
  return cached;
}
