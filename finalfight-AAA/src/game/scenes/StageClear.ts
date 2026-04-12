import { Scene } from 'phaser';
import { GameConfig } from '../../config/GameConfig';

export class StageClear extends Scene {
    constructor() {
        super('StageClearScene');
    }

    create(data?: { stage?: number; score?: number; timeBonus?: number }): void {
        const stage = data?.stage ?? 1;
        const score = data?.score ?? 0;
        const timeBonus = data?.timeBonus ?? 0;

        const { width, height } = this.scale;
        const cx = width / 2;

        this.cameras.main.setBackgroundColor(0x000022);

        this.add.text(cx, height * 0.2, 'STAGE CLEAR', {
            fontFamily: 'Arial Black',
            fontSize: `${Math.floor(GameConfig.CANVAS_WIDTH / 12)}px`,
            color: '#ffdd00',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center',
        }).setOrigin(0.5);

        this.add.text(cx, height * 0.45, `SCORE  ${score}`, {
            fontFamily: 'Arial Black',
            fontSize: `${Math.floor(GameConfig.CANVAS_WIDTH / 22)}px`,
            color: '#ffffff',
        }).setOrigin(0.5);

        if (timeBonus > 0) {
            this.add.text(cx, height * 0.58, `TIME BONUS  ${timeBonus}`, {
                fontFamily: 'Arial Black',
                fontSize: `${Math.floor(GameConfig.CANVAS_WIDTH / 22)}px`,
                color: '#88ff88',
            }).setOrigin(0.5);
        }

        // Advance after a short tally delay
        this.time.delayedCall(3000, () => this.advance(stage));
    }

    private advance(stage: number): void {
        this.scene.stop();

        if (stage >= GameConfig.STAGE_COUNT) {
            // All stages cleared — return to main menu as placeholder for end screen
            this.scene.stop('GameScene');
            this.scene.start('MainMenuScene');
        } else {
            // Reload GameScene for next stage
            this.scene.stop('GameScene');
            this.scene.start('GameScene', { stage: stage + 1 });
        }
    }
}
