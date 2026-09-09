import { isGlitchThemeActive, playElementGlitch } from './glitch';

/** Live-safe idle class — same families as hover/press, no clip-path dead zones. */
export const AMBIENT_GLITCH_CLASS = 'is-glitch-ambient';

const INTERACTIVE_SEL = 'button, a, [role="button"], summary';

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

export type OpenPanelChromeFlags = {
  /** Hit lives under an open `[data-stage-panels] details`. */
  insideOpenStagePanel: boolean;
  /** The panel's own summary / details shell — not inner HUD hits. */
  isPanelChrome: boolean;
};

/**
 * Open-panel skip is shell-only. Listen-on / discog play / tour pills still
 * one-shot via `playElementGlitch`. Closed summaries are not skipped.
 */
export function isOpenStagePanelChromeHit(flags: OpenPanelChromeFlags): boolean {
  return flags.insideOpenStagePanel && flags.isPanelChrome;
}

/** True for an open on-demand summary/details — not `.discog` listen-on `<a>`s. */
export function isOpenStagePanelChrome(el: Element): boolean {
  const box = el.closest('[data-stage-panels] details');
  const insideOpenStagePanel = box instanceof HTMLDetailsElement && box.open;
  const isPanelChrome = el === box || el.matches('summary, .stage-panel__summary');
  return isOpenStagePanelChromeHit({ insideOpenStagePanel, isPanelChrome });
}

export function collectAmbientGlitchTargets(root: ParentNode): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>('.glitch-hit')].filter(isAmbientGlitchTarget);
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
 * controls. Reuses `playElementGlitch` presets — not a second effect.
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

    const idle = collectAmbientGlitchTargets(root).filter((el) => !isBusy(el) && isLaidOut(el));
    if (idle.length > 0 && pending.size < 2) {
      const pick = idle[Math.floor(Math.random() * idle.length)];
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

    // Irregular cadence so the field never reads as one global blink.
    timer = window.setTimeout(tick, randMs(520, 1280));
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
