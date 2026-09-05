import { initEqFlatten } from './eq-flatten';
import { isIntroActive, setPlayerPaused } from './playback';
import { PHONE_PANEL_PHASE_MS } from './panel-motion';

/** Phone HUD media query (SC-007: 1023 = phone, 1024 = laptop). */
export const PHONE_MQ = '(max-width: 1023px)';

/** About / Discography / Tour / socials / info — one pill, exclusive-open. */
export type PhoneContentSheet = 'about' | 'discography' | 'tour' | 'socials' | 'info';

const HINT_NODS = 3;
const HINT_PERIOD_MS = 60_000;
/** Finger travel (px) before a handle drag snaps open/closed. */
const SNAP_PX = 40;
/** Below this, pointerup is a tap (click still toggles). */
const TAP_SLOP_PX = 8;
/** Dampen overscroll past the fully-open cap only. */
const RUBBER = 0.32;
/** Finger past fully open: rubber-band this many px, then snap back. */
const OVERSCROLL_PX_MAX = 18;
const SETTLE_MS = 220;
const FLICK_PX_MS = 0.45;

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
  // Phone: never attach a native tooltip (long-press / hover).
  if (label && !isPhoneHud()) el.setAttribute('title', label);
  else el.removeAttribute('title');
}

type ExtraSheet = 'about' | 'discography' | 'tour' | 'vflip-list' | 'socials' | 'info';

function panelKind(details: HTMLDetailsElement): ExtraSheet | undefined {
  const kind = details.dataset.stagePanel;
  if (kind === 'about' || kind === 'discography' || kind === 'tour' || kind === 'info') {
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
  let settleRaf = 0;
  let drag:
    | {
        pointerId: number;
        startY: number;
        lastY: number;
        lastT: number;
        velocity: number;
        moved: boolean;
        startH: number;
        collapsedH: number;
        openH: number;
        fromExpanded: boolean;
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
    const wantAnim =
      Boolean(morphPlayerSheet) &&
      opts?.animated !== false &&
      phoneMq.matches &&
      !motionMq.matches &&
      !html.hasAttribute('data-player-sheet-dragging');

    if (wantAnim && expanded !== next && syncVflip) {
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

    // Phone: pill expanded opens V-Flip; collapsed closes it.
    if (changed && syncVflip && phoneMq.matches) {
      if (next) {
        closePhoneSheetsExcept('vflip-list');
        document.dispatchEvent(
          new CustomEvent('phone-hud-open-vflip', {
            detail: { animated: opts?.animated !== false },
          }),
        );
      } else {
        closeVflipList(opts?.animated !== false);
      }
    }
  };

  applyExpanded(false);

  handle?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (suppressHandleClick) {
      suppressHandleClick = false;
      return;
    }
    if (!phoneMq.matches) return;
    applyExpanded(!expanded);
  });

  const remPx = () => Number.parseFloat(getComputedStyle(html).fontSize) || 16;

  const readDockHeight = () => dock?.getBoundingClientRect().height ?? 0;

  const collapsedHeightPx = () => {
    if (dock && !expanded) {
      const live = readDockHeight();
      if (live > 1) return live;
    }
    const rem = remPx();
    const control =
      Number.parseFloat(getComputedStyle(dock ?? html).getPropertyValue('--control-size')) ||
      3.1 * rem;
    const gap =
      Number.parseFloat(getComputedStyle(dock ?? html).getPropertyValue('--phone-now-gap')) ||
      0.45 * rem;
    const safe =
      Number.parseFloat(getComputedStyle(dock ?? html).getPropertyValue('--phone-safe-bottom')) || 0;
    return control + 2 * gap + safe;
  };

  const sheetCapPx = () => {
    const rem = remPx();
    return Math.min(window.innerHeight * 0.68, window.innerHeight - 5.5 * rem);
  };

  const cssVarPx = (el: HTMLElement, prop: string, fallback: number) => {
    const value = Number.parseFloat(getComputedStyle(el).getPropertyValue(prop));
    return Number.isFinite(value) ? value : fallback;
  };

  const clampOpenSheetPx = (px: number, collapsedH: number) =>
    Math.min(Math.max(px, collapsedH + 8), sheetCapPx());

  /** Header box as painted when open — never the live max-height:0 / clipped rect. */
  const measureHeaderNaturalPx = () => {
    const header = dock?.querySelector<HTMLElement>('.jukebox__header');
    if (!header) return 0;
    const prev = {
      maxHeight: header.style.maxHeight,
      overflow: header.style.overflow,
      visibility: header.style.visibility,
    };
    header.style.maxHeight = 'none';
    header.style.overflow = 'visible';
    header.style.visibility = 'hidden';
    const cs = getComputedStyle(header);
    const rem = remPx();
    const hud =
      Number.parseFloat(getComputedStyle(dock ?? html).getPropertyValue('--hud-scale')) || 1;
    const marginBottom =
      Number.parseFloat(cs.marginBottom) || 0.5 * rem * hud;
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
    return natural;
  };

  /**
   * Header + transport + floor + dock padding. Never 1fr / 50svh / full-list
   * scrollHeight — those overshoot solo then clip down after the ease.
   */
  const measureSheetChromePx = () => {
    if (!dock) return 0;
    const rem = remPx();
    const dockCs = getComputedStyle(dock);
    const padTop = Number.parseFloat(dockCs.paddingTop) || 0;
    const padBottom = Number.parseFloat(dockCs.paddingBottom) || 0;
    const handle = cssVarPx(dock, '--phone-handle', 1.5 * rem);
    const nowGap = cssVarPx(dock, '--phone-now-gap', 0.45 * rem);
    // Open drawer-inner always clears the handle. Live padding is 0 while collapsed.
    const innerPadTop = handle + nowGap;
    const headerH = measureHeaderNaturalPx();
    const floorH = cssVarPx(dock, '--control-size', 3.1 * rem);
    const transportH = cssVarPx(dock, '--player-transport-h', floorH + 0.25 * rem);
    const panel = dock.querySelector<HTMLElement>('.jukebox__panel');
    const panelCs = panel ? getComputedStyle(panel) : null;
    const panelPad = panelCs
      ? (Number.parseFloat(panelCs.paddingTop) || 0) + (Number.parseFloat(panelCs.paddingBottom) || 0)
      : 0;
    return padTop + innerPadTop + headerH + panelPad + transportH + floorH + padBottom;
  };

  const playlistGapPx = () => {
    const list = playlistList();
    if (!list) return 0;
    return (
      Number.parseFloat(getComputedStyle(list).getPropertyValue('--discog-row-gap')) ||
      Number.parseFloat(getComputedStyle(list).gap) ||
      0
    );
  };

  /** Solo open target: chrome + the playing card only (title + LISTEN ON). */
  const measureSoloOpenPx = (collapsedH: number) => {
    const playing = playingPlaylistRow();
    const cardH = playing ? measureRowNaturalPx(playing, 'solo') : 0;
    const rem = remPx();
    // Extra air under LISTEN ON — last-chance measures clipped the links row.
    const cardFloor = cssVarPx(dock ?? html, '--phone-now-gap', 0.45 * rem) + 1.15 * rem;
    return clampOpenSheetPx(
      measureSheetChromePx() + Math.max(0, cardH) + cardFloor,
      collapsedH,
    );
  };

  /** Playlist open target: chrome + every row + gaps. */
  const measurePlaylistOpenPx = (collapsedH: number, rowHeights: number[], gap: number) => {
    const rowsH = rowHeights.reduce((sum, height) => sum + Math.max(0, height), 0);
    const gaps = Math.max(0, rowHeights.length - 1) * Math.max(0, gap);
    return clampOpenSheetPx(measureSheetChromePx() + rowsH + gaps, collapsedH);
  };

  const openHeightPx = () => {
    const collapsedH = collapsedHeightPx();
    if (dock?.classList.contains('is-theme-tracks')) {
      const rows = playlistRows();
      const gap = playlistGapPx();
      const heights = rows.map((row) => measureRowNaturalPx(row, 'playlist'));
      return measurePlaylistOpenPx(collapsedH, heights, gap);
    }
    return measureSoloOpenPx(collapsedH);
  };

  /** After click/drag settle: if LISTEN ON sits under transport, grow the sheet. */
  const growSheetToFitCard = () => {
    if (!dock || !expanded || dock.classList.contains('is-theme-tracks')) return;
    const playing = playingPlaylistRow();
    const listen = playing?.querySelector<HTMLElement>('.discog__listen-links');
    if (!playing || !listen) return;
    const listenBottom = listen.getBoundingClientRect().bottom;
    const transport = dock.querySelector<HTMLElement>('[data-player-transport]');
    const title = dock.querySelector<HTMLElement>('[data-now-playing]');
    const ceiling =
      (transport && transport.offsetParent
        ? transport.getBoundingClientRect().top
        : title?.getBoundingClientRect().top) ?? dock.getBoundingClientRect().bottom;
    const overflow = listenBottom + 12 - ceiling;
    if (overflow <= 1) return;
    const collapsedH = collapsedHeightPx();
    const next = clampOpenSheetPx(readDockHeight() + overflow, collapsedH);
    html.setAttribute('data-player-sheet-sized', '');
    setSheetHeight(next, collapsedH, next);
  };

  /** Drag-open cap: same solo/playlist px as a tap — never a live 1fr reflow. */
  const measureOpenHeightPx = (collapsedH: number) => {
    void collapsedH;
    return openHeightPx();
  };

  const setSheetHeight = (px: number, collapsedH: number, openH: number) => {
    const span = Math.max(1, openH - collapsedH);
    const progress = Math.min(1, Math.max(0, (px - collapsedH) / span));
    dock?.style.setProperty('--player-sheet-h', `${Math.max(0, px)}px`);
    dock?.style.setProperty('--player-sheet-progress', String(progress));
  };

  /** 1:1 height from the floor. Rubber-band only past the open cap. */
  const applyDragHeight = (rawH: number, collapsedH: number, openH: number) => {
    if (rawH > openH) {
      return openH + Math.min((rawH - openH) * RUBBER, OVERSCROLL_PX_MAX);
    }
    if (rawH < collapsedH) return collapsedH;
    return rawH;
  };

  const syncCollapseChrome = (heightPx: number, openH: number, fromExpanded: boolean) => {
    // Drag-down from open: hide transport from the first pixel. Waiting for
    // openH-4 left activated shuffle/play/playlist painted over the floor.
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
  let playlistPinRaf = 0;

  const playlistRows = () =>
    Array.from(
      dock?.querySelectorAll<HTMLElement>('.discog[data-theme-tracks] .discog__item') ?? [],
    );

  const playlistList = () =>
    dock?.querySelector<HTMLElement>('.discog[data-theme-tracks]') ?? null;

  const playingPlaylistRow = () =>
    dock?.querySelector<HTMLElement>(
      '.discog[data-theme-tracks] .discog__item[data-discog-active="true"]',
    ) ?? playlistRows()[0] ?? null;

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
      row.style.removeProperty('z-index');
      row.style.removeProperty('flex-shrink');
    }
    if (list) list.style.removeProperty('gap');
  };

  const stopPlaylistPin = () => {
    window.cancelAnimationFrame(playlistPinRaf);
    playlistPinRaf = 0;
  };

  /** Keep the playing card at a fixed viewport Y while siblings add in. */
  const pinPlayingToViewport = (
    playing: HTMLElement | null,
    section: HTMLElement | null,
    pinY: number,
  ) => {
    if (!playing || !section) return;
    const dy = playing.getBoundingClientRect().top - pinY;
    if (Math.abs(dy) > 0.5) section.scrollTop += dy;
  };

  const runPlaylistPin = (
    playing: HTMLElement | null,
    section: HTMLElement | null,
    pinY: number,
    token: number,
    duration: number,
  ) => {
    stopPlaylistPin();
    const start = performance.now();
    const tick = (now: number) => {
      if (token !== sheetMorphGen) return;
      pinPlayingToViewport(playing, section, pinY);
      if (now - start < duration) {
        playlistPinRaf = window.requestAnimationFrame(tick);
        return;
      }
      playlistPinRaf = 0;
    };
    playlistPinRaf = window.requestAnimationFrame(tick);
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
        ? 'jukebox is-player-expanded is-open'
        : 'jukebox is-player-expanded is-open is-theme-tracks';
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
      'height:auto;max-height:none;overflow:visible;visibility:hidden;pointer-events:none;z-index:-1;';
    probe.style.cssText =
      'height:auto;max-height:none;min-height:0;overflow:visible;clip-path:none;' +
      'opacity:1;visibility:visible;flex-shrink:0;';
    document.body.appendChild(shell);
    const natural = probe.getBoundingClientRect().height;
    shell.remove();
    return natural;
  };

  const startSheetMorph = (fromPx: number, collapsedH: number) => {
    html.setAttribute('data-player-sheet-morphing', '');
    dock?.classList.add('is-sheet-morphing');
    const span = Math.max(fromPx, collapsedH + 1);
    setSheetHeight(fromPx, collapsedH, span);
  };

  const afterSheetMorph = (token: number, then?: () => void, keepHeight = false) => {
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
    sheetMorphTimer = window.setTimeout(run, PHONE_PANEL_PHASE_MS);
  };

  morphPlayerSheet = (toOpen: boolean) => {
    if (!dock || !phoneMq.matches) {
      applyExpanded(toOpen, { animated: false });
      return;
    }
    if (motionMq.matches) {
      applyExpanded(toOpen, { animated: false });
      return;
    }

    const token = ++sheetMorphGen;
    stopPlaylistPin();
    dock.classList.remove('is-playlist-morphing');
    dock.classList.toggle('is-sheet-collapsing', !toOpen);
    const collapsedH = collapsedHeightPx();
    const fromH = readDockHeight() || (toOpen ? collapsedH : openHeightPx());

    // Lock current height first so is-open cannot jump the sheet.
    startSheetMorph(fromH, collapsedH);
    void dock.offsetHeight;

    if (toOpen && !expanded) {
      applyExpanded(true, { animated: false });
      void dock.offsetHeight;
    }

    // Solo stack only — never playlist/full-list height or 1fr/50svh.
    // Same unconstrained stack drag remasures after expand.
    const toH = toOpen ? measureSoloOpenPx(collapsedH) : collapsedH;
    void dock.offsetHeight;
    setSheetHeight(toH, collapsedH, Math.max(toH, fromH, collapsedH + 1));

    afterSheetMorph(
      token,
      () => {
        if (!toOpen) applyExpanded(false, { animated: false });
        else window.requestAnimationFrame(growSheetToFitCard);
      },
      toOpen,
    );
  };

  morphPlaylist = (open: boolean) => {
    if (!dock || !phoneMq.matches) return;
    const already = dock.classList.contains('is-theme-tracks');
    if (already === open) return;
    if (dock.classList.contains('is-sheet-morphing') && !dock.classList.contains('is-playlist-morphing')) {
      return;
    }

    if (motionMq.matches) {
      document.dispatchEvent(
        new CustomEvent('phone-player-playlist-apply', { detail: { open, phase: 'instant' } }),
      );
      return;
    }

    const token = ++sheetMorphGen;
    window.clearTimeout(sheetMorphTimer);
    stopPlaylistPin();
    const collapsedH = collapsedHeightPx();
    const fromH = readDockHeight() || openHeightPx();
    const list = playlistList();
    const section = dock.querySelector<HTMLElement>('.jukebox__section--theme-tracks');
    const playing = playingPlaylistRow();
    const others = playlistRows().filter((row) => row !== playing);
    const pinY = playing?.getBoundingClientRect().top ?? 0;
    const fromScroll = section?.scrollTop ?? 0;

    const playingChrome = playing ? getComputedStyle(playing) : null;
    const openPadY = playingChrome?.paddingTop || '0px';
    const openPadX = playingChrome?.paddingLeft || '0px';
    const openBorder = playingChrome?.borderTopWidth || '1px';

    const otherFrom = others.map((row) => ({
      el: row,
      from: row.getBoundingClientRect().height,
    }));

    dock.getAnimations().forEach((anim) => {
      if (anim instanceof CSSAnimation || anim instanceof CSSTransition) return;
      anim.cancel();
    });
    cancelPlaylistRowAnims();

    document.dispatchEvent(
      new CustomEvent('phone-player-playlist-apply', { detail: { open, phase: 'prepare' } }),
    );

    // Lock sibling boxes BEFORE any class that would auto-size them (open pop).
    for (const row of otherFrom) {
      row.el.style.height = `${Math.max(0, row.from)}px`;
      row.el.style.overflow = 'hidden';
      row.el.style.opacity = '1';
      row.el.style.visibility = 'visible';
      row.el.style.clipPath = 'none';
      row.el.style.flexShrink = '0';
      row.el.classList.remove('is-playlist-collapsed');
      if (open) {
        row.el.style.paddingTop = '0px';
        row.el.style.paddingBottom = '0px';
        row.el.style.borderTopWidth = '0px';
        row.el.style.borderBottomWidth = '0px';
        row.el.removeAttribute('aria-hidden');
      } else {
        row.el.style.paddingTop = openPadY;
        row.el.style.paddingBottom = openPadY;
        row.el.style.paddingLeft = openPadX;
        row.el.style.paddingRight = openPadX;
        row.el.style.borderTopWidth = openBorder;
        row.el.style.borderBottomWidth = openBorder;
      }
    }

    if (playing) {
      const currentMode = dock.classList.contains('is-theme-tracks') ? 'playlist' : 'solo';
      const lockH = Math.max(
        playing.getBoundingClientRect().height,
        measureRowNaturalPx(playing, currentMode),
      );
      playing.style.height = `${lockH}px`;
      playing.style.overflow = 'hidden';
      playing.style.flexShrink = '0';
    }

    const gapPx = playlistGapPx();
    if (list) list.style.gap = open ? '0px' : `${gapPx}px`;

    startSheetMorph(fromH, collapsedH);
    dock.classList.add('is-playlist-morphing');
    void dock.offsetHeight;

    // Dest sizes from off-DOM clones — never paint dest heights (that 1-frame pop).
    const otherTo = otherFrom.map((row) => ({
      ...row,
      to: open ? measureRowNaturalPx(row.el, 'playlist') : 0,
    }));

    const playingH = playing
      ? measureRowNaturalPx(playing, open ? 'playlist' : 'solo')
      : 0;
    const destRowHeights = playlistRows().map((row) => {
      if (row === playing) return playingH;
      const found = otherTo.find((entry) => entry.el === row);
      return found ? found.to : 0;
    });
    const toH = open
      ? measurePlaylistOpenPx(collapsedH, destRowHeights, gapPx)
      : measureSoloOpenPx(collapsedH);

    // Keep the playing card at the same viewport Y. scrollTop=0 on close hid
    // Taking Over (3rd row) and looked like a card jump.
    if (open && section) section.scrollTop = fromScroll;
    pinPlayingToViewport(playing, section, pinY);
    startSheetMorph(fromH, collapsedH);

    const ease = 'cubic-bezier(0.4, 0, 0.2, 1)';
    const duration = PHONE_PANEL_PHASE_MS;
    void dock.offsetHeight;
    runPlaylistPin(playing, section, pinY, token, duration);

    const applyPlaylistClass = () => {
      document.dispatchEvent(
        new CustomEvent('phone-player-playlist-apply', { detail: { open, phase: 'apply' } }),
      );
    };
    // Close keeps the old apply-first path (looks fine). Open waits for the
    // locked from-frame so theme-tracks cannot flash dest-height siblings.
    if (open) {
      window.requestAnimationFrame(() => {
        if (token !== sheetMorphGen) return;
        applyPlaylistClass();
        pinPlayingToViewport(playing, section, pinY);
      });
    } else {
      applyPlaylistClass();
    }

    const sheetAnim = dock.animate(
      [{ height: `${fromH}px` }, { height: `${toH}px` }],
      { duration, easing: ease, fill: 'forwards' },
    );

    const listAnim = list
      ? list.animate(
          [
            { gap: open ? '0px' : `${gapPx}px` },
            { gap: open ? `${gapPx}px` : '0px' },
          ],
          { duration, easing: ease, fill: 'forwards' },
        )
      : null;

    // Playing card stays in flow. Siblings clip with height — a 320ms fade reads late.
    const rowAnims = otherTo.map((row) => {
      row.el.style.visibility = 'visible';
      const fromPad = open ? '0px' : openPadY;
      const toPad = open ? openPadY : '0px';
      const fromBorder = open ? '0px' : openBorder;
      const toBorder = open ? openBorder : '0px';
      return row.el.animate(
        [
          {
            height: `${Math.max(0, row.from)}px`,
            opacity: 1,
            paddingTop: fromPad,
            paddingBottom: fromPad,
            borderTopWidth: fromBorder,
            borderBottomWidth: fromBorder,
          },
          {
            height: `${Math.max(0, row.to)}px`,
            opacity: 1,
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
      if (open) pinPlayingToViewport(playing, section, pinY);
      document.dispatchEvent(
        new CustomEvent('phone-player-playlist-apply', { detail: { open, phase: 'commit' } }),
      );
      if (open) {
        for (const row of otherTo) {
          row.el.removeAttribute('aria-hidden');
          row.el.classList.remove('is-playlist-collapsed');
        }
        pinPlayingToViewport(playing, section, pinY);
      } else {
        for (const row of otherTo) {
          row.el.setAttribute('aria-hidden', 'true');
          row.el.classList.add('is-playlist-collapsed');
        }
        // Siblings are height 0 — only the playing card remains.
        if (section) section.scrollTop = 0;
        if (list) list.scrollTop = 0;
      }
      setSheetHeight(toH, collapsedH, Math.max(toH, fromH, collapsedH + 1));
      sheetAnim.cancel();
      listAnim?.cancel();
      // Unlock overflow / pointer-events. Do not pin after this — that freezes flick.
      endSheetMorphStyles({ keepHeight: true });
    };

    let settled = false;
    const finishOnce = () => {
      if (settled || token !== sheetMorphGen) return;
      settled = true;
      finish();
    };

    void Promise.all([
      sheetAnim.finished.catch(() => undefined),
      listAnim?.finished.catch(() => undefined),
      ...rowAnims.map((anim) => anim.finished.catch(() => undefined)),
    ]).then(finishOnce);
    // Always unlock overflow even if a WAAPI finished promise hangs.
    afterSheetMorph(token, finishOnce, true);
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
        applyExpanded(false, { animated: false });
      } else {
        scheduleHint();
      }
      window.requestAnimationFrame(() => {
        endSheetDragStyles({ keepHeight: toOpen });
        if (toOpen) growSheetToFitCard();
      });
    };
    if (motionMq.matches || Math.abs(toH - fromH) < 2) {
      commit();
      return;
    }
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

  handle?.addEventListener('pointerdown', (event) => {
    if (!phoneMq.matches || !handle) return;
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
    const openH = openHeightPx();
    drag = {
      pointerId: event.pointerId,
      startY: event.clientY,
      lastY: event.clientY,
      lastT: performance.now(),
      velocity: 0,
      moved: false,
      startH: readDockHeight() || (expanded ? openH : collapsedH),
      collapsedH,
      openH,
      fromExpanded: expanded,
    };
    handle.setPointerCapture(event.pointerId);
  });

  handle?.addEventListener('pointermove', (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const now = performance.now();
    const dt = now - drag.lastT;
    if (dt > 0) drag.velocity = (event.clientY - drag.lastY) / dt;
    drag.lastY = event.clientY;
    drag.lastT = now;
    const travel = Math.abs(event.clientY - drag.startY);
    if (!drag.moved && travel < TAP_SLOP_PX) return;
    const rawH = drag.startH + (drag.startY - event.clientY);
    if (!drag.moved) {
      drag.moved = true;
      beginSheetDrag(drag.startH, drag.collapsedH, drag.openH);
      drag.openH = measureOpenHeightPx(drag.collapsedH);
    }
    const height = applyDragHeight(rawH, drag.collapsedH, drag.openH);
    syncCollapseChrome(height, drag.openH, drag.fromExpanded);
    setSheetHeight(height, drag.collapsedH, drag.openH);
  });

  const finishHandleDrag = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const session = drag;
    drag = undefined;
    if (handle?.hasPointerCapture(session.pointerId)) {
      handle.releasePointerCapture(session.pointerId);
    }
    if (!session.moved) return;

    // Swallow the click that follows a real drag. pointercancel has no click.
    if (event.type === 'pointerup') {
      suppressHandleClick = true;
      window.setTimeout(() => {
        suppressHandleClick = false;
      }, 50);
    }
    const deltaUp = session.startY - event.clientY;
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
      // Sheet, dock icons, socials links: stay open (icons still exclusive-switch).
      if (target.closest('[data-stage-panels]')) return;
      if (target.closest('#stage-socials') || target.closest('.stage__socials')) return;

      if (sheetCtl?.isOpen()) sheetCtl.close({ animated: true });

      // V-Flip collapses on backdrop too, unless the tap is on the player pill.
      const onPlayer = Boolean(target.closest('[data-player-dock], [data-jukebox]'));
      if (expanded && !onPlayer) applyExpanded(false);
    },
    true,
  );

  document.addEventListener('phone-player-playlist', (event) => {
    if (!phoneMq.matches) return;
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
    if (event.matches) {
      window.cancelAnimationFrame(settleRaf);
      window.clearTimeout(sheetMorphTimer);
      sheetMorphGen += 1;
      stopPlaylistPin();
      endSheetDragStyles();
      endSheetMorphStyles();
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
  if (phoneMq.matches) {
    document.querySelector<HTMLElement>('[data-now-playing]')?.removeAttribute('title');
  }

  if (!isIntroActive()) scheduleHint();

  initBgVideoToggle();
}

/**
 * Phone transport: play/pause the hero/stage `<video>` (that *is* the music).
 * Writes `html[data-player-paused]` so the soundwave + shuffle clock freeze together.
 */
function initBgVideoToggle(): void {
  const btn = document.querySelector<HTMLButtonElement>('[data-bg-play-toggle]');
  if (!btn) return;

  const playLabel = btn.dataset.playLabel ?? 'Play video';
  const pauseLabel = btn.dataset.pauseLabel ?? 'Pause video';
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
    if (!isPhoneHud()) return;
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
