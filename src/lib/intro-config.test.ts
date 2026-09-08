import { describe, expect, it } from 'vitest';
import {
  applyIntroConfig,
  desktopIntro,
  introConfigToCssVars,
  mobileIntro,
  pickIntroConfig,
} from './intro-config';

describe('intro config bags', () => {
  it('keeps desktop timings identical to the original 006 intro', () => {
    expect(desktopIntro.zoomStartScale).toBe(0.42);
    expect(desktopIntro.zoomHoldScale).toBe(1);
    expect(desktopIntro.zoomEndScale).toBe(89);
    expect(desktopIntro.zoomDurationMs).toBe(2850);
    expect(desktopIntro.zoomDelayMs).toBe(400);
    expect(desktopIntro.leadInDurationMs).toBe(550);
    expect(desktopIntro.leadInDelayMs).toBe(120);
    expect(desktopIntro.leadOutDurationMs).toBe(2400);
    expect(desktopIntro.leadOutDelayMs).toBe(550);
    expect(desktopIntro.fallbackMs).toBe(4500);
    expect(desktopIntro.endSettleMs).toBe(80);
    expect(desktopIntro.nameFontSize).toBe('clamp(2.75rem, 15vw, 6.5rem)');
    expect(desktopIntro.leadOffset).toBe('clamp(4.5rem, 16vw, 7rem)');
  });

  it('uses a separate mobile bag so phone tweaks cannot change desktop', () => {
    expect(mobileIntro).not.toBe(desktopIntro);
    expect(mobileIntro.viewport).toBe('mobile');
    expect(desktopIntro.viewport).toBe('desktop');
    expect(mobileIntro.zoomDurationMs).not.toBe(desktopIntro.zoomDurationMs);
    expect(mobileIntro.zoomEndScale).not.toBe(desktopIntro.zoomEndScale);
    expect(mobileIntro.nameFontSize).not.toBe(desktopIntro.nameFontSize);
    expect(mobileIntro.fallbackMs).not.toBe(desktopIntro.fallbackMs);
  });

  it('picks mobile below 1024px and desktop at 1024px+', () => {
    expect(pickIntroConfig({ matches: true })).toBe(mobileIntro);
    expect(pickIntroConfig({ matches: false })).toBe(desktopIntro);
    expect(pickIntroConfig(null)).toBe(desktopIntro);
  });

  it('maps each bag to CSS variables without mixing viewports', () => {
    const desktopVars = introConfigToCssVars(desktopIntro);
    const mobileVars = introConfigToCssVars(mobileIntro);
    expect(desktopVars['--intro-zoom-duration']).toBe('2850ms');
    expect(mobileVars['--intro-zoom-duration']).toBe('3800ms');
    expect(mobileIntro.fallbackMs).toBe(5000);
    expect(mobileIntro.fallbackMs).toBeGreaterThan(
      mobileIntro.zoomDelayMs + mobileIntro.zoomDurationMs + mobileIntro.endSettleMs,
    );
    expect(desktopVars['--intro-zoom-end']).toBe('89');
    expect(mobileVars['--intro-zoom-end']).toBe('200');
    expect(mobileIntro.zoomEndScale).toBe(200);
    expect(mobileIntro.zoomEndScale).toBeGreaterThan(desktopIntro.zoomEndScale);
    expect(desktopVars['--intro-name-font-size']).toBe(desktopIntro.nameFontSize);
    expect(mobileVars['--intro-name-font-size']).toBe(mobileIntro.nameFontSize);
  });

  it('applies the chosen bag onto the overlay element', () => {
    const props: Record<string, string> = {};
    const el = {
      dataset: {} as DOMStringMap,
      style: {
        setProperty(name: string, value: string) {
          props[name] = value;
        },
      },
    } as HTMLElement;

    applyIntroConfig(el, mobileIntro);
    expect(el.dataset.introViewport).toBe('mobile');
    expect(props['--intro-zoom-duration']).toBe('3800ms');
    expect(props['--intro-name-font-size']).toBe(mobileIntro.nameFontSize);

    applyIntroConfig(el, desktopIntro);
    expect(el.dataset.introViewport).toBe('desktop');
    expect(props['--intro-zoom-duration']).toBe('2850ms');
  });
});
