import { transform } from '@astrojs/compiler';
import { describe, expect, it } from 'vitest';
import { applyMuteSlotSound, muteSlotSoundAttr } from './mute-slot';
import jukeboxSrc from '../components/Jukebox.astro?raw';
import muteSrc from '../components/MuteControl.astro?raw';

describe('muteSlotSoundAttr', () => {
  it('maps muted → off and unmuted → on for the jukebox mute slot', () => {
    expect(muteSlotSoundAttr(true)).toBe('off');
    expect(muteSlotSoundAttr(false)).toBe('on');
  });
});

describe('applyMuteSlotSound', () => {
  it('writes data-sound onto the mute slot element', () => {
    const slot = { dataset: {} as DOMStringMap } as HTMLElement;
    applyMuteSlotSound(slot, false);
    expect(slot.dataset.sound).toBe('on');
    applyMuteSlotSound(slot, true);
    expect(slot.dataset.sound).toBe('off');
  });

  it('no-ops when the slot is missing', () => {
    expect(() => applyMuteSlotSound(null, false)).not.toThrow();
  });
});

describe('jukebox mute expand selector (Astro scoped CSS)', () => {
  async function compileCss(source: string, filename: string): Promise<string> {
    const result = await transform(source, {
      filename,
      scopedStyleStrategy: 'attribute',
    });
    return String(result.css ?? '');
  }

  it('must not nest :global() inside :has() — that survives as invalid CSS', async () => {
    const brokenCss = await compileCss(
      `
---
---
<div class="jukebox"></div>
<style>
  .jukebox:has(:global(.volume-control--in-jukebox[data-sound='on'])) {
    --jukebox-mute-width: 10rem;
  }
</style>
`,
      '/tmp/JukeboxBroken.astro',
    );
    expect(brokenCss).toMatch(/:has\(:global\(/);
  });

  it('same-scope mute-slot :has() keeps a valid selector (no nested :global)', async () => {
    const css = await compileCss(
      `
---
---
<div class="jukebox">
  <div class="jukebox__tool--mute" data-sound="on"></div>
</div>
<style>
  .jukebox:has(.jukebox__tool--mute[data-sound='on']) {
    width: fit-content;
  }
</style>
`,
      '/tmp/JukeboxOk.astro',
    );
    expect(css).not.toMatch(/:has\(:global\(/);
    // Astro scopes the host; :has() subject stays a plain class+attr match.
    expect(css).toMatch(
      /\.jukebox\[data-astro-cid-[a-z0-9]+\]:has\(\.jukebox__tool--mute\[data-sound=["']on["']\]\)/,
    );
  });

  it('muted in-jukebox slider wrap uses display:none so range min-content cannot widen the mute slot', async () => {
    const css = await compileCss(
      `
---
---
<div class="volume-control volume-control--in-jukebox" data-sound="off">
  <div class="volume-control__slider-wrap"></div>
</div>
<style>
  .volume-control--in-jukebox[data-sound='off'] .volume-control__slider-wrap {
    display: none;
    width: 0;
    max-width: 0;
    min-width: 0;
  }
</style>
`,
      '/tmp/MuteCollapsed.astro',
    );
    // Astro may inject [data-astro-cid-…] between the class and [data-sound].
    expect(css).toMatch(
      /\.volume-control--in-jukebox\[data-astro-cid-[a-z0-9]+\]\[data-sound=["']?off["']?\]\s+\.volume-control__slider-wrap/,
    );
    expect(css).toMatch(/display:\s*none/);
  });
});

describe('jukebox muted toolbar layout (regression)', () => {
  it('must not slack-eat with flex:1 / toolbar width:100% on unmute (pinned mute right)', () => {
    // The b1d45d6 pattern stretched a wide pill and pinned mute to the far edge.
    expect(jukeboxSrc).not.toMatch(
      /\.jukebox:has\(\.jukebox__tool--mute\[data-sound=['"]on['"]\]\)\s+\.jukebox__tool--mute\s*\{[^}]*flex:\s*1/,
    );
    expect(jukeboxSrc).not.toMatch(
      /\.jukebox:has\(\.jukebox__tool--mute\[data-sound=['"]on['"]\]\)\s+\.jukebox__toolbar\s*\{[^}]*width:\s*100%/,
    );
  });

  it('muted mute slot is locked to --control-size (no --jukebox-mute-width grow var)', () => {
    expect(jukeboxSrc).toMatch(
      /\.jukebox__tool--mute(?![^{]*data-sound)[^{]*\{[^}]*flex:\s*0\s+0\s+var\(--control-size\)/s,
    );
    expect(jukeboxSrc).not.toMatch(/--jukebox-mute-width/);
    expect(jukeboxSrc).not.toMatch(/--jukebox-slider-extra/);
  });

  it('unmuted slider uses fixed track width, not flex-grow', () => {
    expect(muteSrc).toMatch(
      /\[data-sound=['"]on['"]\]\s+\.volume-control__slider-wrap\s*\{[^}]*flex:\s*0\s+0\s+var\(--volume-slider-size\)/s,
    );
    expect(muteSrc).not.toMatch(
      /\[data-sound=['"]on['"]\]\s+\.volume-control__slider-wrap\s*\{[^}]*flex:\s*1\s+1\s+auto/s,
    );
  });

  it('toolbar inline padding uses --jukebox-toolbar-inline-pad (balanced pill ends)', () => {
    expect(jukeboxSrc).toMatch(
      /\.jukebox__toolbar\s*\{[^}]*padding:\s*var\(--jukebox-toolbar-pad\)\s+var\(--jukebox-toolbar-inline-pad\)/s,
    );
    // Always-on asymmetric end-pad stranded muted mute — unmuted-only is OK.
    expect(jukeboxSrc).not.toMatch(/--jukebox-toolbar-end-pad(?![\w-])/);
  });

  it('unmuted toolbar gains end pad; mute→slider uses --jukebox-volume-gap', () => {
    expect(jukeboxSrc).toMatch(/--jukebox-toolbar-unmuted-end-pad/);
    expect(jukeboxSrc).toMatch(/--jukebox-volume-gap/);
    expect(jukeboxSrc).toMatch(
      /\.jukebox:has\(\.jukebox__tool--mute\[data-sound=['"]on['"]\]\)\s+\.jukebox__toolbar\s*\{[^}]*padding-right:\s*var\(--jukebox-toolbar-unmuted-end-pad\)/s,
    );
    expect(muteSrc).toMatch(
      /\[data-sound=['"]on['"]\]\s*\{[^}]*gap:\s*var\(--jukebox-volume-gap/s,
    );
  });

  it('desktop transport stays display:contents with no flex box props (Firefox double-gap)', () => {
    // flex/margin/padding on a contents node can promote a real flex item in Firefox,
    // nesting vinyl|shuffle|play and adding a second gap before mute.
    const desktopTransport = jukeboxSrc.match(
      /\.player-dock__transport\s*\{[^}]*display:\s*contents;[^}]*\}/gs,
    );
    expect(desktopTransport?.length).toBeGreaterThan(0);
    for (const block of desktopTransport ?? []) {
      if (!block.includes('display: contents')) continue;
      // Phone overrides use display:flex !important — skip those.
      if (block.includes('display: flex')) continue;
      expect(block).not.toMatch(/\bflex\s*:/);
      expect(block).not.toMatch(/\bmargin\s*:/);
      expect(block).not.toMatch(/\bpadding\s*:/);
    }
    // Loop must not sit between play and mute in markup.
    const playIdx = jukeboxSrc.indexOf('data-bg-play-toggle');
    const muteIdx = jukeboxSrc.indexOf('data-jukebox-mute-slot');
    const loopIdx = jukeboxSrc.indexOf('data-loop-toggle');
    expect(playIdx).toBeGreaterThan(-1);
    expect(muteIdx).toBeGreaterThan(playIdx);
    expect(loopIdx).toBeGreaterThan(muteIdx);
  });
});
