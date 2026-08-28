export type ClientCatalogTrack = {
  id: string;
  title: string;
  blurb?: string;
  listenLinks: { platform: string; url: string; label: string }[];
  credits: { role: string; name: string }[];
  mentions?: string;
};

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((node) => node.tabIndex >= 0 || node.matches('a[href], button, input'));
}

function getActiveId(): string {
  const atmosphere = document.querySelector<HTMLElement>('[data-atmosphere]');
  return atmosphere?.dataset.activeId ?? '';
}

function readJukeboxLabels(): Record<string, string> {
  const labels: Record<string, string> = {};
  document.querySelectorAll<HTMLButtonElement>('[data-jukebox-option]').forEach((btn) => {
    const id = btn.dataset.jukeboxOption;
    if (id) labels[id] = btn.textContent?.trim() ?? id;
  });
  return labels;
}

function resolveTrack(
  activeId: string,
  catalog: ClientCatalogTrack[],
  jukeboxLabels: Record<string, string>,
): ClientCatalogTrack | undefined {
  const row = catalog.find((t) => t.id === activeId);
  if (row) return row;
  const label = jukeboxLabels[activeId];
  if (!label) return undefined;
  return {
    id: activeId,
    title: label,
    listenLinks: [],
    credits: [],
  };
}

export function initNowPlaying() {
  const root = document.querySelector<HTMLElement>('[data-now-playing]');
  const trigger = root?.querySelector<HTMLButtonElement>('[data-now-playing-trigger]');
  const popover = root?.querySelector<HTMLElement>('[data-now-playing-popover]');
  const catalogHost = document.querySelector<HTMLElement>('[data-track-catalog]');
  if (!root || !trigger || !popover || !catalogHost?.dataset.trackCatalog) return;

  const catalog = JSON.parse(catalogHost.dataset.trackCatalog) as ClientCatalogTrack[];
  const titleEl = popover.querySelector<HTMLElement>('[data-now-playing-title]');
  const blurbEl = popover.querySelector<HTMLElement>('[data-now-playing-blurb]');
  const linksEl = popover.querySelector<HTMLElement>('[data-now-playing-links]');
  const creditsEl = popover.querySelector<HTMLElement>('[data-now-playing-credits]');
  const mentionsEl = popover.querySelector<HTMLElement>('[data-now-playing-mentions]');
  if (!titleEl || !linksEl || !creditsEl) return;

  let open = false;
  let trapHandler: ((event: KeyboardEvent) => void) | undefined;

  const syncContent = () => {
    const activeId = getActiveId();
    const track = resolveTrack(activeId, catalog, readJukeboxLabels());
    if (!track) {
      titleEl.textContent = '';
      if (blurbEl) blurbEl.hidden = true;
      linksEl.hidden = true;
      creditsEl.hidden = true;
      if (mentionsEl) mentionsEl.hidden = true;
      return;
    }

    titleEl.textContent = track.title;

    if (blurbEl) {
      if (track.blurb) {
        blurbEl.textContent = track.blurb;
        blurbEl.hidden = false;
      } else {
        blurbEl.hidden = true;
      }
    }

    if (track.listenLinks.length > 0) {
      linksEl.innerHTML = track.listenLinks
        .map(
          (link) =>
            `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label}</a>`,
        )
        .join('');
      linksEl.hidden = false;
    } else {
      linksEl.innerHTML = '';
      linksEl.hidden = true;
    }

    if (track.credits.length > 0) {
      creditsEl.innerHTML = track.credits
        .map((credit) => `<li><span>${credit.role}</span> ${credit.name}</li>`)
        .join('');
      creditsEl.hidden = false;
    } else {
      creditsEl.innerHTML = '';
      creditsEl.hidden = true;
    }

    if (mentionsEl) {
      if (track.mentions) {
        mentionsEl.textContent = track.mentions;
        mentionsEl.hidden = false;
      } else {
        mentionsEl.hidden = true;
      }
    }
  };

  const close = () => {
    if (!open) return;
    open = false;
    root.dataset.open = 'false';
    popover.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (trapHandler) {
      document.removeEventListener('keydown', trapHandler);
      trapHandler = undefined;
    }
    trigger.focus();
  };

  const openPopover = () => {
    if (open) {
      close();
      return;
    }
    syncContent();
    open = true;
    root.dataset.open = 'true';
    popover.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');

    trapHandler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = getFocusable(popover);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', trapHandler);

    const focusable = getFocusable(popover);
    if (focusable.length > 0) focusable[0].focus();
    else popover.focus();
  };

  trigger.addEventListener('click', () => openPopover());

  document.addEventListener('click', (event) => {
    if (!open) return;
    const target = event.target;
    if (target instanceof Node && !root.contains(target)) close();
  });

  document.querySelector('[data-atmosphere]')?.addEventListener('bg-state-change', () => {
    syncContent();
    close();
  });

  document.querySelectorAll('[data-jukebox-option]').forEach((node) => {
    node.addEventListener('click', () => close());
  });

  syncContent();
}
