// ============================================================
// ItemPickup.ts — A collectible item that optionally despawns after a timer.
// @spec FR-IP-01 Item collected on player or enemy overlap
// @spec FR-IP-02 Auto-despawn timer is optional (null = persist indefinitely)
// @spec FR-IP-03 ItemPickup positioned on ground plane
// @spec FR-HI-20 Pickup on spatial overlap — no button press required
// @spec FR-HI-22 Item consumed at most once
// @spec FR-HI-24 Knockdown/death/invincibility entities cannot collect
// @spec FR-HI-30 Health restoration = ITEM_HEALTH_RESTORE_AMOUNT
// ============================================================
import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import { ASSET_KEY_PROP_SUSHI_1, ASSET_KEY_PROP_SUSHI_2 } from '../assets/AssetKeys';
import type { ItemType } from './StageData';
import type { PlayerController } from '../player/PlayerController';
import type { EnemyController } from '../enemy/EnemyController';
import { PlayerState } from '../player/PlayerState';
import { EnemyState } from '../enemy/EnemyState';

/** Collectible pickup entity — either a health sushi or a score pickup. */
export class ItemPickup {
  private readonly _sprite: Phaser.GameObjects.Image;
  private _ticksRemaining: number | null;
  private _collected: boolean = false;
  private _despawning: boolean = false;
  private readonly _fixedUpdateBound: (dt: number) => void;

  /**
   * @param despawnTicks - Ticks until auto-despawn, or `null` to persist indefinitely. @spec FR-IP-02
   */
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly type: ItemType,
    private readonly worldX: number,
    private readonly worldY: number,
    private readonly getCameraX: () => number,
    private readonly getPlayer: () => PlayerController | null,
    private readonly getEnemies: () => ReadonlyMap<string, EnemyController>,
    despawnTicks: number | null = GameConfig.ITEM_DESPAWN_TICKS,
  ) {
    this._ticksRemaining = despawnTicks;

    // Sushi sprite for health; random variant per item. @spec FR-HI-11
    const textureKey = type === 'health'
      ? (Math.random() < 0.5 ? ASSET_KEY_PROP_SUSHI_1 : ASSET_KEY_PROP_SUSHI_2)
      : ASSET_KEY_PROP_SUSHI_1;

    this._sprite = scene.add.image(
      worldX - getCameraX(),
      worldY,
      textureKey,
    );
    this._sprite.setDepth(7);
    this._sprite.setScale(0.5);

    this._fixedUpdateBound = this._fixedUpdate.bind(this);
    scene.registerFixedUpdate(this._fixedUpdateBound);
  }

  /** True after item has been collected or despawned. */
  get isCollected(): boolean { return this._collected; }

  private _fixedUpdate(_dt: number): void {
    if (this._collected) return;

    // Update screen position. @spec FR-IP-03
    this._sprite.x = this.worldX - this.getCameraX();

    // Despawn countdown — skipped when timer is null. @spec FR-IP-02
    if (!this._despawning && this._ticksRemaining !== null) {
      this._ticksRemaining--;
      if (this._ticksRemaining <= 0) {
        this._startDespawn();
        return;
      }
    }

    // Player overlap check. @spec FR-IP-01, FR-HI-20
    const player = this.getPlayer();
    if (player && !this._collected) {
      if (this._canCollect(player) && this._overlaps(this._sprite, player.sprite)) {
        this._collect({ heal: (n) => player.heal(n), isScore: false });
        return;
      }
    }

    // Enemy overlap checks. @spec FR-HI-23
    if (!this._collected) {
      for (const enemy of this.getEnemies().values()) {
        if (enemy.isDead) continue;
        if (!this._canCollectEnemy(enemy)) continue;
        if (this._overlaps(this._sprite, enemy.sprite)) {
          this._collect({ heal: (n) => enemy.heal(n), isScore: false });
          return;
        }
      }
    }
  }

  /** Check whether a player entity is eligible to collect (not in excluded states). @spec FR-HI-24 */
  private _canCollect(player: PlayerController): boolean {
    if (player.iFramesRemaining > 0) return false;
    const s = player.state;
    return s !== PlayerState.Knockdown && s !== PlayerState.GetUp;
  }

  /** Check whether an enemy entity is eligible to collect. @spec FR-HI-24 */
  private _canCollectEnemy(enemy: EnemyController): boolean {
    const s = enemy.state;
    return s !== EnemyState.Knockdown && s !== EnemyState.Death;
  }

  /** Simple bounding-box proximity check. */
  private _overlaps(item: Phaser.GameObjects.Image, entity: Phaser.Physics.Arcade.Sprite): boolean {
    const dx = Math.abs(item.x - entity.x);
    const dy = Math.abs(item.y - entity.y);
    return dx < 24 && dy < 24;
  }

  private _collect(entity: { heal: (n: number) => void; isScore: boolean }): void {
    if (this._collected) return; // Guard: already consumed. @spec FR-HI-22
    this._collected = true;
    this._despawning = true;
    this.scene.unregisterFixedUpdate(this._fixedUpdateBound);

    if (this.type === 'health') {
      entity.heal(GameConfig.ITEM_HEALTH_RESTORE_AMOUNT);
      this.scene.events.emit('healthRestored', { worldX: this.worldX });
    } else if (this.type === 'score') {
      this.scene.events.emit('scorePickup', { worldX: this.worldX });
    }

    // Brief pickup visual effect before removal. @spec FR-HI-35
    this.scene.tweens.add({
      targets: this._sprite,
      scaleX: 1.5,
      scaleY: 1.5,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        if (this._sprite.active) this._sprite.destroy();
      },
    });
  }

  private _startDespawn(): void {
    this._despawning = true;
    this.scene.unregisterFixedUpdate(this._fixedUpdateBound);

    this.scene.tweens.add({
      targets: this._sprite,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        if (this._sprite.active) this._sprite.destroy();
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
