/**
 * Displays remaining player lives with a "P1 x N" label.
 *
 * @spec hud – Requirement: LivesDisplay label
 */
import Phaser from 'phaser';
import {
  HUD_LIVES_X, HUD_LIVES_Y,
  HUD_FONT_FAMILY, HUD_FONT_SIZE_SMALL,
  HUD_DEPTH,
} from './HudConfig';

export class LivesDisplay {
  private readonly _text: Phaser.GameObjects.Text;
  private _lives = 0;

  constructor(scene: Phaser.Scene, lives: number) {
    this._lives = lives;
    this._text  = scene.add
      .text(HUD_LIVES_X, HUD_LIVES_Y, this._label(), {
        fontFamily: HUD_FONT_FAMILY,
        fontSize:   HUD_FONT_SIZE_SMALL,
        color:      '#ffffff',
      })
      .setDepth(HUD_DEPTH);
  }

  /** @spec hud Update lives count. */
  update(lives: number): void {
    this._lives = lives;
    this._text.setText(this._label());
  }

  /** @spec hud Current lives value (for testing). */
  get lives(): number { return this._lives; }

  /** @spec hud Raw label text (for testing). */
  get text(): string { return this._text.text; }

  private _label(): string {
    return `P1 x ${this._lives}`;
  }
}
