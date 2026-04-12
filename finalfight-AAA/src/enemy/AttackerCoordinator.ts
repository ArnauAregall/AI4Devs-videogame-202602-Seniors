/**
 * Token-based coordinator that caps simultaneous attackers at MAX_SIMULTANEOUS_ATTACKERS.
 * Enemies call requestAttackToken() before entering Attack state.
 *
 * @spec attacker-coordinator
 * @implements FR-EA-16
 */
import { MAX_SIMULTANEOUS_ATTACKERS } from './EnemyConfig';

export class AttackerCoordinator {
  private _count: number = 0;

  /**
   * Attempt to obtain an attack token.
   * @returns true if token granted; false if already at maximum.
   */
  requestAttackToken(): boolean {
    if (this._count >= MAX_SIMULTANEOUS_ATTACKERS) return false;
    this._count++;
    return true;
  }

  /**
   * Release a previously granted attack token.
   * Counter never goes below zero.
   */
  releaseToken(): void {
    if (this._count > 0) this._count--;
  }

  /** Current number of active attackers (for debug/testing). */
  get activeCount(): number {
    return this._count;
  }

  /** Reset all tokens (e.g. on stage clear). */
  reset(): void {
    this._count = 0;
  }
}
