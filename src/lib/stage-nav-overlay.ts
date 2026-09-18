/**
 * Open/close nav StagePanels as LegalPanel-style fullscreen sheets.
 * Do not drive open via summary.click() — closed panels use display:none,
 * and programmatic clicks on hidden <summary> are unreliable across engines.
 *
 * Sheets mount on <body> (Base.astro) next to LegalOverlay so they are not
 * trapped under .stage-dock / SiteNav stacking contexts.
 */

export type StageNavPanelId =
  | 'about'
  | 'discography'
  | 'tour'
  | 'contact'
  | 'shop';

const PANEL_IDS = new Set<string>(['about', 'discography', 'tour', 'contact', 'shop']);

export function isStageNavPanelId(id: string): id is StageNavPanelId {
  return PANEL_IDS.has(id);
}

function closeOpenLegalPanel(): void {
  const exit = document.querySelector<HTMLElement>(
    '[data-legal-panel]:not([hidden]) [data-legal-exit]',
  );
  exit?.click();
}

export function setStageNavPanelOpen(panel: HTMLDetailsElement, open: boolean): void {
  panel.open = open;
  if (!open) {
    panel.classList.remove('is-panel-closing', 'is-overlay-in');
    return;
  }
  panel.classList.remove('is-panel-closing');
  // Retrigger legal-style enter animation on each open.
  panel.classList.remove('is-overlay-in');
  void panel.offsetWidth;
  panel.classList.add('is-overlay-in');
}

export function closeStageNavPanel(panel: HTMLDetailsElement): void {
  setStageNavPanelOpen(panel, false);
}

export function closeOpenStageNavPanels(except?: HTMLDetailsElement): void {
  document.querySelectorAll<HTMLDetailsElement>('[data-stage-panel][open]').forEach((node) => {
    if (except && node === except) return;
    closeStageNavPanel(node);
  });
}

/** Toggle or open a nav content sheet by data-stage-panel id. */
export function openStageNavOverlay(id: string): HTMLDetailsElement | null {
  if (!isStageNavPanelId(id)) return null;
  const panel = document.querySelector<HTMLDetailsElement>(`[data-stage-panel="${id}"]`);
  if (!panel) return null;

  if (panel.open && !panel.classList.contains('is-panel-closing')) {
    closeStageNavPanel(panel);
    return panel;
  }

  closeOpenLegalPanel();
  closeOpenStageNavPanels(panel);
  setStageNavPanelOpen(panel, true);
  const exit = panel.querySelector<HTMLElement>('[data-stage-panel-exit]');
  exit?.focus();
  return panel;
}
