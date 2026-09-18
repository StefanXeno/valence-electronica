#!/usr/bin/env node
/**
 * Dev-only HUD verification for the coding agent.
 * Drives the running landing with Playwright (phone + cheap laptop).
 * Never imported from visitor pages.
 */
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ARTIFACT_DIR = path.join(ROOT, '.verify-hud');
const PHONE = { width: 390, height: 844 };
const LAPTOP = { width: 1280, height: 800 };
const BASE = '/valence-electronica/';
const DEFAULT_PORT = 4321;
const HEIGHT_TOL = 12;
const SETTLE_MS = 450;

const FLOW_IDS = [
  'phone-rest',
  'phone-tap-open',
  'phone-drag-open',
  'phone-playlist',
  'phone-collapse',
  'phone-mute-center',
  'phone-content-info',
  'phone-pause-flatten',
  'laptop-rest',
];

const MISSING_TOOL_COPY = [
  'HUD verification could not run: Playwright or Chromium is missing.',
  'Install tools mise-first: mise install',
  'Then download Chromium + OS libs: mise run playwright:chromium',
  '(or: playwright install --with-deps chromium)',
].join('\n');

function parseArgs(argv) {
  const urlIdx = argv.indexOf('--url');
  return {
    phoneOnly: argv.includes('--phone-only'),
    laptopOnly: argv.includes('--laptop-only'),
    skipUnit: argv.includes('--skip-unit'),
    url: urlIdx >= 0 ? argv[urlIdx + 1] : process.env.VERIFY_HUD_URL,
  };
}

function usage() {
  console.log(`Usage: npm run verify:hud -- [--phone-only] [--laptop-only] [--skip-unit]

Drives the running landing HUD with Playwright and writes .verify-hud/ artifacts.
`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** rAF height samples on a selector while `action` runs (sees mid-morph overshoot). */
async function sampleDuring(page, selector, action, ms = 520) {
  const samplesP = page.evaluate(
    async ({ selector, ms }) => {
      const el = document.querySelector(selector);
      if (!el) return [];
      const samples = [];
      const start = performance.now();
      while (performance.now() - start < ms) {
        const box = el.getBoundingClientRect();
        samples.push({
          t: Math.round(performance.now() - start),
          h: Math.round(box.height * 10) / 10,
          y: Math.round(box.y * 10) / 10,
        });
        await new Promise((r) => requestAnimationFrame(r));
      }
      return samples;
    },
    { selector, ms },
  );
  await action();
  const samples = await samplesP;
  const heights = samples.map((s) => s.h);
  const peak = heights.length ? Math.max(...heights) : 0;
  const settle = heights.length ? heights[heights.length - 1] : 0;
  return { samples, peak, settle, overshoot: Math.max(0, peak - settle) };
}

async function shotAt(page, flowId, delayMs) {
  await sleep(delayMs);
  await shot(page, `${flowId}-t${delayMs}`);
}

function runNpm(script) {
  return new Promise((resolve, reject) => {
    const child = spawn('npm', ['run', script], {
      cwd: ROOT,
      stdio: 'inherit',
      env: process.env,
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`npm run ${script} exited ${code}`));
    });
  });
}

function portInUse(port) {
  return new Promise((resolve) => {
    const server = createServer();
    server.once('error', () => resolve(true));
    server.once('listening', () => {
      server.close(() => resolve(false));
    });
    server.listen(port, '127.0.0.1');
  });
}

async function waitForUrl(url, timeoutMs = 60_000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url, { redirect: 'manual' });
      if (res.status > 0) return;
    } catch {
      // preview not up yet
    }
    await sleep(400);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function startPreviewIfNeeded(explicitUrl) {
  const envUrl = explicitUrl || process.env.VERIFY_HUD_URL;
  if (envUrl) {
    const url = envUrl.replace(/\/?$/, '/');
    console.log(`verify-hud: reusing ${url}`);
    await waitForUrl(url);
    return { url, child: null };
  }

  const port = Number(process.env.VERIFY_HUD_PORT || DEFAULT_PORT);
  const origin = `http://127.0.0.1:${port}`;
  const url = `${origin}${BASE}`;

  if (await portInUse(port)) {
    console.log(`verify-hud: port ${port} in use, reusing ${url}`);
    await waitForUrl(url);
    return { url, child: null };
  }

  const script = existsSync(path.join(ROOT, 'dist')) ? 'preview' : 'dev';
  const child = spawn('npm', ['run', script], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port) },
  });
  child.stdout?.on('data', () => {});
  child.stderr?.on('data', () => {});
  try {
    await waitForUrl(url);
    return { url, child };
  } catch (error) {
    child.kill('SIGTERM');
    throw error;
  }
}

async function visible(locator) {
  if ((await locator.count()) === 0) return false;
  return locator.first().evaluate((el) => {
    const style = getComputedStyle(el);
    const box = el.getBoundingClientRect();
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      box.width > 1 &&
      box.height > 1
    );
  });
}

async function boxOf(locator) {
  return locator.first().evaluate((el) => {
    const box = el.getBoundingClientRect();
    return { x: box.x, y: box.y, width: box.width, height: box.height, top: box.top, bottom: box.bottom };
  });
}

async function shot(page, flowId) {
  const file = path.join(ARTIFACT_DIR, `${flowId}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

async function waitChrome(page) {
  await page.waitForSelector('[data-player-dock]', { timeout: 20_000 });
  await page.waitForFunction(() => {
    const html = document.documentElement;
    return !html.hasAttribute('data-intro-pending') && !html.hasAttribute('data-intro-active');
  });
  await page.waitForFunction(() => document.documentElement.hasAttribute('data-player-dock-js'));
  await sleep(200);
}

async function openLanding(context, url) {
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await waitChrome(page);
  return page;
}

function fail(flow, errors) {
  return { id: flow, status: 'fail', errors };
}

function pass(flow, note) {
  return { id: flow, status: 'pass', errors: [], note };
}

function skipped(flow, note) {
  return { id: flow, status: 'skipped', errors: [], note };
}

async function startTrace(context) {
  await context.tracing.start({ screenshots: true, snapshots: true });
}

async function stopTrace(context, flowId) {
  const file = path.join(ARTIFACT_DIR, `${flowId}.trace.zip`);
  try {
    await context.tracing.stop({ path: file });
  } catch {
    // tracing may already be stopped
  }
  return file;
}

async function phoneRest(page) {
  const id = 'phone-rest';
  const errors = [];
  const vp = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    phoneMq: window.matchMedia('(max-width: 1023px)').matches,
  }));
  if (vp.innerWidth > 1023 || !vp.phoneMq) {
    errors.push(
      `harness viewport is not phone (innerWidth=${vp.innerWidth}, phoneMq=${vp.phoneMq})`,
    );
  }
  const player = page.locator('[data-player-dock]');
  const panels = page.locator('[data-stage-panels]');
  if (!(await visible(player))) errors.push('player dock not visible');
  if (!(await visible(panels))) errors.push('content dock not visible');
  const icons = page.locator('[data-stage-panel-icons] button');
  if ((await icons.count()) !== 5) errors.push(`expected 5 content icons, got ${await icons.count()}`);
  const socials = page.locator('.stage__socials');
  const parked = await socials.evaluate((el) => Boolean(el.closest('[data-stage-panels]')));
  if (!parked) errors.push('socials bar is not parked in the content sheet');
  if (await visible(page.locator('footer'))) errors.push('phone footer legal strip is visible');
  await shot(page, id);
  const note = `innerWidth=${vp.innerWidth} innerHeight=${vp.innerHeight} phoneMq=${vp.phoneMq}`;
  return errors.length ? fail(id, errors) : pass(id, note);
}

async function phoneTapOpen(page) {
  const id = 'phone-tap-open';
  const errors = [];
  const handle = page.locator('[data-player-handle]');
  const dock = page.locator('[data-player-dock]');
  const [morph] = await Promise.all([
    sampleDuring(page, '[data-player-dock]', () => handle.click({ force: true })),
    shotAt(page, id, 80),
    shotAt(page, id, 160),
    shotAt(page, id, 240),
  ]);
  await sleep(80);
  const expanded = await page.locator('html').evaluate((el) => el.hasAttribute('data-player-dock-expanded'));
  if (!expanded) errors.push('tap did not set data-player-dock-expanded (expand === V-Flip)');
  if (!(await visible(page.locator('[data-player-transport]')))) {
    errors.push('transport not visible after tap-open');
  }
  if (!(await visible(page.locator('[data-shuffle-toggle]')))) errors.push('shuffle missing');
  if (!(await visible(page.locator('[data-bg-play-toggle]')))) errors.push('play/pause missing');
  if (!(await visible(page.locator('.jukebox__tool--vinyl')))) errors.push('vinyl missing in transport');
  if (await visible(page.locator('[data-playlist-toggle]'))) errors.push('playlist toggle still in bar');
  if (await visible(page.locator('.jukebox__tool--loop'))) errors.push('loop visible on phone');
  if (!(await visible(page.locator('.jukebox__title-phone--playlist')))) {
    errors.push('useful-open playlist header (Songs) missing');
  }
  const height = (await boxOf(dock)).height;
  await shot(page, id);
  const note = `openHeight=${Math.round(height)} peak=${morph.peak} settle=${morph.settle} overshoot=${morph.overshoot}`;
  const result = errors.length ? fail(id, errors) : pass(id, note);
  result.openHeight = height;
  result.morph = morph;
  return result;
}

async function collapsePlayer(page) {
  const handle = page.locator('[data-player-handle]');
  const expanded = await page.locator('html').evaluate((el) => el.hasAttribute('data-player-dock-expanded'));
  if (expanded) {
    await handle.click({ force: true });
    await sleep(SETTLE_MS);
  }
}

async function phoneDragOpen(page, tapHeight) {
  const id = 'phone-drag-open';
  const errors = [];
  await collapsePlayer(page);
  const handle = page.locator('[data-player-handle]');
  const dock = page.locator('[data-player-dock]');
  const box = await handle.boundingBox();
  if (!box) return fail(id, ['handle has no bounding box for drag']);
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  const morph = await sampleDuring(
    page,
    '[data-player-dock]',
    async () => {
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX, Math.max(8, startY - 160), { steps: 12 });
      await page.mouse.up();
    },
    700,
  );
  await sleep(200);
  const expanded = await page.locator('html').evaluate((el) => el.hasAttribute('data-player-dock-expanded'));
  if (!expanded) errors.push('drag did not expand the player');
  const height = (await boxOf(dock)).height;
  if (typeof tapHeight === 'number' && Math.abs(height - tapHeight) > HEIGHT_TOL) {
    errors.push(
      `drag height ${Math.round(height)}px != tap height ${Math.round(tapHeight)}px (tol ${HEIGHT_TOL})`,
    );
  }
  if (typeof tapHeight === 'number' && height > tapHeight + HEIGHT_TOL + 6) {
    errors.push('leftover overshoot after drag settle');
  }
  await shot(page, id);
  const note = `openHeight=${Math.round(height)} tapHeight=${tapHeight != null ? Math.round(tapHeight) : 'n/a'} peak=${morph.peak} settle=${morph.settle} overshoot=${morph.overshoot}`;
  const result = errors.length ? fail(id, errors) : pass(id, note);
  result.openHeight = height;
  result.morph = morph;
  return result;
}

async function phonePlaylist(page) {
  const id = 'phone-playlist';
  const errors = [];
  const dock = page.locator('[data-player-dock]');
  const expanded = await page.locator('html').evaluate((el) => el.hasAttribute('data-player-dock-expanded'));
  if (!expanded) {
    await page.locator('[data-player-handle]').tap();
    await sleep(SETTLE_MS);
  }
  const current = page.locator('[data-now-playing]');
  const beforeText = (await current.textContent())?.trim() ?? '';
  const beforeBox = await boxOf(current);
  // No bar playlist toggle — useful-open already lands on song selection.
  const themeOn = await dock.evaluate((el) => el.classList.contains('is-theme-tracks'));
  if (!themeOn) errors.push('useful-open did not add theme-track cards (is-theme-tracks)');
  if (!(await visible(page.locator('.jukebox__title-phone--playlist')))) {
    errors.push('playlist header (Songs) not visible after useful-open');
  }
  const afterOpenText = (await current.textContent())?.trim() ?? '';
  if (beforeText && afterOpenText && beforeText !== afterOpenText) {
    errors.push('current card label changed on useful-open playlist face');
  }
  const list = page.locator('[data-theme-tracks-panel]');
  const listScroll = await list.evaluate((el) => el.scrollHeight > el.clientHeight + 4).catch(() => false);
  await shot(page, id);
  // Collapse clears playlist so the next open is useful-open again.
  const [morph] = await Promise.all([
    sampleDuring(page, '[data-player-dock]', () =>
      page.locator('[data-player-handle]').click({ force: true }),
    ),
    shotAt(page, id, 80),
    shotAt(page, id, 160),
    shotAt(page, id, 240),
  ]);
  await sleep(SETTLE_MS);
  const themeOff = await dock.evaluate((el) => !el.classList.contains('is-theme-tracks'));
  if (!themeOff) errors.push('collapse left theme-tracks open');
  const afterBox = await boxOf(current);
  if (Math.abs(afterBox.y - beforeBox.y) > 24) {
    errors.push('collapse jumped the current card');
  }
  const note = `peak=${morph.peak} settle=${morph.settle} overshoot=${morph.overshoot} listScroll=${listScroll} cardDy=${Math.round(afterBox.y - beforeBox.y)}`;
  const result = errors.length ? fail(id, errors) : pass(id, note);
  result.morph = morph;
  return result;
}

async function phoneCollapse(page) {
  const id = 'phone-collapse';
  const errors = [];
  const expanded = await page.locator('html').evaluate((el) => el.hasAttribute('data-player-dock-expanded'));
  if (!expanded) {
    await page.locator('[data-player-handle]').tap();
    await sleep(SETTLE_MS);
  }
  const morph = await sampleDuring(page, '[data-player-dock]', () =>
    page.locator('[data-player-handle]').click({ force: true }),
  );
  await sleep(80);
  const still = await page.locator('html').evaluate((el) => el.hasAttribute('data-player-dock-expanded'));
  if (still) errors.push('handle tap did not collapse');
  const transportVisible = await visible(page.locator('[data-player-transport]'));
  if (transportVisible) {
    errors.push('transport still visible after collapse');
  }
  if (!(await visible(page.locator('[data-now-playing]')))) {
    errors.push('collapsed now-playing row missing');
  }
  await shot(page, id);
  const note = `peak=${morph.peak} settle=${morph.settle} overshoot=${morph.overshoot} transportVisible=${transportVisible}`;
  const result = errors.length ? fail(id, errors) : pass(id, note);
  result.morph = morph;
  return result;
}

async function phoneMuteCenter(page) {
  const id = 'phone-mute-center';
  const mute = page.locator('[data-player-dock] [data-mute-control]');
  const slot = page.locator('[data-jukebox-mute-slot]');
  const mounted = (await mute.count()) > 0 && (await visible(mute) || (await slot.count()) > 0);
  const muteVisible = await visible(mute);
  if (!mounted || !muteVisible) {
    await shot(page, id);
    return skipped(id, 'mute not mounted');
  }
  const errors = [];
  const muteBox = await boxOf(mute);
  const wave = page.locator('[data-player-dock] .player-dock__soundwave');
  const title = page.locator('[data-player-dock] [data-now-playing]');
  const waveBox = await boxOf(wave);
  const titleBox = await boxOf(title);
  const muteMid = muteBox.y + muteBox.height / 2;
  const rowMid = (Math.min(waveBox.y, titleBox.y) + Math.max(waveBox.bottom, titleBox.bottom)) / 2;
  const delta = muteMid - rowMid;
  if (Math.abs(delta) > 10) {
    errors.push(`mute not vertically centered (delta ${Math.round(delta)}px)`);
  }
  if (muteBox.x < titleBox.x) errors.push('mute is not on the right of the floor row');
  const slider = page.locator('[data-player-dock] [data-volume-slider]');
  if (await visible(slider)) errors.push('loudness slider visible on phone');
  const css = await mute.evaluate((el) => {
    const s = getComputedStyle(el);
    return { position: s.position, top: s.top, left: s.left };
  });
  await shot(page, id);
  const note = `delta=${Math.round(delta)}px position=${css.position} top=${css.top}`;
  const result = errors.length ? fail(id, errors) : pass(id, note);
  result.mute = { delta, css, muteBox, waveBox, titleBox };
  return result;
}

async function phoneContentInfo(page) {
  const id = 'phone-content-info';
  const errors = [];
  const triggers = {
    about: page.locator('[data-stage-panel-trigger="about"]'),
    discography: page.locator('[data-stage-panel-trigger="discography"]'),
    tour: page.locator('[data-stage-panel-trigger="tour"]'),
    socials: page.locator('[data-socials-trigger]'),
    info: page.locator('[data-stage-panel-trigger="info"]'),
  };
  for (const [name, loc] of Object.entries(triggers)) {
    if ((await loc.count()) === 0) errors.push(`missing ${name} icon`);
  }
  const iconsStay = await visible(page.locator('[data-stage-panel-icons]'));
  if (!iconsStay) errors.push('content icons row not visible');

  await triggers.about.tap();
  await sleep(SETTLE_MS);
  if ((await page.locator('[data-stage-panel="about"][open]').count()) === 0) {
    errors.push('About did not grow the content pill');
  }
  await triggers.discography.tap();
  await sleep(SETTLE_MS);
  const aboutStill = await page.locator('[data-stage-panel="about"][open]:not(.is-cross-out)').count();
  if (aboutStill > 0) errors.push('exclusive-open failed (About still open with Discography)');
  await triggers.info.tap();
  await sleep(SETTLE_MS);
  if ((await page.locator('[data-stage-panel="info"][open]').count()) === 0) {
    errors.push('Info sheet did not open');
  }
  const copy = page.locator('[data-stage-panel="info"] .stage-panel__sheet-copy');
  if ((await copy.count()) === 0) errors.push('Info © line missing');
  const legalBtn = page.locator('[data-stage-panel="info"] [data-legal-slug]').first();
  if ((await legalBtn.count()) === 0) errors.push('Imprint / Privacy pills missing');
  else {
    await legalBtn.tap();
    await sleep(SETTLE_MS);
    const overlay = page.locator('[data-legal-panel]:not([hidden])');
    if ((await overlay.count()) === 0) errors.push('legal overlay did not open from Info');
    const exit = page.locator('[data-legal-exit]').first();
    if ((await exit.count()) > 0 && (await visible(exit))) {
      await exit.tap();
      await sleep(SETTLE_MS);
    }
  }
  await shot(page, id);
  return errors.length ? fail(id, errors) : pass(id);
}

async function ensureExpanded(page) {
  const expanded = await page.locator('html').evaluate((el) => el.hasAttribute('data-player-dock-expanded'));
  if (!expanded) {
    await page.locator('[data-player-handle]').tap();
    await sleep(SETTLE_MS);
  }
}

async function runFlow(id, fn) {
  try {
    return await fn();
  } catch (error) {
    return fail(id, [String(error.message || error).split('\n')[0]]);
  }
}

async function phonePauseFlatten(page) {
  const id = 'phone-pause-flatten';
  const errors = [];
  const infoOpen = await page.locator('[data-stage-panel="info"][open]').count();
  if (infoOpen > 0) {
    await page.locator('[data-stage-panel-trigger="info"]').tap();
    await sleep(SETTLE_MS);
  }
  await ensureExpanded(page);
  const pause = page.locator('[data-bg-play-toggle]');
  const beforePaused = await page.locator('html').evaluate((el) => el.hasAttribute('data-player-paused'));
  if (beforePaused) {
    await pause.tap();
    await sleep(SETTLE_MS);
  }
  await pause.tap();
  await sleep(SETTLE_MS);
  const paused = await page.locator('html').evaluate((el) => el.hasAttribute('data-player-paused'));
  if (!paused) errors.push('pause did not set data-player-paused');
  const flat = page.locator('.player-dock__soundwave.is-eq-flat');
  if ((await flat.count()) === 0) errors.push('soundwave missing is-eq-flat after pause');
  await shot(page, id);
  return errors.length ? fail(id, errors) : pass(id);
}

async function laptopRest(page) {
  const id = 'laptop-rest';
  const errors = [];
  if (!(await visible(page.locator('.stage__identity')))) errors.push('laptop identity missing');
  const socials = page.locator('.stage__socials');
  if (!(await visible(socials))) errors.push('laptop socials missing');
  const parked = await socials.evaluate((el) => Boolean(el.closest('[data-stage-panels]')));
  if (parked) errors.push('laptop socials are parked in the phone content sheet');
  if (await visible(page.locator('[data-stage-panel-icons]'))) {
    errors.push('phone growing-pill icon row visible at laptop width');
  }
  if (!(await visible(page.locator('footer')))) errors.push('laptop footer legal strip missing');
  await shot(page, id);
  return errors.length ? fail(id, errors) : pass(id);
}

function printResults(results) {
  for (const row of results) {
    const extra = row.errors?.length ? ` — ${row.errors.join('; ')}` : row.note ? ` — ${row.note}` : '';
    console.log(`${row.id}\t${row.status}${extra}`);
  }
}

async function writeReport({ results, previewUrl, playwrightPresent, browserPresent, toolPath }) {
  const lines = [
    '# HUD verification report',
    '',
    `- command: npm run verify:hud`,
    `- startedAt: ${new Date().toISOString()}`,
    `- previewUrl: ${previewUrl}`,
    `- phoneViewport: ${PHONE.width}x${PHONE.height}`,
    `- laptopViewport: ${LAPTOP.width}x${LAPTOP.height}`,
    `- toolPath: ${toolPath}`,
    `- playwrightPresent: ${playwrightPresent}`,
    `- browserPresent: ${browserPresent}`,
    '',
    '| Flow | Status | Notes |',
    '|------|--------|-------|',
  ];
  for (const row of results) {
    const note = [...(row.errors ?? []), row.note].filter(Boolean).join('; ') || '—';
    lines.push(`| ${row.id} | ${row.status} | ${note} |`);
  }
  lines.push('');
  await writeFile(path.join(ARTIFACT_DIR, 'report.md'), lines.join('\n'), 'utf8');
  const diagnostics = {};
  for (const row of results) {
    if (row.morph || row.mute || row.openHeight != null) {
      diagnostics[row.id] = {
        status: row.status,
        openHeight: row.openHeight,
        morph: row.morph
          ? { peak: row.morph.peak, settle: row.morph.settle, overshoot: row.morph.overshoot, samples: row.morph.samples }
          : undefined,
        mute: row.mute,
        note: row.note,
      };
    }
  }
  await writeFile(path.join(ARTIFACT_DIR, 'heights.json'), JSON.stringify(diagnostics, null, 2), 'utf8');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    usage();
    process.exit(0);
  }

  await mkdir(ARTIFACT_DIR, { recursive: true });

  if (!args.skipUnit) {
    await runNpm('test');
    await runNpm('check');
  }

  let chromium;
  try {
    ({ chromium } = await import('playwright'));
  } catch {
    console.error(MISSING_TOOL_COPY);
    await writeReport({
      results: FLOW_IDS.map((id) => fail(id, ['Playwright module missing'])),
      previewUrl: '',
      playwrightPresent: false,
      browserPresent: false,
      toolPath: 'playwright',
    });
    process.exit(1);
  }

  let preview;
  try {
    preview = await startPreviewIfNeeded(args.url);
  } catch (error) {
    console.error(`Preview failed: ${error.message}`);
    process.exit(1);
  }

  const results = [];
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
  } catch (error) {
    console.error(MISSING_TOOL_COPY);
    console.error(String(error.message || error));
    await writeReport({
      results: FLOW_IDS.map((id) => fail(id, ['Chromium failed to launch'])),
      previewUrl: preview.url,
      playwrightPresent: true,
      browserPresent: false,
      toolPath: 'playwright',
    });
    preview.child?.kill('SIGTERM');
    process.exit(1);
  }

  const phoneFlows = !args.laptopOnly;
  const laptopFlows = !args.phoneOnly;
  let tapHeight;

  try {
    if (phoneFlows) {
      const phoneContext = await browser.newContext({
        viewport: PHONE,
        hasTouch: true,
        isMobile: true,
        deviceScaleFactor: 2,
      });
      await phoneContext.addInitScript(() => {
        try {
          localStorage.setItem('valence-intro-seen', '1');
        } catch {
          // storage blocked — waitChrome still waits out the intro
        }
      });
      await startTrace(phoneContext);
      const page = await openLanding(phoneContext, preview.url);
      const rest = await runFlow('phone-rest', () => phoneRest(page));
      results.push(rest);
      const tap = await runFlow('phone-tap-open', () => phoneTapOpen(page));
      results.push(tap);
      tapHeight = tap.openHeight;
      results.push(await runFlow('phone-drag-open', () => phoneDragOpen(page, tapHeight)));
      results.push(await runFlow('phone-playlist', () => phonePlaylist(page)));
      results.push(await runFlow('phone-collapse', () => phoneCollapse(page)));
      results.push(await runFlow('phone-mute-center', () => phoneMuteCenter(page)));
      results.push(await runFlow('phone-content-info', () => phoneContentInfo(page)));
      results.push(await runFlow('phone-pause-flatten', () => phonePauseFlatten(page)));
      const failed = results.some((row) => row.status === 'fail');
      if (failed) await stopTrace(phoneContext, 'phone-fail');
      else await phoneContext.tracing.stop().catch(() => {});
      await phoneContext.close();
    }

    if (laptopFlows) {
      const laptopContext = await browser.newContext({
        viewport: LAPTOP,
        hasTouch: false,
        isMobile: false,
      });
      await laptopContext.addInitScript(() => {
        try {
          localStorage.setItem('valence-intro-seen', '1');
        } catch {
          // ignore
        }
      });
      const page = await openLanding(laptopContext, preview.url);
      results.push(await runFlow('laptop-rest', () => laptopRest(page)));
      await laptopContext.close();
    }
  } finally {
    await browser.close();
    preview.child?.kill('SIGTERM');
  }

  await writeReport({
    results,
    previewUrl: preview.url,
    playwrightPresent: true,
    browserPresent: true,
    toolPath: 'playwright',
  });
  printResults(results);
  const failed = results.some((row) => row.status === 'fail');
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
