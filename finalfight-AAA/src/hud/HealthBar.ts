/**
 * Renders the player health bar with colour-coded fill on the fixed HUD overlay.
 *
 * The bar width is proportional to `current / max` HP. Colour transitions are
 * determined by thresholds defined in {@link HudConfig} (`HUD_HEALTH_YELLOW_THRESHOLD`
 * and `HUD_HEALTH_RED_THRESHOLD`). Both width and colour are recalculated
 * **synchronously** within the same render frame that {@link update} is called,
 * so the visual always matches the current game state with no lag.
 *
 * @spec hud – FR-HU-01, FR-HU-02, FR-HU-03
 */
import Phaser from 'phaser';
import {
  HUD_HEALTH_BAR_X, HUD_HEALTH_BAR_Y, HUD_HEALTH_BAR_WIDTH, HUD_HEALTH_BAR_HEIGHT,
  HUD_HEALTH_GREEN, HUD_HEALTH_YELLOW, HUD_HEALTH_RED,
  HUD_HEALTH_YELLOW_THRESHOLD, HUD_HEALTH_RED_THRESHOLD,
  HUD_DEPTH,
} from './HudConfig';

/**
 * Player health bar rendered on the fixed HUD overlay layer.
 *
 * Colour thresholds are sourced from `HudConfig.ts`. Designers can tune the
 * green → yellow → red progression by changing those constants alone.
 */
export class HealthBar {
  private readonly _bg:   Phaser.GameObjects.Graphics;
  private readonly _fill: Phaser.GameObjects.Graphics;
  private _current: number;
  private _max:     number;
  private _dirty = true;

  /**
   * Creates the health bar graphics objects and performs the initial draw.
   *
   * @param scene   - The HUD scene (fixed overlay, never scrolls).
   * @param current - Initial current HP.
   * @param max     - Initial maximum HP.
   */
  constructor(scene: Phaser.Scene, current: number, max: number) {
    this._current = current;
    this._max     = max;
    this._bg   = scene.add.graphics().setDepth(HUD_DEPTH);
    this._fill = scene.add.graphics().setDepth(HUD_DEPTH);
    this._redraw();
  }

  /**
   * Synchronously updates the bar to reflect new HP values.
   *
   * Both bar width and fill colour are recalculated in the same frame this
   * method is invoked — no deferred or tweened update is involved.
   *
   * @param current - New current HP value.
   * @param max     - New maximum HP value (supports future max-HP buffs).
   */
  update(current: number, max: number): void {
    if (this._current === current && this._max === max) return;
    this._current = current;
    this._max     = max;
    this._dirty   = true;
    this._redraw();
  }

  private _redraw(): void {
    if (!this._dirty) return;
    this._dirty = false;
    const fraction  = this._max > 0 ? Math.max(0, this._current / this._max) : 0;
    const fillWidth = Math.round(HUD_HEALTH_BAR_WIDTH * fraction);
    const colour    = this._colourFor(fraction);

    this._bg.clear();
    this._bg.fillStyle(0x000000, 0.7);
    this._bg.fillRect(HUD_HEALTH_BAR_X, HUD_HEALTH_BAR_Y, HUD_HEALTH_BAR_WIDTH, HUD_HEALTH_BAR_HEIGHT);

    this._fill.clear();
    if (fillWidth > 0) {
      this._fill.fillStyle(colour, 1);
      this._fill.fillRect(HUD_HEALTH_BAR_X, HUD_HEALTH_BAR_Y, fillWidth, HUD_HEALTH_BAR_HEIGHT);
    }
  }

  /**
   * Selects the bar colour based on the current HP fraction.
   *
   * Colour progression (high → low HP):
   *  - fraction > YELLOW_THRESHOLD  → green  (healthy)
   *  - fraction > RED_THRESHOLD     → yellow (caution)
   *  - fraction ≤ RED_THRESHOLD     → red    (critical)
   *
   * Thresholds are defined in `HudConfig.ts` and can be tuned by designers
   * without modifying this logic.
   */
  private _colourFor(fraction: number): number {
    if (fraction > HUD_HEALTH_YELLOW_THRESHOLD) return HUD_HEALTH_GREEN;
    if (fraction > HUD_HEALTH_RED_THRESHOLD)    return HUD_HEALTH_YELLOW;
    return HUD_HEALTH_RED;
  }

  /** Current fill fraction (0–1). Useful for testing and external inspection. */
  get fraction(): number {
    return this._max > 0 ? Math.max(0, this._current / this._max) : 0;
  }

  /** The fill colour currently applied to the bar (Phaser hex). */
  get fillColour(): number {
    return this._colourFor(this.fraction);
  }
}
