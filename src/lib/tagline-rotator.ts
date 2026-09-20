import '../styles/tagline-rotate.css';
import { isGlitchThemeActive, playElementGlitch } from './glitch';
import {
  buildEligibleSet,
  clampRotationIndex,
  formatTagline,
  loadTaglinePool,
  nextRotationIndex,
  readTaglineRotationMsFromLocation,
  taglineTextsEqual,
  type EligibleTagline,
} from './tagline-pool';

const FADE_MS = 500;
const GLITCH_SWAP_RATIO = 0.45;

/** Shown under the Valence logo after a successful rub reveal — page lifetime only. */
export const RUB_SUCCESS_TAGLINE = 'You know how to rub ^^';

type ActiveRotator = {
  pin: (text: string) => void;
};

/** Living rotator instance so rub success can freeze the line without localStorage. */
let activeRotator: ActiveRotator | null = null;

/**
 * Swap the logo subtext to the rub easter-egg line and stop rotation for this page load.
 * No persistence — a full reload restores the normal rotating tagline.
 */
export function applyRubSuccessTagline(): void {
  const text = RUB_SUCCESS_TAGLINE;
  if (activeRotator) {
    activeRotator.pin(text);
    return;
  }
  // Rotator not booted yet (or missing) — still mutate the brand subtext node.
  const root = document.querySelector<HTMLElement>('[data-tagline-root]');
  if (!root) return;
  root.textContent = formatTagline(text);
  root.removeAttribute('data-tagline-phase');
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function waitForMotionEnd(element: HTMLElement, ms = FADE_MS): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      element.removeEventListener('transitionend', onEnd);
      element.removeEventListener('animationend', onEnd);
      resolve();
    };
    const onEnd = (event: Event) => {
      if (event.target !== element) return;
      finish();
    };
    element.addEventListener('transitionend', onEnd);
    element.addEventListener('animationend', onEnd);
    window.setTimeout(finish, ms + 100);
  });
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function initTaglineRotator(root: HTMLElement, fallbackText: string): () => void {
  const rotationMs = readTaglineRotationMsFromLocation();
  const pool = loadTaglinePool();
  let eligible: EligibleTagline[] = buildEligibleSet(pool);
  let index = 0;
  let currentText = root.textContent ?? fallbackText;
  let rotationTimer: ReturnType<typeof setTimeout> | undefined;
  let disposed = false;
  /** Rub success freezes this line until reload (page-lifetime pin). */
  let pinned = false;

  const clearRotationTimer = () => {
    if (rotationTimer !== undefined) {
      clearTimeout(rotationTimer);
      rotationTimer = undefined;
    }
  };

  const clearGlitchState = () => {
    root.classList.remove(
      'is-glitching',
      'is-glitch-hover',
      'is-glitch-continuous',
      'is-glitch-ambient',
    );
    delete root.dataset.glitch;
  };

  const pin = (text: string) => {
    pinned = true;
    clearRotationTimer();
    clearGlitchState();
    root.textContent = formatTagline(text);
    root.removeAttribute('data-tagline-phase');
    currentText = text;
  };

  const scheduleNextRotation = () => {
    if (disposed || pinned || eligible.length === 0) return;
    clearRotationTimer();
    rotationTimer = setTimeout(() => {
      void advanceRotation();
    }, rotationMs);
  };

  const applyInstant = (text: string) => {
    if (pinned) return;
    root.textContent = formatTagline(text);
    root.removeAttribute('data-tagline-phase');
    currentText = text;
  };

  const applyWithFade = async (text: string) => {
    if (pinned || taglineTextsEqual(text, currentText)) return;

    root.removeAttribute('data-tagline-phase');
    await nextFrame();
    if (disposed || pinned) return;

    root.dataset.taglinePhase = 'out';
    void root.offsetWidth;
    await waitForMotionEnd(root);
    if (disposed || pinned) return;

    root.textContent = formatTagline(text);
    root.dataset.taglinePhase = 'in';
    await waitForMotionEnd(root);
    if (disposed || pinned) return;

    root.removeAttribute('data-tagline-phase');
    currentText = text;
  };

  const applyWithGlitch = async (text: string) => {
    if (pinned || taglineTextsEqual(text, currentText)) return;

    root.removeAttribute('data-tagline-phase');
    clearGlitchState();

    const dur = playElementGlitch(root, 'is-glitching');
    if (!dur) {
      applyInstant(text);
      return;
    }

    const swapAt = Math.round(dur * GLITCH_SWAP_RATIO);
    await waitMs(swapAt);
    if (disposed || pinned) return;

    root.textContent = formatTagline(text);
    currentText = text;

    await waitMs(dur + 80 - swapAt);
    if (disposed || pinned) return;

    clearGlitchState();
  };

  const showLine = (text: string, animate: boolean) => {
    if (pinned || taglineTextsEqual(text, currentText)) return Promise.resolve();
    if (!animate || prefersReducedMotion()) {
      applyInstant(text);
      return Promise.resolve();
    }
    if (isGlitchThemeActive()) {
      return applyWithGlitch(text);
    }
    return applyWithFade(text);
  };

  const syncEligibleSet = () => {
    eligible = buildEligibleSet(pool);
    index = clampRotationIndex(index, eligible.length);
  };

  const advanceRotation = async () => {
    if (disposed || pinned) return;

    syncEligibleSet();
    if (eligible.length === 0) {
      applyInstant(fallbackText);
      clearRotationTimer();
      return;
    }

    const nextIndex = nextRotationIndex(index, eligible.length);
    const nextText = eligible[nextIndex]?.text;
    if (!nextText) {
      scheduleNextRotation();
      return;
    }

    index = nextIndex;
    const animate = !taglineTextsEqual(nextText, currentText);
    await showLine(nextText, animate);
    if (disposed || pinned) return;
    scheduleNextRotation();
  };

  const bootstrap = async () => {
    if (pinned) return;
    syncEligibleSet();
    if (eligible.length === 0) {
      applyInstant(fallbackText);
      return;
    }

    index = 0;
    const first = eligible[0]?.text;
    if (!first) {
      applyInstant(fallbackText);
      return;
    }

    await showLine(first, !taglineTextsEqual(first, currentText));
    if (disposed || pinned) return;
    scheduleNextRotation();
  };

  const onPageHide = () => {
    disposed = true;
    clearRotationTimer();
    clearGlitchState();
    root.removeAttribute('data-tagline-phase');
  };

  activeRotator = { pin };
  window.addEventListener('pagehide', onPageHide);

  void bootstrap();

  return () => {
    if (activeRotator?.pin === pin) activeRotator = null;
    onPageHide();
    window.removeEventListener('pagehide', onPageHide);
  };
}
