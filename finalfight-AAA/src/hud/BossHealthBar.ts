/**
 * Renders the boss health bar, centred near the bottom of the screen.
 * Hidden by default; shown when boss arrives.
 *
 * @spec hud – Requirement: BossHealthBar visibility
 */
import Phaser from 'phaser';
import {
  HUD_BOSS_BAR_Y, HUD_BOSS_BAR_WIDTH, HUD_BOSS_BAR_HEIGHT,
  HUD_HEALTH_GREEN, HUD_HEALTH_YELLOW, HUD_HEALTH_RED,
  HUD_DEPTH,
  HUD_HEALTH_YELLOW_THRESHOLD, HUD_HEALTH_RED_THRESHOLD,
} from './HudConfig';
import { GameConfig } from '../config/GameConfig';

const BOSS_BAR_X = Math.round((GameConfig.CANVAS_WIDTH - HUD_BOSS_BAR_WIDTH) / 2);

export class BossHealthBar {
  private readonly _bg:   Phaser.GameObjects.Graphics;
  private readonly _fill: Phaser.GameObjects.Graphics;
  private _current: number  = 0;
  private _max:     number  = 1;
  private _visible: boolean = false;

  constructor(scene: Phaser.Scene) {
    this._bg   = scene.add.graphics().setDepth(HUD_DEPTH);
    this._fill = scene.add.graphics().setDepth(HUD_DEPTH);
    this._setVisible(false);
  }

  /** @spec hud Show boss bar and set maximum health. */
  show(maxHealth: number): void {
    this._max     = maxHealth;
    this._current = maxHealth;
    this._visible = true;
    this._setVisible(true);
    this._redraw();
  }

  /** @spec hud Update boss bar fill. */
  update(current: number, max: number): void {
    this._current = current;
    this._max     = max;
    this._redraw();
  }

  /** @spec hud Hide the boss bar. */
  hide(): void {
    this._visible = false;
    this._setVisible(false);
  }

  /** @spec hud Whether the bar is currently visible. */
  get visible(): boolean { return this._visible; }

  /** @spec hud Fill fraction 0–1 (for testing). */
  get fraction(): number {
    return this._max > 0 ? Math.max(0, this._current / this._max) : 0;
  }

  private _setVisible(v: boolean): void {
    this._bg.setVisible(v);
    this._fill.setVisible(v);
  }

  private _redraw(): void {
    const fraction  = this.fraction;
    const fillWidth = Math.round(HUD_BOSS_BAR_WIDTH * fraction);
    const colour    = this._colourFor(fraction);

    this._bg.clear();
    this._bg.fillStyle(0x000000, 0.7);
    this._bg.fillRect(BOSS_BAR_X, HUD_BOSS_BAR_Y, HUD_BOSS_BAR_WIDTH, HUD_BOSS_BAR_HEIGHT);

    this._fill.clear();
    if (fillWidth > 0) {
      this._fill.fillStyle(colour, 1);
      this._fill.fillRect(BOSS_BAR_X, HUD_BOSS_BAR_Y, fillWidth, HUD_BOSS_BAR_HEIGHT);
    }
  }

  private _colourFor(fraction: number): number {
    if (fraction > HUD_HEALTH_YELLOW_THRESHOLD) return HUD_HEALTH_GREEN;
    if (fraction > HUD_HEALTH_RED_THRESHOLD)    return HUD_HEALTH_YELLOW;
    return HUD_HEALTH_RED;
  }
}
