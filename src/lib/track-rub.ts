/**
 * Easter egg: horizontal back-and-forth “rub” strokes on `[data-rubbable]` rows.
 * Three direction-reversals with enough travel open the track body overlay.
 */

const MIN_STROKE_PX = 36;
const RUBS_NEEDED = 3;
const IDLE_RESET_MS = 1600;
/** Outbound / play controls — never start a rub from these. */
const IGNORE_SELECTOR =
  'a, [data-discog-play], [data-stage-button], .discog__listen, .discog__listen-links, .site-nav__menu-portal-listen, .site-nav__menu-portal-listen-links, .site-nav__menu-portal-listen-glyphs';

/** One-shot unlock toast after the first successful rub reveal. */
export const ACHIEVEMENT_RUB_STORAGE_KEY = 've-achievement-why-are-you-rubbing';
const ACHIEVEMENT_HOLD_MS = 4200;
const ACHIEVEMENT_EXIT_MS = 400;

type RubSession = {
  el: HTMLElement;
  trackId: string;
  pointerId: number;
  lastX: number;
  /** +1 right, -1 left, 0 unset */
  dir: -1 | 0 | 1;
  travel: number;
  rubs: number;
  idleTimer: ReturnType<typeof setTimeout> | null;
  /** True once horizontal intent is clear — then we suppress click/scroll steal. */
  lockedHorizontal: boolean;
};

let session: RubSession | null = null;
let lastFocus: HTMLElement | null = null;
/** Suppress the synthetic click after a real rub so expand toggles / links stay calm. */
let suppressClickUntil = 0;
let achievementHideTimer: ReturnType<typeof setTimeout> | null = null;
let achievementRemoveTimer: ReturnType<typeof setTimeout> | null = null;

function clearIdle(s: RubSession) {
  if (s.idleTimer) {
    clearTimeout(s.idleTimer);
    s.idleTimer = null;
  }
}

function armIdle(s: RubSession) {
  clearIdle(s);
  s.idleTimer = setTimeout(() => {
    if (session === s) endSession(false);
  }, IDLE_RESET_MS);
}

function endSession(releasePointer: boolean) {
  if (!session) return;
  clearIdle(session);
  if (releasePointer) {
    try {
      session.el.releasePointerCapture(session.pointerId);
    } catch {
      /* already released */
    }
  }
  session = null;
}

function panelFor(trackId: string): HTMLElement | null {
  // Slugs are URL-safe; attribute selector is enough.
  return document.querySelector(`[data-track-rub-panel="${trackId}"]`);
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function hasRubAchievement(): boolean {
  try {
    return localStorage.getItem(ACHIEVEMENT_RUB_STORAGE_KEY) === '1';
  } catch {
    // Storage blocked — treat as already unlocked so we never spam the toast.
    return true;
  }
}

function markRubAchievement(): void {
  try {
    localStorage.setItem(ACHIEVEMENT_RUB_STORAGE_KEY, '1');
  } catch {
    // Site stays usable without persistence.
  }
}

function clearAchievementTimers() {
  if (achievementHideTimer) {
    clearTimeout(achievementHideTimer);
    achievementHideTimer = null;
  }
  if (achievementRemoveTimer) {
    clearTimeout(achievementRemoveTimer);
    achievementRemoveTimer = null;
  }
}

/** Game-style toast on first successful rub reveal; no-op after localStorage unlock. */
function maybeShowRubAchievement() {
  if (hasRubAchievement()) return;

  const root = document.querySelector<HTMLElement>('[data-ve-achievement]');
  if (!root) return;

  // Persist before animating so a second reveal during the hold never doubles up.
  markRubAchievement();
  clearAchievementTimers();

  const title =
    root.querySelector('[data-ve-achievement-title]')?.textContent?.trim() ??
    'Why are you rubbing?!';
  const sub =
    root.querySelector('[data-ve-achievement-sub]')?.textContent?.trim() ??
    'Rub a song in the discography for three times.';
  const announce = root.querySelector<HTMLElement>('[data-ve-achievement-announce]');

  root.hidden = false;
  root.classList.remove('is-out');
  // Retrigger entrance if the node was already in the tree.
  root.classList.remove('is-in');
  void root.offsetWidth;
  root.classList.add('is-in');

  // Populate after unhiding so polite live regions actually announce.
  if (announce) {
    announce.textContent = `Achievement unlocked: ${title}. ${sub}`;
  }

  const holdMs = prefersReducedMotion() ? 2800 : ACHIEVEMENT_HOLD_MS;
  const exitMs = prefersReducedMotion() ? 0 : ACHIEVEMENT_EXIT_MS;

  achievementHideTimer = setTimeout(() => {
    root.classList.remove('is-in');
    root.classList.add('is-out');
    achievementRemoveTimer = setTimeout(() => {
      root.classList.remove('is-out');
      root.hidden = true;
      if (announce) announce.textContent = '';
      achievementRemoveTimer = null;
    }, exitMs);
    achievementHideTimer = null;
  }, holdMs);
}

function openRubPanel(trackId: string, source: HTMLElement) {
  const panel = panelFor(trackId);
  if (!panel) return;

  document.querySelectorAll('[data-track-rub-panel]').forEach((node) => {
    if (node instanceof HTMLElement) node.hidden = true;
  });

  lastFocus = source;
  panel.hidden = false;

  const frame = panel.querySelector('.track-rub-panel__frame');
  if (frame instanceof HTMLElement) {
    frame.style.animation = 'none';
    void frame.offsetWidth;
    frame.style.animation = '';
  }

  const exit = panel.querySelector<HTMLElement>('[data-track-rub-exit]');
  exit?.focus();

  maybeShowRubAchievement();
}

export function closeTrackRubPanel() {
  document.querySelectorAll('[data-track-rub-panel]').forEach((node) => {
    if (node instanceof HTMLElement) node.hidden = true;
  });
  if (lastFocus?.isConnected) lastFocus.focus();
  lastFocus = null;
}

function isRubPanelOpen(): boolean {
  return Boolean(document.querySelector('[data-track-rub-panel]:not([hidden])'));
}

function shouldIgnoreTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(IGNORE_SELECTOR));
}

function registerStroke(s: RubSession) {
  s.rubs += 1;
  s.travel = 0;
  armIdle(s);
  if (s.rubs >= RUBS_NEEDED) {
    const { trackId, el } = s;
    suppressClickUntil = performance.now() + 400;
    endSession(true);
    openRubPanel(trackId, el);
  }
}

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0 && event.pointerType === 'mouse') return;
  const target = event.target;
  if (!(target instanceof Element)) return;
  if (shouldIgnoreTarget(target)) return;

  const el = target.closest<HTMLElement>('[data-rubbable]');
  if (!el) return;
  const trackId = el.dataset.rubbable?.trim();
  if (!trackId || !panelFor(trackId)) return;

  endSession(false);
  session = {
    el,
    trackId,
    pointerId: event.pointerId,
    lastX: event.clientX,
    dir: 0,
    travel: 0,
    rubs: 0,
    idleTimer: null,
    lockedHorizontal: false,
  };
  armIdle(session);
  try {
    el.setPointerCapture(event.pointerId);
  } catch {
    /* ignore */
  }
}

function onPointerMove(event: PointerEvent) {
  if (!session || event.pointerId !== session.pointerId) return;

  const dx = event.clientX - session.lastX;
  session.lastX = event.clientX;
  if (dx === 0) return;

  const nextDir: -1 | 1 = dx > 0 ? 1 : -1;
  const absDx = Math.abs(dx);

  // Prefer vertical scroll until horizontal intent is clear.
  if (!session.lockedHorizontal) {
    session.travel += absDx;
    if (session.travel < MIN_STROKE_PX * 0.55) return;
    session.lockedHorizontal = true;
    suppressClickUntil = performance.now() + 800;
    session.travel = absDx;
    session.dir = nextDir;
    armIdle(session);
    return;
  }

  if (event.cancelable) event.preventDefault();

  if (session.dir === 0) {
    session.dir = nextDir;
    session.travel = absDx;
    armIdle(session);
    return;
  }

  if (nextDir === session.dir) {
    session.travel += absDx;
    armIdle(session);
    return;
  }

  // Direction reversed — count a rub if the previous stroke had enough travel.
  if (session.travel >= MIN_STROKE_PX) {
    registerStroke(session);
    if (!session) return;
  } else {
    session.travel = 0;
  }
  session.dir = nextDir;
  session.travel = absDx;
  armIdle(session);
}

function onPointerUp(event: PointerEvent) {
  if (!session || event.pointerId !== session.pointerId) return;
  // Keep the counter alive briefly after lift so the next stroke can continue.
  armIdle(session);
  try {
    session.el.releasePointerCapture(session.pointerId);
  } catch {
    /* ignore */
  }
}

function onPointerCancel(event: PointerEvent) {
  if (!session || event.pointerId !== session.pointerId) return;
  endSession(false);
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key !== 'Escape') return;
  if (!isRubPanelOpen()) return;
  event.preventDefault();
  event.stopPropagation();
  closeTrackRubPanel();
}

function onOverlayClick(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof Element)) return;

  if (target.closest('[data-track-rub-exit]')) {
    event.preventDefault();
    closeTrackRubPanel();
    return;
  }

  // Backdrop click (outside the frame) closes.
  if (target.matches('[data-track-rub-panel]')) {
    closeTrackRubPanel();
    return;
  }

  // After a rub stroke, eat the synthetic click on the row (not overlay chrome).
  if (performance.now() < suppressClickUntil && target.closest('[data-rubbable]')) {
    event.preventDefault();
    event.stopPropagation();
  }
}

/** Bind gesture + overlay chrome once per page. */
export function initTrackRub(): void {
  if (typeof document === 'undefined') return;
  if (document.documentElement.dataset.trackRubInit === '1') return;
  document.documentElement.dataset.trackRubInit = '1';

  document.addEventListener('pointerdown', onPointerDown, { passive: true });
  document.addEventListener('pointermove', onPointerMove, { passive: false });
  document.addEventListener('pointerup', onPointerUp, { passive: true });
  document.addEventListener('pointercancel', onPointerCancel, { passive: true });
  document.addEventListener('keydown', onKeyDown, true);
  document.addEventListener('click', onOverlayClick, true);
}
