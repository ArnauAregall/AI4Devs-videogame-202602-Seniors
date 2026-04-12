// ============================================================
// StageTimer.ts — Fixed-timestep countdown timer.
// @spec FR-TIM-01 180-second countdown using fixed ticks
// @spec FR-TIM-02 Emit 'timeUp' event when countdown reaches zero
// @spec FR-TIM-03 Expose secondsRemaining getter
// ============================================================
import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

export class StageTimer {
  private _ticksRemaining: number;
  private _fired: boolean = false;
  private readonly _fixedUpdateBound: (dt: number) => void;

  constructor(private readonly scene: Phaser.Scene) {
    this._ticksRemaining = 180 * GameConfig.TARGET_FPS;
    this._fixedUpdateBound = this._fixedUpdate.bind(this);
    scene.registerFixedUpdate(this._fixedUpdateBound);
  }

  /** Remaining full seconds (floored). */
  get secondsRemaining(): number {
    return Math.floor(this._ticksRemaining / GameConfig.TARGET_FPS);
  }

  /** Raw ticks remaining — exposed for testing. */
  get ticksRemaining(): number {
    return this._ticksRemaining;
  }

  private _fixedUpdate(_dt: number): void {
    if (this._fired) return;

    this._ticksRemaining--;

    if (this._ticksRemaining <= 0) {
      this._ticksRemaining = 0;
      this._fired = true;
      this.scene.events.emit('timeUp');
    }
  }

  /** Stop the timer without firing timeUp (e.g., stage cleared). */
  stop(): void {
    this._fired = true;
  }

  destroy(): void {
    this.scene.unregisterFixedUpdate(this._fixedUpdateBound);
  }
}
