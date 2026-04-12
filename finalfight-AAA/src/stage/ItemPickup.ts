// ============================================================
// ItemPickup.ts — A collectible item that despawns after 15 s.
// @spec FR-IP-01 Item collected on player overlap
// @spec FR-IP-02 Auto-despawn after 15 seconds (900 ticks)
// @spec FR-IP-03 Health pickup restores ITEM_HEALTH_RESTORE_AMOUNT HP
// ============================================================
import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { ASSET_KEY_CYBERPUNK_DECORATIONS } from '../assets/AssetKeys';
import type { ItemType } from './StageData';
import type { PlayerController } from '../player/PlayerController';

export class ItemPickup {
  private readonly _sprite: Phaser.GameObjects.Image;
  private _ticksRemaining: number;
  private _collected: boolean = false;
  private _despawning: boolean = false;
  private readonly _fixedUpdateBound: (dt: number) => void;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly type: ItemType,
    private readonly worldX: number,
    private readonly worldY: number,
    private readonly getCameraX: () => number,
    private readonly getPlayer: () => PlayerController | null,
  ) {
    this._ticksRemaining = GameConfig.ITEM_DESPAWN_TICKS;

    this._sprite = scene.add.image(
      worldX - getCameraX(),
      worldY,
      ASSET_KEY_CYBERPUNK_DECORATIONS,
    );
    this._sprite.setDepth(7);

    this._fixedUpdateBound = this._fixedUpdate.bind(this);
    scene.registerFixedUpdate(this._fixedUpdateBound);
  }

  /** True after item has been collected. */
  get isCollected(): boolean { return this._collected; }

  private _fixedUpdate(_dt: number): void {
    if (this._collected) return;

    // Update screen position
    this._sprite.x = this.worldX - this.getCameraX();

    // Despawn countdown
    if (!this._despawning) {
      this._ticksRemaining--;
      if (this._ticksRemaining <= 0) {
        this._startDespawn();
        return;
      }
    }

    // Check proximity overlap with player (simple bounding-box check)
    const player = this.getPlayer();
    if (player) {
      const playerSprite = player.sprite;
      if (playerSprite) {
        const dx = Math.abs(this._sprite.x - playerSprite.x);
        const dy = Math.abs(this._sprite.y - playerSprite.y);
        if (dx < 24 && dy < 24) {
          this._collect(player);
        }
      }
    }
  }

  private _collect(player: PlayerController): void {
    if (this._collected) return;
    this._collected = true;
    this._despawning = true;
    this.scene.unregisterFixedUpdate(this._fixedUpdateBound);

    if (this.type === 'health') {
      player.heal(GameConfig.ITEM_HEALTH_RESTORE_AMOUNT);
    } else if (this.type === 'score') {
      this.scene.events.emit('scorePickup', { worldX: this.worldX });
    }

    this._sprite.destroy();
  }

  private _startDespawn(): void {
    this._despawning = true;
    this.scene.unregisterFixedUpdate(this._fixedUpdateBound);

    this.scene.tweens.add({
      targets: this._sprite,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        this._sprite.destroy();
      },
    });
  }

  destroy(): void {
    if (!this._collected && !this._despawning) {
      this.scene.unregisterFixedUpdate(this._fixedUpdateBound);
    }
    if (this._sprite.active) {
      this._sprite.destroy();
    }
  }
}
