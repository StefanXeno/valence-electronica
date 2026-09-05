/**
 * Pause flatten for `.player-dock__soundwave` and `.discog__eq`.
 *
 * `animation: none` + height: 4px snaps in one frame (keyframes own transform).
 * Instead: freeze the dance, bake each bar's visual height, then transition
 * height to 4px. Does not touch `data-player-paused` (shuffle hold stays).
 */

const ROOT_SEL = '.player-dock__soundwave, .discog__eq';
const FLAT_CLASS = 'is-eq-flat';

let started = false;
/** Bumps on pause/play so a stale rAF cannot flatten after resume (or the reverse). */
let gen = 0;

function roots(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>(ROOT_SEL)];
}

function barsIn(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(':scope > span')];
}

function flattenEq(): void {
  const mine = ++gen;
  const groups = roots();

  for (const root of groups) {
    for (const bar of barsIn(root)) {
      const visualH = bar.getBoundingClientRect().height;
      bar.style.setProperty('transition', 'none');
      bar.style.setProperty('animation', 'none');
      bar.style.setProperty('transform', 'none');
      if (visualH > 0) {
        const px = `${visualH}px`;
        bar.style.setProperty('height', px);
        bar.style.setProperty('min-height', px);
        bar.style.setProperty('max-height', px);
      }
    }
  }

  // Paint the locked px heights before 4px is applied so height can interpolate.
  groups[0]?.getBoundingClientRect();

  requestAnimationFrame(() => {
    if (mine !== gen) return;
    for (const root of groups) {
      for (const bar of barsIn(root)) {
        bar.style.removeProperty('transition');
      }
      root.classList.add(FLAT_CLASS);
      for (const bar of barsIn(root)) {
        bar.style.removeProperty('height');
        bar.style.removeProperty('min-height');
        bar.style.removeProperty('max-height');
        bar.style.removeProperty('animation');
        bar.style.removeProperty('transform');
      }
    }
  });
}

function releaseEq(): void {
  const mine = ++gen;
  for (const root of roots()) {
    for (const bar of barsIn(root)) {
      // Instant dance on play — don't ease from 4px back to diamond rest.
      bar.style.setProperty('transition', 'none');
      bar.style.removeProperty('animation');
      bar.style.removeProperty('transform');
      bar.style.removeProperty('height');
      bar.style.removeProperty('min-height');
      bar.style.removeProperty('max-height');
    }
    root.classList.remove(FLAT_CLASS);
  }

  requestAnimationFrame(() => {
    if (mine !== gen) return;
    for (const root of roots()) {
      for (const bar of barsIn(root)) {
        bar.style.removeProperty('transition');
      }
    }
  });
}

export function initEqFlatten(): void {
  if (started) return;
  started = true;

  const html = document.documentElement;
  const sync = () => {
    if (html.hasAttribute('data-player-paused')) flattenEq();
    else releaseEq();
  };

  new MutationObserver(sync).observe(html, {
    attributes: true,
    attributeFilter: ['data-player-paused'],
  });
  sync();
}
