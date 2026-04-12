import { Scene } from 'phaser';
import { GameConfig } from '../../config/GameConfig';

export class PauseOverlay extends Scene {
    constructor() {
        super('PauseOverlayScene');
    }

    create(): void {
        const { width, height } = this.scale;
        const cx = width / 2;

        // Semi-transparent overlay
        this.add.rectangle(0, 0, width, height, 0x000000, 0.5).setOrigin(0);

        this.add.text(cx, height * 0.4, 'PAUSED', {
            fontFamily: 'Arial Black',
            fontSize: `${Math.floor(GameConfig.CANVAS_WIDTH / 12)}px`,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center',
        }).setOrigin(0.5);

        this.add.text(cx, height * 0.6, 'Press ESC or P to resume', {
            fontFamily: 'Arial',
            fontSize: `${Math.floor(GameConfig.CANVAS_WIDTH / 26)}px`,
            color: '#aaaaaa',
        }).setOrigin(0.5);

        this.input.keyboard?.on('keydown-ESC', () => this.resumeGame());
        this.input.keyboard?.on('keydown-P', () => this.resumeGame());
    }

    private resumeGame(): void {
        this.scene.stop();
        const gameScene = this.scene.get('GameScene');
        gameScene.sound.resumeAll();
        this.scene.resume('GameScene');
    }
}
