import { Scene } from 'phaser';
import { GameConfig } from '../../config/GameConfig';
import type { GameScene as GameSceneType } from './GameScene';

export class GameOver extends Scene {
    private _cursor   = 0;
    private _options: Phaser.GameObjects.Text[] = [];

    constructor() {
        super('GameOverScene');
    }

    create(data?: { score?: number; continuesLeft?: number }): void {
        const score         = data?.score         ?? 0;
        const continuesLeft = data?.continuesLeft ?? 0;

        const { width, height } = this.scale;
        const cx = width / 2;

        this._cursor  = 0;
        this._options = [];

        this.cameras.main.setBackgroundColor(0x110000);

        this.add.text(cx, height * 0.2, 'GAME OVER', {
            fontFamily: 'Arial Black',
            fontSize: `${Math.floor(GameConfig.CANVAS_WIDTH / 10)}px`,
            color: '#ff2222',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center',
        }).setOrigin(0.5);

        this.add.text(cx, height * 0.38, `SCORE  ${score}`, {
            fontFamily: 'Arial Black',
            fontSize: `${Math.floor(GameConfig.CANVAS_WIDTH / 22)}px`,
            color: '#ffffff',
        }).setOrigin(0.5);

        let nextY = 0.54;

        if (continuesLeft > 0) {
            const continueText = this.add.text(cx, height * nextY, `CONTINUE (${continuesLeft} left)`, {
                fontFamily: 'Arial Black',
                fontSize: `${Math.floor(GameConfig.CANVAS_WIDTH / 22)}px`,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2,
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            continueText.on('pointerdown', () => this.handleContinue());
            this._options.push(continueText);
            nextY += 0.14;
        }

        const highScoreText = this.add.text(cx, height * nextY, 'HIGH SCORES', {
            fontFamily: 'Arial Black',
            fontSize: `${Math.floor(GameConfig.CANVAS_WIDTH / 26)}px`,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        highScoreText.on('pointerdown', () => this.showLeaderboard());
        this._options.push(highScoreText);
        nextY += 0.12;

        const quitText = this.add.text(cx, height * nextY, 'QUIT TO MAIN MENU', {
            fontFamily: 'Arial Black',
            fontSize: `${Math.floor(GameConfig.CANVAS_WIDTH / 26)}px`,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        quitText.on('pointerdown', () => this.quitToMenu());
        this._options.push(quitText);

        // Keyboard navigation
        this.input.keyboard?.on('keydown-UP',    () => { this._cursor = (this._cursor - 1 + this._options.length) % this._options.length; this._refresh(); });
        this.input.keyboard?.on('keydown-DOWN',  () => { this._cursor = (this._cursor + 1) % this._options.length; this._refresh(); });
        this.input.keyboard?.on('keydown-ENTER', () => this._activate());

        this._refresh();
    }

    private _refresh(): void {
        this._options.forEach((t, i) => t.setColor(i === this._cursor ? '#ffcc00' : '#ffffff'));
    }

    private _activate(): void {
        const handlers = [
            () => this.handleContinue(),
            () => this.showLeaderboard(),
            () => this.quitToMenu(),
        ];
        // Map cursor to the correct handler accounting for the optional Continue entry
        // _options is built in order: [Continue?], HighScores, Quit
        const handler = handlers[
            this._options.length === 3 ? this._cursor : this._cursor + 1
        ];
        handler?.();
    }

    private handleContinue(): void {
        const gs = this.scene.get('GameScene') as GameSceneType;
        gs.resumeAfterContinue();
        this.scene.stop();
    }

    private showLeaderboard(): void {
        this.scene.stop('GameScene');
        this.scene.stop('HudScene');
        this.scene.start('LeaderboardScene', { returnScene: 'MainMenuScene' });
    }

    private quitToMenu(): void {
        this.scene.stop('GameScene');
        this.scene.stop('HudScene');
        this.scene.stop();
        this.scene.start('MainMenuScene');
    }
}

