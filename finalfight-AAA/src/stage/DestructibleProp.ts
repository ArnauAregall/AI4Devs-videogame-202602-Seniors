// ============================================================
// DestructibleProp.ts — A breakable environmental prop.
// @spec FR-DP-01 Two destructible prop subtypes (barrel, crate)
// @spec FR-DP-02 Hit detection against player attack hitboxes
// @spec FR-DP-03 Destruction animation (tween, ≤ 500 ms)
// @spec FR-DP-04 Item reveal on destruction
// ============================================================
import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import {
  ASSET_KEY_PROP_BARREL,
} from '../assets/AssetKeys';
import type { PropDef, ItemType } from './StageData';

export type SpawnItemCallback = (type: ItemType, worldX: number, worldY: number) => void;

export class DestructibleProp {
  private readonly _sprite: Phaser.GameObjects.Image;
  private _hp: number;
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

    this._sprite = scene.add.image(
      def.worldX - getCameraX(),
      def.worldY,
      textureKey,
    );
    this._sprite.setDepth(6);

    this._fixedUpdateBound = this._fixedUpdate.bind(this);
    scene.registerFixedUpdate(this._fixedUpdateBound);
  }

  /** Apply damage. No-op if already destroyed. */
  hit(damage: number): void {
    if (this._dead) return;
    this._hp -= damage;
    if (this._hp <= 0) {
      this._destroy();
    }
  }

  /** Current HP — exposed for testing. */
  get hp(): number { return this._hp; }

  /** True after destruction begins. */
  get isDead(): boolean { return this._dead; }

  private _fixedUpdate(_dt: number): void {
    if (this._dead) return;
    this._sprite.x = this.def.worldX - this.getCameraX();
  }

  private _destroy(): void {
    if (this._dead) return;
    this._dead = true;
    this.scene.unregisterFixedUpdate(this._fixedUpdateBound);

    // Destruction tween: scale up then fade out (total ≤ 500 ms)
    this.scene.tweens.add({
      targets: this._sprite,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 150,
      yoyo: false,
      onComplete: () => {
        this.scene.tweens.add({
          targets: this._sprite,
          alpha: 0,
          duration: 200,
          onComplete: () => {
            this._sprite.destroy();
          },
        });
      },
    });

    if (this.def.dropItemType !== null) {
      this.onSpawnItem(this.def.dropItemType, this.def.worldX, this.def.worldY);
    }
  }

  destroy(): void {
    if (!this._dead) {
      this.scene.unregisterFixedUpdate(this._fixedUpdateBound);
    }
    this._sprite.destroy();
  }
}
