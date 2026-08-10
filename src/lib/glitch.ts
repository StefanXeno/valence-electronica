export type GlitchPreset = {
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
  /** Vertical scanline positions in % of element width. */
  vline1: number;
  vline2: number;
  scale: number;
  dur: number;
};

const PRESET_COUNT = 10;

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function makePreset(): GlitchPreset {
  const hDir = Math.random() > 0.5 ? 1 : -1;
  const vDir = Math.random() > 0.5 ? 1 : -1;

  return {
    xa: rand(8, 20) * hDir,
    xb: rand(10, 22) * -hDir,
    xc: rand(6, 14) * hDir,
    ya: rand(4, 12) * vDir,
    yb: rand(5, 14) * -vDir,
    yc: rand(3, 9) * vDir,
    sa: rand(12, 28) * hDir,
    sb: rand(10, 24) * -vDir,
    sc: rand(8, 18) * hDir,
    line1: rand(18, 40),
    line2: rand(55, 78),
    vline1: rand(20, 42),
    vline2: rand(58, 80),
    scale: rand(1.05, 1.16),
    dur: Math.floor(rand(520, 720)),
  };
}

/** Fixed pool of 10 glitch variants — hover/press only picks from these. */
export const GLITCH_PRESETS: readonly GlitchPreset[] = Array.from({ length: PRESET_COUNT }, makePreset);

function pickPreset(previousIndex?: number): { preset: GlitchPreset; index: number } {
  if (GLITCH_PRESETS.length === 1) {
    return { preset: GLITCH_PRESETS[0], index: 0 };
  }

  let index = Math.floor(Math.random() * GLITCH_PRESETS.length);
  if (previousIndex !== undefined && index === previousIndex) {
    index =
      (previousIndex + 1 + Math.floor(Math.random() * (GLITCH_PRESETS.length - 1))) %
      GLITCH_PRESETS.length;
  }

  return { preset: GLITCH_PRESETS[index], index };
}

/** Apply one of the 10 presets onto an element as CSS custom properties. */
export function applyGlitchPreset(el: HTMLElement): GlitchPreset {
  const prev = Number.parseInt(el.dataset.glitchPreset ?? '', 10);
  const { preset, index } = pickPreset(Number.isFinite(prev) ? prev : undefined);
  el.dataset.glitchPreset = String(index);

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
  el.style.setProperty('--g-vline1', preset.vline1.toFixed(2));
  el.style.setProperty('--g-vline2', preset.vline2.toFixed(2));
  el.style.setProperty('--g-scale', preset.scale.toFixed(3));
  el.style.setProperty('--g-dur', `${preset.dur}ms`);

  return preset;
}

/** @deprecated Use applyGlitchPreset — kept as alias for call sites. */
export const rollGlitchVars = applyGlitchPreset;

export function playElementGlitch(el: HTMLElement, className = 'is-glitching'): number {
  const preset = applyGlitchPreset(el);
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
  return preset.dur;
}
