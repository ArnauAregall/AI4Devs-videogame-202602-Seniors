/**
 * Renders the player health bar with colour-coded fill.
 *
 * @spec hud – Requirement: HealthBar colour thresholds
 */
import Phaser from 'phaser';
import {
  HUD_HEALTH_BAR_X, HUD_HEALTH_BAR_Y, HUD_HEALTH_BAR_WIDTH, HUD_HEALTH_BAR_HEIGHT,
  HUD_HEALTH_GREEN, HUD_HEALTH_YELLOW, HUD_HEALTH_RED,
  HUD_HEALTH_YELLOW_THRESHOLD, HUD_HEALTH_RED_THRESHOLD,
} from './HudConfig';

export class HealthBar {
  private readonly _bg:   Phaser.GameObjects.Graphics;
  private readonly _fill: Phaser.GameObjects.Graphics;
  private _current: number;
  private _max:     number;
  private _dirty = true;

  constructor(scene: Phaser.Scene, current: number, max: number) {
    this._current = current;
    this._max     = max;
    this._bg   = scene.add.graphics().setDepth(9999);
    this._fill = scene.add.graphics().setDepth(9999);
    this._redraw();
  }

  /**
   * @spec hud – Requirement: HealthBar updates on PLAYER_HEALTH_CHANGED
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

  private _colourFor(fraction: number): number {
    if (fraction > HUD_HEALTH_YELLOW_THRESHOLD) return HUD_HEALTH_GREEN;
    if (fraction > HUD_HEALTH_RED_THRESHOLD)    return HUD_HEALTH_YELLOW;
    return HUD_HEALTH_RED;
  }

  /** @spec hud Fill fraction 0–1 (for testing). */
  get fraction(): number {
    return this._max > 0 ? Math.max(0, this._current / this._max) : 0;
  }

  /** @spec hud Current fill colour. */
  get fillColour(): number {
    return this._colourFor(this.fraction);
  }
}
