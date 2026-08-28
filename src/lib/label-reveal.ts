const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const LABEL_GAP_PX = 6;

function isKeyboardFocus(el: HTMLElement): boolean {
  return el.matches(':focus-visible');
}

type LabelAnchor = 'above' | 'below';

function readAnchor(el: HTMLElement): LabelAnchor {
  return el.dataset.hudLabelAnchor === 'below' ? 'below' : 'above';
}

export function initLabelReveal(): void {
  const floater = document.getElementById('hud-label-reveal');
  if (!floater) return;

  const reduceMotion = window.matchMedia(REDUCED_MOTION);
  let active: HTMLElement | null = null;

  const hide = () => {
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
    const centerX = rect.left + rect.width / 2;
    const anchor = readAnchor(el);

    floater.textContent = label;
    floater.hidden = false;
    floater.style.left = `${centerX}px`;

    if (anchor === 'below') {
      floater.style.top = `${anchorRect.bottom + LABEL_GAP_PX}px`;
      floater.style.transform = 'translate(-50%, 0)';
    } else {
      floater.style.top = `${anchorRect.top - LABEL_GAP_PX}px`;
      floater.style.transform = 'translate(-50%, -100%)';
    }

    floater.classList.add('is-visible');
    floater.classList.toggle('is-reduced', reduceMotion.matches);
  };

  const show = (el: HTMLElement) => {
    const label = el.dataset.hudLabel?.trim();
    if (!label) return;
    const panel = el.closest('details');
    if (panel instanceof HTMLDetailsElement && panel.open) return;
    // Open V-Flip uses an inline track title — no floater on the vinyl toggle.
    if (
      el.matches('[data-jukebox-toggle]') &&
      el.closest('[data-jukebox]')?.classList.contains('is-open')
    ) {
      return;
    }
    active = el;
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
    if (active) positionFloater(active, active.dataset.hudLabel ?? '');
  });
}
