import { Scene } from 'phaser';
import { GameConfig } from '../../config/GameConfig';

export class TimeUp extends Scene {
    constructor() {
        super('TimeUpScene');
    }

    create(data?: { continuesLeft?: number; score?: number }): void {
        const continuesLeft = data?.continuesLeft ?? 0;
        const score = data?.score ?? 0;

        const { width, height } = this.scale;
        const cx = width / 2;

        this.cameras.main.setBackgroundColor(0x110011);

        this.add.text(cx, height * 0.3, 'TIME UP!', {
            fontFamily: 'Arial Black',
            fontSize: `${Math.floor(GameConfig.CANVAS_WIDTH / 10)}px`,
            color: '#ff6622',
            stroke: '#000000',
            strokeThickness: 4,
            align: 'center',
        }).setOrigin(0.5);

        // After a brief pause, delegate to GameOver logic
        this.time.delayedCall(1500, () => {
            this.scene.stop();
            this.scene.stop('GameScene');
            this.scene.launch('GameOverScene', { score, continuesLeft });
        });
    }
}
