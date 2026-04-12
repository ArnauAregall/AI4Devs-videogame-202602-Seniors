import { Scene, GameObjects } from 'phaser';
import { GameConfig } from '../../config/GameConfig';

export class MainMenu extends Scene {
    private startText!: GameObjects.Text;

    constructor() {
        super('MainMenuScene');
    }

    create(): void {
        const { width, height } = this.scale;
        const cx = width / 2;

        this.add.text(cx, height * 0.3, 'FINAL FIGHT', {
            fontFamily: 'Arial Black',
            fontSize: `${Math.floor(GameConfig.CANVAS_WIDTH / 12)}px`,
            color: '#ffcc00',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center',
        }).setOrigin(0.5);

        this.startText = this.add.text(cx, height * 0.6, 'START GAME', {
            fontFamily: 'Arial Black',
            fontSize: `${Math.floor(GameConfig.CANVAS_WIDTH / 20)}px`,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
            align: 'center',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.startText.on('pointerdown', () => this.startGame());

        this.input.keyboard?.on('keydown-ENTER', () => this.startGame());
        this.input.keyboard?.on('keydown-SPACE', () => this.startGame());
    }

    private startGame(): void {
        this.scene.start('GameScene');
    }
}

