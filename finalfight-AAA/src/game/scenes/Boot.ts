import { Scene } from 'phaser';

export class Boot extends Scene {
    constructor() {
        super('BootScene');
    }

    preload(): void {
        // Load only the assets required for the loading screen
        this.load.setPath('assets');
        this.load.image('loading-bg', 'ui/loading-bg.png');
    }

    create(): void {
        this.scene.start('PreloadScene');
    }
}

