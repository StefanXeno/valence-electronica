import { PHONE_MQ } from './player-dock';

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const LABEL_GAP_PX = 6;
const VIEWPORT_PAD_PX = 8;

function isKeyboardFocus(el: HTMLElement): boolean {
  return el.matches(':focus-visible');
}

export type LabelAnchor = 'above' | 'below' | 'end';

export type LabelBox = {
  left: number;
  top: number;
  width: number;
  height: number;
  bottom?: number;
};

function readAnchor(el: HTMLElement): LabelAnchor {
  const raw = el.dataset.hudLabelAnchor;
  if (raw === 'below') return 'below';
  if (raw === 'end' || raw === 'side') return 'end';
  return 'above';
}

/**
 * Place the HUD floater. `end` sits to the right of the trigger (flips left
 * if it would leave the viewport). `above` / `below` stay centered, then
 * shift inward so a left-dock control cannot clip "CU" off CURRENTLY PLAYING.
 */
export function hudLabelPosition(opts: {
  trigger: LabelBox;
  floater: { width: number; height: number };
  anchor: LabelAnchor;
  viewport: { width: number; height: number };
  gap?: number;
  pad?: number;
}): { left: number; top: number; transform: string } {
  const gap = opts.gap ?? LABEL_GAP_PX;
  const pad = opts.pad ?? VIEWPORT_PAD_PX;
  const { trigger, floater, viewport, anchor } = opts;
  const maxLeft = Math.max(pad, viewport.width - pad - floater.width);

  if (anchor === 'end') {
    let left = trigger.left + trigger.width + gap;
    if (left > maxLeft) left = trigger.left - gap - floater.width;
    left = Math.min(maxLeft, Math.max(pad, left));
    return {
      left,
      top: trigger.top + trigger.height / 2,
      transform: 'translate(0, -50%)',
    };
  }

  let left = trigger.left + trigger.width / 2;
  const triggerBottom = trigger.bottom ?? trigger.top + trigger.height;
  const top = anchor === 'below' ? triggerBottom + gap : trigger.top - gap;
  const transform = anchor === 'below' ? 'translate(-50%, 0)' : 'translate(-50%, -100%)';
  const visualLeft = left - floater.width / 2;
  if (visualLeft < pad) left += pad - visualLeft;
  const visualRight = left + floater.width / 2;
  if (visualRight > viewport.width - pad) {
    left -= visualRight - (viewport.width - pad);
  }
  return { left, top, transform };
}

export function initLabelReveal(): void {
  const floater = document.getElementById('hud-label-reveal');
  if (!floater) return;

  const reduceMotion = window.matchMedia(REDUCED_MOTION);
  const phoneHud = window.matchMedia(PHONE_MQ);
  let active: HTMLElement | null = null;

  const labelObserver = new MutationObserver(() => {
    if (!active || phoneHud.matches) return;
    const label = active.dataset.hudLabel?.trim();
    if (label) positionFloater(active, label);
  });

  const hide = () => {
    labelObserver.disconnect();
    active = null;
    floater.hidden = true;
    floater.textContent = '';
    floater.style.removeProperty('transform');
    floater.style.removeProperty('left');
    floater.style.removeProperty('top');
    floater.classList.remove('is-visible', 'is-reduced');
  };

  const readVolumeLabelAnchor = (el: HTMLElement): HTMLElement | null => {
    const volumeRoot = el.closest('.volume-control--in-jukebox');
    if (!volumeRoot || !el.matches('[data-volume-slider]')) return null;
    const toggle = volumeRoot.querySelector<HTMLElement>('[data-mute-control]');
    return toggle ?? null;
  };

  const positionFloater = (el: HTMLElement, label: string) => {
    const rect = el.getBoundingClientRect();
    const volumeToggle = readVolumeLabelAnchor(el);
    const anchorRect = volumeToggle?.getBoundingClientRect() ?? rect;
    const trigger = {
      left: rect.left,
      top: anchorRect.top,
      width: rect.width,
      height: anchorRect.height,
      bottom: anchorRect.bottom,
    };
    const anchor = readAnchor(el);

    floater.textContent = label;
    floater.hidden = false;
    floater.style.left = '0px';
    floater.style.top = '0px';
    floater.style.transform = 'none';
    const box = floater.getBoundingClientRect();
    const placed = hudLabelPosition({
      trigger,
      floater: { width: box.width, height: box.height },
      anchor,
      viewport: { width: window.innerWidth, height: window.innerHeight },
    });
    floater.style.left = `${placed.left}px`;
    floater.style.top = `${placed.top}px`;
    floater.style.transform = placed.transform;

    floater.classList.add('is-visible');
    floater.classList.toggle('is-reduced', reduceMotion.matches);
  };

  const syncNativeTitles = () => {
    document
      .querySelectorAll<HTMLElement>(
        '[data-now-playing], .jukebox__title, .jukebox__title-laptop, .jukebox__title-phone, .jukebox__header, .jukebox__track-select',
      )
      .forEach((el) => {
        el.removeAttribute('title');
      });
    if (phoneHud.matches) hide();
  };

  const show = (el: HTMLElement) => {
    if (phoneHud.matches) return;
    // In-box player titles already show the copy — no duplicate HUD floater.
    if (el.closest('.jukebox__header, .jukebox__title')) return;
    const label = el.dataset.hudLabel?.trim();
    if (!label) return;
    const panel = el.closest('details');
    if (panel instanceof HTMLDetailsElement && panel.open) return;
    // Open V-Flip uses an inline track title — no floater on the vinyl FAB.
    if (
      el.matches('[data-jukebox-toggle]') &&
      el.closest('[data-jukebox]')?.classList.contains('is-open')
    ) {
      return;
    }
    active = el;
    labelObserver.disconnect();
    labelObserver.observe(el, { attributes: true, attributeFilter: ['data-hud-label'] });
    positionFloater(el, label);
  };

  document.querySelectorAll<HTMLElement>('[data-hud-label]').forEach((el) => {
    el.addEventListener('pointerenter', () => show(el));
    el.addEventListener('pointerleave', () => {
      if (active === el) hide();
    });
    el.addEventListener('focus', () => {
      if (isKeyboardFocus(el)) show(el);
    });
    el.addEventListener('blur', () => {
      if (active === el) hide();
    });
  });

  document.querySelectorAll('details').forEach((details) => {
    details.addEventListener('toggle', () => {
      if (details.open && active && details.contains(active)) hide();
    });
  });

  reduceMotion.addEventListener('change', () => {
    if (phoneHud.matches) {
      hide();
      return;
    }
    if (active) positionFloater(active, active.dataset.hudLabel ?? '');
  });

  phoneHud.addEventListener('change', () => {
    syncNativeTitles();
  });

  syncNativeTitles();
}
