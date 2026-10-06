/**
 * Theme colour handoff, frame by frame.
 *
 * CSS transitions on the registered `--color-*` properties let Chrome paint
 * descendants with their own animations/transitions at the *target* colour for a
 * frame before the transition takes over (flash of the new theme, then a fade from
 * the old one). Instead we write the interpolated values inline on `<html>` every
 * frame, so every element inherits the exact same in-between colour.
 */

/** Theme tokens registered with `@property` in themes.css. */
export const THEME_COLOR_VARS = [
  '--color-bg',
  '--color-surface',
  '--color-border',
  '--color-text',
  '--color-text-muted',
  '--color-accent',
  '--color-accent-alt',
  '--bg-scrim',
] as const;

export type Rgba = [number, number, number, number];

/** Parses computed colours (`rgb(…)` / `rgba(…)`, comma or space syntax). */
export function parseCssColor(value: string): Rgba | null {
  const match = value.trim().match(/^rgba?\(([^)]+)\)$/i);
  if (!match) return null;
  const parts = match[1]
    .split(/[\s,/]+/)
    .filter(Boolean)
    .map((part) => (part.endsWith('%') ? Number.parseFloat(part) / 100 : Number.parseFloat(part)));
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
  return [parts[0], parts[1], parts[2], parts[3] ?? 1];
}

export function rgbaToCss([r, g, b, a]: Rgba): string {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Math.round(a * 1000) / 1000})`;
}

export function mixRgba(from: Rgba, to: Rgba, t: number): string {
  const lerp = (i: number) => from[i] + (to[i] - from[i]) * t;
  return rgbaToCss([lerp(0), lerp(1), lerp(2), lerp(3)]);
}

/** CSS `cubic-bezier(x1, y1, x2, y2)` as a progress → eased progress function. */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const at = (a: number, b: number, t: number) =>
    3 * a * t * (1 - t) ** 2 + 3 * b * t ** 2 * (1 - t) + t ** 3;
  return (x: number): number => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 24; i += 1) {
      const mid = (lo + hi) / 2;
      if (at(x1, x2, mid) < x) lo = mid;
      else hi = mid;
    }
    return at(y1, y2, (lo + hi) / 2);
  };
}

/** `steps(n, end)`: holds the start value, jumps at each step boundary. */
export function stepsEnd(n: number) {
  return (x: number): number => (x >= 1 ? 1 : Math.floor(x * n) / n);
}

const smoothEase = cubicBezier(0.45, 0, 0.55, 1);

let frame = 0;

function readColors(el: Element): (Rgba | null)[] {
  const style = getComputedStyle(el);
  return THEME_COLOR_VARS.map((name) => parseCssColor(style.getPropertyValue(name)));
}

function clearInline(html: HTMLElement): void {
  for (const name of THEME_COLOR_VARS) html.style.removeProperty(name);
}

/** Target colours of a theme pack, read from a detached-style probe element. */
function readThemeColors(themeId: string): (Rgba | null)[] {
  const probe = document.createElement('span');
  probe.dataset.theme = themeId;
  probe.hidden = true;
  document.body.append(probe);
  const colors = readColors(probe);
  probe.remove();
  return colors;
}

/** Stop any running tween and drop the inline overrides (theme CSS takes over). */
export function cancelThemeTween(): void {
  cancelAnimationFrame(frame);
  frame = 0;
  clearInline(document.documentElement);
}

/**
 * Switch `data-theme` and blend the colour tokens from what is on screen now.
 * `mode: 'glitch'` quantises into 4 hard steps (Nightmare handoff).
 */
export function tweenTheme(
  themeId: string,
  options: { durationMs: number; mode: 'smooth' | 'glitch' },
): void {
  const html = document.documentElement;
  // Start from the colours currently painted (mid-tween values included).
  const from = readColors(html);
  cancelAnimationFrame(frame);

  // Freeze the current colours inline, then switch the theme underneath.
  THEME_COLOR_VARS.forEach((name, i) => {
    const color = from[i];
    if (color) html.style.setProperty(name, rgbaToCss(color));
  });
  html.dataset.theme = themeId;
  const to = readThemeColors(themeId);

  const ease = options.mode === 'glitch' ? stepsEnd(4) : smoothEase;
  const start = performance.now();

  const tick = (now: number) => {
    const progress = Math.min(1, (now - start) / options.durationMs);
    const eased = ease(progress);
    THEME_COLOR_VARS.forEach((name, i) => {
      const a = from[i];
      const b = to[i];
      if (a && b) html.style.setProperty(name, mixRgba(a, b, eased));
    });
    if (progress < 1) {
      frame = requestAnimationFrame(tick);
      return;
    }
    frame = 0;
    clearInline(html);
  };

  frame = requestAnimationFrame(tick);
}
