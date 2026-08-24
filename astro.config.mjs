// @ts-check
import { defineConfig } from 'astro/config';

// Read through globalThis: the project intentionally ships no Node type definitions,
// so `process` is not a known global to `astro check`.
const envOwner = /** @type {any} */ (globalThis).process?.env?.GITHUB_REPOSITORY_OWNER;

// GitHub Actions injects the owner, so forks resolve their own Pages origin.
// GitHub Pages serves the lowercased owner, so normalize before building the URL.
const owner = String(envOwner ?? 'stefanxeno').toLowerCase();

if (!owner || owner === 'owner') {
  throw new Error(
    'astro.config: unresolved site owner — canonical and og:url tags would point nowhere',
  );
}

export default defineConfig({
  site: `https://${owner}.github.io`,
  base: '/valence-electronica',
});
