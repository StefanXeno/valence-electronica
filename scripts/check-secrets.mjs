#!/usr/bin/env node
/**
 * Build guard (036, SC-007): secret achievement copy must never ship in plain text.
 *
 * Reads src/data/achievements.json and searches every text file in dist/ (case-insensitive)
 * for each secret entry's full title, full subtitle, and each title word of 4+ letters.
 * Subtitle words are not checked one by one: they share ordinary words with the site.
 * Exits 1 on any hit. Node built-ins only.
 */

import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const distDir = join(root, 'dist');
const TEXT_EXTENSIONS = new Set(['.html', '.js', '.mjs', '.css', '.json', '.txt', '.xml', '.svg', '.map', '.webmanifest']);

const registry = JSON.parse(await readFile(join(root, 'src/data/achievements.json'), 'utf8'));
const secrets = registry.achievements.filter((entry) => entry.secret === true);

const needles = new Set();
for (const entry of secrets) {
  needles.add(entry.title.trim().toLowerCase());
  needles.add(entry.subtitle.trim().toLowerCase());
  for (const word of entry.title.toLowerCase().match(/\p{L}{4,}/gu) ?? []) needles.add(word);
}

async function* walk(dir) {
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, item.name);
    if (item.isDirectory()) yield* walk(path);
    else if (TEXT_EXTENSIONS.has(extname(item.name).toLowerCase())) yield path;
  }
}

let hits = 0;
let files = 0;
try {
  for await (const file of walk(distDir)) {
    files += 1;
    const text = (await readFile(file, 'utf8')).toLowerCase();
    for (const needle of needles) {
      if (text.includes(needle)) {
        hits += 1;
        console.error(`[check-secrets] "${needle}" found in ${relative(root, file)}`);
      }
    }
  }
} catch (error) {
  console.error(`[check-secrets] cannot read dist/ — run astro build first (${error.message})`);
  process.exit(1);
}

if (hits > 0) {
  console.error(`[check-secrets] ${hits} leak(s): secret achievement copy is in the build output.`);
  process.exit(1);
}
console.log(`[check-secrets] ok — ${secrets.length} secret achievement(s), ${files} files checked.`);
