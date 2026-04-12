import { Scene } from 'phaser';
import { GameConfig } from '../../config/GameConfig';

export class GameOver extends Scene {
    constructor() {
        super('GameOverScene');
    }

    create(data?: { score?: number; continuesLeft?: number }): void {
        const score = data?.score ?? 0;
        const continuesLeft = data?.continuesLeft ?? 0;

        const { width, height } = this.scale;
        const cx = width / 2;

        this.cameras.main.setBackgroundColor(0x110000);

        this.add.text(cx, height * 0.25, 'GAME OVER', {
            fontFamily: 'Arial Black',
            fontSize: `${Math.floor(GameConfig.CANVAS_WIDTH / 10)}px`,
            color: '#ff2222',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center',
        }).setOrigin(0.5);

        this.add.text(cx, height * 0.45, `SCORE  ${score}`, {
            fontFamily: 'Arial Black',
            fontSize: `${Math.floor(GameConfig.CANVAS_WIDTH / 22)}px`,
            color: '#ffffff',
        }).setOrigin(0.5);

        if (continuesLeft > 0) {
            const continueText = this.add.text(cx, height * 0.62, 'CONTINUE', {
                fontFamily: 'Arial Black',
                fontSize: `${Math.floor(GameConfig.CANVAS_WIDTH / 22)}px`,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 2,
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            continueText.on('pointerdown', () => this.handleContinue());
            this.input.keyboard?.on('keydown-ENTER', () => this.handleContinue());
        }

        const quitText = this.add.text(cx, height * 0.78, 'QUIT TO MAIN MENU', {
            fontFamily: 'Arial Black',
            fontSize: `${Math.floor(GameConfig.CANVAS_WIDTH / 26)}px`,
            color: '#aaaaaa',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        quitText.on('pointerdown', () => this.quitToMenu());
    }

    private handleContinue(): void {
        this.scene.stop();
        this.scene.resume('GameScene');
    }

    private quitToMenu(): void {
        this.scene.stop('GameScene');
        this.scene.stop();
        this.scene.start('MainMenuScene');
    }
}

