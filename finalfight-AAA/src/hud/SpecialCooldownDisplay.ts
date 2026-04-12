/**
 * Pip bar showing how much of the special-attack cooldown has recovered.
 * fraction = 0 → fully recharged (bar full); fraction = 1 → on cooldown (bar empty).
 *
 * @spec hud – Requirement: SpecialCooldownDisplay fraction
 */
import Phaser from 'phaser';
import {
  HUD_SPECIAL_X, HUD_SPECIAL_Y,
  HUD_SPECIAL_WIDTH, HUD_SPECIAL_HEIGHT,
} from './HudConfig';

const COLOUR_READY    = 0x22aaff;
const COLOUR_CHARGING = 0x336688;

export class SpecialCooldownDisplay {
  private readonly _bg:   Phaser.GameObjects.Graphics;
  private readonly _fill: Phaser.GameObjects.Graphics;
  private _fraction = 0;

  constructor(scene: Phaser.Scene) {
    this._bg   = scene.add.graphics().setDepth(9999);
    this._fill = scene.add.graphics().setDepth(9999);
    this._redraw();
  }

  /** @spec hud Update cooldown state (0 = full, 1 = empty). */
  update(fraction: number): void {
    this._fraction = Math.max(0, Math.min(1, fraction));
    this._redraw();
  }

  /** @spec hud Current fraction (for testing). */
  get fraction(): number { return this._fraction; }

  private _redraw(): void {
    const fillWidth = Math.round(HUD_SPECIAL_WIDTH * (1 - this._fraction));
    const colour    = this._fraction === 0 ? COLOUR_READY : COLOUR_CHARGING;

    this._bg.clear();
    this._bg.fillStyle(0x000000, 0.7);
    this._bg.fillRect(HUD_SPECIAL_X, HUD_SPECIAL_Y, HUD_SPECIAL_WIDTH, HUD_SPECIAL_HEIGHT);

    this._fill.clear();
    if (fillWidth > 0) {
      this._fill.fillStyle(colour, 1);
      this._fill.fillRect(HUD_SPECIAL_X, HUD_SPECIAL_Y, fillWidth, HUD_SPECIAL_HEIGHT);
    }
  }
}
