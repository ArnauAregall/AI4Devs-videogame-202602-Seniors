import { Scene } from 'phaser';
import { GameConfig } from '../../config/GameConfig';

type FixedUpdateFn = (dt: number) => void;

export class GameScene extends Scene {
    private _accumulator: number = 0;
    private _fixedCallbacks: Set<FixedUpdateFn> = new Set();

    constructor() {
        super('GameScene');
    }

    create(): void {
        // Pause input
        this.input.keyboard?.on('keydown-ESC', () => this.pauseGame());
        this.input.keyboard?.on('keydown-P', () => this.pauseGame());

        // TODO(player): register player fixed-update callback here
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
}
