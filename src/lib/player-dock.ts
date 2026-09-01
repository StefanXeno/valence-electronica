import { isIntroActive } from './playback';

/** Phone HUD media query (SC-007: 1023 = phone, 1024 = laptop). */
export const PHONE_MQ = '(max-width: 1023px)';

const HINT_NODS = 3;
const HINT_PERIOD_MS = 60_000;
const SWIPE_PX = 40;

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isPhoneHud(): boolean {
  return window.matchMedia(PHONE_MQ).matches;
}

type CatalogRow = { id: string; label: string };

/** Center now-playing copy is the V-Flip list label (never themeId). */
export function syncNowPlayingLabel(activeId: string): void {
  const root = document.querySelector<HTMLElement>('[data-jukebox]');
  const el = document.querySelector<HTMLElement>('[data-now-playing]');
  if (!root?.dataset.stageCatalog || !el) return;

  let catalog: CatalogRow[] = [];
  try {
    catalog = JSON.parse(root.dataset.stageCatalog) as CatalogRow[];
  } catch {
    return;
  }

  const label = catalog.find((row) => row.id === activeId)?.label?.trim() ?? '';
  el.textContent = label;
  if (label) el.setAttribute('title', label);
  else el.removeAttribute('title');
}

type ExtraSheet = 'about' | 'discography' | 'tour' | 'vflip-list' | 'socials';

function panelKind(details: HTMLDetailsElement): ExtraSheet | undefined {
  const kind = details.dataset.stagePanel;
  if (kind === 'about' || kind === 'discography' || kind === 'tour') return kind;
  return undefined;
}

function closeVflipList(): void {
  document.dispatchEvent(new Event('phone-hud-close-vflip'));
}

function setSocialsOpen(open: boolean): void {
  const html = document.documentElement;
  const btn = document.querySelector<HTMLButtonElement>('[data-socials-trigger]');
  html.toggleAttribute('data-socials-open', open);
  btn?.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function closeStagePanels(except?: HTMLDetailsElement): void {
  document.querySelectorAll<HTMLDetailsElement>('[data-stage-panel][open]').forEach((node) => {
    if (node !== except) node.open = false;
  });
}

/** Phone exclusive-open: at most one extra surface. Pill expand is not a sheet. */
export function closePhoneSheetsExcept(keep?: ExtraSheet, exceptPanel?: HTMLDetailsElement): void {
  if (!isPhoneHud()) return;
  if (keep !== 'about' && keep !== 'discography' && keep !== 'tour') {
    closeStagePanels();
  } else {
    closeStagePanels(exceptPanel);
  }
  if (keep !== 'vflip-list') closeVflipList();
  if (keep !== 'socials') setSocialsOpen(false);
}

export function initPlayerDock(): void {
  const html = document.documentElement;
  html.setAttribute('data-player-dock-js', '');

  const dock =
    document.querySelector<HTMLElement>('[data-player-dock]') ??
    document.querySelector<HTMLElement>('[data-jukebox]');
  const handle = document.querySelector<HTMLButtonElement>('[data-player-handle]');
  const socialsBtn = document.querySelector<HTMLButtonElement>('[data-socials-trigger]');
  if (!dock && !socialsBtn) return;

  const expandLabel = handle?.dataset.expandLabel ?? 'Show player controls';
  const collapseLabel = handle?.dataset.collapseLabel ?? 'Hide player controls';

  let expanded = false;
  let hintBurst: number | undefined;
  let hintWait: number | undefined;
  let swipeStartY: number | undefined;
  let swipeIgnore = false;

  const phoneMq = window.matchMedia(PHONE_MQ);
  const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');

  const stopHint = () => {
    window.clearTimeout(hintWait);
    window.clearTimeout(hintBurst);
    hintWait = undefined;
    hintBurst = undefined;
    handle?.classList.remove('is-hinting');
  };

  const canHint = () =>
    Boolean(handle) &&
    phoneMq.matches &&
    !expanded &&
    !motionMq.matches &&
    !isIntroActive();

  const playHintBurst = () => {
    if (!handle || !canHint()) return;
    handle.classList.remove('is-hinting');
    // Re-trigger CSS animation (3 nods).
    void handle.offsetWidth;
    handle.classList.add('is-hinting');
    const nodMs = 450 * HINT_NODS + 80;
    hintBurst = window.setTimeout(() => {
      handle.classList.remove('is-hinting');
    }, nodMs);
  };

  const scheduleHint = () => {
    stopHint();
    if (!canHint()) return;
    playHintBurst();
    const tick = () => {
      if (!canHint()) return;
      playHintBurst();
      hintWait = window.setTimeout(tick, HINT_PERIOD_MS);
    };
    hintWait = window.setTimeout(tick, HINT_PERIOD_MS);
  };

  const applyExpanded = (next: boolean) => {
    expanded = next;
    html.toggleAttribute('data-player-dock-expanded', next);
    dock?.classList.toggle('is-player-expanded', next);
    if (handle) {
      handle.setAttribute('aria-expanded', next ? 'true' : 'false');
      const label = next ? collapseLabel : expandLabel;
      handle.setAttribute('aria-label', label);
      handle.dataset.hudLabel = label;
    }
    if (next) stopHint();
    else scheduleHint();
  };

  applyExpanded(false);

  handle?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!phoneMq.matches) return;
    applyExpanded(!expanded);
  });

  const swipeTarget = (event: Event) => event.target instanceof Element ? event.target : null;

  dock?.addEventListener(
    'pointerdown',
    (event) => {
      if (!phoneMq.matches || event.pointerType === 'mouse') return;
      const target = swipeTarget(event);
      if (!target) return;
      if (target.closest('[data-mute-control], [data-volume-slider], [data-jukebox-drawer]')) {
        swipeIgnore = true;
        swipeStartY = undefined;
        return;
      }
      swipeIgnore = false;
      swipeStartY = event.clientY;
    },
    { passive: true },
  );

  dock?.addEventListener(
    'pointerup',
    (event) => {
      if (swipeIgnore || swipeStartY === undefined || !phoneMq.matches) {
        swipeStartY = undefined;
        swipeIgnore = false;
        return;
      }
      const delta = swipeStartY - event.clientY;
      swipeStartY = undefined;
      if (Math.abs(delta) < SWIPE_PX) return;
      if (delta > 0 && !expanded) applyExpanded(true);
      if (delta < 0 && expanded) applyExpanded(false);
    },
    { passive: true },
  );

  socialsBtn?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!phoneMq.matches) return;
    const next = !html.hasAttribute('data-socials-open');
    if (next) closePhoneSheetsExcept('socials');
    setSocialsOpen(next);
  });

  document.querySelector('[data-stage-panels]')?.addEventListener(
    'toggle',
    (event) => {
      if (!phoneMq.matches) return;
      const target = event.target;
      if (!(target instanceof HTMLDetailsElement) || !target.open) return;
      const kind = panelKind(target) ?? 'about';
      closePhoneSheetsExcept(kind, target);
    },
    true,
  );

  document.addEventListener('vflip-list-change', (event) => {
    const open = Boolean((event as CustomEvent<{ open?: boolean }>).detail?.open);
    if (!phoneMq.matches || !open) return;
    closePhoneSheetsExcept('vflip-list');
  });

  phoneMq.addEventListener('change', (event) => {
    if (event.matches) {
      applyExpanded(expanded);
      scheduleHint();
    } else {
      stopHint();
    }
  });

  motionMq.addEventListener('change', () => {
    if (motionMq.matches) stopHint();
    else scheduleHint();
  });

  const introObserver = new MutationObserver(() => {
    if (isIntroActive()) stopHint();
    else scheduleHint();
  });
  introObserver.observe(html, {
    attributes: true,
    attributeFilter: ['data-intro-pending', 'data-intro-active'],
  });

  if (!isIntroActive()) scheduleHint();
}
