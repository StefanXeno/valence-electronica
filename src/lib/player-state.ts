/**
 * Stage player state machine (035). Pure — DOM wiring lives in `stage-player.ts`.
 *
 * hidden → (3 taps) → hint → (vinyl tap) → full ⇄ minimal
 */

export type PlayerState = 'hidden' | 'hint' | 'minimal' | 'full';

export type PlayerEvent =
  | 'TAP_HINT'
  | 'HINT_TIMEOUT'
  | 'ACTIVATE_VINYL'
  | 'KEYBOARD_REVEAL'
  | 'CLOSE'
  | 'OVERLAY_OPENED';

export type PlayerEffects = {
  /** First reveal — persist discovery and unlock the achievement. */
  markDiscovered: boolean;
  startHintTimer: boolean;
  extendHintTimer: boolean;
  focusVinyl: boolean;
};

export type PlayerTransition = {
  state: PlayerState;
  effects: PlayerEffects;
};

const NO_EFFECTS: PlayerEffects = {
  markDiscovered: false,
  startHintTimer: false,
  extendHintTimer: false,
  focusVinyl: false,
};

function to(state: PlayerState, effects: Partial<PlayerEffects> = {}): PlayerTransition {
  return { state, effects: { ...NO_EFFECTS, ...effects } };
}

export function initialPlayerState(discovered: boolean): PlayerState {
  return discovered ? 'minimal' : 'hidden';
}

export function nextPlayerState(state: PlayerState, event: PlayerEvent): PlayerTransition {
  switch (state) {
    case 'hidden':
      if (event === 'TAP_HINT') return to('hint', { startHintTimer: true });
      if (event === 'KEYBOARD_REVEAL') return to('full', { markDiscovered: true });
      break;
    case 'hint':
      if (event === 'HINT_TIMEOUT') return to('hidden');
      if (event === 'TAP_HINT') return to('hint', { extendHintTimer: true });
      if (event === 'ACTIVATE_VINYL') return to('full', { markDiscovered: true });
      break;
    case 'minimal':
      if (event === 'ACTIVATE_VINYL') return to('full');
      break;
    case 'full':
      if (event === 'CLOSE') return to('minimal', { focusVinyl: true });
      if (event === 'OVERLAY_OPENED') return to('minimal');
      break;
  }
  return to(state);
}
