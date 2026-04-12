/**
 * LeaderboardScene — displays the top-10 high-score table.
 * Launched from MainMenu ("HIGH SCORES") or GameOver.
 *
 * @spec hud-leaderboard
 */
import { Scene } from 'phaser';
import { GameConfig } from '../../config/GameConfig';
import { LeaderboardStore } from '../../hud/LeaderboardStore';

export class LeaderboardScene extends Scene {
    /** Scene that launched us — we return here on dismiss. */
    private _returnScene = 'MainMenuScene';

    constructor() {
        super('LeaderboardScene');
    }

    create(data?: { returnScene?: string }): void {
        this._returnScene = data?.returnScene ?? 'MainMenuScene';

        const store   = new LeaderboardStore();
        const entries = store.getEntries();

        const { width, height } = this.scale;
        const cx = width / 2;

        this.cameras.main.setBackgroundColor(0x000022);

        this.add.text(cx, height * 0.08, 'HIGH SCORES', {
            fontFamily: 'Arial Black',
            fontSize:   `${Math.floor(GameConfig.CANVAS_WIDTH / 14)}px`,
            color:      '#ffcc00',
            stroke:     '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);

        if (entries.length === 0) {
            this.add.text(cx, height * 0.5, 'No scores yet!', {
                fontFamily: 'Arial',
                fontSize:   `${Math.floor(GameConfig.CANVAS_WIDTH / 22)}px`,
                color:      '#aaaaaa',
            }).setOrigin(0.5);
        } else {
            const rowStartY = height * 0.22;
            const rowStep   = height * 0.07;
            entries.forEach((e, i) => {
                const rankColor = i === 0 ? '#ffcc00' : i === 1 ? '#cccccc' : i === 2 ? '#cc8844' : '#ffffff';
                this.add.text(cx - 80, rowStartY + i * rowStep, `${i + 1}.  ${e.name}`, {
                    fontFamily: 'Arial Black',
                    fontSize:   `${Math.floor(GameConfig.CANVAS_WIDTH / 28)}px`,
                    color:      rankColor,
                }).setOrigin(0, 0.5);
                this.add.text(cx + 80, rowStartY + i * rowStep, String(e.score), {
                    fontFamily: 'Arial Black',
                    fontSize:   `${Math.floor(GameConfig.CANVAS_WIDTH / 28)}px`,
                    color:      rankColor,
                }).setOrigin(1, 0.5);
            });
        }

        const backText = this.add.text(cx, height * 0.92, 'BACK', {
            fontFamily: 'Arial Black',
            fontSize:   `${Math.floor(GameConfig.CANVAS_WIDTH / 26)}px`,
            color:      '#aaaaaa',
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        backText.on('pointerover', () => backText.setColor('#ffffff'));
        backText.on('pointerout',  () => backText.setColor('#aaaaaa'));
        backText.on('pointerdown', () => this._back());
        this.input.keyboard?.on('keydown-ESC',   () => this._back());
        this.input.keyboard?.on('keydown-ENTER', () => this._back());
    }

    private _back(): void {
        this.scene.start(this._returnScene);
    }
}
