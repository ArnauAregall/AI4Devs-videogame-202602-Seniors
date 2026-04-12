/**
 * Displays "N HIT" combo count. Visible only when count ≥ HUD_COMBO_MIN_COUNT
 * and the combo window is active.
 *
 * @spec hud – Requirement: ComboCounter minimum visibility
 */
import Phaser from 'phaser';
import {
  HUD_COMBO_X, HUD_COMBO_Y,
  HUD_FONT_FAMILY, HUD_FONT_SIZE_LARGE,
  HUD_COMBO_MIN_COUNT, HUD_DEPTH,
} from './HudConfig';

export class ComboCounter {
  private readonly _text: Phaser.GameObjects.Text;
  private _count        = 0;
  private _windowActive = false;

  constructor(scene: Phaser.Scene) {
    this._text = scene.add
      .text(HUD_COMBO_X, HUD_COMBO_Y, '', {
        fontFamily: HUD_FONT_FAMILY,
        fontSize:   HUD_FONT_SIZE_LARGE,
        color:      '#ffff00',
      })
      .setDepth(HUD_DEPTH)
      .setVisible(false);
  }

  /** @spec hud Update combo state. */
  update(count: number, windowActive: boolean): void {
    this._count        = count;
    this._windowActive = windowActive;
    const show = count >= HUD_COMBO_MIN_COUNT && windowActive;
    this._text.setVisible(show);
    if (show) {
      this._text.setText(`${count} HIT`);
    }
  }

  /** @spec hud Whether the counter is currently shown (for testing). */
  get visible(): boolean { return this._count >= HUD_COMBO_MIN_COUNT && this._windowActive; }

  /** @spec hud Current combo count (for testing). */
  get count(): number { return this._count; }
}
