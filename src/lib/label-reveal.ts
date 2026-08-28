const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

function isKeyboardFocus(el: HTMLElement): boolean {
  return el.matches(':focus-visible');
}

export function initLabelReveal(): void {
  const floater = document.getElementById('hud-label-reveal');
  if (!floater) return;

  const reduceMotion = window.matchMedia(REDUCED_MOTION);
  let active: HTMLElement | null = null;
  let raf = 0;

  const hide = () => {
    active = null;
    floater.hidden = true;
    floater.textContent = '';
    floater.style.removeProperty('transform');
    floater.style.removeProperty('left');
    floater.style.removeProperty('top');
    floater.classList.remove('is-visible', 'is-reduced');
  };

  const positionFloater = (el: HTMLElement, label: string) => {
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const viewportCenter = window.innerWidth / 2;
    const deltaX = viewportCenter - centerX;

    floater.textContent = label;
    floater.hidden = false;
    floater.style.left = `${centerX}px`;
    floater.style.top = `${centerY}px`;

    if (reduceMotion.matches) {
      floater.classList.add('is-visible', 'is-reduced');
      floater.style.transform = 'translate(-50%, -50%)';
      return;
    }

    floater.classList.add('is-visible');
    floater.classList.remove('is-reduced');
    floater.style.transform = 'translate(-50%, -50%)';

    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      floater.style.transform = `translate(calc(-50% + ${deltaX}px), -50%)`;
    });
  };

  const show = (el: HTMLElement) => {
    const label = el.dataset.hudLabel?.trim();
    if (!label) return;
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

  reduceMotion.addEventListener('change', () => {
    if (active) positionFloater(active, active.dataset.hudLabel ?? '');
  });
}
