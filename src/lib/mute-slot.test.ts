import { transform } from '@astrojs/compiler';
import { describe, expect, it } from 'vitest';
import { applyMuteSlotSound, muteSlotSoundAttr } from './mute-slot';

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
    --jukebox-mute-width: 10rem;
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
});
