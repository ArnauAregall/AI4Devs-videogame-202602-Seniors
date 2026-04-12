/**
 * Finite-state machine for enemy AI.
 * Validates transitions, fires onExit/onEnter hooks.
 * Illegal transitions are silently ignored.
 *
 * @spec enemy-state-machine
 * @implements FR-EA-05 through FR-EA-13
 */
import { EnemyState } from './EnemyState';

type StateHook = (state: EnemyState) => void;

/**
 * Legal outbound transitions per state.
 * Hurt can interrupt any state except Death (handled by EnemyController
 * which calls transition(Hurt) directly; the table includes Hurt in all
 * non-Death outbound sets).
 */
const TRANSITIONS: ReadonlyMap<EnemyState, ReadonlySet<EnemyState>> = new Map([
  [EnemyState.Idle,      new Set([EnemyState.Patrol, EnemyState.Aggro, EnemyState.Hurt])],
  [EnemyState.Patrol,    new Set([EnemyState.Idle, EnemyState.Aggro, EnemyState.Hurt])],
  [EnemyState.Aggro,     new Set([EnemyState.Attack, EnemyState.Hurt, EnemyState.Knockdown, EnemyState.Death])],
  [EnemyState.Attack,    new Set([EnemyState.Aggro, EnemyState.Hurt, EnemyState.Knockdown, EnemyState.Death])],
  [EnemyState.Hurt,      new Set([EnemyState.Aggro, EnemyState.Knockdown, EnemyState.Death])],
  [EnemyState.Knockdown, new Set([EnemyState.Aggro, EnemyState.Death])],
  [EnemyState.Death,     new Set()],
]);

export class EnemyStateMachine {
  private _state: EnemyState;
  private readonly _onEnter: StateHook;
  private readonly _onExit: StateHook;

  constructor(
    initial: EnemyState,
    onEnter: StateHook,
    onExit: StateHook,
  ) {
    this._state   = initial;
    this._onEnter = onEnter;
    this._onExit  = onExit;
    // fire enter hook for the initial state
    this._onEnter(initial);
  }

  get state(): EnemyState {
    return this._state;
  }

  /**
   * Attempt a state transition. Silently ignores illegal transitions.
   * @returns true if transition occurred.
   */
  transition(next: EnemyState): boolean {
    if (!this.canTransition(next)) return false;
    const prev = this._state;
    this._onExit(prev);
    this._state = next;
    this._onEnter(next);
    return true;
  }

  /**
   * Returns true if the transition is legal without mutating state.
   */
  canTransition(next: EnemyState): boolean {
    if (this._state === next) return false;
    return TRANSITIONS.get(this._state)?.has(next) ?? false;
  }
}
