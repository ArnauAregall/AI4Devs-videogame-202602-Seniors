import { Scene } from 'phaser';
import { ASSET_KEY_LOADING_BG } from '../../assets/AssetKeys';

export class Boot extends Scene {
    constructor() {
        super('BootScene');
    }

    preload(): void {
        this.load.setPath('assets');
        this.load.image(ASSET_KEY_LOADING_BG, 'bg.png');
    }

    create(): void {
        const { width, height } = this.scale;
        const cx = width / 2;
        const cy = height / 2;

        if (this.textures.exists(ASSET_KEY_LOADING_BG)) {
            this.add.image(cx, cy, ASSET_KEY_LOADING_BG).setDisplaySize(width, height);
        }

        this.add.text(cx, height - 24, 'Loading...', {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#ffffff',
        }).setOrigin(0.5);

        this.time.delayedCall(50, () => {
            this.scene.start('PreloadScene');
        });
    }
}
