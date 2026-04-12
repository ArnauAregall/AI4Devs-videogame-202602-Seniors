import { Scene } from 'phaser';
import { GameConfig } from '../../config/GameConfig';
import { PlayerController } from '../../player/PlayerController';

type FixedUpdateFn = (dt: number) => void;

export class GameScene extends Scene {
    private _accumulator: number = 0;
    private _fixedCallbacks: Set<FixedUpdateFn> = new Set();

    /** @spec game-scene – Requirement: getPlayer() accessor */
    private _player: PlayerController | null = null;

    /** Physics group for all player attack hitboxes. Queried by combat-system. */
    playerHitboxGroup!: Phaser.Physics.Arcade.StaticGroup;

    constructor() {
        super('GameScene');
    }

    create(): void {
        // Hitbox group for player attacks (combat-system queries this group)
        this.playerHitboxGroup = this.physics.add.staticGroup();

        // Pause input
        this.input.keyboard?.on('keydown-ESC', () => this.pauseGame());
        this.input.keyboard?.on('keydown-P', () => this.pauseGame());

        // Spawn player at centre of ground plane
        const spawnX = GameConfig.CANVAS_WIDTH / 2;
        const spawnY = (GameConfig.GROUND_TOP + GameConfig.GROUND_BOTTOM) / 2;
        this._player = new PlayerController(this, spawnX, spawnY);

        // TODO(stage): register stage fixed-update callback here
        // TODO(combat): register combat fixed-update callback here
        // TODO(enemy-ai): register enemy-ai fixed-update callback here
        // TODO(hud): register hud fixed-update callback here
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
     * Pause the game scene and launch the Game Over screen.
     * Called by PlayerController when the player exhausts all lives.
     * @spec player-health – Requirement: Last life lost triggers Game Over
     */
    triggerGameOver(): void {
        this.scene.pause();
        this.scene.launch('GameOverScene');
    }
}
