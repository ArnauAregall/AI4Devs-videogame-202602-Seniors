// ============================================================
// DestructibleProp.ts — A breakable environmental prop.
// @spec FR-DP-01 Two destructible prop subtypes (barrel, crate)
// @spec FR-DP-02 Hit detection against player and enemy attack hitboxes; no blocking physics body
// @spec FR-DP-03 Destruction animation (tween, ≤ 500 ms)
// @spec FR-DP-04 Item reveal on destruction (probabilistic)
// ============================================================
import Phaser from 'phaser';
import {
  ASSET_KEY_PROP_BARREL,
  ASSET_KEY_PROP_DEBRIS,
} from '../assets/AssetKeys';
import { GameConfig } from '../config/GameConfig';
import type { PropDef, ItemType } from './StageData';

export type SpawnItemCallback = (type: ItemType, worldX: number, worldY: number) => void;

/** Delay (ms) between the crushed-state swap and the destruction tween. */
const CRUSHED_LINGER_MS = 300;

export class DestructibleProp {
  /**
   * Single sprite — shows the intact barrel for all hits; crushed tint is applied on destruction.
   * Uses scene.add.sprite (no Arcade physics body) so the player can walk through freely.
   * @spec FR-DP-01, FR-DP-02
   */
  private readonly _sprite: Phaser.GameObjects.Sprite;

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

    // All subtypes use barrel asset as placeholder (crate/dumpster sprites unavailable)
    const textureKey = ASSET_KEY_PROP_BARREL;
    const screenX = def.worldX - getCameraX();

    this._sprite = scene.add.sprite(screenX, def.worldY, textureKey);
    this._sprite.setDepth(6);
    this._sprite.setFrame(0); // frame 0 = intact state

    this._fixedUpdateBound = this._fixedUpdate.bind(this);
    scene.registerFixedUpdate(this._fixedUpdateBound);
  }

  /**
   * Register one hit. Each call counts as a single hit regardless of damage value.
   * No visual changes until the final hit triggers the destruction sequence.
   * No-op if already destroyed.
   * @spec FR-DP-02
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

  /** Screen-space hurtbox rect for collision queries. Returns zero-size when dead. @spec FR-DP-02, FR-DP-03 */
  get hurtboxRect(): { x: number; y: number; w: number; h: number } {
    if (this._dead) return { x: 0, y: 0, w: 0, h: 0 };
    const w = this._sprite.displayWidth || 32;
    const h = this._sprite.displayHeight || 48;
    return {
      x: this._sprite.x - w / 2,
      y: this.def.worldY - h / 2,
      w,
      h,
    };
  }

  private _fixedUpdate(_dt: number): void {
    if (this._dead) return;
    this._sprite.x = this.def.worldX - this.getCameraX();
  }

  /**
   * Apply crushed frame and play destruction animation.
   * @spec FR-DP-03, FR-DP-06
   */
  private _scheduleDestroy(): void {
    if (this._dead) return;
    this._dead = true;
    this.scene.unregisterFixedUpdate(this._fixedUpdateBound);

    // Apply crushed frame before destruction animation. @spec barrel-damage-states
    this._sprite.setFrame(1); // frame 1 = crushed state

    this.scene.time.addEvent({
      delay: CRUSHED_LINGER_MS,
      callback: this._playDestructionAnim,
      callbackScope: this,
    });
  }

  private _playDestructionAnim(): void {
    const animKey = 'prop-barrel-destroy';
    this._sprite.play(animKey);
    this._sprite.on('animationcomplete', this._onDestructionComplete, this);
  }

  private _onDestructionComplete(): void {
    // Probabilistic item drop. @spec health-item-drop, FR-DP-04
    if (this.def.dropItemType !== null && Math.random() < this.def.dropChance) {
      this.onSpawnItem(this.def.dropItemType, this.def.worldX, this.def.worldY);
    }

    // Emit debris particles. @spec destruction-particles
    this._emitDebrisParticles();

    this._sprite.destroy();
  }

  private _emitDebrisParticles(): void {
    let count: number = GameConfig.DEBRIS_PARTICLE_COUNT;
    if (GameConfig.PARTICLE_QUALITY === 'low') {
      count = Math.floor(count * 0.5);
    }
    const emitter = this.scene.add.particles(this._sprite.x, this._sprite.y, ASSET_KEY_PROP_DEBRIS, {
      lifespan: GameConfig.DEBRIS_PARTICLE_LIFESPAN_MS,
      gravityY: GameConfig.DEBRIS_PARTICLE_GRAVITY_Y,
      emitting: false,
    });
    emitter.explode(count);
  }

  destroy(): void {
    if (!this._dead) {
      this.scene.unregisterFixedUpdate(this._fixedUpdateBound);
    }
    this._sprite.destroy();
  }
}

