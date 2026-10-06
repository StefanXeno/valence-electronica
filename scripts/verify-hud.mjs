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
const SETTLE_MS = 450;

const FLOW_STEPS = [
  'fresh-hidden',
  'tap-hint',
  'hint-reveal',
  'pick-song',
  'close-minimal',
  'keyboard-reveal',
  'discog-play-close',
];
const FLOW_IDS = ['phone', 'laptop'].flatMap((vp) => FLOW_STEPS.map((step) => `${vp}-${step}`));

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
  await page.waitForSelector('[data-stage-player]', { state: 'attached', timeout: 20_000 });
  await page.waitForFunction(() => {
    const html = document.documentElement;
    return !html.hasAttribute('data-intro-pending') && !html.hasAttribute('data-intro-active');
  });
  await page.waitForFunction(
    () => document.querySelector('[data-stage-player]')?.getAttribute('data-stage-player-ready') === 'true',
  );
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

async function runFlow(id, fn) {
  try {
    return await fn();
  } catch (error) {
    return fail(id, [String(error.message || error).split('\n')[0]]);
  }
}

function playerState(page) {
  return page.locator('[data-stage-player]').getAttribute('data-player-state');
}

/** Tap (phone) or click (laptop) a viewport point — empty stage by default. */
async function tapAt(page, touch, x, y) {
  if (touch) await page.touchscreen.tap(x, y);
  else await page.mouse.click(x, y);
}

async function pressLocator(locator, touch) {
  if (touch) await locator.tap();
  else await locator.click();
}

/** Three quick presses on empty stage centre (hint gesture). */
async function tripleTapStage(page, touch) {
  const vp = page.viewportSize();
  const x = Math.round(vp.width / 2);
  const y = Math.round(vp.height / 2);
  for (let i = 0; i < 3; i += 1) {
    await tapAt(page, touch, x, y);
    await sleep(120);
  }
}

async function freshHidden(page, prefix) {
  const id = `${prefix}-fresh-hidden`;
  const errors = [];
  const state = await playerState(page);
  if (state !== 'hidden') errors.push(`fresh visit starts in ${state}, expected hidden`);
  if (await visible(page.locator('[data-player-vinyl]'))) errors.push('vinyl visible on a clean stage');
  if (await visible(page.locator('[data-player-panel]'))) errors.push('panel visible on a clean stage');
  await shot(page, id);
  return errors.length ? fail(id, errors) : pass(id);
}

async function tapHint(page, prefix, touch) {
  const id = `${prefix}-tap-hint`;
  const errors = [];
  await tripleTapStage(page, touch);
  await sleep(SETTLE_MS);
  const state = await playerState(page);
  if (state !== 'hint') errors.push(`after 3 taps state is ${state}, expected hint`);
  if (!(await visible(page.locator('[data-player-vinyl]')))) errors.push('peeking vinyl not visible');
  await shot(page, id);
  // Hint times out after ~4 s.
  await sleep(4600);
  const after = await playerState(page);
  if (after !== 'hidden') errors.push(`hint did not slide away (state ${after})`);
  return errors.length ? fail(id, errors) : pass(id);
}

async function hintReveal(page, prefix, touch) {
  const id = `${prefix}-hint-reveal`;
  const errors = [];
  await tripleTapStage(page, touch);
  await sleep(SETTLE_MS);
  await pressLocator(page.locator('[data-player-vinyl]'), touch);
  await sleep(SETTLE_MS);
  const state = await playerState(page);
  if (state !== 'full') errors.push(`vinyl tap from hint gave ${state}, expected full`);
  if (!(await visible(page.locator('[data-player-panel]')))) errors.push('full panel not visible');
  const discovered = await page.evaluate(() => localStorage.getItem('ve-player-discovered'));
  if (discovered !== '1') errors.push('discovery not remembered (ve-player-discovered)');
  const songs = await page.locator('[data-player-songs] [data-jukebox-option]').count();
  if (songs < 1) errors.push('song list is empty');
  await shot(page, id);
  return errors.length ? fail(id, errors) : pass(id, `${songs} songs listed`);
}

async function pickSong(page, prefix, touch) {
  const id = `${prefix}-pick-song`;
  const errors = [];
  const other = page.locator('[data-player-songs] [data-jukebox-option][aria-pressed="false"]').first();
  if ((await other.count()) === 0) return skipped(id, 'only one stage song');
  const targetId = await other.getAttribute('data-jukebox-option');
  const shuffleBefore = await page.locator('[data-stage-player] [data-shuffle-toggle]').getAttribute('aria-pressed');
  await pressLocator(other, touch);
  await sleep(SETTLE_MS);
  const pressed = await page
    .locator(`[data-player-songs] [data-jukebox-option="${targetId}"]`)
    .getAttribute('aria-pressed');
  if (pressed !== 'true') errors.push(`picked ${targetId} is not marked current`);
  const shuffleAfter = await page.locator('[data-stage-player] [data-shuffle-toggle]').getAttribute('aria-pressed');
  if (shuffleBefore !== shuffleAfter) errors.push('manual pick changed shuffle state');
  await shot(page, id);
  return errors.length ? fail(id, errors) : pass(id, `picked ${targetId}`);
}

async function closeMinimal(page, prefix, touch) {
  const id = `${prefix}-close-minimal`;
  const errors = [];
  await pressLocator(page.locator('[data-player-close]'), touch);
  await sleep(SETTLE_MS);
  if ((await playerState(page)) !== 'minimal') errors.push('close button did not collapse to minimal');
  const box = await boxOf(page.locator('[data-player-vinyl]'));
  const vp = page.viewportSize();
  const share = (box.width * box.height) / (vp.width * vp.height);
  if (share > 0.02) errors.push(`minimal vinyl covers ${(share * 100).toFixed(2)}% of the viewport`);

  // Reopen, then Escape and outside press.
  await pressLocator(page.locator('[data-player-vinyl]'), touch);
  await sleep(SETTLE_MS);
  if ((await playerState(page)) !== 'full') errors.push('vinyl did not reopen the player');
  await page.keyboard.press('Escape');
  await sleep(SETTLE_MS);
  if ((await playerState(page)) !== 'minimal') errors.push('Escape did not collapse to minimal');
  await pressLocator(page.locator('[data-player-vinyl]'), touch);
  await sleep(SETTLE_MS);
  await tapAt(page, touch, Math.round(vp.width / 2), Math.round(vp.height / 3));
  await sleep(SETTLE_MS);
  if ((await playerState(page)) !== 'minimal') errors.push('outside press did not collapse to minimal');
  await shot(page, id);
  return errors.length ? fail(id, errors) : pass(id);
}

async function keyboardReveal(page, prefix) {
  const id = `${prefix}-keyboard-reveal`;
  const errors = [];
  const reveal = page.locator('[data-player-reveal]');
  await reveal.focus();
  if (!(await visible(reveal))) errors.push('Show player button not visible on focus');
  await page.keyboard.press('Enter');
  await sleep(SETTLE_MS);
  if ((await playerState(page)) !== 'full') errors.push('Enter on Show player did not open the player');
  const focusInList = await page.evaluate(() =>
    Boolean(document.activeElement?.closest('[data-player-songs]')),
  );
  if (!focusInList) errors.push('focus did not move to the song list');
  await page.keyboard.press('Escape');
  await sleep(SETTLE_MS);
  const vinylFocused = await page.evaluate(() =>
    document.activeElement?.hasAttribute('data-player-vinyl'),
  );
  if (!vinylFocused) errors.push('Escape did not return focus to the vinyl');
  await shot(page, id);
  return errors.length ? fail(id, errors) : pass(id);
}

async function discogPlayClose(page, prefix, touch) {
  const id = `${prefix}-discog-play-close`;
  const errors = [];
  const stateBefore = await playerState(page);
  let scope;
  if (touch) {
    await page.locator('[data-site-nav-menu-toggle]').tap();
    await sleep(SETTLE_MS);
    await page.locator('[data-site-nav-portal="discography"]').first().tap();
    await sleep(SETTLE_MS);
    scope = page.locator('[data-site-nav-menu]');
  } else {
    await page.locator('[data-legal-slug="discography"]').first().click();
    await sleep(SETTLE_MS);
    scope = page.locator('#legal-overlay [data-legal-panel="discography"]');
  }
  const buttons = scope.locator('[data-stage-button]:not([hidden])');
  const count = await buttons.count();
  if (count < 1) return fail(id, ['no stage play button in the discography']);
  await shot(page, `${id}-open`);
  await pressLocator(buttons.first(), touch);
  await sleep(SETTLE_MS * 2);
  const stillOpen = touch
    ? await page.evaluate(() => document.documentElement.classList.contains('site-nav-menu-open'))
    : await page.evaluate(() =>
        Boolean(document.querySelector('#legal-overlay [data-legal-panel]:not([hidden])')),
      );
  if (stillOpen) errors.push('overlay/menu did not close after play');
  const stateAfter = await playerState(page);
  if (stateAfter === 'full' && stateBefore !== 'full') errors.push('discography play forced the player open');
  await shot(page, id);
  return errors.length ? fail(id, errors) : pass(id, `${count} play buttons visible`);
}

async function newContext(browser, viewport, touch) {
  const context = await browser.newContext(
    touch
      ? { viewport, hasTouch: true, isMobile: true, deviceScaleFactor: 2 }
      : { viewport, hasTouch: false, isMobile: false },
  );
  await context.addInitScript(() => {
    try {
      localStorage.setItem('valence-intro-seen', '1');
    } catch {
      // storage blocked — waitChrome still waits out the intro
    }
  });
  return context;
}

/** All player flows for one viewport. Fresh storage for discovery and keyboard paths. */
async function runViewport(browser, preview, prefix, viewport, touch) {
  const results = [];
  const context = await newContext(browser, viewport, touch);
  await startTrace(context);
  const page = await openLanding(context, preview.url);
  results.push(await runFlow(`${prefix}-fresh-hidden`, () => freshHidden(page, prefix)));
  results.push(await runFlow(`${prefix}-tap-hint`, () => tapHint(page, prefix, touch)));
  results.push(await runFlow(`${prefix}-hint-reveal`, () => hintReveal(page, prefix, touch)));
  results.push(await runFlow(`${prefix}-pick-song`, () => pickSong(page, prefix, touch)));
  results.push(await runFlow(`${prefix}-close-minimal`, () => closeMinimal(page, prefix, touch)));
  results.push(await runFlow(`${prefix}-discog-play-close`, () => discogPlayClose(page, prefix, touch)));
  if (results.some((row) => row.status === 'fail')) await stopTrace(context, `${prefix}-fail`);
  else await context.tracing.stop().catch(() => {});
  await context.close();

  const keyboardContext = await newContext(browser, viewport, false);
  const keyboardPage = await openLanding(keyboardContext, preview.url);
  results.push(
    await runFlow(`${prefix}-keyboard-reveal`, () => keyboardReveal(keyboardPage, prefix)),
  );
  await keyboardContext.close();
  return results;
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

  try {
    if (phoneFlows) results.push(...(await runViewport(browser, preview, 'phone', PHONE, true)));
    if (laptopFlows) results.push(...(await runViewport(browser, preview, 'laptop', LAPTOP, false)));
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
