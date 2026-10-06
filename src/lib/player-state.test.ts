import { describe, expect, it } from 'vitest';
import {
  initialPlayerState,
  nextPlayerState,
  type PlayerEvent,
  type PlayerState,
} from './player-state';

const ALL_EVENTS: PlayerEvent[] = [
  'TAP_HINT',
  'HINT_TIMEOUT',
  'ACTIVATE_VINYL',
  'KEYBOARD_REVEAL',
  'CLOSE',
  'OVERLAY_OPENED',
];

describe('initialPlayerState', () => {
  it('starts hidden until discovered', () => {
    expect(initialPlayerState(false)).toBe('hidden');
    expect(initialPlayerState(true)).toBe('minimal');
  });
});

describe('nextPlayerState', () => {
  it('hidden → hint on three taps and starts the hint timer', () => {
    const next = nextPlayerState('hidden', 'TAP_HINT');
    expect(next.state).toBe('hint');
    expect(next.effects.startHintTimer).toBe(true);
  });

  it('hidden → full via keyboard and marks discovery', () => {
    const next = nextPlayerState('hidden', 'KEYBOARD_REVEAL');
    expect(next.state).toBe('full');
    expect(next.effects.markDiscovered).toBe(true);
  });

  it('hint times out back to hidden', () => {
    expect(nextPlayerState('hint', 'HINT_TIMEOUT').state).toBe('hidden');
  });

  it('extra taps during the hint extend instead of restarting', () => {
    const next = nextPlayerState('hint', 'TAP_HINT');
    expect(next.state).toBe('hint');
    expect(next.effects.extendHintTimer).toBe(true);
    expect(next.effects.startHintTimer).toBe(false);
  });

  it('vinyl tap in hint reveals the full player and marks discovery', () => {
    const next = nextPlayerState('hint', 'ACTIVATE_VINYL');
    expect(next.state).toBe('full');
    expect(next.effects.markDiscovered).toBe(true);
  });

  it('minimal vinyl opens full without re-marking discovery', () => {
    const next = nextPlayerState('minimal', 'ACTIVATE_VINYL');
    expect(next.state).toBe('full');
    expect(next.effects.markDiscovered).toBe(false);
  });

  it('closing full collapses to minimal and focuses the vinyl', () => {
    const next = nextPlayerState('full', 'CLOSE');
    expect(next.state).toBe('minimal');
    expect(next.effects.focusVinyl).toBe(true);
  });

  it('an opening overlay collapses full to minimal without stealing focus', () => {
    const next = nextPlayerState('full', 'OVERLAY_OPENED');
    expect(next.state).toBe('minimal');
    expect(next.effects.focusVinyl).toBe(false);
  });

  it('ignores every event that has no transition', () => {
    const allowed: Record<PlayerState, PlayerEvent[]> = {
      hidden: ['TAP_HINT', 'KEYBOARD_REVEAL'],
      hint: ['HINT_TIMEOUT', 'TAP_HINT', 'ACTIVATE_VINYL'],
      minimal: ['ACTIVATE_VINYL'],
      full: ['CLOSE', 'OVERLAY_OPENED'],
    };
    for (const state of Object.keys(allowed) as PlayerState[]) {
      for (const event of ALL_EVENTS) {
        if (allowed[state].includes(event)) continue;
        const next = nextPlayerState(state, event);
        expect(next.state, `${state} + ${event}`).toBe(state);
        expect(Object.values(next.effects).some(Boolean), `${state} + ${event}`).toBe(false);
      }
    }
  });
});
