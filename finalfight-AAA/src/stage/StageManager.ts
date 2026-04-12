// ============================================================
// StageManager.ts — Orchestrates all stage sub-systems.
// @spec FR-SM-01 One-way horizontal camera scroll
// @spec FR-SM-02 Scroll-trigger locking
// @spec FR-SM-03 Stage-clear detection
// @spec FR-SM-04 Stage-clear transition sequence
// @spec FR-SM-05 Boundary walls
// ============================================================
import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import type { StageData, ItemType } from './StageData';
import { ParallaxBackground } from './ParallaxBackground';
import { StageTimer } from './StageTimer';
import { SpawnController } from './SpawnController';
import { DestructibleProp } from './DestructibleProp';
import { ItemPickup } from './ItemPickup';
import type { PlayerController } from '../player/PlayerController';

/** Expected shape of GameScene for type-safe access. */
interface StageScene extends Phaser.Scene {
  getPlayer(): PlayerController | null;
}

export class StageManager {
  private _cameraX: number = 0;
  private _locked: boolean = false;
  private _cleared: boolean = false;

  private readonly _parallax: ParallaxBackground;
  private readonly _timer: StageTimer;
  private readonly _spawnControllers: Map<string, SpawnController> = new Map();
  private readonly _props: DestructibleProp[] = [];
  private readonly _pickups: ItemPickup[] = [];

  /** Triggers sorted ascending by worldX; fired flags per zoneId. */
  private readonly _triggersRemaining: Array<{ worldX: number; zoneId: string }>;
  private _zonesTotal: number = 0;
  private _zonesCleared: number = 0;

  private readonly _fixedUpdateBound: (dt: number) => void;
  private readonly _onZoneClearedBound: (zoneId: string) => void;

  constructor(
    private readonly scene: StageScene,
    private readonly data: StageData,
    private readonly stageIndex: number,
  ) {
    this._parallax = new ParallaxBackground(scene, data.layers);
    this._timer = new StageTimer(scene);

    // Build spawn controllers
    this._zonesTotal = data.spawnZones.length;
    for (const zone of data.spawnZones) {
      this._spawnControllers.set(zone.id, new SpawnController(scene, zone));
    }

    // Build props
    for (const propDef of data.props) {
      this._props.push(new DestructibleProp(
        scene,
        propDef,
        () => this._cameraX,
        this._spawnItem.bind(this),
      ));
    }

    // Copy scroll triggers sorted by worldX
    this._triggersRemaining = [...data.scrollTriggers].sort((a, b) => a.worldX - b.worldX);

    this._onZoneClearedBound = this._onZoneCleared.bind(this);
    scene.events.on('zoneCleared', this._onZoneClearedBound);

    this._fixedUpdateBound = this._fixedUpdate.bind(this);
    scene.registerFixedUpdate(this._fixedUpdateBound);
  }

  /** Current camera X world position. */
  get cameraX(): number { return this._cameraX; }

  /** True while scroll is locked by a trigger. */
  get isLocked(): boolean { return this._locked; }

  /** True after stage-clear sequence begins. */
  get isCleared(): boolean { return this._cleared; }

  private _fixedUpdate(_dt: number): void {
    if (this._cleared) return;

    const player = this.scene.getPlayer();
    const prevCameraX = this._cameraX;

    if (!this._locked && player) {
      // Advance camera rightward toward player (one-way: never move left)
      const target = player.sprite.x + this._cameraX - GameConfig.CANVAS_WIDTH / 2;
      if (target > this._cameraX) {
        const speed = GameConfig.CAMERA_MAX_SCROLL_SPEED / GameConfig.TARGET_FPS;
        this._cameraX = Math.min(
          this._cameraX + speed,
          Math.min(target, this.data.stageWidth - GameConfig.CANVAS_WIDTH),
        );
      }
    }

    // Update parallax with camera delta
    const delta = this._cameraX - prevCameraX;
    this._parallax.setCameraDelta(delta);

    // Update Phaser camera
    this.scene.cameras.main.scrollX = this._cameraX;

    // Check scroll triggers
    this._checkTriggers();

    // Clamp player to stage boundaries
    this._clampPlayer(player);

    // Check stage-clear condition
    if (!this._locked && player) {
      const playerWorldX = player.sprite.x + this._cameraX;
      if (this._zonesCleared >= this._zonesTotal && playerWorldX >= this.data.stageWidth - GameConfig.CANVAS_WIDTH) {
        this._startStageClear();
      }
    }
  }

  private _checkTriggers(): void {
    if (this._triggersRemaining.length === 0) return;

    const rightEdge = this._cameraX + GameConfig.CANVAS_WIDTH;
    const next = this._triggersRemaining[0];

    if (rightEdge >= next.worldX) {
      this._triggersRemaining.shift();
      this._locked = true;

      const ctrl = this._spawnControllers.get(next.zoneId);
      if (ctrl) {
        ctrl.activate(this._cameraX);
      }
    }
  }

  private _onZoneCleared(_zoneId: string): void {
    this._zonesCleared++;
    if (this._zonesCleared >= this._zonesTotal) {
      this._locked = false;
    }
  }

  private _startStageClear(): void {
    if (this._cleared) return;
    this._cleared = true;
    this._timer.stop();

    // Freeze all movement by locking
    this._locked = true;

    this.scene.cameras.main.fadeOut(GameConfig.STAGE_TRANSITION_FADE_MS);
    this.scene.cameras.main.once('camerafadeoutcomplete', () => {
      if (this.stageIndex < GameConfig.STAGE_COUNT) {
        this.scene.scene.restart();
      } else {
        this.scene.scene.start('StageClearScene');
      }
    });
  }

  private _spawnItem(type: ItemType, worldX: number, worldY: number): void {
    if (!type) return;
    const pickup = new ItemPickup(
      this.scene,
      type,
      worldX,
      worldY,
      () => this._cameraX,
      () => this.scene.getPlayer(),
    );
    this._pickups.push(pickup);
  }

  private _clampPlayer(player: PlayerController | null): void {
    if (!player) return;
    const hw = GameConfig.PLAYER_BODY_HALF_WIDTH;
    const minScreenX = hw;
    const maxScreenX = GameConfig.CANVAS_WIDTH - hw;
    player.sprite.x = Phaser.Math.Clamp(player.sprite.x, minScreenX, maxScreenX);
  }

  destroy(): void {
    this.scene.unregisterFixedUpdate(this._fixedUpdateBound);
    this.scene.events.off('zoneCleared', this._onZoneClearedBound);
    this._parallax.destroy();
    this._timer.destroy();
    for (const ctrl of this._spawnControllers.values()) ctrl.destroy();
    for (const prop of this._props) prop.destroy();
    for (const pickup of this._pickups) pickup.destroy();
  }
}
