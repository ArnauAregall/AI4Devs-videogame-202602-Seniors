import { Scene } from 'phaser';
import { GameConfig } from '../../config/GameConfig';
import { PlayerController } from '../../player/PlayerController';
import { StageManager } from '../../stage/StageManager';
import { stage1Data } from '../../data/stage1Data';
import { CombatSystem } from '../../combat/CombatSystem';
import { DebugRenderer } from '../../combat/DebugRenderer';

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

    private _debugRenderer: DebugRenderer | null = null;

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

        // TODO(enemy-ai): register enemy-ai fixed-update callback here
        // TODO(hud): register hud fixed-update callback here

        // Stage subsystem — initialise after player so StageManager can call getPlayer()
        this._stageManager = new StageManager(this, stage1Data, 1);
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

        // Discard surplus to prevent spiral-of-death on severe frame drops
        if (this._accumulator > 0) {
            this._accumulator = 0;
        }

        // Debug renderer runs every render frame (not fixed tick)
        this._debugRenderer?.update();
    }

    pauseGame(): void {
        this.sound.pauseAll();
        this.scene.pause();
        this.scene.launch('PauseOverlayScene');
    }

    /** Triggered by GameOverScene when the player uses a continue. */
    resumeAfterContinue(): void {
        this._accumulator = 0;
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
     * Pause the game scene and launch the Game Over screen.
     * Called by PlayerController when the player exhausts all lives.
     * @spec player-health – Requirement: Last life lost triggers Game Over
     */
    triggerGameOver(): void {
        this.scene.pause();
        this.scene.launch('GameOverScene');
    }
}
