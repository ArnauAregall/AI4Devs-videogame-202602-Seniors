import { Scene } from 'phaser';
import { GameConfig } from '../../config/GameConfig';
import type { GameScene as GameSceneType } from './GameScene';

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

            continueText.on('pointerover', () => continueText.setColor('#ffcc00'));
            continueText.on('pointerout',  () => continueText.setColor('#ffffff'));
            continueText.on('pointerdown', () => this.handleContinue());
            this.input.keyboard?.on('keydown-ENTER', () => this.handleContinue());
            nextY += 0.14;
        }

        const highScoreText = this.add.text(cx, height * nextY, 'HIGH SCORES', {
            fontFamily: 'Arial Black',
            fontSize: `${Math.floor(GameConfig.CANVAS_WIDTH / 26)}px`,
            color: '#aaaaaa',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        highScoreText.on('pointerover', () => highScoreText.setColor('#ffcc00'));
        highScoreText.on('pointerout',  () => highScoreText.setColor('#aaaaaa'));
        highScoreText.on('pointerdown', () => this.showLeaderboard());
        nextY += 0.12;

        const quitText = this.add.text(cx, height * nextY, 'QUIT TO MAIN MENU', {
            fontFamily: 'Arial Black',
            fontSize: `${Math.floor(GameConfig.CANVAS_WIDTH / 26)}px`,
            color: '#aaaaaa',
            stroke: '#000000',
            strokeThickness: 2,
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        quitText.on('pointerover', () => quitText.setColor('#ffffff'));
        quitText.on('pointerout',  () => quitText.setColor('#aaaaaa'));
        quitText.on('pointerdown', () => this.quitToMenu());
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

