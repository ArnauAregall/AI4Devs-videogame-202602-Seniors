/**
 * Toggleable debug overlay that draws hitboxes (red) and hurtboxes (green)
 * using a Phaser.GameObjects.Graphics object each render frame.
 *
 * @spec debug-renderer
 * @implements FR-CS-17, NFR-CS-04
 */
import Phaser from 'phaser';
import { CombatSystem } from './CombatSystem';
import { GameConfig } from '../config/GameConfig';

export class DebugRenderer {
  private readonly _graphics: Phaser.GameObjects.Graphics;
  private readonly _combat: CombatSystem;
  private _visible: boolean;

  constructor(scene: Phaser.Scene, combat: CombatSystem) {
    this._combat   = combat;
    this._visible  = GameConfig.DEBUG_HITBOXES;
    this._graphics = scene.add.graphics();
    this._graphics.setDepth(1000);
    this._graphics.setVisible(this._visible);
  }

  /**
   * Draw all active hitboxes and hurtboxes.
   * Call from GameScene.update() (render frame, not fixed tick).
   *
   * @spec debug-renderer – Requirement: Debug hitbox overlay rendering
   */
  update(): void {
    if (!this._visible) return;

    this._graphics.clear();

    // Hitboxes — red
    this._graphics.lineStyle(1, 0xff0000, 1);
    for (const hx of this._combat.getHitboxes().values()) {
      this._graphics.strokeRect(hx.rect.x, hx.rect.y, hx.rect.w, hx.rect.h);
    }

    // Hurtboxes — green
    this._graphics.lineStyle(1, 0x00ff00, 1);
    for (const hz of this._combat.getHurtboxes().values()) {
      this._graphics.strokeRect(hz.rect.x, hz.rect.y, hz.rect.w, hz.rect.h);
    }
  }

  /**
   * Show or hide the overlay at runtime without destroying the Graphics object.
   * @spec debug-renderer – Requirement: Runtime toggle without reload
   */
  setVisible(flag: boolean): void {
    this._visible = flag;
    this._graphics.setVisible(flag);
    if (!flag) this._graphics.clear();
  }

  destroy(): void {
    this._graphics.destroy();
  }
}
