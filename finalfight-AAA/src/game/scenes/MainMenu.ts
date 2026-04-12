import { Scene, GameObjects } from 'phaser';
import { GameConfig } from '../../config/GameConfig';

export class MainMenu extends Scene {
    private _cursor = 0;
    private _labels: GameObjects.Text[] = [];

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

        const items = [
            { label: 'START GAME',   action: () => this._startGame() },
            { label: 'HIGH SCORES',  action: () => this._showLeaderboard() },
        ];

        items.forEach(({ label, action }, i) => {
            const txt = this.add.text(cx, height * 0.55 + i * height * 0.14, label, {
                fontFamily: 'Arial Black',
                fontSize: `${Math.floor(GameConfig.CANVAS_WIDTH / 20)}px`,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3,
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            txt.on('pointerover', () => { this._cursor = i; this._refresh(); });
            txt.on('pointerdown', action);
            this._labels.push(txt);
        });

        this._cursor = 0;
        this._refresh();

        this.input.keyboard?.on('keydown-UP',    () => { this._move(-1); });
        this.input.keyboard?.on('keydown-W',     () => { this._move(-1); });
        this.input.keyboard?.on('keydown-DOWN',  () => { this._move(1); });
        this.input.keyboard?.on('keydown-S',     () => { this._move(1); });
        this.input.keyboard?.on('keydown-ENTER', () => { this._activate(); });
        this.input.keyboard?.on('keydown-SPACE', () => { this._activate(); });
    }

    private _move(dir: -1 | 1): void {
        this._cursor = (this._cursor + dir + this._labels.length) % this._labels.length;
        this._refresh();
    }

    private _refresh(): void {
        this._labels.forEach((lbl, i) => lbl.setColor(i === this._cursor ? '#ffcc00' : '#ffffff'));
    }

    private _activate(): void {
        if (this._cursor === 0) this._startGame();
        else                    this._showLeaderboard();
    }

    private _startGame(): void {
        this.scene.start('GameScene');
    }

    private _showLeaderboard(): void {
        this.scene.start('LeaderboardScene', { returnScene: 'MainMenuScene' });
    }
}

