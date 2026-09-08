/**
 * Viewport-specific landing intro numbers.
 *
 * Shared engine: `LandingIntro.astro` + `src/styles/intro.css`.
 * Tweak mobile vs desktop here — do not copy timings into CSS media queries.
 * Zoom/lead keyframe *shape* (hold % points) stays in `intro.css`; duration,
 * delay, scale, type, and skip flags are per bag.
 *
 * Phone breakpoint matches HUD (`max-width: 1023px`) but stays local so intro
 * can diverge later without touching player-dock.
 */

/** Phone intro viewport — `<1024px`. */
export const INTRO_PHONE_MQ = '(max-width: 1023px)';

export const INTRO_PHONE_MAX_WIDTH_PX = 1023;

export type IntroViewport = 'desktop' | 'mobile';

export type IntroConfig = {
  viewport: IntroViewport;
  /** Portal name cut-out font-size (CSS length). */
  nameFontSize: string;
  nameLetterSpacing: string;
  leadFontSize: string;
  leadLetterSpacing: string;
  /** Distance from vertical center up to the lead line. */
  leadOffset: string;
  leadMaxWidth: string;
  leadPadInline: string;
  zoomStartScale: number;
  zoomHoldScale: number;
  zoomEndScale: number;
  zoomDurationMs: number;
  zoomDelayMs: number;
  zoomEase: string;
  leadInDurationMs: number;
  leadInDelayMs: number;
  leadInEase: string;
  leadOutDurationMs: number;
  leadOutDelayMs: number;
  leadOutEase: string;
  /** Safety timeout if `animationend` never fires. */
  fallbackMs: number;
  /** Pause after zoom `animationend` before removing the overlay. */
  endSettleMs: number;
  skipOnPointer: boolean;
  skipOnEscape: boolean;
};

/**
 * Laptop / ≥1024px — values match the original 006 intro.css (do not “improve”).
 */
export const desktopIntro: IntroConfig = Object.freeze({
  viewport: 'desktop',
  nameFontSize: 'clamp(2.75rem, 15vw, 6.5rem)',
  nameLetterSpacing: '0.06em',
  leadFontSize: 'clamp(1.1rem, 4vw, 1.65rem)',
  leadLetterSpacing: '0.04em',
  leadOffset: 'clamp(4.5rem, 16vw, 7rem)',
  leadMaxWidth: 'none',
  leadPadInline: '0px',
  zoomStartScale: 0.42,
  zoomHoldScale: 1,
  zoomEndScale: 89,
  zoomDurationMs: 2850,
  zoomDelayMs: 400,
  zoomEase: 'cubic-bezier(0.33, 1, 0.38, 1)',
  leadInDurationMs: 550,
  leadInDelayMs: 120,
  leadInEase: 'ease-out',
  leadOutDurationMs: 2400,
  leadOutDelayMs: 550,
  leadOutEase: 'ease-out',
  fallbackMs: 4500,
  endSettleMs: 80,
  skipOnPointer: true,
  skipOnEscape: true,
});

/**
 * Phone / ≤1023px — same sequence, independent numbers (tighter type, no edge overflow).
 *
 * zoomEndScale is *higher* than desktop: the name is smaller (12vw / 4.25rem cap)
 * and the E’s horizontal bar is only ~0.12em. At 390×844, scale 72 leaves that bar
 * shorter than the viewport (~470px vs ~844px), so the E’s top/bottom edges stay
 * visible. 200× makes the bar overshoot tall phones (~930px) with margin.
 */
export const mobileIntro: IntroConfig = Object.freeze({
  viewport: 'mobile',
  nameFontSize: 'clamp(2.25rem, 12vw, 4.25rem)',
  nameLetterSpacing: '0.04em',
  leadFontSize: 'clamp(0.95rem, 3.6vw, 1.25rem)',
  leadLetterSpacing: '0.03em',
  leadOffset: 'clamp(3.25rem, 14vw, 5.25rem)',
  leadMaxWidth: '92vw',
  leadPadInline: '0.75rem',
  zoomStartScale: 0.38,
  zoomHoldScale: 1,
  zoomEndScale: 200,
  // Longer than desktop: 200× over 2400ms felt rushed; keep skip/reduced-motion as-is.
  zoomDurationMs: 3800,
  zoomDelayMs: 280,
  zoomEase: 'cubic-bezier(0.33, 1, 0.38, 1)',
  leadInDurationMs: 450,
  leadInDelayMs: 80,
  leadInEase: 'ease-out',
  leadOutDurationMs: 2000,
  leadOutDelayMs: 420,
  leadOutEase: 'ease-out',
  // Must exceed zoomDelayMs + zoomDurationMs + endSettleMs so the overlay does not cut the zoom.
  fallbackMs: 5000,
  endSettleMs: 80,
  skipOnPointer: true,
  skipOnEscape: true,
});

const CSS_VARS: Record<string, (config: IntroConfig) => string> = {
  '--intro-name-font-size': (c) => c.nameFontSize,
  '--intro-name-letter-spacing': (c) => c.nameLetterSpacing,
  '--intro-lead-font-size': (c) => c.leadFontSize,
  '--intro-lead-letter-spacing': (c) => c.leadLetterSpacing,
  '--intro-lead-offset': (c) => c.leadOffset,
  '--intro-lead-max-width': (c) => c.leadMaxWidth,
  '--intro-lead-pad': (c) => c.leadPadInline,
  '--intro-zoom-start': (c) => String(c.zoomStartScale),
  '--intro-zoom-hold': (c) => String(c.zoomHoldScale),
  '--intro-zoom-end': (c) => String(c.zoomEndScale),
  '--intro-zoom-duration': (c) => `${c.zoomDurationMs}ms`,
  '--intro-zoom-delay': (c) => `${c.zoomDelayMs}ms`,
  '--intro-zoom-ease': (c) => c.zoomEase,
  '--intro-lead-in-duration': (c) => `${c.leadInDurationMs}ms`,
  '--intro-lead-in-delay': (c) => `${c.leadInDelayMs}ms`,
  '--intro-lead-in-ease': (c) => c.leadInEase,
  '--intro-lead-out-duration': (c) => `${c.leadOutDurationMs}ms`,
  '--intro-lead-out-delay': (c) => `${c.leadOutDelayMs}ms`,
  '--intro-lead-out-ease': (c) => c.leadOutEase,
};

export function introConfigToCssVars(config: IntroConfig): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [prop, read] of Object.entries(CSS_VARS)) {
    vars[prop] = read(config);
  }
  return vars;
}

/** Paint config onto the overlay before it is shown. */
export function applyIntroConfig(el: HTMLElement, config: IntroConfig): void {
  el.dataset.introViewport = config.viewport;
  const vars = introConfigToCssVars(config);
  for (const [prop, value] of Object.entries(vars)) {
    el.style.setProperty(prop, value);
  }
}

/**
 * Pick the bag for this load. Pass a media-query stand-in in tests.
 * Defaults to desktop when `window` is missing (SSR / Node).
 */
export function pickIntroConfig(
  media: Pick<MediaQueryList, 'matches'> | null = typeof window !== 'undefined'
    ? window.matchMedia(INTRO_PHONE_MQ)
    : null,
): IntroConfig {
  return media?.matches ? mobileIntro : desktopIntro;
}
