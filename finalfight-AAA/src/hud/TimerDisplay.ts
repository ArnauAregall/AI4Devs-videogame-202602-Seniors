/**
 * Countdown timer display. Turns warning colour at HUD_TIMER_WARNING_SECONDS.
 *
 * @spec hud – Requirement: TimerDisplay warning colour
 */
import Phaser from 'phaser';
import {
  HUD_TIMER_X, HUD_TIMER_Y,
  HUD_FONT_FAMILY, HUD_FONT_SIZE_NORMAL,
  HUD_TIMER_WARNING_SECONDS, HUD_TIMER_WARNING_COLOUR,
  HUD_TIMER_START_SECONDS, HUD_TIMER_COLOUR_NORMAL,
  HUD_DEPTH,
} from './HudConfig';

const COLOUR_NORMAL  = HUD_TIMER_COLOUR_NORMAL;
const COLOUR_WARNING = `#${HUD_TIMER_WARNING_COLOUR.toString(16).padStart(6, '0')}`;

export class TimerDisplay {
  private readonly _text:   Phaser.GameObjects.Text;
  private _remaining: number;

  constructor(scene: Phaser.Scene) {
    this._remaining = HUD_TIMER_START_SECONDS;
    this._text = scene.add
      .text(HUD_TIMER_X, HUD_TIMER_Y, String(this._remaining), {
        fontFamily: HUD_FONT_FAMILY,
        fontSize:   HUD_FONT_SIZE_NORMAL,
        color:      COLOUR_NORMAL,
      })
      .setOrigin(0.5, 0)
      .setDepth(HUD_DEPTH);
  }

  /** @spec hud Update displayed time and warning colour. */
  update(remaining: number): void {
    this._remaining = remaining;
    this._text.setText(String(remaining));
    this._text.setColor(
      remaining <= HUD_TIMER_WARNING_SECONDS ? COLOUR_WARNING : COLOUR_NORMAL,
    );
  }

  /** @spec hud Remaining seconds (for testing). */
  get remaining(): number { return this._remaining; }

  /** @spec hud Current text colour string (for testing). */
  get colour(): string {
    return this._remaining <= HUD_TIMER_WARNING_SECONDS ? COLOUR_WARNING : COLOUR_NORMAL;
  }
}
