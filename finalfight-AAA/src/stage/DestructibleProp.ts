// ============================================================
// DestructibleProp.ts — A breakable environmental prop.
// @spec FR-DP-01 Two destructible prop subtypes (barrel, crate)
// @spec FR-DP-02 Hit detection against player attack hitboxes; no blocking physics body
// @spec FR-DP-03 Destruction animation (tween, ≤ 500 ms)
// @spec FR-DP-04 Item reveal on destruction
// @spec FR-DP-05 Dual-state sprite visibility (healthy / crushed)
// ============================================================
import Phaser from 'phaser';
import {
  ASSET_KEY_PROP_BARREL,
} from '../assets/AssetKeys';
import type { PropDef, ItemType } from './StageData';

export type SpawnItemCallback = (type: ItemType, worldX: number, worldY: number) => void;

/** Delay (ms) between the crushed-state swap and the destruction tween. @spec FR-DP-05 */
const CRUSHED_LINGER_MS = 300;

export class DestructibleProp {
  /**
   * Healthy sprite — visible from creation until the final hit.
   * Uses scene.add.image (no Arcade physics body) so the player can walk through freely.
   * @spec FR-DP-02
   */
  private readonly _spriteHealthy: Phaser.GameObjects.Image;
  /**
   * Crushed sprite — hidden on creation, shown after the final hit.
   * @spec FR-DP-05
   */
  private readonly _spriteCrushed: Phaser.GameObjects.Image;

  private _hp: number;
  /** Number of times hit() has been called (each call = one hit). @spec FR-DP-02 */
  private _hitCount: number = 0;
  private _dead: boolean = false;
  private readonly _fixedUpdateBound: (dt: number) => void;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly def: PropDef,
    private readonly getCameraX: () => number,
    private readonly onSpawnItem: SpawnItemCallback,
  ) {
    this._hp = def.hp;

    // Both 'barrel' and 'crate' use barrel asset as placeholder (crate sprite unavailable)
    const textureKey = ASSET_KEY_PROP_BARREL;
    const screenX = def.worldX - getCameraX();

    this._spriteHealthy = scene.add.image(screenX, def.worldY, textureKey);
    this._spriteHealthy.setDepth(6);

    this._spriteCrushed = scene.add.image(screenX, def.worldY, textureKey);
    this._spriteCrushed.setDepth(6);
    // Tint to visually distinguish crushed state from healthy state
    this._spriteCrushed.setTint(0x888888);
    this._spriteCrushed.setVisible(false);

    this._fixedUpdateBound = this._fixedUpdate.bind(this);
    scene.registerFixedUpdate(this._fixedUpdateBound);
  }

  /**
   * Register one hit. Each call counts as a single hit regardless of damage value.
   * On the third hit: swap to crushed sprite, then schedule destruction.
   * No-op if already destroyed.
   * @spec FR-DP-02, FR-DP-05
   */
  hit(_damage: number): void {
    if (this._dead) return;
    this._hp = Math.max(0, this._hp - _damage);
    this._hitCount++;
    if (this._hitCount >= this.def.hp) {
      this._scheduleDestroy();
    }
  }

  /** Current HP — exposed for testing. */
  get hp(): number { return this._hp; }

  /** Number of hits received so far — exposed for testing. */
  get hitCount(): number { return this._hitCount; }

  /** True after destruction begins. */
  get isDead(): boolean { return this._dead; }

  private _fixedUpdate(_dt: number): void {
    if (this._dead) return;
    const screenX = this.def.worldX - this.getCameraX();
    this._spriteHealthy.x = screenX;
    this._spriteCrushed.x = screenX;
  }

  /**
   * Swap to the crushed sprite state and schedule the destruction tween.
   * @spec FR-DP-05
   */
  private _scheduleDestroy(): void {
    if (this._dead) return;
    this._dead = true;
    this.scene.unregisterFixedUpdate(this._fixedUpdateBound);

    // Swap to crushed state
    this._spriteHealthy.setVisible(false);
    this._spriteCrushed.setVisible(true);

    // Wait briefly then play the destruction tween
    this.scene.time.addEvent({
      delay: CRUSHED_LINGER_MS,
      callback: this._destroy,
      callbackScope: this,
    });
  }

  private _destroy(): void {
    // Emit item drop before visual destruction
    if (this.def.dropItemType !== null) {
      this.onSpawnItem(this.def.dropItemType, this.def.worldX, this.def.worldY);
    }

    // Destruction tween on crushed sprite: scale up then fade out (total ≤ 500 ms)
    this.scene.tweens.add({
      targets: this._spriteCrushed,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 150,
      yoyo: false,
      onComplete: () => {
        this.scene.tweens.add({
          targets: this._spriteCrushed,
          alpha: 0,
          duration: 200,
          onComplete: () => {
            this._spriteCrushed.destroy();
          },
        });
      },
    });
  }

  destroy(): void {
    if (!this._dead) {
      this.scene.unregisterFixedUpdate(this._fixedUpdateBound);
    }
    this._spriteHealthy.destroy();
    this._spriteCrushed.destroy();
  }
}
