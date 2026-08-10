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
  line3: number;
  /** Vertical scanline positions in % of element width. */
  vline1: number;
  vline2: number;
  vline3: number;
  scale: number;
  dur: number;
};

const PRESET_COUNT = 10;

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/**
 * Build one calm-but-distinct variant.
 * Index spreads character (direction bias, line layout, tempo) so picks read differently.
 */
function makePreset(index: number): GlitchPreset {
  const hDir = index % 2 === 0 ? 1 : -1;
  const vDir = index % 3 === 0 ? -1 : 1;
  // Keep overall calm; spread intensity across the pool so variants differ
  const t = index / (PRESET_COUNT - 1); // 0..1
  const move = 6.5 + t * 8.5; // ~6.5–15px peak horizontal
  const moveY = 3.5 + t * 5.5; // ~3.5–9px vertical
  const skew = 8 + t * 10; // ~8–18deg
  const lineShift = (index * 7) % 18;

  return {
    xa: (move + rand(-1.4, 1.4)) * hDir,
    xb: (move * 1.2 + rand(-1.6, 1.6)) * -hDir,
    xc: (move * 0.7 + rand(-1, 1)) * hDir,
    ya: (moveY + rand(-1, 1)) * vDir,
    yb: (moveY * 1.15 + rand(-1, 1)) * -vDir,
    yc: (moveY * 0.75 + rand(-0.6, 0.6)) * vDir,
    sa: (skew + rand(-1.8, 1.8)) * hDir,
    sb: (skew * 0.9 + rand(-1.4, 1.4)) * -vDir,
    sc: (skew * 0.65 + rand(-1.2, 1.2)) * hDir,
    line1: 12 + lineShift + rand(0, 4),
    line2: 38 + ((lineShift * 1.4) % 16) + rand(0, 4),
    line3: 66 + ((lineShift * 0.8) % 14) + rand(0, 4),
    vline1: 14 + ((index * 9) % 20) + rand(0, 3),
    vline2: 42 + ((index * 5) % 16) + rand(0, 3),
    vline3: 70 + ((index * 11) % 14) + rand(0, 3),
    scale: 1.03 + t * 0.07 + rand(0, 0.02),
    dur: Math.floor(470 + t * 170 + rand(0, 40)),
  };
}

/** Fixed pool of 10 distinct glitch variants — hover/press picks from these. */
export const GLITCH_PRESETS: readonly GlitchPreset[] = Array.from({ length: PRESET_COUNT }, (_, i) =>
  makePreset(i),
);

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
  el.style.setProperty('--g-line3', preset.line3.toFixed(2));
  el.style.setProperty('--g-vline1', preset.vline1.toFixed(2));
  el.style.setProperty('--g-vline2', preset.vline2.toFixed(2));
  el.style.setProperty('--g-vline3', preset.vline3.toFixed(2));
  el.style.setProperty('--g-scale', preset.scale.toFixed(3));
  el.style.setProperty('--g-dur', `${preset.dur}ms`);

  return preset;
}

/** @deprecated Use applyGlitchPreset — kept as alias for call sites. */
export const rollGlitchVars = applyGlitchPreset;

export function playElementGlitch(el: HTMLElement, className = 'is-glitching'): number {
  const preset = applyGlitchPreset(el);
  // Force a clean restart so new CSS vars take effect on the next animation
  el.classList.remove('is-glitching', 'is-glitch-hover');
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = '';
  el.classList.add(className);
  return preset.dur;
}
