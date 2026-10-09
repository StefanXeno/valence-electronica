import '../styles/tagline-rotate.css';
import { isGlitchThemeActive, playElementGlitch } from './glitch';
import {
  buildEligibleSet,
  clampRotationIndex,
  formatTagline,
  loadTaglinePool,
  nextRotationIndex,
  readTaglineRotationMsFromLocation,
  splitTaglineLink,
  taglineTextsEqual,
  type EligibleTagline,
} from './tagline-pool';

const FADE_MS = 500;
const GLITCH_SWAP_RATIO = 0.45;

/** Write one line into the tagline node; `linkText` (or the whole line) links to `url`. */
function renderLine(root: HTMLElement, line: EligibleTagline): void {
  const parts = splitTaglineLink(line);
  if (!parts || !line.url) {
    root.textContent = formatTagline(line.text);
    return;
  }
  const link = document.createElement('a');
  link.className = 'tagline__link';
  link.href = line.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = parts.link;
  root.replaceChildren(formatTagline(parts.before), link, formatTagline(parts.after));
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

  const scheduleNextRotation = () => {
    if (disposed || eligible.length === 0) return;
    clearRotationTimer();
    rotationTimer = setTimeout(() => {
      void advanceRotation();
    }, rotationMs);
  };

  const applyInstant = (line: EligibleTagline) => {
    renderLine(root, line);
    root.removeAttribute('data-tagline-phase');
    currentText = line.text;
  };

  const applyWithFade = async (line: EligibleTagline) => {
    if (taglineTextsEqual(line.text, currentText)) return;

    root.removeAttribute('data-tagline-phase');
    await nextFrame();
    if (disposed) return;

    root.dataset.taglinePhase = 'out';
    void root.offsetWidth;
    await waitForMotionEnd(root);
    if (disposed) return;

    renderLine(root, line);
    root.dataset.taglinePhase = 'in';
    await waitForMotionEnd(root);
    if (disposed) return;

    root.removeAttribute('data-tagline-phase');
    currentText = line.text;
  };

  const applyWithGlitch = async (line: EligibleTagline) => {
    if (taglineTextsEqual(line.text, currentText)) return;

    root.removeAttribute('data-tagline-phase');
    clearGlitchState();

    const dur = playElementGlitch(root, 'is-glitching');
    if (!dur) {
      applyInstant(line);
      return;
    }

    const swapAt = Math.round(dur * GLITCH_SWAP_RATIO);
    await waitMs(swapAt);
    if (disposed) return;

    renderLine(root, line);
    currentText = line.text;

    await waitMs(dur + 80 - swapAt);
    if (disposed) return;

    clearGlitchState();
  };

  const showLine = (line: EligibleTagline, animate: boolean) => {
    if (taglineTextsEqual(line.text, currentText)) return Promise.resolve();
    if (!animate || prefersReducedMotion()) {
      applyInstant(line);
      return Promise.resolve();
    }
    if (isGlitchThemeActive()) {
      return applyWithGlitch(line);
    }
    return applyWithFade(line);
  };

  const syncEligibleSet = () => {
    eligible = buildEligibleSet(pool);
    index = clampRotationIndex(index, eligible.length);
  };

  const advanceRotation = async () => {
    if (disposed) return;

    syncEligibleSet();
    if (eligible.length === 0) {
      applyInstant({ text: fallbackText });
      clearRotationTimer();
      return;
    }

    const nextIndex = nextRotationIndex(index, eligible.length);
    const next = eligible[nextIndex];
    if (!next?.text) {
      scheduleNextRotation();
      return;
    }

    index = nextIndex;
    const animate = !taglineTextsEqual(next.text, currentText);
    await showLine(next, animate);
    if (disposed) return;
    scheduleNextRotation();
  };

  const bootstrap = async () => {
    syncEligibleSet();
    if (eligible.length === 0) {
      applyInstant({ text: fallbackText });
      return;
    }

    index = 0;
    const first = eligible[0];
    if (!first?.text) {
      applyInstant({ text: fallbackText });
      return;
    }

    await showLine(first, !taglineTextsEqual(first.text, currentText));
    if (disposed) return;
    scheduleNextRotation();
  };

  const onPageHide = () => {
    disposed = true;
    clearRotationTimer();
    clearGlitchState();
    root.removeAttribute('data-tagline-phase');
  };

  window.addEventListener('pagehide', onPageHide);

  void bootstrap();

  return () => {
    onPageHide();
    window.removeEventListener('pagehide', onPageHide);
  };
}
