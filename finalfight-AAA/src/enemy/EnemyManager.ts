/**
 * EnemyManager — factory, lifecycle, and coordination hub for all enemies.
 * Listens for `enemySpawn` events, routes to archetype factory, ticks all
 * active enemies, enforces separation (FR-EA-17), handles grab-pause,
 * and emits `enemyDefeated` / `bossArrived` back to the scene.
 *
 * @spec enemy-manager
 * @implements FR-EA-14, FR-EA-15, FR-EA-16, FR-EA-17, FR-EA-18, FR-EA-24
 */
import Phaser from 'phaser';
import { CombatSystem }              from '../combat/CombatSystem';
import { AttackerCoordinator }       from './AttackerCoordinator';
import { EnemyController }           from './EnemyController';
import { BrawlerController }         from './BrawlerController';
import { RusherController }          from './RusherController';
import { KnifeThrowerController }    from './KnifeThrowerController';
import { BossController }            from './BossController';
import { ENEMY_SEPARATION_MIN_PX }   from './EnemyConfig';

export type GetPlayerPosition = () => { x: number; y: number };

export type EnemyType = 'brawler' | 'rusher' | 'knife-thrower' | 'boss';

export interface ItemDropEntry {
  /** Item type identifier. */
  type:        string;
  /** Probability weight (0–1). */
  probability: number;
}

export interface EnemySpawnPayload {
  id:           string;
  type:         EnemyType;
  x:            number;
  y:            number;
  facingRight:  boolean;
  /** Optional zone identifier — prevents duplicate spawns per zone. */
  zoneId?:      string;
  /** Optional drop table for item resolution on death. */
  dropTable?:   ItemDropEntry[];
}

export class EnemyManager {
  private readonly _scene:        Phaser.Scene;
  private readonly _combatSystem: CombatSystem;
  private readonly _coordinator:  AttackerCoordinator;
  private readonly _getPlayer:    GetPlayerPosition;
  private readonly _enemies:      Map<string, EnemyController> = new Map();
  /** Drop tables keyed by enemy ID. */
  private readonly _dropTables:   Map<string, ItemDropEntry[]> = new Map();
  /** Archetype type keyed by enemy ID — used to enrich enemyDefeated events. */
  private readonly _enemyTypes:   Map<string, string> = new Map();
  /** Tracks spawned zoneIds to prevent duplicate spawns. */
  private readonly _spawnedZones: Set<string> = new Set();
  private          _grabFrozen:   boolean = false;
  private          _nextId:       number  = 0;

  constructor(
    scene:        Phaser.Scene,
    combatSystem: CombatSystem,
    getPlayer:    GetPlayerPosition,
  ) {
    this._scene        = scene;
    this._combatSystem = combatSystem;
    this._coordinator  = new AttackerCoordinator();
    this._getPlayer    = getPlayer;

    scene.events.on('enemySpawn',  this._onSpawn,  this);
    scene.events.on('playerGrabStart', this._onGrabStart, this);
    scene.events.on('playerGrabEnd',   this._onGrabEnd,   this);
  }

  // ── Fixed update (registered with GameScene.registerFixedUpdate) ──────────

  /**
   * @spec FR-EA-15 — Tick all active enemies; remove defeated enemies.
   */
  fixedUpdate(): void {
    const { x: px, y: py } = this._getPlayer();

    for (const [, enemy] of this._enemies) {
      enemy.fixedUpdate(px, py);
    }

    this._separateEnemies();
    this._purgeDefeated();
  }

  /** Returns the AttackerCoordinator (exposed for testing). */
  get coordinator(): AttackerCoordinator { return this._coordinator; }

  /** Returns a snapshot of live enemy controllers. */
  getEnemies(): ReadonlyMap<string, EnemyController> { return this._enemies; }

  /** Freeze all enemies (e.g. during boss transition or stage clear). */
  freezeAll(): void {
    for (const enemy of this._enemies.values()) enemy.freeze();
  }

  /** Unfreeze all enemies. */
  unfreezeAll(): void {
    for (const enemy of this._enemies.values()) enemy.unfreeze();
  }

  destroy(): void {
    this._scene.events.off('enemySpawn',      this._onSpawn,     this);
    this._scene.events.off('playerGrabStart', this._onGrabStart, this);
    this._scene.events.off('playerGrabEnd',   this._onGrabEnd,   this);
    for (const enemy of this._enemies.values()) enemy.destroy();
    this._enemies.clear();
    this._enemyTypes.clear();
    this._coordinator.reset();
  }

  // ── Event handlers ─────────────────────────────────────────────────────────

  /**
   * @spec FR-EA-14 — Spawn an enemy from SpawnController's `enemySpawn` event.
   */
  private _onSpawn(payload: EnemySpawnPayload): void {
    // Zone deduplication guard (@spec enemy-manager)
    if (payload.zoneId && this._spawnedZones.has(payload.zoneId)) return;
    if (payload.zoneId) this._spawnedZones.add(payload.zoneId);

    const id  = payload.id ?? `enemy_${this._nextId++}`;
    if (this._enemies.has(id)) return; // duplicate ID guard
    const cfg = {
      scene:        this._scene,
      id,
      x:            payload.x,
      y:            payload.y,
      facingRight:  payload.facingRight,
      combatSystem: this._combatSystem,
      coordinator:  this._coordinator,
    };

    let enemy: EnemyController;

    switch (payload.type) {
      case 'brawler':
        enemy = new BrawlerController(cfg);
        break;
      case 'rusher':
        enemy = new RusherController(cfg);
        break;
      case 'knife-thrower':
        enemy = new KnifeThrowerController(cfg);
        break;
      case 'boss':
        enemy = new BossController(cfg, () => {
          this._scene.events.emit('bossArrived', id);
        });
        break;
      default:
        console.warn(`[EnemyManager] Unknown enemy type: ${(payload as EnemySpawnPayload).type}`);
        return;
    }

    this._enemies.set(id, enemy);
    this._enemyTypes.set(id, payload.type);
    if (payload.dropTable) this._dropTables.set(id, payload.dropTable);
    if (this._grabFrozen) enemy.freeze();
  }

  /**
   * @spec FR-EA-18 — Freeze all enemies while player holds a grab.
   */
  private _onGrabStart(): void {
    this._grabFrozen = true;
    for (const e of this._enemies.values()) e.freeze();
  }

  private _onGrabEnd(): void {
    this._grabFrozen = false;
    for (const e of this._enemies.values()) e.unfreeze();
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Push enemies apart when they overlap. @spec FR-EA-17
   */
  private _separateEnemies(): void {
    const arr = [...this._enemies.values()];
    if (arr.length <= 1) return;
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const a  = arr[i];
        const b  = arr[j];
        const dx = b.x - a.x;
        if (Math.abs(dx) < ENEMY_SEPARATION_MIN_PX && Math.abs(dx) > 0) {
          const push = (ENEMY_SEPARATION_MIN_PX - Math.abs(dx)) / 2;
          const sign = Math.sign(dx);
          a.sprite.x -= sign * push;
          b.sprite.x += sign * push;
        }
      }
    }
  }

  /**
   * Destroy and remove all enemies that have finished their death sequence.
   * Emits `enemyDefeated` for each removed enemy.
   */
  private _purgeDefeated(): void {
    for (const [id, enemy] of this._enemies) {
      if (enemy.isDead) {
        this._resolveItemDrop(id, enemy);
        enemy.destroy();
        this._enemies.delete(id);
        this._dropTables.delete(id);
        const type = this._enemyTypes.get(id) ?? '';
        this._enemyTypes.delete(id);
        this._scene.events.emit('enemyDefeated', { id, type });
      }
    }
  }

  /**
   * Select at most one item from the enemy's drop table and emit `itemDrop`.
   * @spec FR-EA-14, FR-EA-15
   */
  private _resolveItemDrop(id: string, enemy: EnemyController): void {
    const dropTable = this._dropTables.get(id);
    if (!dropTable || dropTable.length === 0) return;

    const roll = Math.random();
    let cumulative = 0;
    for (const entry of dropTable) {
      cumulative += entry.probability;
      if (roll < cumulative) {
        this._scene.events.emit('itemDrop', {
          type: entry.type,
          x:    enemy.x,
          y:    enemy.y,
        });
        return;
      }
    }
  }
}
