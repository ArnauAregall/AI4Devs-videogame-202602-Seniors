import { Scene } from 'phaser';
import { ASSET_KEY_LOADING_BG, ASSET_PATH_LOADING_BG } from '../../assets/AssetKeys';

export class Boot extends Scene {
    constructor() {
        super('BootScene');
    }

    preload(): void {
        // Load only the assets required for the loading screen
        this.load.setPath('assets');
        this.load.image(ASSET_KEY_LOADING_BG, ASSET_PATH_LOADING_BG);
    }

    create(): void {
        this.scene.start('PreloadScene');
    }
}

