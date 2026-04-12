import { Scene } from 'phaser';
import { ASSET_PATH, ASSET_FRAME_CONFIG } from '../../assets/AssetKeys';

export class Preloader extends Scene {
    constructor() {
        super('PreloadScene');
    }

    create(): void {
        const { width, height } = this.scale;
        const cx = width / 2;
        const cy = height / 2;

        // Loading bar outline
        this.add.rectangle(cx, cy, 200, 16).setStrokeStyle(1, 0xffffff);
        const bar = this.add.rectangle(cx - 98, cy, 4, 12, 0xffffff);

        this.load.on('progress', (progress: number) => {
            bar.width = 4 + (196 * progress);
        });

        this.load.on('complete', () => {
            this.scene.start('MainMenuScene');
        });

        this.loadAssets();
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

        this.load.start();
    }
}

