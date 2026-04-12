// ============================================================
// SpawnController.ts — Data-driven, staggered enemy spawner.
// @spec FR-SZ-01 SpawnZoneData type
// @spec FR-SZ-02 Staggered enemy entry
// @spec FR-SZ-03 'zoneCleared' event after all enemies defeated
// @spec FR-SZ-04 Decoupled from enemy-ai (event-bus only)
// ============================================================
import Phaser from 'phaser';
import { GameConfig } from '../config/GameConfig';
import type { SpawnZoneData } from './StageData';

export class SpawnController {
  private _totalEnemies: number = 0;
  private _living: number = 0;
  private _activated: boolean = false;
  private _cleared: boolean = false;
  private readonly _onEnemyDefeatedBound: () => void;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly data: SpawnZoneData,
  ) {
    this._totalEnemies = data.entries.reduce((sum, e) => sum + e.count, 0);
    this._onEnemyDefeatedBound = this._onEnemyDefeated.bind(this);
    scene.events.on('enemyDefeated', this._onEnemyDefeatedBound);
  }

  /** True once all spawned enemies have been defeated. */
  get isCleared(): boolean {
    return this._cleared;
  }

  /**
   * Activate this zone: schedule staggered spawn events on the scene bus.
   * @param cameraX Current camera X — enemies spawn just off right edge.
   */
  activate(cameraX: number): void {
    if (this._activated) return;
    this._activated = true;
    this._living = this._totalEnemies;

    let cumulativeDelay = 0;

    for (const entry of this.data.entries) {
      for (let i = 0; i < entry.count; i++) {
        cumulativeDelay += entry.staggerDelayMs;
        const spawnX = cameraX + GameConfig.CANVAS_WIDTH + GameConfig.SPAWN_OFFSCREEN_MARGIN;
        const spawnY = (GameConfig.GROUND_TOP + GameConfig.GROUND_BOTTOM) / 2;
        const { archetype } = entry;

        this.scene.time.addEvent({
          delay: cumulativeDelay,
          callback: () => {
            this.scene.events.emit('enemySpawn', { type: archetype, x: spawnX, y: spawnY });
          },
        });
      }
    }

    // Edge-case: zone with zero enemies is immediately cleared
    if (this._totalEnemies === 0) {
      this._cleared = true;
      this.scene.events.emit('zoneCleared', this.data.id);
    }
  }

  private _onEnemyDefeated(): void {
    if (!this._activated || this._cleared) return;
    this._living = Math.max(0, this._living - 1);

    if (this._living === 0) {
      this._cleared = true;
      this.scene.events.emit('zoneCleared', this.data.id);
    }
  }

  destroy(): void {
    this.scene.events.off('enemyDefeated', this._onEnemyDefeatedBound);
  }
}
