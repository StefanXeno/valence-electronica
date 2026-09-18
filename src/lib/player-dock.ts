import { initEqFlatten } from './eq-flatten';
import { clearTransitionGlitch, playTransitionGlitch } from './glitch';
import { isIntroActive, isPlayerPaused, setPlayerPaused, watchPlayerPause } from './playback';
import { PHONE_PANEL_PHASE_MS } from './panel-motion';
import {
  applyDragHeight as clampDragHeight,
  dragFaceOpenPx,
  OVERSCROLL_PX_MAX,
  morphBoxPx,
  pickSoloOpenPx,
  PLAYLIST_ROW_GAP_REM,
  playlistStackPx,
  playlistViewportPx,
  PLAYLIST_WINDOW_SLOTS,
  plausibleRowPx,
  resolvePlaylistGapPx,
  RUBBER,
  sheetProgress,
} from './player-sheet';
import { playlistWindow, shouldRewindow } from './playlist-window';
import {
  consumeHandlePointerTap,
  isHandleDoubleTapEcho,
  isHandlePointerTap,
} from './player-handle-tap';

/** Phone HUD media query (SC-007: 1023 = phone, 1024 = laptop). */
export const PHONE_MQ = '(max-width: 1023px)';

/**
 * 021 visit-only player surface defaults (no persistence):
 * - selectionVisible = true (is-theme-tracks)
 * - nowPlayingVisible = false
 * - vflipEasterEggOpen = false (vinyl → .jukebox__section--list)
 */

/** About / Discography / Tour / Contact / Shop / socials / info — exclusive-open sheets. */
export type PhoneContentSheet =
  | 'about'
  | 'discography'
  | 'tour'
  | 'contact'
  | 'shop'
  | 'socials'
  | 'info';

const HINT_NODS = 3;
const HINT_PERIOD_MS = 60_000;
/** Finger travel (px) before a handle drag snaps open/closed. */
const SNAP_PX = 40;
/** Below this, pointerup is a tap (click still toggles). */
const TAP_SLOP_PX = 8;
/** Drag-release settle — same duration as tap open/close so chrome and content stay locked. */
const SETTLE_MS = PHONE_PANEL_PHASE_MS;
const FLICK_PX_MS = 0.45;
/** Currently Playing ↔ V-Flip: slightly longer than the 320ms sheet so the pluck reads. */
const PLAYLIST_MORPH_MS = 380;

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function isPhoneHud(): boolean {
  return window.matchMedia(PHONE_MQ).matches;
}

/**
 * Desktop rest header copy only (CURRENTLY PLAYING / PAUSING).
 * Phone keeps currentlyPlayingLabel. No HUD floater on the title.
 */
export function syncDesktopNowTitle(): void {
  if (isPhoneHud()) return;
  const title = document.querySelector<HTMLElement>('.jukebox__title');
  const nowSpan = document.querySelector<HTMLElement>('.jukebox__title-phone--now');
  if (!title || !nowSpan) return;
  const playingLabel = title.dataset.playingLabel?.trim() || 'Currently playing';
  const pausingLabel = title.dataset.pausingLabel?.trim() || 'Currently pausing';
  nowSpan.textContent = isPlayerPaused() ? pausingLabel : playingLabel;
  title.removeAttribute('data-hud-label');
  title.removeAttribute('title');
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
  // Phone: never attach a native tooltip (long-press / hover).
  if (label && !isPhoneHud()) el.setAttribute('title', label);
  else el.removeAttribute('title');
}

type ExtraSheet =
  | 'about'
  | 'discography'
  | 'tour'
  | 'contact'
  | 'shop'
  | 'vflip-list'
  | 'socials'
  | 'info';

function panelKind(details: HTMLDetailsElement): ExtraSheet | undefined {
  const kind = details.dataset.stagePanel;
  if (
    kind === 'about' ||
    kind === 'discography' ||
    kind === 'tour' ||
    kind === 'contact' ||
    kind === 'shop' ||
    kind === 'info'
  ) {
    return kind;
  }
  return undefined;
}

function closeVflipList(animated = false): void {
  document.dispatchEvent(
    new CustomEvent('phone-hud-close-vflip', { detail: { animated } }),
  );
}

/** Imprint / Privacy fullscreen (LegalOverlay + LegalPanel). */
function isLegalOverlayOpen(): boolean {
  return Boolean(
    document.querySelector('#legal-overlay [data-legal-panel]:not([hidden])') ||
      document.querySelector('[data-legal-panel]:not([hidden])'),
  );
}

function setSocialsOpen(open: boolean): void {
  const html = document.documentElement;
  const btn = document.querySelector<HTMLButtonElement>('[data-socials-trigger]');
  const panels = document.querySelector<HTMLElement>('[data-stage-panels]');
  html.toggleAttribute('data-socials-open', open);
  panels?.classList.toggle('is-socials-open', open);
  btn?.setAttribute('aria-expanded', open ? 'true' : 'false');
}

/** Original `.stage__socials` slot — restore on laptop so the top-right HUD returns. */
let socialsHome: { parent: Node; next: Node | null } | null = null;

/**
 * Phone: park the one Channels tree inside the content sheet so Socials clips
 * with `--phone-sheet-h` (same icons-out-of-the-box morph as About).
 * Laptop: put it back. Never mount a second Channels list.
 */
function parkPhoneSocials(): void {
  const socials = document.querySelector<HTMLElement>('.stage__socials');
  const sheet = document.querySelector<HTMLElement>('[data-stage-panels] .stage-panels__sheet');
  if (!socials) return;
  if (!socialsHome && socials.parentElement) {
    socialsHome = { parent: socials.parentElement, next: socials.nextSibling };
  }
  if (window.matchMedia(PHONE_MQ).matches) {
    if (sheet && socials.parentElement !== sheet) sheet.appendChild(socials);
    return;
  }
  if (socialsHome && socials.parentElement !== socialsHome.parent) {
    socialsHome.parent.insertBefore(socials, socialsHome.next);
  }
}

function closeStagePanels(except?: HTMLDetailsElement): void {
  document.querySelectorAll<HTMLDetailsElement>('[data-stage-panel][open]').forEach((node) => {
    if (node !== except) node.open = false;
  });
}

type PhoneSheetController = {
  request: (kind: PhoneContentSheet) => void;
  open: (kind: PhoneContentSheet) => void;
  close: (opts?: { animated?: boolean }) => void;
  isOpen: () => boolean;
};

let sheetCtl: PhoneSheetController | null = null;

function isContentSheet(keep?: ExtraSheet): keep is PhoneContentSheet {
  return (
    keep === 'about' ||
    keep === 'discography' ||
    keep === 'tour' ||
    keep === 'contact' ||
    keep === 'shop' ||
    keep === 'socials' ||
    keep === 'info'
  );
}

/** Instant fallback if the pill controller is not booted yet. */
function closeContentInstant(except?: HTMLDetailsElement, keepSocials = false): void {
  closeStagePanels(except);
  if (!keepSocials) setSocialsOpen(false);
}

/**
 * Phone exclusive-open: at most one extra surface. Pill expand === V-Flip list.
 * Content sheets (About / Discography / Tour / socials / info) cross-switch in one pill.
 */
export function closePhoneSheetsExcept(keep?: ExtraSheet, exceptPanel?: HTMLDetailsElement): void {
  if (!isPhoneHud()) return;
  if (sheetCtl) {
    if (isContentSheet(keep)) sheetCtl.open(keep);
    else sheetCtl.close({ animated: true });
  } else if (isContentSheet(keep)) {
    closeContentInstant(exceptPanel, keep === 'socials');
  } else {
    closeContentInstant();
  }
  if (keep !== 'vflip-list') closeVflipList();
}

/** Icon-bar tap: toggle same sheet, cross-switch otherwise. Phone only. */
export function requestPhoneContent(kind: PhoneContentSheet): void {
  if (!isPhoneHud()) return;
  sheetCtl?.request(kind);
}

/** Collapse the content pill back to the 5-icon bar. Phone only. */
export function closePhoneContent(animated = true): void {
  if (!isPhoneHud()) return;
  sheetCtl?.close({ animated });
}

function createPhoneSheetController(): PhoneSheetController {
  const html = document.documentElement;
  const cluster = document.querySelector<HTMLElement>('[data-stage-panels]');
  const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');

  let active: PhoneContentSheet | null = null;
  let morphTimer = 0;
  let morphGen = 0;
  let barGlitchTimer = 0;

  const flavorBarGlitch = () => {
    if (!cluster) return;
    window.clearTimeout(barGlitchTimer);
    const dur = playTransitionGlitch(cluster, PHONE_PANEL_PHASE_MS);
    if (!dur) return;
    barGlitchTimer = window.setTimeout(() => clearTransitionGlitch(cluster), dur + 80);
  };

  const panelEl = (kind: PhoneContentSheet) =>
    kind === 'socials'
      ? null
      : document.querySelector<HTMLDetailsElement>(`[data-stage-panel="${kind}"]`);

  const remPx = () => Number.parseFloat(getComputedStyle(html).fontSize) || 16;
  const hudScale = () =>
    Number.parseFloat(getComputedStyle(cluster ?? html).getPropertyValue('--hud-scale')) || 1;

  const sheetCapPx = () => Math.min(window.innerHeight * 0.5, 22 * remPx() * hudScale());

  const socialsSheetPx = () => {
    const row = document.querySelector<HTMLElement>('.stage__socials .channels ul');
    // scrollHeight survives a height:0 overflow:hidden sheet after parking.
    const measured = row?.scrollHeight || row?.offsetHeight || 0;
    if (measured > 1) return measured;
    return 2.5 * remPx() * hudScale();
  };

  const panelSheetPx = (panel: HTMLDetailsElement) => {
    const body = panel.querySelector<HTMLElement>('.stage-panel__body');
    if (!body) return 0;
    // Unlock body + inner scrollports — --phone-sheet-h may be 0 during expand.
    const locked = [
      body,
      ...panel.querySelectorAll<HTMLElement>('.stage-panel__scroll, .discog, .about-body, .tour, .legal-sheet'),
    ];
    const prev = locked.map((el) => ({
      el,
      maxHeight: el.style.maxHeight,
      height: el.style.height,
      overflow: el.style.overflow,
    }));
    for (const el of locked) {
      el.style.maxHeight = 'none';
      el.style.height = 'auto';
      el.style.overflow = 'visible';
    }
    const h = Math.min(Math.max(body.scrollHeight, 0), sheetCapPx());
    for (const row of prev) {
      row.el.style.maxHeight = row.maxHeight;
      row.el.style.height = row.height;
      row.el.style.overflow = row.overflow;
    }
    return h;
  };

  const titleStackPx = (panel: HTMLDetailsElement | null) => {
    const title = panel?.querySelector<HTMLElement>('.stage-panel__sheet-title');
    if (!title || getComputedStyle(title).display === 'none') return 0;
    const cs = getComputedStyle(title);
    return (
      title.getBoundingClientRect().height +
      (Number.parseFloat(cs.marginTop) || 0) +
      (Number.parseFloat(cs.marginBottom) || 0)
    );
  };

  const targetHeight = (kind: PhoneContentSheet) => {
    if (kind === 'socials') return socialsSheetPx();
    const panel = panelEl(kind);
    return panel ? panelSheetPx(panel) : 0;
  };

  const setSheetHeight = (px: number, kind?: PhoneContentSheet | null) => {
    const sheet = Math.max(0, px);
    cluster?.style.setProperty('--phone-sheet-h', `${sheet}px`);
    if (!kind || kind === 'socials') {
      cluster?.style.setProperty('--phone-sheet-scroll-h', `${sheet}px`);
      return;
    }
    const scroll = Math.max(0, sheet - titleStackPx(panelEl(kind)));
    cluster?.style.setProperty('--phone-sheet-scroll-h', `${scroll}px`);
  };

  const setChrome = (open: boolean, closing = false) => {
    html.toggleAttribute('data-sheet-open', open);
    cluster?.classList.toggle('is-sheet-open', open);
    cluster?.classList.toggle('is-sheet-closing', closing);
  };

  const syncTriggers = (kind: PhoneContentSheet | null) => {
    cluster?.querySelectorAll<HTMLButtonElement>('[data-stage-panel-trigger]').forEach((btn) => {
      btn.setAttribute('aria-expanded', btn.dataset.stagePanelTrigger === kind ? 'true' : 'false');
    });
    const socialsBtn = document.querySelector<HTMLButtonElement>('[data-socials-trigger]');
    socialsBtn?.setAttribute('aria-expanded', kind === 'socials' ? 'true' : 'false');
  };

  const clearMorph = () => {
    window.clearTimeout(morphTimer);
    morphTimer = 0;
  };

  const afterMorph = (fn: () => void) => {
    clearMorph();
    const token = ++morphGen;
    const run = () => {
      if (token !== morphGen) return;
      fn();
    };
    if (reduceMq.matches) {
      run();
      return;
    }
    morphTimer = window.setTimeout(run, PHONE_PANEL_PHASE_MS);
  };

  const stripCross = (panel: HTMLDetailsElement | null) => {
    panel?.classList.remove('is-cross-out', 'is-cross-in', 'is-panel-closing');
  };

  const finishLayers = (keep?: PhoneContentSheet) => {
    cluster?.classList.remove('is-cross-switching');
    document.querySelectorAll<HTMLDetailsElement>('[data-stage-panel]').forEach((node) => {
      const kind = panelKind(node);
      if (kind && kind === keep) {
        stripCross(node);
        return;
      }
      node.open = false;
      stripCross(node);
    });
  };

  const expand = (kind: PhoneContentSheet) => {
    if (!cluster) return;
    parkPhoneSocials();
    finishLayers(kind === 'socials' ? undefined : kind);
    setChrome(true, false);
    setSheetHeight(0);
    if (kind === 'socials') {
      setSocialsOpen(true);
    } else {
      const panel = panelEl(kind);
      if (panel) panel.open = true;
      setSocialsOpen(false);
    }
    active = kind;
    syncTriggers(kind);
    closeVflipList();
    const h = targetHeight(kind);
    if (reduceMq.matches) {
      setSheetHeight(h, kind);
    } else {
      // Lock 0px as the from-value, then interpolate to the measured sheet.
      void cluster.offsetHeight;
      setSheetHeight(h, kind);
      flavorBarGlitch();
    }
    // Invalidate a pending close/cross so it cannot drop this open.
    afterMorph(() => undefined);
  };

  const cross = (from: PhoneContentSheet, to: PhoneContentSheet) => {
    if (!cluster) return;
    finishLayers(from === 'socials' ? undefined : from);
    setChrome(true, false);
    cluster.classList.add('is-cross-switching');

    const fromPanel = panelEl(from);
    const toPanel = panelEl(to);
    if (fromPanel) {
      fromPanel.open = true;
      fromPanel.classList.add('is-cross-out');
    }
    if (toPanel) {
      toPanel.open = true;
      toPanel.classList.add('is-cross-in');
    }

    if (from === 'socials') setSocialsOpen(false);
    if (to === 'socials') setSocialsOpen(true);
    else if (from !== 'socials') setSocialsOpen(false);

    active = to;
    syncTriggers(to);
    closeVflipList();
    setSheetHeight(targetHeight(to), to);
    if (!reduceMq.matches) flavorBarGlitch();

    afterMorph(() => {
      if (fromPanel) {
        fromPanel.open = false;
        stripCross(fromPanel);
      }
      stripCross(toPanel);
      cluster.classList.remove('is-cross-switching');
    });
  };

  const open = (kind: PhoneContentSheet) => {
    if (active === kind) return;
    if (active) cross(active, kind);
    else expand(kind);
  };

  const close = (opts?: { animated?: boolean }) => {
    if (!active && !cluster?.classList.contains('is-sheet-open')) return;
    // Player drag/expand may call close again while the morph is already running.
    if (cluster?.classList.contains('is-sheet-closing') && opts?.animated !== false) return;
    const animated = opts?.animated !== false && !reduceMq.matches;
    const closingSocials = active === 'socials';
    const panel = active && active !== 'socials' ? panelEl(active) : null;
    clearMorph();
    finishLayers(active && active !== 'socials' ? active : undefined);

    if (!animated) {
      setSocialsOpen(false);
      if (panel) {
        panel.open = false;
        stripCross(panel);
      }
      setSheetHeight(0);
      setChrome(false, false);
      active = null;
      syncTriggers(null);
      return;
    }

    if (panel) {
      panel.open = true;
      panel.classList.add('is-panel-closing');
    }
    // Keep socials painted while --phone-sheet-h reverses so the row clips
    // back into the pill (don't fade/jump them behind the collapsed dock).
    if (!closingSocials) setSocialsOpen(false);
    setChrome(true, true);
    setSheetHeight(0);
    flavorBarGlitch();
    afterMorph(() => {
      if (panel) {
        panel.open = false;
        stripCross(panel);
      }
      setSocialsOpen(false);
      setChrome(false, false);
      active = null;
      syncTriggers(null);
    });
  };

  const request = (kind: PhoneContentSheet) => {
    if (active === kind) close({ animated: true });
    else open(kind);
  };

  return {
    request,
    open,
    close,
    isOpen: () => active !== null,
  };
}

export function initPlayerDock(): void {
  const html = document.documentElement;
  const dock =
    document.querySelector<HTMLElement>('[data-player-dock]') ??
    document.querySelector<HTMLElement>('[data-jukebox]');
  const handle = document.querySelector<HTMLButtonElement>('[data-player-handle]');
  const socialsBtn = document.querySelector<HTMLButtonElement>('[data-socials-trigger]');
  const transport =
    dock?.querySelector<HTMLElement>('[data-player-transport]') ??
    dock?.querySelector<HTMLElement>('.player-dock__transport');
  const toolbar = dock?.querySelector<HTMLElement>('[data-jukebox-toolbar]');

  html.setAttribute('data-player-dock-js', '');
  initEqFlatten();
  parkPhoneSocials();
  sheetCtl = createPhoneSheetController();
  if (!dock && !socialsBtn) return;

  const expandLabel = handle?.dataset.expandLabel ?? 'Show player controls';
  const collapseLabel = handle?.dataset.collapseLabel ?? 'Hide player controls';

  let expanded = false;
  let hintBurst: number | undefined;
  let hintWait: number | undefined;
  let suppressHandleClick = false;
  /** Last handle tap that actually toggled — `null` until the first tap (now() is ~0 after load). */
  let lastHandleToggleAt: number | null = null;
  let settleRaf = 0;
  /** Last committed playlist request while open/close is in flight (FR-008). */
  let pendingPlaylist: boolean | null = null;
  /** Last handle pointerup that counted as a tap (pairs into a double-tap). */
  let lastPointerTapAt: number | null = null;
  let drag:
    | {
        pointerId: number;
        startX: number;
        startY: number;
        startT: number;
        lastX: number;
        lastY: number;
        lastT: number;
        velocity: number;
        moved: boolean;
        startH: number;
        collapsedH: number;
        openH: number;
        fromExpanded: boolean;
        /** Playlist face at pointerdown — drag-close keeps the 3-row cap. */
        fromPlaylist: boolean;
        /** Gesture started on the sheet that was covering the handle. */
        retargeted: boolean;
      }
    | undefined;

  const phoneMq = window.matchMedia(PHONE_MQ);
  const motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');

  /**
   * Transport stays a jukebox grid child (toolbar is display:contents).
   * Never park it in the drawer — sheet height must not reflow the buttons.
   */
  const parkPhoneTransport = () => {
    if (!transport || !toolbar) return;
    if (transport.parentElement === toolbar) return;
    const mute = toolbar.querySelector('.jukebox__tool--mute');
    toolbar.insertBefore(transport, mute);
  };

  parkPhoneTransport();

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

  let morphPlayerSheet: ((toOpen: boolean) => void) | null = null;
  let morphPlaylist: ((open: boolean) => void) | null = null;

  const applyExpanded = (next: boolean, opts?: { syncVflip?: boolean; animated?: boolean }) => {
    const syncVflip = opts?.syncVflip !== false;
    // Instant collapse during drag/settle drops data-player-dock-expanded while
    // --player-sheet-h is still tall — HUD pill (z-index 6) then paints on top.
    // Drag settle still commits with { animated: false }.
    if (
      !next &&
      opts?.animated !== false &&
      (Boolean(drag) || html.hasAttribute('data-player-sheet-dragging'))
    ) {
      return;
    }
    const wantAnim =
      Boolean(morphPlayerSheet) &&
      opts?.animated !== false &&
      phoneMq.matches &&
      !motionMq.matches &&
      !html.hasAttribute('data-player-sheet-dragging');

    if (wantAnim && expanded !== next && syncVflip) {
      if (next && phoneMq.matches) closePhoneSheetsExcept('vflip-list');
      morphPlayerSheet?.(next);
      return;
    }

    const changed = expanded !== next;
    expanded = next;
    html.toggleAttribute('data-player-dock-expanded', next);
    dock?.classList.toggle('is-player-expanded', next);
    if (handle) {
      handle.setAttribute('aria-expanded', next ? 'true' : 'false');
      const label = next ? collapseLabel : expandLabel;
      handle.setAttribute('aria-label', label);
      handle.dataset.hudLabel = label;
    }
    // Same 3×/60s nod for up (collapsed) and down (expanded).
    if (changed) scheduleHint();

    // Phone: opening the player exclusive-closes About / Discography / Tour / socials / Info.
    if (changed && next && phoneMq.matches) {
      closePhoneSheetsExcept('vflip-list');
    }

    // Phone: useful-open lands on song selection (021) — not V-Flip easter egg.
    // Vinyl control still opens V-Flip via jukebox toggle.
    if (changed && syncVflip && phoneMq.matches) {
      if (next) {
        document.dispatchEvent(
          new CustomEvent('phone-player-playlist', { detail: { open: true } }),
        );
      } else {
        closeVflipList(opts?.animated !== false);
      }
    }
  };

  applyExpanded(false);

  // Click still single-taps (015). Pointer double-tap toggles when click never
  // fires. Echo lock only after a successful toggle so the extra half cannot undo.
  const toggleFromHandleTap = () => {
    if (!phoneMq.matches) return;
    const now = performance.now();
    if (lastHandleToggleAt != null && isHandleDoubleTapEcho(now, lastHandleToggleAt)) return;
    lastHandleToggleAt = now;
    applyExpanded(!expanded);
  };

  const suppressClickAfterPointerToggle = () => {
    suppressHandleClick = true;
    window.setTimeout(() => {
      suppressHandleClick = false;
    }, 50);
  };

  handle?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (suppressHandleClick) {
      suppressHandleClick = false;
      return;
    }
    toggleFromHandleTap();
  });

  handle?.addEventListener('dblclick', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (suppressHandleClick) return;
    toggleFromHandleTap();
  });

  const remPx = () => Number.parseFloat(getComputedStyle(html).fontSize) || 16;

  const readDockHeight = () => dock?.getBoundingClientRect().height ?? 0;

  const cssVarPx = (el: HTMLElement, prop: string, fallback: number) => {
    const raw = getComputedStyle(el).getPropertyValue(prop).trim();
    if (!raw) return fallback;
    if (raw.endsWith('px')) {
      const px = Number.parseFloat(raw);
      return Number.isFinite(px) ? px : fallback;
    }
    if (raw.endsWith('rem')) {
      const rem = Number.parseFloat(raw);
      return Number.isFinite(rem) ? rem * remPx() : fallback;
    }
    // Resolve calc() / nested tokens to px via a probe (parseFloat("calc(") is NaN).
    const probe = document.createElement('div');
    probe.style.cssText =
      'position:absolute;left:-9999px;width:0;visibility:hidden;pointer-events:none;' +
      `height:var(${prop});`;
    el.appendChild(probe);
    const resolved = probe.getBoundingClientRect().height;
    probe.remove();
    return resolved > 0 ? resolved : fallback;
  };

  const collapsedHeightPx = () => {
    if (dock) {
      const token = cssVarPx(dock, '--phone-player-h', 0);
      if (token > 1) return token;
    }
    const rem = remPx();
    const control = cssVarPx(dock ?? html, '--control-size', 3.1 * rem);
    const pad = cssVarPx(dock ?? html, '--phone-bar-pad', 0.28 * rem);
    const safe = cssVarPx(dock ?? html, '--phone-safe-bottom', 0);
    return control + 2 * pad + safe;
  };

  const sheetCapPx = () => {
    const rem = remPx();
    return Math.min(window.innerHeight * 0.68, window.innerHeight - 5.5 * rem);
  };

  const clampOpenSheetPx = (px: number, collapsedH: number) =>
    Math.min(Math.max(px, collapsedH + 8), sheetCapPx());

  /** Header box as painted when open — never the live max-height:0 / clipped rect. */
  const measureHeaderNaturalPx = () => {
    const header = dock?.querySelector<HTMLElement>('.jukebox__header');
    if (!header) return 0;
    const panel = header.closest<HTMLElement>('.jukebox__panel');
    const prev = {
      maxHeight: header.style.maxHeight,
      overflow: header.style.overflow,
      visibility: header.style.visibility,
      panelMaxHeight: panel?.style.maxHeight ?? '',
      panelOverflow: panel?.style.overflow ?? '',
    };
    header.style.maxHeight = 'none';
    header.style.overflow = 'visible';
    header.style.visibility = 'hidden';
    if (panel) {
      panel.style.maxHeight = 'none';
      panel.style.overflow = 'visible';
    }
    const cs = getComputedStyle(header);
    const rem = remPx();
    const hud =
      Number.parseFloat(getComputedStyle(dock ?? html).getPropertyValue('--hud-scale')) || 1;
    const marginBottom =
      Number.parseFloat(cs.marginBottom) || 0.28 * rem * hud;
    const natural =
      Math.max(header.getBoundingClientRect().height, header.scrollHeight) +
      (Number.parseFloat(cs.marginTop) || 0) +
      marginBottom;
    if (prev.maxHeight) header.style.maxHeight = prev.maxHeight;
    else header.style.removeProperty('max-height');
    if (prev.overflow) header.style.overflow = prev.overflow;
    else header.style.removeProperty('overflow');
    if (prev.visibility) header.style.visibility = prev.visibility;
    else header.style.removeProperty('visibility');
    if (panel) {
      if (prev.panelMaxHeight) panel.style.maxHeight = prev.panelMaxHeight;
      else panel.style.removeProperty('max-height');
      if (prev.panelOverflow) panel.style.overflow = prev.panelOverflow;
      else panel.style.removeProperty('overflow');
    }
    return natural;
  };

  /**
   * Header + list/card→transport pad + transport + floor + handle clearance.
   * Never 1fr / 50svh / full-list scrollHeight / --phone-handle-hit — those
   * overshoot the painted stack.
   */
  const measureSheetChromePx = () => {
    if (!dock) return 0;
    const rem = remPx();
    const dockCs = getComputedStyle(dock);
    const padTop = Number.parseFloat(dockCs.paddingTop) || 0;
    const padBottom = Number.parseFloat(dockCs.paddingBottom) || 0;
    const handle = cssVarPx(dock, '--phone-handle', 1.5 * rem);
    const sheetGap = cssVarPx(dock, '--phone-sheet-head-gap', 0.28 * rem);
    // Open drawer-inner clears the visual handle. Do not add --phone-handle-hit.
    const innerPadTop = handle + sheetGap;
    const headerH = measureHeaderNaturalPx();
    const floorH = cssVarPx(dock, '--control-size', 3.1 * rem);
    const transportH = cssVarPx(dock, '--player-transport-h', floorH);
    // Card/list → transport: `--jukebox-toolbar-pad` on `.jukebox__panel` (other agent).
    const panel = dock.querySelector<HTMLElement>('.jukebox__panel');
    const panelPad = panel ? Number.parseFloat(getComputedStyle(panel).paddingBottom) || 0 : 0;
    const listTransportGap = Math.max(
      cssVarPx(dock, '--jukebox-toolbar-pad', 0.25 * rem),
      panelPad,
    );
    return padTop + innerPadTop + headerH + listTransportGap + transportH + floorH + padBottom;
  };

  const playlistGapPx = () => {
    const list = playlistList();
    const rem = remPx();
    const hud =
      Number.parseFloat(getComputedStyle(dock ?? html).getPropertyValue('--hud-scale')) || 1;
    const fallback = PLAYLIST_ROW_GAP_REM * rem * hud;
    if (!list) return fallback;
    // Token first — solo `gap: 0` and parseFloat("calc(...)") both miss the
    // settled `--discog-row-gap` (0.55rem * --hud-scale, not page 0.75rem).
    return resolvePlaylistGapPx(
      cssVarPx(list, '--discog-row-gap', 0),
      Number.parseFloat(getComputedStyle(list).gap) || 0,
      fallback,
    );
  };

  /** Off-DOM solo card height, cached so first tap is not a stub. */
  let soloCardPx = 0;

  /**
   * Off-DOM shrink-wrap of the solo sheet. Force auto rows so live 1fr /
   * --player-sheet-h leftover cannot feed back into the next open target.
   */
  const measureSoloShrinkWrapPx = () => {
    if (!dock) return 0;
    const width = dock.getBoundingClientRect().width;
    const clone = dock.cloneNode(true) as HTMLElement;
    clone.classList.add('is-player-expanded', 'is-open');
    clone.classList.remove(
      'is-theme-tracks',
      'is-playlist-morphing',
      'is-sheet-morphing',
      'is-sheet-dragging',
      'is-sheet-collapsing',
      'is-panel-opening',
      'is-panel-closing',
    );
    clone.querySelectorAll<HTMLElement>('.discog[data-theme-tracks] .discog__item').forEach((item) => {
      if (item.dataset.discogActive === 'true') {
        item.classList.remove('is-playlist-collapsed');
        item.style.removeProperty('height');
        item.style.removeProperty('display');
        return;
      }
      item.classList.add('is-playlist-collapsed');
      // display:none — height:0 siblings + list gap still inflated the clone.
      item.style.display = 'none';
    });
    clone.style.cssText =
      `position:fixed;left:-9999px;top:0;width:${Math.max(0, width)}px;` +
      'height:auto !important;min-height:0 !important;max-height:none !important;' +
      'overflow:visible !important;visibility:hidden;pointer-events:none;z-index:-1;' +
      'align-content:start;grid-template-rows:auto auto auto;';
    clone.style.removeProperty('--player-sheet-h');
    const inner = clone.querySelector<HTMLElement>('.jukebox__drawer-inner');
    if (inner) inner.style.flex = '0 0 auto';
    document.body.appendChild(clone);
    const h = clone.getBoundingClientRect().height;
    clone.remove();
    return h;
  };

  /** Playing-card box. Prefer the off-DOM solo clone — live 1fr can stretch it. */
  const measureSoloCardPx = () => {
    const playing = playingPlaylistRow();
    const clonedCard = playing ? measurePlausibleRowPx(playing, 'solo') : 0;
    const liveCard = playing?.getBoundingClientRect().height ?? 0;
    const liveOk = liveCard > 1 && (clonedCard < 1 || liveCard <= clonedCard + 8);
    return Math.max(0, clonedCard, soloCardPx, liveOk ? liveCard : 0);
  };

  /**
   * Solo open target = handle clearance + header + card + transport + floor
   * (plus any card-to-transport gap from CSS). Prefer shrink-wrap so that gap
   * is not dropped — ignoring wrap used to hop the sheet up at playlist-close.
   */
  const measureSoloOpenPx = (collapsedH: number) => {
    const exact = measureSheetChromePx() + measureSoloCardPx();
    const wrapped = measureSoloShrinkWrapPx();
    return pickSoloOpenPx(collapsedH, exact, wrapped, sheetCapPx());
  };

  /** Playlist open target: chrome + exactly three row heights + two gaps. */
  const measurePlaylistOpenPx = (collapsedH: number, rowHeights: number[], gap: number) =>
    clampOpenSheetPx(
      playlistStackPx(measureSheetChromePx(), rowHeights, gap, PLAYLIST_WINDOW_SLOTS),
      collapsedH,
    );

  const openHeightPx = () => {
    const collapsedH = collapsedHeightPx();
    if (dock?.classList.contains('is-theme-tracks')) {
      const gap = playlistGapPx();
      return measurePlaylistOpenPx(collapsedH, measureThreeSlotHeights(), gap);
    }
    return measureSoloOpenPx(collapsedH);
  };

  /**
   * After click/drag settle on Currently Playing: drop the px lock so the
   * absolute bottom-docked box shrink-wraps (height:auto). A leftover
   * --player-sheet-h + align-content:start is the bottom void under the floor.
   */
  const fitSheetToSoloCard = () => {
    if (!dock || !expanded || dock.classList.contains('is-theme-tracks')) return;
    html.removeAttribute('data-player-sheet-sized');
    dock.style.removeProperty('--player-sheet-h');
    dock.style.removeProperty('--player-sheet-progress');
  };

  /**
   * Drag cap for this gesture. Drag-open is solo even after applyExpanded;
   * do not re-read is-theme-tracks / 3-row height into --player-sheet-progress.
   */
  const measureDragOpenPx = (collapsedH: number, playlistFace: boolean) => {
    const soloH = measureSoloOpenPx(collapsedH);
    if (!playlistFace) return soloH;
    return dragFaceOpenPx(
      true,
      soloH,
      measurePlaylistOpenPx(collapsedH, measureThreeSlotHeights(), playlistGapPx()),
    );
  };

  const setSheetHeight = (px: number, collapsedH: number, openH: number) => {
    dock?.style.setProperty('--player-sheet-h', `${Math.max(0, px)}px`);
    dock?.style.setProperty('--player-sheet-progress', String(sheetProgress(px, collapsedH, openH)));
  };

  /** 1:1 height from the floor. Rubber-band only past the open cap. */
  const applyDragHeight = (rawH: number, collapsedH: number, openH: number) =>
    clampDragHeight(rawH, collapsedH, openH, RUBBER, OVERSCROLL_PX_MAX);

  const syncCollapseChrome = (heightPx: number, openH: number, fromExpanded: boolean) => {
    // Drag-down from open: fade transport with --player-sheet-progress (CSS).
    // Do not display:none — that popped the row on the first pixel.
    const shrinking = fromExpanded && heightPx < openH - 0.5;
    dock?.classList.toggle('is-sheet-collapsing', shrinking);
  };

  const beginSheetDrag = (heightPx: number, collapsedH: number, openH: number) => {
    window.clearTimeout(sheetMorphTimer);
    sheetMorphGen += 1;
    endSheetMorphStyles({ keepHeight: true });
    html.setAttribute('data-player-sheet-dragging', '');
    dock?.classList.add('is-sheet-dragging');
    if (expanded) dock?.classList.add('is-sheet-collapsing');
    else syncCollapseChrome(heightPx, openH, false);
    setSheetHeight(heightPx, collapsedH, openH);
    // Grow the same open sheet as a click (drawer + floor bar), not a preview chrome.
    if (!expanded) applyExpanded(true, { animated: false });
    stopHint();
  };

  const endSheetDragStyles = (opts?: { keepHeight?: boolean }) => {
    // Keep the px lock on before dropping drag — one unlocked frame clips down.
    if (opts?.keepHeight) html.setAttribute('data-player-sheet-sized', '');
    else {
      html.removeAttribute('data-player-sheet-sized');
      dock?.style.removeProperty('--player-sheet-h');
    }
    html.removeAttribute('data-player-sheet-dragging');
    dock?.classList.remove('is-sheet-dragging', 'is-sheet-collapsing');
    dock?.style.removeProperty('--player-sheet-progress');
    dock?.style.removeProperty('--player-sheet-overscroll');
  };

  let sheetMorphTimer = 0;
  let sheetMorphGen = 0;
  let chromeGlitchTimer = 0;
  let playlistPinRaf = 0;

  const flavorDockGlitch = (durationMs: number) => {
    if (!dock) return;
    window.clearTimeout(chromeGlitchTimer);
    const dur = playTransitionGlitch(dock, durationMs);
    if (!dur) return;
    chromeGlitchTimer = window.setTimeout(() => clearTransitionGlitch(dock), dur + 80);
  };

  const playlistList = () =>
    dock?.querySelector<HTMLElement>('.discog[data-theme-tracks]') ?? null;

  const playlistSection = () =>
    dock?.querySelector<HTMLElement>('.jukebox__section--theme-tracks') ?? null;

  /** Real theme-track rows only (no placeholders, no test-only fixture hides). */
  const realPlaylistRows = () =>
    Array.from(
      dock?.querySelectorAll<HTMLElement>(
        '.discog[data-theme-tracks] .discog__item[data-discog-item]',
      ) ?? [],
    ).filter((row) => !row.hasAttribute('data-playlist-fixture-hide') && !row.hidden);

  const playlistRows = () =>
    Array.from(
      dock?.querySelectorAll<HTMLElement>(
        '.discog[data-theme-tracks] .discog__item:not([data-playlist-fixture-hide])',
      ) ?? [],
    ).filter((row) => !row.hidden);

  const placeholderRows = () =>
    Array.from(
      dock?.querySelectorAll<HTMLElement>(
        '.discog[data-theme-tracks] [data-playlist-placeholder]',
      ) ?? [],
    );

  const playingPlaylistRow = () =>
    dock?.querySelector<HTMLElement>(
      '.discog[data-theme-tracks] .discog__item[data-discog-item][data-discog-active="true"]',
    ) ?? realPlaylistRows()[0] ?? null;

  const currentRowIndex = (rows: HTMLElement[]) => {
    const index = rows.findIndex((row) => row.dataset.discogActive === 'true');
    return index < 0 ? 0 : index;
  };

  const refreshSoloCardPx = () => {
    const playing = playingPlaylistRow();
    if (!playing) return;
    const next = measurePlausibleRowPx(playing, 'solo');
    if (next > 1) soloCardPx = next;
  };

  const cancelPlaylistRowAnims = () => {
    const list = playlistList();
    list?.getAnimations().forEach((anim) => anim.cancel());
    playingPlaylistRow()?.getAnimations().forEach((anim) => anim.cancel());
    for (const row of playlistRows()) {
      row.getAnimations().forEach((anim) => anim.cancel());
      row.style.removeProperty('height');
      row.style.removeProperty('overflow');
      row.style.removeProperty('opacity');
      row.style.removeProperty('padding-top');
      row.style.removeProperty('padding-bottom');
      row.style.removeProperty('padding-left');
      row.style.removeProperty('padding-right');
      row.style.removeProperty('border-top-width');
      row.style.removeProperty('border-bottom-width');
      row.style.removeProperty('visibility');
      row.style.removeProperty('clip-path');
      row.style.removeProperty('transform');
      row.style.removeProperty('box-shadow');
      row.style.removeProperty('position');
      row.style.removeProperty('z-index');
      row.style.removeProperty('flex-shrink');
      row.style.removeProperty('flex-grow');
    }
    if (list) list.style.removeProperty('gap');
  };

  const stopPlaylistPin = () => {
    window.cancelAnimationFrame(playlistPinRaf);
    playlistPinRaf = 0;
  };

  const endSheetMorphStyles = (opts?: { keepHeight?: boolean }) => {
    // Size lock first — dropping morphing before sized lets 1fr / 50svh clip down.
    if (opts?.keepHeight) html.setAttribute('data-player-sheet-sized', '');
    else {
      html.removeAttribute('data-player-sheet-sized');
      dock?.style.removeProperty('--player-sheet-h');
    }
    html.removeAttribute('data-player-sheet-morphing');
    dock?.classList.remove('is-sheet-morphing', 'is-playlist-morphing', 'is-sheet-collapsing');
    // After morph classes drop so closed-row CSS can hold height:0.
    cancelPlaylistRowAnims();
    dock?.style.removeProperty('--player-sheet-progress');
  };

  /**
   * Natural row box. Clone inside a jukebox shell so solo/playlist Discography
   * rules apply — a body-only clone missed stage-slot collapse and under/over
   * measured listen-on. Never use the live clipped rect in a short sheet.
   * Force block + is-playlist-morphing so 1fr / max-height:100% cannot stretch
   * the probe to the sheet or viewport (that blew sibling rows on morph).
   */
  const measureRowNaturalPx = (row: HTMLElement, mode: 'solo' | 'playlist' = 'playlist') => {
    const host = row.parentElement;
    if (!host) return Math.max(row.scrollHeight, 0);
    const probe = row.cloneNode(true) as HTMLElement;
    probe.classList.remove('is-playlist-collapsed');
    probe.removeAttribute('aria-hidden');
    const width = host.getBoundingClientRect().width || dock?.getBoundingClientRect().width || 0;

    const shell = document.createElement('div');
    shell.className =
      mode === 'solo'
        ? 'jukebox is-player-expanded is-open is-playlist-morphing'
        : 'jukebox is-player-expanded is-open is-theme-tracks is-playlist-morphing';
    if (dock) {
      for (const attr of dock.attributes) {
        if (attr.name.startsWith('data-astro')) shell.setAttribute(attr.name, attr.value);
      }
    }
    const list = document.createElement('ul');
    list.className = host.className;
    for (const attr of host.attributes) {
      if (attr.name.startsWith('data-astro') || attr.name === 'data-theme-tracks') {
        list.setAttribute(attr.name, attr.value);
      }
    }
    for (const attr of row.attributes) {
      if (attr.name.startsWith('data-astro') && !probe.hasAttribute(attr.name)) {
        probe.setAttribute(attr.name, attr.value);
      }
    }
    list.appendChild(probe);
    const section = document.createElement('section');
    section.className = 'jukebox__section jukebox__section--theme-tracks';
    const liveSection = row.closest('.jukebox__section--theme-tracks');
    if (liveSection) {
      for (const attr of liveSection.attributes) {
        if (attr.name.startsWith('data-astro')) section.setAttribute(attr.name, attr.value);
      }
    }
    section.appendChild(list);
    shell.appendChild(section);
    shell.style.cssText =
      `position:fixed;left:-9999px;top:0;width:${Math.max(0, width)}px;` +
      'display:block;height:auto !important;min-height:0 !important;max-height:none !important;' +
      'overflow:visible;visibility:hidden;pointer-events:none;z-index:-1;' +
      'grid-template-rows:none;align-content:start;';
    section.style.cssText = 'flex:0 0 auto;height:auto;max-height:none;overflow:visible;min-height:0;';
    list.style.cssText =
      'display:flex;flex-direction:column;height:auto;max-height:none;flex:0 0 auto;';
    probe.style.cssText =
      'height:auto;max-height:none;min-height:0;overflow:visible;clip-path:none;' +
      'opacity:1;visibility:visible;flex:0 0 auto;align-self:start;';
    document.body.appendChild(shell);
    const natural = probe.getBoundingClientRect().height;
    shell.remove();
    return natural;
  };

  const rowPxCap = () => Math.max(48, Math.min(sheetCapPx() * 0.4, window.innerHeight * 0.28));

  const measurePlausibleRowPx = (
    row: HTMLElement,
    mode: 'solo' | 'playlist',
    typical = 0,
  ) => plausibleRowPx(measureRowNaturalPx(row, mode), typical, rowPxCap());

  const createPlaceholderRow = () => {
    const template = dock?.querySelector<HTMLTemplateElement>(
      '[data-playlist-placeholder-template]',
    );
    const fromTemplate = template?.content.firstElementChild?.cloneNode(true);
    if (fromTemplate instanceof HTMLElement) return fromTemplate;
    const li = document.createElement('li');
    li.className = 'discog__item';
    li.setAttribute('data-playlist-placeholder', '');
    li.setAttribute('aria-hidden', 'true');
    return li;
  };

  const removePlaceholders = () => {
    for (const row of placeholderRows()) row.remove();
  };

  /** Pad leading/trailing inert slots when n < 3. Never duplicate reals. */
  const applyPlaceholders = () => {
    removePlaceholders();
    const list = playlistList();
    if (!list) return;
    const rows = realPlaylistRows();
    const n = rows.length;
    if (n >= PLAYLIST_WINDOW_SLOTS) return;
    const win = playlistWindow(n, currentRowIndex(rows));
    let lead = 0;
    for (const idx of win.indices) {
      if (idx === 'placeholder') lead += 1;
      else break;
    }
    let trail = 0;
    for (let k = win.indices.length - 1; k >= 0; k -= 1) {
      if (win.indices[k] === 'placeholder') trail += 1;
      else break;
    }
    for (let k = 0; k < lead; k += 1) {
      list.insertBefore(createPlaceholderRow(), list.firstChild);
    }
    for (let k = 0; k < trail; k += 1) {
      list.appendChild(createPlaceholderRow());
    }
  };

  const measureThreeSlotHeights = (): number[] => {
    const rows = realPlaylistRows();
    const n = rows.length;
    const win = playlistWindow(n, currentRowIndex(rows));
    const typical = rows[0] ? measurePlausibleRowPx(rows[0], 'playlist') : 0;
    const placeholders = placeholderRows();
    let ph = 0;
    return win.indices.map((idx) => {
      if (idx === 'placeholder') {
        const node = placeholders[ph];
        ph += 1;
        return node ? Math.max(measurePlausibleRowPx(node, 'playlist', typical), typical) : typical;
      }
      return measurePlausibleRowPx(rows[idx], 'playlist', typical);
    });
  };

  const setPlaylistViewportVar = () => {
    const heights = measureThreeSlotHeights();
    const viewport = playlistViewportPx(heights, playlistGapPx(), PLAYLIST_WINDOW_SLOTS);
    dock?.style.setProperty('--player-playlist-viewport-h', `${Math.max(0, viewport)}px`);
  };

  const scrollWindowIntoView = () => {
    const section = playlistSection();
    const rows = realPlaylistRows();
    if (!section || !rows.length) return;
    const win = playlistWindow(rows.length, currentRowIndex(rows));
    const firstReal = win.indices.find((idx): idx is number => idx !== 'placeholder');
    const lastReal = [...win.indices].reverse().find((idx): idx is number => idx !== 'placeholder');
    if (firstReal === undefined || lastReal === undefined) return;
    const first = rows[firstReal];
    const last = rows[lastReal];
    if (!first || !last) return;
    const port = section.getBoundingClientRect();
    const firstTop = first.getBoundingClientRect().top - port.top + section.scrollTop;
    if (win.slot === 'bottom') {
      const lastBottom = last.getBoundingClientRect().bottom - port.top + section.scrollTop;
      section.scrollTop = Math.max(0, lastBottom - section.clientHeight);
      return;
    }
    section.scrollTop = Math.max(0, firstTop);
  };

  const visibleRealIndices = () => {
    const section = playlistSection();
    const rows = realPlaylistRows();
    if (!section) return rows.map((_, index) => index);
    const port = section.getBoundingClientRect();
    const visible: number[] = [];
    rows.forEach((row, index) => {
      const box = row.getBoundingClientRect();
      if (box.bottom > port.top + 1 && box.top < port.bottom - 1) visible.push(index);
    });
    return visible;
  };

  const rewindowIfNeeded = () => {
    if (!dock?.classList.contains('is-theme-tracks')) return;
    if (dock.classList.contains('is-playlist-morphing')) return;
    const rows = realPlaylistRows();
    const next = currentRowIndex(rows);
    if (!shouldRewindow(visibleRealIndices(), next)) return;
    applyPlaceholders();
    setPlaylistViewportVar();
    scrollWindowIntoView();
  };

  /** Test-only SC-010 fixture. Never the live four-track catalog. */
  const applyPlaylistFixture = () => {
    const raw = new URLSearchParams(window.location.search).get('playlist-fixture');
    if (raw !== '1' && raw !== '2') return;
    const want = Number(raw);
    const rows = Array.from(
      dock?.querySelectorAll<HTMLElement>('.discog[data-theme-tracks] .discog__item[data-discog-item]') ??
        [],
    );
    const current = rows.find((row) => row.dataset.discogActive === 'true');
    const keep = new Set<HTMLElement>();
    if (current) keep.add(current);
    for (const row of rows) {
      if (keep.size >= want) break;
      keep.add(row);
    }
    for (const row of rows) {
      if (keep.has(row)) continue;
      row.hidden = true;
      row.setAttribute('data-playlist-fixture-hide', '');
      row.setAttribute('aria-hidden', 'true');
    }
  };

  const flushPendingPlaylist = () => {
    if (pendingPlaylist === null) return;
    if (dock?.classList.contains('is-sheet-morphing')) return;
    if (!expanded) {
      pendingPlaylist = null;
      return;
    }
    const next = pendingPlaylist;
    pendingPlaylist = null;
    morphPlaylist?.(next);
  };

  const startSheetMorph = (fromPx: number, collapsedH: number) => {
    html.setAttribute('data-player-sheet-morphing', '');
    dock?.classList.add('is-sheet-morphing');
    const span = Math.max(fromPx, collapsedH + 1);
    setSheetHeight(fromPx, collapsedH, span);
  };

  const afterSheetMorph = (
    token: number,
    then?: () => void,
    keepHeight = false,
    waitMs = PHONE_PANEL_PHASE_MS,
  ) => {
    window.clearTimeout(sheetMorphTimer);
    const run = () => {
      if (token !== sheetMorphGen) return;
      then?.();
      if (token !== sheetMorphGen) return;
      endSheetMorphStyles({ keepHeight });
    };
    if (motionMq.matches) {
      run();
      return;
    }
    sheetMorphTimer = window.setTimeout(run, waitMs);
  };

  morphPlayerSheet = (toOpen: boolean) => {
    if (!dock || !phoneMq.matches) {
      applyExpanded(toOpen, { animated: false });
      return;
    }
    if (motionMq.matches) {
      applyExpanded(toOpen, { animated: false });
      if (toOpen) {
        refreshSoloCardPx();
        fitSheetToSoloCard();
      } else {
        pendingPlaylist = null;
        endSheetMorphStyles();
      }
      flushPendingPlaylist();
      return;
    }

    const token = ++sheetMorphGen;
    stopPlaylistPin();
    dock.classList.remove('is-playlist-morphing');
    dock.classList.toggle('is-sheet-collapsing', !toOpen);
    flavorDockGlitch(PHONE_PANEL_PHASE_MS);
    const collapsedH = collapsedHeightPx();
    // First open must start from the CSS floor token, not a bloated first-paint box.
    const fromH =
      toOpen && !expanded ? collapsedH : readDockHeight() || (toOpen ? collapsedH : openHeightPx());

    // Lock current height first so is-open cannot jump the sheet.
    startSheetMorph(fromH, collapsedH);
    void dock.offsetHeight;

    if (toOpen && !expanded) {
      applyExpanded(true, { animated: false });
      void dock.offsetHeight;
    }

    refreshSoloCardPx();
    // Solo stack only — never playlist/full-list height or 1fr/50svh.
    const toH = toOpen ? measureSoloOpenPx(collapsedH) : collapsedH;
    void dock.offsetHeight;
    setSheetHeight(toH, collapsedH, Math.max(toH, fromH, collapsedH + 1));

    afterSheetMorph(
      token,
      () => {
        if (!toOpen) {
          pendingPlaylist = null;
          applyExpanded(false, { animated: false });
        } else window.requestAnimationFrame(fitSheetToSoloCard);
        flushPendingPlaylist();
      },
      false,
    );
  };

  morphPlaylist = (open: boolean) => {
    if (!dock) return;
    const phone = phoneMq.matches;
    const already = dock.classList.contains('is-theme-tracks');
    if (already === open) return;
    // Phone open/close owns the sheet — queue last-committed playlist until it settles.
    if (
      phone &&
      dock.classList.contains('is-sheet-morphing') &&
      !dock.classList.contains('is-playlist-morphing')
    ) {
      pendingPlaylist = open;
      return;
    }

    // Last committed playlist wins — cancel an in-flight playlist morph.
    window.cancelAnimationFrame(settleRaf);
    window.clearTimeout(sheetMorphTimer);
    stopPlaylistPin();
    cancelPlaylistRowAnims();

    if (motionMq.matches) {
      if (open) applyPlaceholders();
      else removePlaceholders();
      document.dispatchEvent(
        new CustomEvent('phone-player-playlist-apply', { detail: { open, phase: 'instant' } }),
      );
      if (open) {
        setPlaylistViewportVar();
        if (phone) {
          const collapsedH = collapsedHeightPx();
          const toH = openHeightPx();
          html.setAttribute('data-player-sheet-sized', '');
          setSheetHeight(toH, collapsedH, toH);
        }
        scrollWindowIntoView();
      } else {
        dock.style.removeProperty('--player-playlist-viewport-h');
        if (phone) fitSheetToSoloCard();
      }
      return;
    }

    const token = ++sheetMorphGen;
    flavorDockGlitch(PLAYLIST_MORPH_MS);
    const collapsedH = collapsedHeightPx();
    const fromH = readDockHeight() || openHeightPx();
    const list = playlistList();
    const section = playlistSection();
    // Capture the well before morph classes / max-height can snap it.
    const fromSectionH = section?.getBoundingClientRect().height ?? 0;

    if (open) {
      applyPlaceholders();
      // New pads start collapsed so they grow with the two companion rows.
      for (const row of placeholderRows()) {
        row.style.height = '0px';
        row.style.overflow = 'hidden';
        row.style.opacity = '0';
      }
    }

    const rows = realPlaylistRows();
    const win = playlistWindow(rows.length, currentRowIndex(rows));
    const windowReals = new Set(
      win.indices.filter((idx): idx is number => idx !== 'placeholder'),
    );
    const playing = playingPlaylistRow();
    const companions = [
      ...rows.filter((row, idx) => windowReals.has(idx) && row !== playing),
      ...placeholderRows(),
    ];
    const extras = open
      ? companions
      : playlistRows().filter((row) => row !== playing);

    const playingChrome = playing ? getComputedStyle(playing) : null;
    const openPadY = playingChrome?.paddingTop || '0px';
    const openBorder = playingChrome?.borderTopWidth || '1px';

    const extraFrom = extras.map((row) => ({
      el: row,
      from: row.getBoundingClientRect().height,
    }));

    dock.getAnimations().forEach((anim) => {
      if (anim instanceof CSSAnimation || anim instanceof CSSTransition) return;
      anim.cancel();
    });

    document.dispatchEvent(
      new CustomEvent('phone-player-playlist-apply', { detail: { open, phase: 'prepare' } }),
    );

    // Lock extras BEFORE is-theme-tracks so dest-height rows cannot flash.
    for (const row of extraFrom) {
      row.el.style.height = `${Math.max(0, row.from)}px`;
      row.el.style.overflow = 'hidden';
      row.el.style.opacity = open ? '0' : '1';
      row.el.style.visibility = 'visible';
      row.el.style.clipPath = 'none';
      row.el.style.flexShrink = '0';
      row.el.style.flexGrow = '0';
      row.el.classList.remove('is-playlist-collapsed');
      if (open) {
        row.el.style.paddingTop = '0px';
        row.el.style.paddingBottom = '0px';
        row.el.style.borderTopWidth = '0px';
        row.el.style.borderBottomWidth = '0px';
        if (!row.el.hasAttribute('data-playlist-placeholder')) {
          row.el.removeAttribute('aria-hidden');
        }
      } else {
        row.el.style.paddingTop = openPadY;
        row.el.style.paddingBottom = openPadY;
        row.el.style.borderTopWidth = openBorder;
        row.el.style.borderBottomWidth = openBorder;
      }
    }

    // Off-window reals stay collapsed during open (no dest-height flash).
    if (open) {
      for (const row of rows) {
        if (row === playing || windowReals.has(rows.indexOf(row))) continue;
        row.style.height = '0px';
        row.style.overflow = 'hidden';
        row.style.opacity = '0';
        row.style.visibility = 'hidden';
      }
    }

    if (playing) {
      const fromMode = open ? 'solo' : 'playlist';
      const naturalFrom = measurePlausibleRowPx(playing, fromMode);
      const liveH = playing.getBoundingClientRect().height;
      const lockH =
        liveH > 1 && liveH <= naturalFrom + 8 ? liveH : naturalFrom;
      playing.style.height = `${Math.max(0, lockH)}px`;
      playing.style.overflow = 'hidden';
      playing.style.flexShrink = '0';
      playing.style.flexGrow = '0';
      playing.style.position = 'relative';
      playing.style.zIndex = '3';
      playing.style.transform = 'none';
    }

    // Settled playlist gap from frame 0 — zeroing it packed the FLIP, then
    // settle re-inserted `--discog-row-gap` and shoved the cards.
    const gapPx = playlistGapPx();
    if (list) list.style.gap = `${gapPx}px`;

    if (!phone) {
      // Lock the box now so is-playlist-morphing cannot pop max-height.
      dock.style.overflow = 'hidden';
      dock.style.height = `${fromH}px`;
    }
    dock.classList.add('is-playlist-morphing');
    if (phone) startSheetMorph(fromH, collapsedH);
    void dock.offsetHeight;

    const typicalPlaylist = playing
      ? measurePlausibleRowPx(playing, 'playlist')
      : extraFrom[0]
        ? measurePlausibleRowPx(extraFrom[0].el, 'playlist')
        : 0;

    const extraTo = extraFrom.map((row) => ({
      ...row,
      to: open ? measurePlausibleRowPx(row.el, 'playlist', typicalPlaylist) : 0,
    }));

    const playingH = playing
      ? measurePlausibleRowPx(playing, open ? 'playlist' : 'solo', typicalPlaylist)
      : 0;

    const applyPlaylistClass = () => {
      document.dispatchEvent(
        new CustomEvent('phone-player-playlist-apply', { detail: { open, phase: 'apply' } }),
      );
    };
    // Desktop: flip faces with the morph (no leftover CURRENTLY PLAYING).
    // Phone open still waits a frame so dest-height rows cannot flash.
    if (open && phone) {
      window.requestAnimationFrame(() => {
        if (token !== sheetMorphGen) return;
        applyPlaylistClass();
      });
    } else {
      applyPlaylistClass();
      void dock.offsetHeight;
    }

    // Solo target after playlist class drops so wrap includes settled gap CSS.
    const toH = open
      ? measurePlaylistOpenPx(collapsedH, measureThreeSlotHeights(), gapPx)
      : measureSoloOpenPx(collapsedH);

    if (phone) startSheetMorph(fromH, collapsedH);

    const ease = 'cubic-bezier(0.22, 1, 0.36, 1)';
    const duration = PLAYLIST_MORPH_MS;
    void dock.offsetHeight;

    // Slot is layout, not a dest-Y estimate: companions above grow from 0 and
    // push the current card into TOP/MIDDLE/BOTTOM. Pre-translate by
    // extraTo[0] * slot yanked the solo card and scaled with blown row clones.

    if (!phone && open) setPlaylistViewportVar();
    const desktopDestSection = open
      ? Number.parseFloat(dock.style.getPropertyValue('--player-playlist-viewport-h')) || playingH
      : playingH;
    const desktopToH = morphBoxPx(fromH, fromSectionH, desktopDestSection);

    const sheetAnim = dock.animate(
      [{ height: `${fromH}px` }, { height: `${phone ? toH : desktopToH}px` }],
      {
        duration,
        easing: ease,
        fill: 'forwards',
      },
    );

    // Close interpolates gap away with the shrink so solo settle does not
    // drop leftover gaps between height:0 siblings. Open keeps gapPx.
    const listAnim =
      !open && list && gapPx > 0
        ? list.animate(
            [{ gap: `${gapPx}px` }, { gap: '0px' }],
            { duration, easing: ease, fill: 'forwards' },
          )
        : null;

    const playFromH = playing ? playing.getBoundingClientRect().height : 0;
    const playingAnims: Animation[] = [];
    if (playing) {
      if (Math.abs(playFromH - playingH) > 1) {
        playingAnims.push(
          playing.animate(
            [{ height: `${Math.max(0, playFromH)}px` }, { height: `${Math.max(0, playingH)}px` }],
            { duration, easing: ease, fill: 'forwards' },
          ),
        );
      }
    }

    // Only the other two visible rows grow in; extras leave with the shrink.
    const rowAnims = extraTo.map((row) => {
      row.el.style.visibility = 'visible';
      const fromPad = open ? '0px' : openPadY;
      const toPad = open ? openPadY : '0px';
      const fromBorder = open ? '0px' : openBorder;
      const toBorder = open ? openBorder : '0px';
      return row.el.animate(
        [
          {
            height: `${Math.max(0, row.from)}px`,
            opacity: open ? 0 : 1,
            paddingTop: fromPad,
            paddingBottom: fromPad,
            borderTopWidth: fromBorder,
            borderBottomWidth: fromBorder,
          },
          {
            height: `${Math.max(0, row.to)}px`,
            opacity: open ? 1 : 0,
            paddingTop: toPad,
            paddingBottom: toPad,
            borderTopWidth: toBorder,
            borderBottomWidth: toBorder,
          },
        ],
        { duration, easing: ease, fill: 'forwards' },
      );
    });

    const finish = () => {
      if (token !== sheetMorphGen) return;
      stopPlaylistPin();
      document.dispatchEvent(
        new CustomEvent('phone-player-playlist-apply', { detail: { open, phase: 'commit' } }),
      );
      if (open) {
        for (const row of extraTo) {
          if (!row.el.hasAttribute('data-playlist-placeholder')) {
            row.el.removeAttribute('aria-hidden');
          }
          row.el.classList.remove('is-playlist-collapsed');
        }
        for (const row of rows) {
          row.style.removeProperty('visibility');
        }
        if (phone) setPlaylistViewportVar();
      } else {
        for (const row of extraTo) {
          if (!row.el.hasAttribute('data-playlist-placeholder')) {
            row.el.setAttribute('aria-hidden', 'true');
            row.el.classList.add('is-playlist-collapsed');
          }
        }
        removePlaceholders();
        dock.style.removeProperty('--player-playlist-viewport-h');
        if (section) section.scrollTop = 0;
        if (list) list.scrollTop = 0;
      }
      if (phone) {
        setSheetHeight(toH, collapsedH, Math.max(toH, fromH, collapsedH + 1));
      }
      sheetAnim.cancel();
      listAnim?.cancel();
      for (const anim of playingAnims) anim.cancel();
      if (!phone) {
        dock.style.removeProperty('height');
        dock.style.removeProperty('overflow');
        dock.classList.remove('is-playlist-morphing');
        cancelPlaylistRowAnims();
        if (open) scrollWindowIntoView();
        return;
      }
      if (open) {
        endSheetMorphStyles({ keepHeight: true });
        scrollWindowIntoView();
        return;
      }
      endSheetMorphStyles({ keepHeight: true });
      const soloH = measureSoloOpenPx(collapsedH);
      setSheetHeight(soloH, collapsedH, soloH);
      window.requestAnimationFrame(() => {
        if (token !== sheetMorphGen) return;
        fitSheetToSoloCard();
      });
    };

    let settled = false;
    const finishOnce = () => {
      if (settled || token !== sheetMorphGen) return;
      settled = true;
      finish();
    };

    void Promise.all([
      sheetAnim?.finished.catch(() => undefined),
      listAnim?.finished.catch(() => undefined),
      ...playingAnims.map((anim) => anim.finished.catch(() => undefined)),
      ...rowAnims.map((anim) => anim.finished.catch(() => undefined)),
    ]).then(finishOnce);
    const waitMs = PLAYLIST_MORPH_MS + 48;
    if (phone) {
      afterSheetMorph(token, finishOnce, open, waitMs);
    } else {
      window.clearTimeout(sheetMorphTimer);
      sheetMorphTimer = window.setTimeout(finishOnce, waitMs);
    }
  };

  const settleSheet = (fromH: number, toOpen: boolean, collapsedH: number, openH: number) => {
    window.cancelAnimationFrame(settleRaf);
    const toH = toOpen ? openH : collapsedH;
    const commit = () => {
      setSheetHeight(toH, collapsedH, openH);
      // Same end classes as a click. Drag already interpolated height —
      // skip a second open/close morph.
      if (toOpen) {
        if (!expanded) applyExpanded(true, { animated: false });
        else scheduleHint();
      } else if (expanded) {
        // Drag already interpolated height — do not start a second close morph.
        // Playlist class stays through the shrink; drop it only after settle.
        pendingPlaylist = null;
        removePlaceholders();
        dock?.style.removeProperty('--player-playlist-viewport-h');
        applyExpanded(false, { animated: false });
      } else {
        scheduleHint();
      }
      window.requestAnimationFrame(() => {
        const playlist = Boolean(dock?.classList.contains('is-theme-tracks'));
        endSheetDragStyles({ keepHeight: toOpen && playlist });
        if (toOpen && !playlist) fitSheetToSoloCard();
        flushPendingPlaylist();
      });
    };
    if (motionMq.matches || Math.abs(toH - fromH) < 2) {
      commit();
      return;
    }
    flavorDockGlitch(SETTLE_MS);
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / SETTLE_MS);
      const eased = 1 - (1 - t) ** 3;
      setSheetHeight(fromH + (toH - fromH) * eased, collapsedH, openH);
      if (t < 1) {
        settleRaf = window.requestAnimationFrame(tick);
        return;
      }
      commit();
    };
    settleRaf = window.requestAnimationFrame(tick);
  };

  const blockHandleOverscroll = (event: TouchEvent) => {
    // WebKit pull-to-refresh: the larger hitbox must own the gesture.
    event.preventDefault();
  };
  handle?.addEventListener('touchstart', blockHandleOverscroll, { passive: false });
  handle?.addEventListener('touchmove', blockHandleOverscroll, { passive: false });

  const dismissPhoneContentForPlayer = () => {
    if (!phoneMq.matches) return;
    const cluster = document.querySelector<HTMLElement>('[data-stage-panels]');
    if (cluster?.classList.contains('is-sheet-closing')) return;
    if (sheetCtl?.isOpen()) sheetCtl.close({ animated: true });
  };

  const pointHitsHandle = (x: number, y: number) => {
    if (!handle) return false;
    const r = handle.getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return true;
    return document.elementsFromPoint(x, y).includes(handle);
  };

  const swallowNextClick = () => {
    const eat = (clickEvent: Event) => {
      clickEvent.preventDefault();
      clickEvent.stopPropagation();
    };
    document.addEventListener('click', eat, true);
    window.setTimeout(() => document.removeEventListener('click', eat, true), 50);
  };

  const armHandlePointer = (event: PointerEvent, opts?: { retargeted?: boolean }) => {
    if (!phoneMq.matches || !handle) return;
    if (drag?.pointerId === event.pointerId) return;
    window.cancelAnimationFrame(settleRaf);
    window.clearTimeout(sheetMorphTimer);
    sheetMorphGen += 1;
    stopPlaylistPin();
    if (dock?.classList.contains('is-sheet-morphing')) {
      const liveH = readDockHeight();
      startSheetMorph(liveH, collapsedHeightPx());
    }
    // Keep the open px lock — dropping it here unlocked 1fr/50svh for a frame.
    endSheetDragStyles({ keepHeight: expanded });
    const collapsedH = collapsedHeightPx();
    const fromPlaylist = Boolean(expanded && dock?.classList.contains('is-theme-tracks'));
    const openH = measureDragOpenPx(collapsedH, fromPlaylist);
    drag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startT: performance.now(),
      lastX: event.clientX,
      lastY: event.clientY,
      lastT: performance.now(),
      velocity: 0,
      moved: false,
      startH: readDockHeight() || (expanded ? openH : collapsedH),
      collapsedH,
      openH,
      fromExpanded: expanded,
      fromPlaylist,
      retargeted: Boolean(opts?.retargeted),
    };
    try {
      handle.setPointerCapture(event.pointerId);
    } catch {
      // Pointer may already be released (lost capture / synthetic).
    }
  };

  handle?.addEventListener('pointerdown', (event) => {
    if (!phoneMq.matches || !handle) return;
    // Close About / Discography / Tour / socials / Info on the same gesture as the swipe.
    dismissPhoneContentForPlayer();
    armHandlePointer(event);
  });

  handle?.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const now = performance.now();
    const dt = now - drag.lastT;
    if (dt > 0) drag.velocity = (event.clientY - drag.lastY) / dt;
    drag.lastX = event.clientX;
    drag.lastY = event.clientY;
    drag.lastT = now;
    const travel = Math.abs(event.clientY - drag.startY);
    if (!drag.moved && travel < TAP_SLOP_PX) return;
    const rawH = drag.startH + (drag.startY - event.clientY);
    if (!drag.moved) {
      drag.moved = true;
      beginSheetDrag(drag.startH, drag.collapsedH, drag.openH);
      drag.openH = measureDragOpenPx(drag.collapsedH, drag.fromPlaylist);
    }
    const height = applyDragHeight(rawH, drag.collapsedH, drag.openH);
    syncCollapseChrome(height, drag.openH, drag.fromExpanded);
    setSheetHeight(height, drag.collapsedH, drag.openH);
  });

  const finishHandleDrag = (
    event: Pick<PointerEvent, 'pointerId' | 'type' | 'clientY'> & { clientX?: number },
  ) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const session = drag;
    drag = undefined;
    if (handle?.hasPointerCapture(session.pointerId)) {
      handle.releasePointerCapture(session.pointerId);
    }
    if (!session.moved) {
      // pointercancel / blur abort — not a tap. Click still handles 015 single-tap.
      if (event.type === 'pointercancel') return;

      const now = performance.now();
      const viewH = window.innerHeight || 0;
      const inView = event.clientY >= 0 && event.clientY <= viewH;
      const useEventPoint = event.type === 'pointerup' && inView;
      const endX = useEventPoint && event.clientX != null ? event.clientX : session.lastX;
      const endY = useEventPoint ? event.clientY : session.lastY;
      const travel = Math.hypot(endX - session.startX, endY - session.startY);
      const duration = now - session.startT;
      if (!isHandlePointerTap(travel, duration)) return;

      const consumed = consumeHandlePointerTap(now, lastPointerTapAt);
      lastPointerTapAt = consumed.nextLastPointerTapMs;
      // Click still single-taps (015). When click never fires (capture +
      // touchstart preventDefault), two pointerups inside 450ms toggle once.
      // Retargeted first tap has no click — toggle immediately.
      // Echo lock after a successful toggle stops the extra half from undoing.
      if (consumed.paired || session.retargeted) {
        suppressClickAfterPointerToggle();
        toggleFromHandleTap();
      }
      return;
    }

    // Swallow the click that follows a real drag. pointercancel has no click.
    if (event.type === 'pointerup') {
      suppressHandleClick = true;
      window.setTimeout(() => {
        suppressHandleClick = false;
      }, 50);
    }
    // lostpointercapture / pointercancel often report clientY 0. Pointerup
    // outside the viewport can too. Snap from the last in-view sample.
    const viewH = window.innerHeight || 0;
    const inView = event.clientY >= 0 && event.clientY <= viewH;
    const endY = event.type === 'pointerup' && inView ? event.clientY : session.lastY;
    const deltaUp = session.startY - endY;
    const height = applyDragHeight(
      session.startH + deltaUp,
      session.collapsedH,
      session.openH,
    );
    setSheetHeight(height, session.collapsedH, session.openH);
    const flickedOpen = session.velocity < -FLICK_PX_MS;
    const flickedClosed = session.velocity > FLICK_PX_MS;
    let next = session.fromExpanded;
    if (flickedOpen) next = true;
    else if (flickedClosed) next = false;
    else if (deltaUp >= SNAP_PX) next = true;
    else if (deltaUp <= -SNAP_PX) next = false;
    settleSheet(height, next, session.collapsedH, session.openH);
  };

  handle?.addEventListener('pointerup', finishHandleDrag);
  handle?.addEventListener('pointercancel', finishHandleDrag);
  handle?.addEventListener('lostpointercapture', finishHandleDrag);
  // Capture can drop when the pointer leaves the window; still finish the gesture.
  window.addEventListener('pointerup', finishHandleDrag);
  window.addEventListener('pointercancel', finishHandleDrag);
  window.addEventListener('blur', () => {
    if (!drag) return;
    finishHandleDrag({ pointerId: drag.pointerId, type: 'pointercancel', clientY: drag.lastY });
  });

  socialsBtn?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!phoneMq.matches) return;
    requestPhoneContent('socials');
  });

  document.addEventListener(
    'pointerdown',
    (event) => {
      if (!phoneMq.matches) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (isIntroActive()) return;
      // Legal fullscreen is outside [data-stage-panels]; Exit / backdrop must
      // not collapse the Info sheet (or V-Flip) sitting behind it.
      if (isLegalOverlayOpen()) return;
      if (target.closest('#legal-overlay, [data-legal-panel]')) return;

      const onHandle = Boolean(target.closest('[data-player-handle]'));
      const overHandle = pointHitsHandle(event.clientX, event.clientY);
      const onHudIcon = Boolean(
        target.closest('[data-stage-panel-trigger], [data-socials-trigger], [data-stage-panel-icons]'),
      );
      // Open sheet may paint over the handle. First pointer on that strip
      // closes the bar and continues as a player swipe — no second gesture.
      if ((onHandle || overHandle) && !onHudIcon) {
        dismissPhoneContentForPlayer();
        if (!onHandle && overHandle && handle) {
          event.preventDefault();
          event.stopPropagation();
          armHandlePointer(event, { retargeted: true });
          swallowNextClick();
        }
        return;
      }

      // Sheet, dock icons, socials links: stay open (icons still exclusive-switch).
      if (target.closest('[data-stage-panels]')) return;
      if (target.closest('#stage-socials') || target.closest('.stage__socials')) return;

      if (sheetCtl?.isOpen()) sheetCtl.close({ animated: true });

      // Pointer left the viewport without pointerup: empty-space press must
      // settle the sheet (lastY), not restack the HUD pill above it.
      if (drag) {
        const moved = drag.moved;
        finishHandleDrag({
          pointerId: drag.pointerId,
          type: 'pointercancel',
          clientY: drag.lastY,
        });
        if (moved) return;
      }
      if (html.hasAttribute('data-player-sheet-dragging')) return;

      // V-Flip collapses on backdrop too, unless the tap is on the player pill.
      const onPlayer = Boolean(target.closest('[data-player-dock], [data-jukebox]'));
      if (expanded && !onPlayer) applyExpanded(false);
    },
    { capture: true, passive: false },
  );

  document.addEventListener('phone-player-playlist', (event) => {
    const open = Boolean((event as CustomEvent<{ open?: boolean }>).detail?.open);
    morphPlaylist?.(open);
  });

  document.addEventListener('phone-hud-request-collapse', () => {
    if (!phoneMq.matches) return;
    applyExpanded(false);
  });

  document.addEventListener('vflip-list-change', (event) => {
    if (!phoneMq.matches) return;
    const open = Boolean((event as CustomEvent<{ open?: boolean }>).detail?.open);
    if (open) closePhoneSheetsExcept('vflip-list');
    // Exclusive-open (About / socials / backdrop) closing V-Flip also collapses the pill.
    applyExpanded(open, { syncVflip: false });
  });

  phoneMq.addEventListener('change', (event) => {
    parkPhoneTransport();
    parkPhoneSocials();
    pendingPlaylist = null;
    window.cancelAnimationFrame(settleRaf);
    window.clearTimeout(sheetMorphTimer);
    sheetMorphGen += 1;
    stopPlaylistPin();
    removePlaceholders();
    dock?.style.removeProperty('--player-playlist-viewport-h');
    endSheetDragStyles();
    endSheetMorphStyles();
    if (event.matches) {
      const nowPlaying = document.querySelector<HTMLElement>('[data-now-playing]');
      nowPlaying?.removeAttribute('title');
      const vflipOpen = Boolean(dock?.classList.contains('is-open'));
      applyExpanded(vflipOpen, { syncVflip: false });
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

  endSheetDragStyles();
  applyPlaylistFixture();
  const themeList = playlistList();
  if (themeList) {
    new MutationObserver(() => {
      if (!phoneMq.matches) return;
      rewindowIfNeeded();
    }).observe(themeList, {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-discog-active'],
    });
  }
  if (phoneMq.matches) {
    document.querySelector<HTMLElement>('[data-now-playing]')?.removeAttribute('title');
    window.requestAnimationFrame(refreshSoloCardPx);
  }

  if (!isIntroActive()) scheduleHint();

  initBgVideoToggle();
  watchPlayerPause(syncDesktopNowTitle, syncDesktopNowTitle);
  syncDesktopNowTitle();
}

/**
 * Play/pause the hero/stage `<video>` (that *is* the music) on phone and desktop.
 * Writes `html[data-player-paused]` so the soundwave + shuffle clock freeze together.
 */
function initBgVideoToggle(): void {
  const btn = document.querySelector<HTMLButtonElement>('[data-bg-play-toggle]');
  if (!btn) return;

  const playLabel = btn.dataset.playLabel ?? 'Play';
  const pauseLabel = btn.dataset.pauseLabel ?? 'Pause';
  const playIcon = btn.querySelector<HTMLElement>('[data-bg-play-icon="play"]');
  const pauseIcon = btn.querySelector<HTMLElement>('[data-bg-play-icon="pause"]');
  const atmosphere = document.querySelector<HTMLElement>('[data-atmosphere]');

  const getVideo = () => document.querySelector<HTMLVideoElement>('[data-bg-video]');

  let boundVideo: HTMLVideoElement | null = null;

  const sync = () => {
    const video = getVideo();
    const fallback = atmosphere?.getAttribute('data-bg-state') === 'fallback';
    const playing = Boolean(video && !fallback && !video.paused && !video.ended);
    btn.disabled = !video || fallback;
    const label = playing ? pauseLabel : playLabel;
    btn.setAttribute('aria-label', label);
    btn.dataset.hudLabel = label;
    if (playIcon) playIcon.hidden = playing;
    if (pauseIcon) pauseIcon.hidden = !playing;
    // Fallback / missing video is not a user pause — leave shuffle + wave alone.
    if (!video || fallback) {
      setPlayerPaused(false);
    } else {
      setPlayerPaused(!playing);
    }
    syncDesktopNowTitle();
  };

  const bindVideoEvents = () => {
    const video = getVideo();
    if (boundVideo === video) return;
    boundVideo?.removeEventListener('play', sync);
    boundVideo?.removeEventListener('pause', sync);
    boundVideo = video;
    video?.addEventListener('play', sync);
    video?.addEventListener('pause', sync);
  };

  btn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    // Same atmosphere <video> as phone — do not phone-gate (019 desktop toolbar).
    const video = getVideo();
    if (!video || atmosphere?.getAttribute('data-bg-state') === 'fallback') return;
    if (video.paused) {
      void video.play()?.catch(() => {});
    } else {
      video.pause();
    }
    sync();
  });

  atmosphere?.addEventListener('bg-state-change', () => {
    bindVideoEvents();
    sync();
  });

  bindVideoEvents();
  sync();
}
