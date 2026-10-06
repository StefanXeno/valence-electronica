import { transform } from '@astrojs/compiler';
import { describe, expect, it } from 'vitest';
import { applyMuteSlotSound, muteSlotSoundAttr } from './mute-slot';
import playerSrc from '../components/StagePlayer.astro?raw';
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

describe('stage player mute slot layout (regression)', () => {
  it('muted mute slot is locked to --control-size like the other tools', () => {
    expect(playerSrc).toMatch(
      /\.stage-player__tool\s*\{[^}]*flex:\s*0\s+0\s+var\(--control-size\)/s,
    );
    expect(playerSrc).toMatch(/class="stage-player__tool stage-player__tool--mute"/);
  });

  it('unmuted slot fills the rest of the control row and can shrink (never overflows)', () => {
    const block = playerSrc.match(
      /\.stage-player__tool--mute\[data-sound=['"]on['"]\]\s*\{[^}]*\}/s,
    )?.[0];
    expect(block).toMatch(/flex:\s*1\s+1\s+auto/);
    expect(block).toMatch(/min-width:\s*0/);
    expect(playerSrc).toMatch(/--jukebox-volume-gap/);
    expect(muteSrc).toMatch(
      /\[data-sound=['"]on['"]\]\s*\{[^}]*gap:\s*var\(--jukebox-volume-gap/s,
    );
  });

  it('tool row reserves the vinyl slot in every state (no shift on close)', () => {
    const block = playerSrc.match(/\.stage-player__controls\s*\{[^}]*\}/s)?.[0];
    expect(block).toMatch(/padding-left:\s*calc\(var\(--player-vinyl-size\)/);
  });

  it('unmuted slider uses fixed track width, not flex-grow', () => {
    expect(muteSrc).toMatch(
      /\[data-sound=['"]on['"]\]\s+\.volume-control__slider-wrap\s*\{[^}]*flex:\s*0\s+0\s+var\(--volume-slider-size\)/s,
    );
    expect(muteSrc).not.toMatch(
      /\[data-sound=['"]on['"]\]\s+\.volume-control__slider-wrap\s*\{[^}]*flex:\s*1\s+1\s+auto/s,
    );
  });

  it('mute sits after play/pause in the controls row', () => {
    const playIdx = playerSrc.indexOf('data-bg-play-toggle');
    const muteIdx = playerSrc.indexOf('data-jukebox-mute-slot');
    expect(playIdx).toBeGreaterThan(-1);
    expect(muteIdx).toBeGreaterThan(playIdx);
  });
});
