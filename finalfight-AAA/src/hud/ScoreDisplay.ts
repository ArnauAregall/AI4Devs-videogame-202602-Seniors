/**
 * Right-aligned score text.
 *
 * @spec hud – Requirement: ScoreDisplay right-aligned
 */
import Phaser from 'phaser';
import {
  HUD_SCORE_X, HUD_SCORE_Y,
  HUD_FONT_FAMILY, HUD_FONT_SIZE_NORMAL,
} from './HudConfig';

export class ScoreDisplay {
  private readonly _text: Phaser.GameObjects.Text;
  private _score = 0;

  constructor(scene: Phaser.Scene) {
    this._text = scene.add
      .text(HUD_SCORE_X, HUD_SCORE_Y, '0', {
        fontFamily: HUD_FONT_FAMILY,
        fontSize:   HUD_FONT_SIZE_NORMAL,
        color:      '#ffffff',
      })
      .setOrigin(1, 0)
      .setDepth(9999);
  }

  /** @spec hud Update displayed score. */
  update(score: number): void {
    this._score = score;
    this._text.setText(String(score));
  }

  /** @spec hud Current score value (for testing). */
  get score(): number { return this._score; }

  /** @spec hud Raw text content (for testing). */
  get text(): string { return this._text.text; }
}
