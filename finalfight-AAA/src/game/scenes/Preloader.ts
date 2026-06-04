import { Scene } from 'phaser';
import { ASSET_PATH, ASSET_FRAME_CONFIG, ASSET_KEY_LOADING_BG } from '../../assets/AssetKeys';

const BAR_PADDING = 4;
const BAR_LINE_WIDTH = 2;
const BAR_WIDTH = 200;
const BAR_HEIGHT = 16;
const BAR_Y_OFFSET = 30;
const TEXT_Y_OFFSET = 10;
const FONT_SIZE = '10px';

export class Preloader extends Scene {
    constructor() {
        super('PreloadScene');
    }

    create(): void {
        const { width, height } = this.scale;
        const cx = width / 2;
        const barX = cx - BAR_WIDTH / 2;
        const barY = height / 2 + BAR_Y_OFFSET;

        this.cameras.main.setBackgroundColor('#000000');

        if (this.textures.exists(ASSET_KEY_LOADING_BG)) {
            this.add.image(cx, height / 2, ASSET_KEY_LOADING_BG);
        }

        this.add.rectangle(cx, barY, BAR_WIDTH, BAR_HEIGHT)
            .setStrokeStyle(BAR_LINE_WIDTH, 0xffffff)
            .setFillStyle(0x000000, 0.5);

        const fill = this.add.rectangle(barX + BAR_PADDING, barY, 0, BAR_HEIGHT - BAR_PADDING, 0xffffff)
            .setOrigin(0, 0.5);

        const percentText = this.add.text(cx, barY + BAR_HEIGHT / 2 + TEXT_Y_OFFSET, '0%', {
            fontFamily: 'Arial',
            fontSize: FONT_SIZE,
            color: '#ffffff',
        }).setOrigin(0.5);

        this.load.on('progress', (progress: number) => {
            const innerWidth = BAR_WIDTH - BAR_PADDING * 2;
            fill.width = innerWidth * progress;
            percentText.setText(`${Math.round(progress * 100)}%`);
        });

        this.load.on('complete', () => {
            this.scene.start('MainMenuScene');
        });

        this.loadAssets();
        this.load.start();
    }

    private loadAssets(): void {
        this.load.setPath('assets');

        for (const [key, path] of Object.entries(ASSET_PATH)) {
            const frameConfig = ASSET_FRAME_CONFIG[key as keyof typeof ASSET_FRAME_CONFIG];
            if (frameConfig) {
                this.load.spritesheet(key, path, frameConfig);
            } else {
                this.load.image(key, path);
            }
        }
    }
}
