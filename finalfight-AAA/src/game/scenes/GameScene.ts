import { Scene } from 'phaser';
import { GameConfig } from '../../config/GameConfig';
import { PlayerController } from '../../player/PlayerController';
import { StageManager } from '../../stage/StageManager';
import { stage1Data } from '../../data/stage1Data';
import { CombatSystem } from '../../combat/CombatSystem';
import { DebugRenderer } from '../../combat/DebugRenderer';
import { EnemyManager } from '../../enemy/EnemyManager';
import { GameEvents } from '../GameEvents';
import {
  HUD_SCORE_BRAWLER,
  HUD_SCORE_RUSHER,
  HUD_SCORE_KNIFE_THROWER,
  HUD_SCORE_BOSS,
  HUD_MAX_CONTINUES,
} from '../../hud/HudConfig';

type FixedUpdateFn = (dt: number) => void;

export class GameScene extends Scene {
    private _accumulator: number = 0;
    private _fixedCallbacks: Set<FixedUpdateFn> = new Set();

    /** @spec game-scene – Requirement: getPlayer() accessor */
    private _player: PlayerController | null = null;

    /** @spec game-scene – Requirement: getStageManager() accessor */
    private _stageManager: StageManager | null = null;

    /** @spec game-scene – Requirement: getCombatSystem() accessor */
    private _combatSystem: CombatSystem | null = null;

    /** @spec enemy-manager – Requirement: getEnemyManager() accessor */
    private _enemyManager: EnemyManager | null = null;

    private _debugRenderer: DebugRenderer | null = null;

    // ── HUD event tracking ─────────────────────────────────────────────────
    private _score                 = 0;
    private _continuesUsed         = 0;
    private _lastHp                = -1;
    private _lastLives             = -1;
    private _lastSpecialCooldown   = -1;
    private _bossId:       string | null       = null;
    private _lastBossHp                        = -1;
    private _comboCount                        = 0;
    private _comboWindowTicks                  = 0;
    private static readonly COMBO_WINDOW_TICKS = 120; // 2 seconds at 60 fps

    /** Physics group for all player attack hitboxes. Queried by combat-system. */
    playerHitboxGroup!: Phaser.Physics.Arcade.StaticGroup;

    /** Group for item pickup sprites (for future Arcade overlap queries). */
    itemPickupGroup!: Phaser.GameObjects.Group;

    constructor() {
        super('GameScene');
    }

    create(): void {
        // Hitbox group for player attacks (combat-system queries this group)
        this.playerHitboxGroup = this.physics.add.staticGroup();
        /* no player-enemy collider — intentional: FR-GOLV-01 */

        // Item pickup group (for Arcade overlap queries)
        this.itemPickupGroup = this.add.group();

        // Pause input
        this.input.keyboard?.on('keydown-ESC', () => this.pauseGame());
        this.input.keyboard?.on('keydown-P', () => this.pauseGame());

        // Combat system — must be created before PlayerController so player can register hurtbox
        this._combatSystem = new CombatSystem();
        this.registerFixedUpdate(this._combatSystem.fixedUpdate.bind(this._combatSystem));

        // Debug renderer (render-frame, not fixed tick)
        this._debugRenderer = new DebugRenderer(this, this._combatSystem);

        // Spawn player at centre of ground plane
        const spawnX = GameConfig.CANVAS_WIDTH / 2;
        const spawnY = (GameConfig.GROUND_TOP + GameConfig.GROUND_BOTTOM) / 2;
        this._player = new PlayerController(this, spawnX, spawnY, null, this._combatSystem);

        // Enemy manager — must be registered AFTER CombatSystem so CS runs first each tick
        this._enemyManager = new EnemyManager(
            this,
            this._combatSystem,
            () => {
                const p = this._player;
                return p ? { x: p.sprite.x, y: p.sprite.y } : { x: spawnX, y: spawnY };
            },
        );
        this.registerFixedUpdate(this._enemyManager.fixedUpdate.bind(this._enemyManager));

        // TODO(hud): register hud fixed-update callback here

        // Stage subsystem — initialise after player so StageManager can call getPlayer()
        this._stageManager = new StageManager(this, stage1Data, 1);

        // Timer expiry → game over (only when stage not yet cleared)
        this.events.on(GameEvents.TIMER_EXPIRED, () => {
            if (!this._stageManager?.isCleared) this.triggerGameOver();
        });

        // ── HUD event wiring ────────────────────────────────────────────────

        // Emit SCORE_CHANGED when an enemy is defeated.
        // EnemyManager now includes the enemy type in the enemyDefeated payload.
        this.events.on('enemyDefeated', (payload: { id: string; type: string }) => {
            const delta = this._scoreForType(payload.type);
            this._score += delta;
            this.events.emit(GameEvents.SCORE_CHANGED, { score: this._score, delta });
        });

        // Emit BOSS_ARRIVED and track boss id for HP polling.
        this.events.on('bossArrived', (id: string) => {
            this._bossId = id;
            const boss = this._enemyManager?.getEnemies().get(id);
            if (boss) {
                this._lastBossHp = boss.hp;
                this.events.emit(GameEvents.BOSS_ARRIVED, { maxHealth: boss.maxHp });
            }
        });

        // Translate stage-clear signal from StageManager — enrich with score.
        // Guard prevents re-entrant infinite emit: StageManager emits without `score`,
        // GameScene re-emits with `score`; the guard skips the already-enriched payload.
        this.events.on(GameEvents.STAGE_CLEARED, (data: { timeBonus: number; score?: number }) => {
            if (data.score !== undefined) return;
            this.events.emit(GameEvents.STAGE_CLEARED, { score: this._score, timeBonus: data.timeBonus });
        });

        // Wire combo tracking to CombatSystem hit callbacks.
        this._combatSystem?.onHit((_targetId, event) => {
            if (event.teamTag === 'player') {
                this._comboCount++;
                this._comboWindowTicks = GameScene.COMBO_WINDOW_TICKS;
                this.events.emit(GameEvents.COMBO_UPDATED, {
                    count:        this._comboCount,
                    windowActive: true,
                });
            } else if (_targetId === 'player' && event.teamTag === 'enemy') {
                // Bridge enemy-team hit to the player controller. @spec FR-EB-14, enemy-attack-damage
                this._player?.applyHit(event);
            }
        });

        // Launch HUD as a parallel scene.
        this.scene.launch('HudScene');
    }

    /** Register a callback to be called once per fixed timestep tick. */
    registerFixedUpdate(fn: FixedUpdateFn): void {
        this._fixedCallbacks.add(fn);
    }

    /** Unregister a previously registered fixed-update callback. */
    unregisterFixedUpdate(fn: FixedUpdateFn): void {
        this._fixedCallbacks.delete(fn);
    }

    update(_time: number, delta: number): void {
        this._accumulator += delta;
        let steps = 0;

        while (
            this._accumulator >= GameConfig.FIXED_DELTA_MS &&
            steps < GameConfig.MAX_STEPS_PER_FRAME
        ) {
            for (const fn of this._fixedCallbacks) {
                fn(GameConfig.FIXED_DELTA_MS);
            }
            this._accumulator -= GameConfig.FIXED_DELTA_MS;
            steps++;
        }

        // Discard surplus ONLY when the step cap is hit (prevents spiral-of-death).
        // Do NOT discard on normal frames — the remainder must carry over so the
        // fixed tick fires at the correct average rate on high-refresh displays
        // (e.g. 120 Hz where each frame delta < FIXED_DELTA_MS).
        if (steps >= GameConfig.MAX_STEPS_PER_FRAME) {
            this._accumulator = 0;
        }

        // Debug renderer runs every render frame (not fixed tick)
        this._debugRenderer?.update();

        // ── HUD state polling ───────────────────────────────────────────────
        const player = this._player;
        if (player) {
            if (player.hp !== this._lastHp || this._lastHp === -1) {
                this._lastHp = player.hp;
                this.events.emit(GameEvents.PLAYER_HEALTH_CHANGED, { current: player.hp, max: player.maxHp });
            }
            if (player.lives !== this._lastLives) {
                this._lastLives = player.lives;
                this.events.emit(GameEvents.PLAYER_LIVES_CHANGED, { lives: player.lives });
            }
            if (player.specialCooldownTicks !== this._lastSpecialCooldown) {
                this._lastSpecialCooldown = player.specialCooldownTicks;
                this.events.emit(GameEvents.SPECIAL_COOLDOWN_CHANGED, {
                    fraction: player.specialCooldownTicks / GameConfig.SPECIAL_COOLDOWN_TICKS,
                });
            }
        }

        // Boss HP polling.
        if (this._bossId) {
            const boss = this._enemyManager?.getEnemies().get(this._bossId);
            if (boss) {
                if (boss.hp !== this._lastBossHp) {
                    this._lastBossHp = boss.hp;
                    this.events.emit(GameEvents.BOSS_HEALTH_CHANGED, { current: boss.hp, max: boss.maxHp });
                }
            } else if (this._lastBossHp !== 0) {
                this._lastBossHp = 0;
                this.events.emit(GameEvents.BOSS_HEALTH_CHANGED, { current: 0, max: 0 });
                this._bossId = null;
            }
        }

        // Combo window countdown.
        if (this._comboWindowTicks > 0) {
            this._comboWindowTicks--;
            if (this._comboWindowTicks === 0) {
                this._comboCount = 0;
                this.events.emit(GameEvents.COMBO_UPDATED, { count: 0, windowActive: false });
            }
        }
    }

    pauseGame(): void {
        this.sound.pauseAll();
        this.events.emit(GameEvents.PAUSE_TOGGLED, { paused: true });
    }

    /** Triggered by GameOverScene when the player uses a continue. */
    resumeAfterContinue(): void {
        this._continuesUsed++;
        this._accumulator = 0;
        this._player?.respawn();
        this.scene.resume();
        this.sound.resumeAll();
    }

    /**
     * Returns the active PlayerController, or null if not yet created.
     * @spec game-scene – Requirement: getPlayer() accessor
     */
    getPlayer(): PlayerController | null {
        return this._player;
    }

    /**
     * Returns the active StageManager, or null if not yet created.
     * @spec game-scene – Requirement: getStageManager() accessor
     */
    getStageManager(): StageManager | null {
        return this._stageManager;
    }

    /**
     * Returns the active CombatSystem, or null if not yet created.
     * @spec game-scene – Requirement: getCombatSystem() accessor
     */
    getCombatSystem(): CombatSystem | null {
        return this._combatSystem;
    }

    /**
     * Returns the active EnemyManager, or null if not yet created.
     * @spec enemy-manager
     */
    getEnemyManager(): EnemyManager | null {
        return this._enemyManager;
    }

    /**
     * Pause the game scene and launch the Game Over screen.
     * Called by PlayerController when the player exhausts all lives.
     * @spec player-health – Requirement: Last life lost triggers Game Over
     */
    triggerGameOver(): void {
        const continuesLeft = HUD_MAX_CONTINUES - this._continuesUsed;
        this.events.emit(GameEvents.GAME_OVER, { score: this._score });
        this.scene.pause();
        this.scene.launch('GameOverScene', { score: this._score, continuesLeft });
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private _scoreForType(type: string): number {
        switch (type) {
            case 'brawler':       return HUD_SCORE_BRAWLER;
            case 'rusher':        return HUD_SCORE_RUSHER;
            case 'knife-thrower': return HUD_SCORE_KNIFE_THROWER;
            case 'boss':          return HUD_SCORE_BOSS;
            default:              return 0;
        }
    }
}
