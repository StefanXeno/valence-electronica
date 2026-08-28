import '../styles/tagline-rotate.css';
import {
  buildEligibleSet,
  clampRotationIndex,
  formatTagline,
  loadTaglinePool,
  nextRotationIndex,
  type EligibleTagline,
} from './tagline-pool';

const ROTATION_MS = 60_000;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function waitForPhaseEnd(element: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const onEnd = (event: Event) => {
      if (event.target !== element) return;
      element.removeEventListener('transitionend', onEnd);
      element.removeEventListener('animationend', onEnd);
      resolve();
    };
    element.addEventListener('transitionend', onEnd);
    element.addEventListener('animationend', onEnd);
  });
}

export function initTaglineRotator(root: HTMLElement, fallbackText: string): () => void {
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

  const scheduleNextRotation = () => {
    if (disposed || eligible.length === 0) return;
    clearRotationTimer();
    rotationTimer = setTimeout(() => {
      void advanceRotation();
    }, ROTATION_MS);
  };

  const applyInstant = (text: string) => {
    root.textContent = formatTagline(text);
    root.removeAttribute('data-tagline-phase');
    currentText = text;
  };

  const applyWithFade = async (text: string) => {
    if (text === currentText) return;

    root.dataset.taglinePhase = 'out';
    await waitForPhaseEnd(root);
    if (disposed) return;

    root.textContent = formatTagline(text);
    root.dataset.taglinePhase = 'in';
    await waitForPhaseEnd(root);
    if (disposed) return;

    root.removeAttribute('data-tagline-phase');
    currentText = text;
  };

  const showLine = (text: string, animate: boolean) => {
    if (text === currentText) return Promise.resolve();
    if (!animate || prefersReducedMotion()) {
      applyInstant(text);
      return Promise.resolve();
    }
    return applyWithFade(text);
  };

  const syncEligibleSet = () => {
    eligible = buildEligibleSet(pool);
    index = clampRotationIndex(index, eligible.length);
  };

  const advanceRotation = async () => {
    if (disposed) return;

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
    const animate = nextText !== currentText;
    await showLine(nextText, animate);
    if (disposed) return;
    scheduleNextRotation();
  };

  const bootstrap = async () => {
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

    await showLine(first, first !== currentText);
    if (disposed) return;
    scheduleNextRotation();
  };

  const onPageHide = () => {
    disposed = true;
    clearRotationTimer();
    root.removeAttribute('data-tagline-phase');
  };

  window.addEventListener('pagehide', onPageHide);

  void bootstrap();

  return () => {
    onPageHide();
    window.removeEventListener('pagehide', onPageHide);
  };
}
