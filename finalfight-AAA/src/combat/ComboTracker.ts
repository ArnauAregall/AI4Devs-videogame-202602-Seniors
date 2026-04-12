/**
 * Per-target sliding combo window and damage/stun modifiers.
 *
 * @spec combo-tracker
 */
import {
  COMBO_WINDOW_FRAMES,
  DIMINISHING_STEP,
  DIMINISHING_MIN_FACTOR,
  DAMAGE_FLOOR,
  HIT_STUN_COMBO_INCREMENT,
  HIT_STUN_MAX_FRAMES,
} from './CombatConfig';

interface ComboState {
  counter: number;
  windowTimer: number;
}

export interface ComboResult {
  effectiveDamage: number;
  effectiveHitStun: number;
  comboCount: number;
}

/**
 * Tracks per-target combo counters and sliding windows.
 * Call `tick()` once per fixed-update to advance window timers.
 *
 * @spec combo-tracker – Requirement: Per-target combo window tracking
 */
export class ComboTracker {
  private readonly _targets: Map<string, ComboState> = new Map();

  /**
   * Record a hit on `targetId` and return adjusted damage and hit-stun.
   * Increments the combo counter; resets the window timer.
   *
   * @spec combo-tracker – Requirement: Diminishing damage returns
   * @spec combo-tracker – Requirement: Hit-stun scaling with combo depth
   */
  recordHit(targetId: string, baseDamage: number, baseHitStun: number): ComboResult {
    let state = this._targets.get(targetId);
    if (!state) {
      state = { counter: 0, windowTimer: 0 };
      this._targets.set(targetId, state);
    }

    state.counter++;
    state.windowTimer = COMBO_WINDOW_FRAMES;

    const comboCount = state.counter;

    // Diminishing returns: max(FLOOR, base * max(MIN_FACTOR, 1 - STEP * (n-1)))
    const factor = Math.max(DIMINISHING_MIN_FACTOR, 1.0 - DIMINISHING_STEP * (comboCount - 1));
    const effectiveDamage = Math.max(DAMAGE_FLOOR, Math.floor(baseDamage * factor));

    // Hit-stun scaling: capped at max
    const effectiveHitStun = Math.min(
      HIT_STUN_MAX_FRAMES,
      baseHitStun + comboCount * HIT_STUN_COMBO_INCREMENT,
    );

    return { effectiveDamage, effectiveHitStun, comboCount };
  }

  /**
   * Advance all window timers by one tick.
   * Resets counter to zero when a window expires.
   *
   * @spec combo-tracker – Requirement: Per-target combo window tracking
   */
  tick(): void {
    for (const [id, state] of this._targets) {
      if (state.windowTimer > 0) {
        state.windowTimer--;
        if (state.windowTimer === 0) {
          state.counter = 0;
        }
      } else {
        // Clean up expired entries to avoid unbounded map growth
        this._targets.delete(id);
      }
    }
  }

  /** Reset all tracked combos (e.g. on stage clear). */
  reset(): void {
    this._targets.clear();
  }

  /** Returns the current combo counter for a target (0 if not tracked). */
  getComboCount(targetId: string): number {
    return this._targets.get(targetId)?.counter ?? 0;
  }
}
