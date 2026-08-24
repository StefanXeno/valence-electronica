// @ts-check
import { defineConfig } from 'astro/config';

// Read through globalThis: the project intentionally ships no Node type definitions,
// so `process` is not a known global to `astro check`.
const env = /** @type {any} */ (globalThis).process?.env ?? {};

// GitHub Actions injects the owner, so forks resolve their own Pages origin.
// GitHub Pages serves the lowercased owner, so normalize before building the URL.
const owner = String(env.GITHUB_REPOSITORY_OWNER ?? 'stefanxeno').toLowerCase();

if (!owner || owner === 'owner') {
  throw new Error(
    'astro.config: unresolved site owner — canonical and og:url tags would point nowhere',
  );
}

// The deploy workflow builds the pre-release preview into a subpath of the same
// Pages site. Everything downstream reads this through import.meta.env.BASE_URL.
const base = String(env.PAGES_BASE ?? '/valence-electronica');

if (!base.startsWith('/')) {
  throw new Error(`astro.config: PAGES_BASE must start with "/" (got "${base}")`);
}

export default defineConfig({
  site: `https://${owner}.github.io`,
  base,
});
