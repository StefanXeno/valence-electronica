import { isWildGlitchActive } from './demonic-combo';
import { isGlitchThemeActive, playElementGlitch } from './glitch';

/** Live-safe idle class — same families as hover/press, no clip-path dead zones. */
export const AMBIENT_GLITCH_CLASS = 'is-glitch-ambient';

/** Stamped on surfaces that only become `.glitch-hit` while wild ambient runs. */
export const WILD_SURFACE_ATTR = 'wildGlitchSurface';

const INTERACTIVE_SEL = 'button, a, [role="button"], summary';

/**
 * Visible stage / HUD chunks for demonic wild mode.
 * Leaves preferred over parents (see `preferLeafSurfaces`).
 */
export const WILD_SURFACE_SELECTORS = [
  '.glitch-hit',
  '.site-nav__brand',
  '.site-nav__item',
  '.site-nav__menu-btn',
  '.site-nav__menu-item',
  '.site-nav__menu-legal-item',
  '.site-nav__menu-channel',
  '.site-nav__menu-portal-title',
  '.site-nav__menu-portal-head-text',
  '.site-nav__menu-portal-listen',
  '.site-nav__menu-portal-collection-cover',
  '.stage-player__eyebrow',
  '.volume-control',
  '.identity',
  '[data-tagline-root]',
  '.footer a',
  '[data-now-playing]',
  '.discog__item',
  '.discog__head-text__title',
  '.stage-card',
].join(', ');

const WILD_SKIP_CLOSEST =
  '[data-atmosphere], [data-track-rub-overlay], .ve-achievement, [data-legal-overlay], [data-landing-intro], .hud-label-reveal';

export type AmbientGlitchEligibility = {
  glitchHit: boolean;
  interactive: boolean;
  disabled: boolean;
  hidden: boolean;
  placeholder: boolean;
  tagline: boolean;
  slider: boolean;
};

/** Pure gate — clickable HUD chrome only; static copy / sliders stay out. */
export function qualifiesAsAmbientGlitchTarget(flags: AmbientGlitchEligibility): boolean {
  return (
    flags.glitchHit &&
    flags.interactive &&
    !flags.disabled &&
    !flags.hidden &&
    !flags.placeholder &&
    !flags.tagline &&
    !flags.slider
  );
}

/** Wild mode: any laid-out stage surface except sliders / hidden / overlays. */
export function qualifiesAsWildAmbientGlitchTarget(flags: AmbientGlitchEligibility): boolean {
  return !flags.disabled && !flags.hidden && !flags.placeholder && !flags.slider;
}

export function readAmbientGlitchEligibility(el: Element): AmbientGlitchEligibility {
  return {
    glitchHit: el.classList.contains('glitch-hit'),
    interactive: el.matches(INTERACTIVE_SEL),
    disabled: el.matches('[disabled], [aria-disabled="true"]'),
    hidden: el.hasAttribute('hidden') || Boolean(el.closest('[hidden]')),
    placeholder: Boolean(el.closest('.placeholder')),
    tagline: el.matches('[data-tagline-root]'),
    slider: Boolean(el.closest('.volume-control__slider-wrap, input[type="range"]')),
  };
}

export function isAmbientGlitchTarget(el: Element): el is HTMLElement {
  return el instanceof HTMLElement && qualifiesAsAmbientGlitchTarget(readAmbientGlitchEligibility(el));
}

export function isWildAmbientGlitchTarget(el: Element): el is HTMLElement {
  if (!(el instanceof HTMLElement)) return false;
  if (el.closest(WILD_SKIP_CLOSEST)) return false;
  return qualifiesAsWildAmbientGlitchTarget(readAmbientGlitchEligibility(el));
}

/** Drop parents when a descendant is also a candidate — more surfaces, more chaos. */
export function preferLeafSurfaces(els: HTMLElement[]): HTMLElement[] {
  return els.filter((el) => !els.some((other) => other !== el && el.contains(other)));
}

export function collectAmbientGlitchTargets(root: ParentNode): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>('.glitch-hit')].filter(isAmbientGlitchTarget);
}

export function collectWildAmbientGlitchTargets(root: ParentNode = document): HTMLElement[] {
  const raw = [...root.querySelectorAll<HTMLElement>(WILD_SURFACE_SELECTORS)].filter(
    isWildAmbientGlitchTarget,
  );
  return preferLeafSurfaces(raw);
}

/** Temporary `.glitch-hit` so ambient keyframes apply to non-hit stage chrome. */
export function ensureWildGlitchSurface(el: HTMLElement): void {
  if (el.classList.contains('glitch-hit')) return;
  el.classList.add('glitch-hit');
  el.dataset[WILD_SURFACE_ATTR] = '1';
}

export function releaseWildGlitchSurface(el: HTMLElement): void {
  if (el.dataset[WILD_SURFACE_ATTR] !== '1') return;
  el.classList.remove(
    'glitch-hit',
    AMBIENT_GLITCH_CLASS,
    'is-glitching',
    'is-glitch-hover',
    'is-glitch-continuous',
  );
  delete el.dataset[WILD_SURFACE_ATTR];
  delete el.dataset.glitchStyle;
  delete el.dataset.glitchPreset;
}

function releaseAllWildGlitchSurfaces(root: ParentNode = document): void {
  root
    .querySelectorAll<HTMLElement>(`[data-wild-glitch-surface='1']`)
    .forEach(releaseWildGlitchSurface);
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isBusy(el: HTMLElement): boolean {
  return (
    el.classList.contains('is-glitching') ||
    el.classList.contains('is-glitch-hover') ||
    el.classList.contains('is-glitch-continuous') ||
    el.classList.contains(AMBIENT_GLITCH_CLASS)
  );
}

function isLaidOut(el: HTMLElement): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.width < 2 || rect.height < 2) return false;
  const style = getComputedStyle(el);
  if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) === 0) {
    return false;
  }
  return (
    rect.bottom > 0 &&
    rect.right > 0 &&
    rect.top < window.innerHeight &&
    rect.left < window.innerWidth
  );
}

function randMs(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export type AmbientGlitchField = {
  start(): void;
  stop(): void;
};

/**
 * Nightmare idle field: staggered one-shots on visible clickable `.glitch-hit`
 * controls. Wild (666) expands to every visible stage/HUD surface.
 */
export function createAmbientGlitchField(root: ParentNode = document): AmbientGlitchField {
  let timer: number | undefined;
  const pending = new Set<HTMLElement>();
  const cleanups: number[] = [];

  const clearPending = (el: HTMLElement) => {
    pending.delete(el);
    el.classList.remove(AMBIENT_GLITCH_CLASS);
  };

  const stop = () => {
    window.clearTimeout(timer);
    timer = undefined;
    cleanups.forEach((id) => window.clearTimeout(id));
    cleanups.length = 0;
    pending.forEach((el) => {
      el.classList.remove(AMBIENT_GLITCH_CLASS);
    });
    pending.clear();
    releaseAllWildGlitchSurfaces(root instanceof Document ? root : document);
  };

  const tick = () => {
    window.clearTimeout(timer);
    if (prefersReducedMotion() || !isGlitchThemeActive()) {
      stop();
      return;
    }
    if (document.hidden) {
      timer = window.setTimeout(tick, randMs(800, 1600));
      return;
    }

    const wild = isWildGlitchActive();
    const doc = root instanceof Document ? root : document;
    if (!wild) releaseAllWildGlitchSurfaces(doc);

    const maxPending = wild ? 7 : 2;
    const candidates = wild
      ? collectWildAmbientGlitchTargets(doc)
      : collectAmbientGlitchTargets(root);
    const idle = candidates.filter((el) => !isBusy(el) && isLaidOut(el));

    if (idle.length > 0 && pending.size < maxPending) {
      // Wild: a few surfaces per tick — stage-wide, not a strobe wall.
      const burst = wild ? Math.min(3, idle.length, maxPending - pending.size) : 1;
      for (let i = 0; i < burst; i++) {
        const pool = idle.filter((el) => !pending.has(el));
        if (pool.length === 0) break;
        const pick = pool[Math.floor(Math.random() * pool.length)];
        if (wild) ensureWildGlitchSurface(pick);
        const dur = playElementGlitch(pick, AMBIENT_GLITCH_CLASS);
        if (dur) {
          pending.add(pick);
          cleanups.push(
            window.setTimeout(() => {
              if (pick.classList.contains(AMBIENT_GLITCH_CLASS)) {
                clearPending(pick);
              } else {
                pending.delete(pick);
              }
            }, dur + 80),
          );
        }
      }
    }

    // Irregular cadence so the field never reads as one global blink.
    timer = window.setTimeout(tick, wild ? randMs(140, 380) : randMs(520, 1280));
  };

  const onVisibility = () => {
    if (!document.hidden && isGlitchThemeActive() && !prefersReducedMotion()) {
      window.clearTimeout(timer);
      timer = window.setTimeout(tick, randMs(120, 480));
    }
  };

  const start = () => {
    stop();
    document.removeEventListener('visibilitychange', onVisibility);
    document.addEventListener('visibilitychange', onVisibility);
    if (prefersReducedMotion() || !isGlitchThemeActive()) return;
    timer = window.setTimeout(tick, randMs(160, 720));
  };

  const dispose = () => {
    document.removeEventListener('visibilitychange', onVisibility);
    stop();
  };

  return { start, stop: dispose };
}
