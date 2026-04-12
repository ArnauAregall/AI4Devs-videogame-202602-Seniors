import { PlayerState } from './PlayerState';

/**
 * Legal transition table.
 * Key = from-state, Value = set of reachable to-states.
 *
 * "Any → Hurt" and "Any → Knockdown" are handled specially in
 * {@link PlayerStateMachine.transition} via the `interrupt` parameter.
 *
 * @spec player-state-machine – Requirement: State transitions enforce a legal transition table
 */
const LEGAL_TRANSITIONS: ReadonlyMap<PlayerState, ReadonlySet<PlayerState>> = new Map([
  [PlayerState.Idle,         new Set([PlayerState.Walk, PlayerState.Jump, PlayerState.LightAttack, PlayerState.HeavyAttack, PlayerState.Grab, PlayerState.SpecialAttack])],
  [PlayerState.Walk,         new Set([PlayerState.Idle, PlayerState.Jump, PlayerState.LightAttack, PlayerState.HeavyAttack, PlayerState.Grab, PlayerState.SpecialAttack])],
  [PlayerState.Jump,         new Set([PlayerState.JumpAttack, PlayerState.Hurt, PlayerState.Knockdown, PlayerState.Idle])],
  [PlayerState.LightAttack,  new Set([PlayerState.Idle, PlayerState.Hurt, PlayerState.Knockdown])],
  [PlayerState.HeavyAttack,  new Set([PlayerState.Idle, PlayerState.Hurt, PlayerState.Knockdown])],
  [PlayerState.JumpAttack,   new Set([PlayerState.Idle, PlayerState.Hurt, PlayerState.Knockdown])],
  [PlayerState.Grab,         new Set([PlayerState.Idle])],
  [PlayerState.Hurt,         new Set([PlayerState.Idle, PlayerState.Knockdown])],
  [PlayerState.Knockdown,    new Set([PlayerState.GetUp])],
  [PlayerState.GetUp,        new Set([PlayerState.Idle])],
  [PlayerState.SpecialAttack, new Set([PlayerState.Idle, PlayerState.Hurt, PlayerState.Knockdown])],
]);

/** States that can be interrupted by Hurt / Knockdown (i.e. "Any → Hurt/Knockdown"). */
const INTERRUPTIBLE_BY_HIT: ReadonlySet<PlayerState> = new Set([
  PlayerState.Idle,
  PlayerState.Walk,
  PlayerState.Jump,
  PlayerState.LightAttack,
  PlayerState.HeavyAttack,
  PlayerState.JumpAttack,
  PlayerState.Grab,
  PlayerState.SpecialAttack,
]);

/**
 * Finite state machine for the player character.
 *
 * Usage:
 * ```ts
 * const fsm = new PlayerStateMachine();
 * fsm.onEnter = (s) => controller.handleEnter(s);
 * fsm.onExit  = (s) => controller.handleExit(s);
 * fsm.transition(PlayerState.Walk);
 * ```
 *
 * @spec player-state-machine
 */
export class PlayerStateMachine {
  current: PlayerState = PlayerState.Idle;

  /** Called after the new state becomes current. */
  onEnter?: (state: PlayerState) => void;
  /** Called before the current state changes. */
  onExit?: (state: PlayerState) => void;

  /**
   * Attempt a state transition.
   *
   * - If `newState` is `Hurt` or `Knockdown` and the current state is in
   *   {@link INTERRUPTIBLE_BY_HIT}, the transition is forced (interrupt rule).
   * - Any other transition not listed in {@link LEGAL_TRANSITIONS} is silently ignored.
   *
   * @returns `true` if the transition occurred, `false` if ignored.
   * @spec player-state-machine – Requirement: State transitions enforce a legal transition table
   */
  transition(newState: PlayerState): boolean {
    if (this.current === newState) return false;

    // Interrupt: Hurt and Knockdown can override most states
    if (
      (newState === PlayerState.Hurt || newState === PlayerState.Knockdown) &&
      INTERRUPTIBLE_BY_HIT.has(this.current)
    ) {
      this._apply(newState);
      return true;
    }

    if (!this.canTransition(this.current, newState)) return false;
    this._apply(newState);
    return true;
  }

  /**
   * Returns `true` if transitioning from `from` to `to` is legal,
   * without mutating any state.
   *
   * @spec player-state-machine – Requirement: State transitions enforce a legal transition table
   */
  canTransition(from: PlayerState, to: PlayerState): boolean {
    return LEGAL_TRANSITIONS.get(from)?.has(to) ?? false;
  }

  private _apply(newState: PlayerState): void {
    this.onExit?.(this.current);
    this.current = newState;
    this.onEnter?.(newState);
  }
}
