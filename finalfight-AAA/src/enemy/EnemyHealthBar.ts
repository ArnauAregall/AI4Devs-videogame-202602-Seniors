/**
 * Per-enemy health bar rendered in world space above the enemy sprite.
 * Uses Phaser.GameObjects.Graphics to draw two layered rectangles:
 * a background track and a foreground fill proportional to current HP.
 *
 * @spec enemy-health-bar
 * @implements FR-EB-20, FR-EB-21, FR-EB-22, FR-EB-23, FR-EB-24, FR-EB-25, FR-EB-27
 */
import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';

// ── Visual constants ──────────────────────────────────────────────────────────

/** Total width of the bar in px. @spec FR-EB-25 */
export const BAR_WIDTH    = 32;
/** Height of the bar in px. @spec FR-EB-25 */
export const BAR_HEIGHT   = 4;
/** Vertical offset above the sprite's world-y (px). @spec FR-EB-23 */
export const BAR_Y_OFFSET = 38;

/** Background track colour (dark grey). @spec FR-EB-25 */
export const COLOR_TRACK = 0x333333;
/** Full-health foreground colour (green). @spec FR-EB-27 */
export const COLOR_HIGH  = 0x44dd44;
/** Mid-health foreground colour (yellow). @spec FR-EB-27 */
export const COLOR_MID   = 0xdddd44;
/** Low-health foreground colour (red). @spec FR-EB-27 */
export const COLOR_LOW   = 0xdd4444;

/** HP fraction below which the bar turns yellow. */
export const THRESHOLD_MID = 0.5;
/** HP fraction below which the bar turns red. */
export const THRESHOLD_LOW = 0.25;

// ─────────────────────────────────────────────────────────────────────────────

export class EnemyHealthBar {
  private _gfx: Phaser.GameObjects.Graphics | null;

  /**
   * @param scene  The Phaser scene that owns this bar.
   * @spec FR-EB-22 — created together with the enemy; depth above entity layer.
   */
  constructor(scene: Phaser.Scene) {
    this._gfx = scene.add.graphics();
    this._gfx.setDepth(GameConfig.ENTITY_DEPTH + 1);
  }

  /**
   * Redraws the bar at the enemy sprite position.
   * Called every fixedUpdate tick. @spec FR-EB-21, FR-EB-23, NFR-EB-03
   */
  update(hp: number, maxHp: number, spriteX: number, spriteY: number): void {
    if (!this._gfx) return;
    this._gfx.clear();

    const fraction = maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 0;
    const fillW    = Math.floor(fraction * BAR_WIDTH);
    const left     = spriteX - BAR_WIDTH / 2;
    const top      = spriteY - BAR_Y_OFFSET;

    // Background track
    this._gfx.fillStyle(COLOR_TRACK, 1);
    this._gfx.fillRect(left, top, BAR_WIDTH, BAR_HEIGHT);

    // Foreground fill — colour shifts with HP. @spec FR-EB-27
    const color =
      fraction > THRESHOLD_MID ? COLOR_HIGH :
      fraction > THRESHOLD_LOW ? COLOR_MID  :
                                  COLOR_LOW;

    this._gfx.fillStyle(color, 1);
    this._gfx.fillRect(left, top, fillW, BAR_HEIGHT);
  }

  /**
   * Removes the graphics object from the scene.
   * Called when the enemy enters Death state or is destroyed. @spec FR-EB-22
   */
  destroy(): void {
    if (!this._gfx) return;
    this._gfx.destroy();
    this._gfx = null;
  }
}
