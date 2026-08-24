export type GlitchStyle =
  | 'tear'
  | 'chroma'
  | 'stutter'
  | 'slice'
  | 'ripple'
  | 'static'
  | 'shear'
  | 'blink'
  | 'wave'
  | 'punch';

export type GlitchPreset = {
  style: GlitchStyle;
  /** Horizontal snaps (signed, opposite sides). */
  xa: number;
  xb: number;
  xc: number;
  /** Vertical snaps (signed, opposite sides). */
  ya: number;
  yb: number;
  yc: number;
  /** Skew magnitudes matching each paired snap. */
  sa: number;
  sb: number;
  sc: number;
  /** Horizontal scanline positions in % of element height. */
  line1: number;
  line2: number;
  line3: number;
  /** Vertical scanline positions in % of element width. */
  vline1: number;
  vline2: number;
  vline3: number;
  scale: number;
  dur: number;
  /** Scanline peak opacity 0–1 */
  scan: number;
};

const STYLES: readonly GlitchStyle[] = [
  'tear',
  'chroma',
  'stutter',
  'slice',
  'ripple',
  'static',
  'shear',
  'blink',
  'wave',
  'punch',
];

/** Two tuned presets per family → 20 total. */
const PRESET_COUNT = STYLES.length * 2;

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Build one calm-but-distinct variant.
 * Style family drives the CSS keyframes; numeric vars tune that family's character.
 */
function makePreset(index: number): GlitchPreset {
  const style = STYLES[index % STYLES.length];
  const hDir = index % 2 === 0 ? 1 : -1;
  const vDir = index % 3 === 0 ? -1 : 1;
  const t = Math.floor(index / STYLES.length) / Math.max(1, PRESET_COUNT / STYLES.length - 1); // 0 or 1
  const lineShift = (index * 7) % 18;

  let move = 5 + t * 4;
  let moveY = 2.5 + t * 3;
  let skew = 5 + t * 6;
  let scale = 1.02 + t * 0.035;
  let dur = 480;
  let scan = 0.85;

  switch (style) {
    case 'tear':
      move = 6 + t * 5;
      moveY = 3 + t * 3.5;
      skew = 7 + t * 6;
      dur = Math.floor(500 + t * 120);
      scan = 0.75 + t * 0.2;
      break;
    case 'chroma':
      move = 4 + t * 4;
      moveY = 2 + t * 2.5;
      skew = 3 + t * 4;
      scale = 1.01 + t * 0.03;
      dur = Math.floor(560 + t * 100);
      scan = 0.35 + t * 0.25;
      break;
    case 'stutter':
      move = 3.5 + t * 3.5;
      moveY = 2 + t * 2.5;
      skew = 4 + t * 5;
      dur = Math.floor(320 + t * 100);
      scan = 0.55 + t * 0.25;
      break;
    case 'slice':
      move = 7 + t * 4;
      moveY = 1.5 + t * 2;
      skew = 2 + t * 4;
      scale = 1.03 + t * 0.04;
      dur = Math.floor(440 + t * 140);
      scan = 0.9;
      break;
    case 'ripple':
      // Soft scale bloom + gentle drift
      move = 2.5 + t * 2.5;
      moveY = 2 + t * 2;
      skew = 1 + t * 2;
      scale = 1.04 + t * 0.05;
      dur = Math.floor(520 + t * 120);
      scan = 0.25 + t * 0.2;
      break;
    case 'static':
      // TV snow — tiny, fast shakes
      move = 2 + t * 2.5;
      moveY = 2 + t * 2.5;
      skew = 2 + t * 3;
      scale = 1.01 + t * 0.02;
      dur = Math.floor(300 + t * 90);
      scan = 0.7 + t * 0.2;
      break;
    case 'shear':
      // Skew-forward, less travel
      move = 3 + t * 3;
      moveY = 1.5 + t * 2;
      skew = 10 + t * 8;
      scale = 1.02 + t * 0.03;
      dur = Math.floor(460 + t * 110);
      scan = 0.45 + t * 0.2;
      break;
    case 'blink':
      // Opacity flicker + light chroma
      move = 2 + t * 2;
      moveY = 1.5 + t * 1.5;
      skew = 1 + t * 2;
      scale = 1.0 + t * 0.02;
      dur = Math.floor(380 + t * 100);
      scan = 0.5 + t * 0.25;
      break;
    case 'wave':
      // Horizontal-only undulation
      move = 6 + t * 5;
      moveY = 0.5 + t * 1;
      skew = 3 + t * 4;
      scale = 1.02 + t * 0.03;
      dur = Math.floor(540 + t * 120);
      scan = 0.6 + t * 0.2;
      break;
    case 'punch':
      // One hard hit, then settle
      move = 8 + t * 3;
      moveY = 4 + t * 2;
      skew = 6 + t * 5;
      scale = 1.05 + t * 0.04;
      dur = Math.floor(360 + t * 80);
      scan = 0.4 + t * 0.2;
      break;
  }

  return {
    style,
    xa: (move + rand(-1.1, 1.1)) * hDir,
    xb: (move * 1.15 + rand(-1.3, 1.3)) * -hDir,
    xc: (move * 0.65 + rand(-0.8, 0.8)) * hDir,
    ya: (moveY + rand(-0.7, 0.7)) * vDir,
    yb: (moveY * 1.1 + rand(-0.7, 0.7)) * -vDir,
    yc: (moveY * 0.7 + rand(-0.45, 0.45)) * vDir,
    sa: (skew + rand(-1.4, 1.4)) * hDir,
    sb: (skew * 0.85 + rand(-1.1, 1.1)) * -vDir,
    sc: (skew * 0.6 + rand(-0.9, 0.9)) * hDir,
    line1: 10 + lineShift + rand(0, 5),
    line2: 36 + ((lineShift * 1.4) % 18) + rand(0, 5),
    line3: 64 + ((lineShift * 0.8) % 16) + rand(0, 5),
    vline1: 12 + ((index * 9) % 22) + rand(0, 4),
    vline2: 40 + ((index * 5) % 18) + rand(0, 4),
    vline3: 68 + ((index * 11) % 16) + rand(0, 4),
    scale: scale + rand(0, 0.012),
    dur: Math.min(900, Math.max(280, dur + Math.floor(rand(-20, 25)))),
    scan,
  };
}

/** Fixed pool across 10 style families (2 presets each). */
export const GLITCH_PRESETS: readonly GlitchPreset[] = Array.from({ length: PRESET_COUNT }, (_, i) =>
  makePreset(i),
);

function pickPreset(previousIndex?: number): { preset: GlitchPreset; index: number } {
  if (GLITCH_PRESETS.length === 1) {
    return { preset: GLITCH_PRESETS[0], index: 0 };
  }

  const prevStyle =
    previousIndex !== undefined && Number.isFinite(previousIndex)
      ? GLITCH_PRESETS[previousIndex]?.style
      : undefined;

  // Prefer a different style family than last time on this element
  const candidates = GLITCH_PRESETS.map((_, i) => i).filter((i) => {
    if (previousIndex !== undefined && i === previousIndex) return false;
    if (prevStyle && GLITCH_PRESETS[i].style === prevStyle) return false;
    return true;
  });

  const pool =
    candidates.length > 0
      ? candidates
      : GLITCH_PRESETS.map((_, i) => i).filter((i) => i !== previousIndex);
  const index = pool[Math.floor(Math.random() * pool.length)] ?? 0;
  return { preset: GLITCH_PRESETS[index], index };
}

const STYLE_ATTR = 'data-glitch-style';

/** Apply one preset onto an element as CSS custom properties + style family. */
export function applyGlitchPreset(el: HTMLElement): GlitchPreset {
  const prev = Number.parseInt(el.dataset.glitchPreset ?? '', 10);
  const { preset, index } = pickPreset(Number.isFinite(prev) ? prev : undefined);
  el.dataset.glitchPreset = String(index);
  el.setAttribute(STYLE_ATTR, preset.style);

  el.style.setProperty('--g-xa', preset.xa.toFixed(2));
  el.style.setProperty('--g-xb', preset.xb.toFixed(2));
  el.style.setProperty('--g-xc', preset.xc.toFixed(2));
  el.style.setProperty('--g-ya', preset.ya.toFixed(2));
  el.style.setProperty('--g-yb', preset.yb.toFixed(2));
  el.style.setProperty('--g-yc', preset.yc.toFixed(2));
  el.style.setProperty('--g-sa', preset.sa.toFixed(2));
  el.style.setProperty('--g-sb', preset.sb.toFixed(2));
  el.style.setProperty('--g-sc', preset.sc.toFixed(2));
  el.style.setProperty('--g-line1', preset.line1.toFixed(2));
  el.style.setProperty('--g-line2', preset.line2.toFixed(2));
  el.style.setProperty('--g-line3', preset.line3.toFixed(2));
  el.style.setProperty('--g-vline1', preset.vline1.toFixed(2));
  el.style.setProperty('--g-vline2', preset.vline2.toFixed(2));
  el.style.setProperty('--g-vline3', preset.vline3.toFixed(2));
  el.style.setProperty('--g-scale', preset.scale.toFixed(3));
  el.style.setProperty('--g-dur', `${preset.dur}ms`);
  el.style.setProperty('--g-scan', preset.scan.toFixed(2));

  return preset;
}

/** Glitch motion only runs when the active pack enables HUD glitch. */
export function isGlitchThemeActive(): boolean {
  return document.documentElement.dataset.hudGlitch === 'true';
}

export function playElementGlitch(el: HTMLElement, className = 'is-glitching'): number {
  if (!isGlitchThemeActive()) return 0;
  const preset = applyGlitchPreset(el);
  el.classList.remove('is-glitching', 'is-glitch-hover', 'is-glitch-continuous');
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = '';
  el.classList.add(className);
  return preset.dur;
}

export type ContinuousGlitch = {
  /** Begin (or restart) the loop. Stops instead if `shouldRun` is false. */
  start(): void;
  stop(): void;
};

/**
 * Re-rolls a glitch preset on `el` for as long as `shouldRun` holds, so a hovered
 * control keeps mutating instead of freezing after one pass. Callers own the
 * condition; this owns the animation, listener, and timer bookkeeping.
 */
export function createContinuousGlitch(
  el: HTMLElement,
  shouldRun: () => boolean,
): ContinuousGlitch {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer: number | undefined;
  let onEnd: ((event: AnimationEvent) => void) | undefined;

  const stop = () => {
    window.clearTimeout(timer);
    timer = undefined;
    if (onEnd) {
      el.removeEventListener('animationend', onEnd);
      onEnd = undefined;
    }
    el.classList.remove('is-glitch-continuous', 'is-glitch-hover', 'is-glitching');
    el.style.animation = '';
  };

  const start = () => {
    stop();
    if (reduceMotion.matches || !shouldRun()) return;

    // Returns 0 when the active theme pack has HUD glitch disabled.
    const duration = playElementGlitch(el, 'is-glitch-continuous');
    if (!duration) {
      stop();
      return;
    }

    onEnd = (event: AnimationEvent) => {
      // Pseudo-element animations bubble here too; only the host ends a cycle.
      if (event.target !== el) return;
      start();
    };
    el.addEventListener('animationend', onEnd);

    // Fallback for animationend swallowed by pseudo-element noise or browser quirks.
    timer = window.setTimeout(start, duration + 50);
  };

  return { start, stop };
}
