import { Scene, GameObjects } from 'phaser';
import { GameConfig } from '../../config/GameConfig';
import { GameEvents } from '../GameEvents';

const MENU_ITEMS = ['RESUME', 'VIEW CONTROLS', 'QUIT TO MAIN MENU'] as const;
const CONTROLS_TEXT = [
  'Arrow Keys / WASD — Move',
  'A / Z — Attack',
  'S / X — Special Attack',
  'ESC / P — Pause',
].join('\n');

export class PauseOverlay extends Scene {
    private _cursor  = 0;
    private _labels: GameObjects.Text[] = [];
    private _controlsText!: GameObjects.Text;
    private _showingControls = false;

    constructor() {
        super('PauseOverlayScene');
    }

    create(): void {
        const { width, height } = this.scale;
        const cx = width / 2;

        this.add.rectangle(0, 0, width, height, 0x000000, 0.65).setOrigin(0);

        this.add.text(cx, height * 0.22, 'PAUSED', {
            fontFamily: 'Arial Black',
            fontSize:   `${Math.floor(GameConfig.CANVAS_WIDTH / 12)}px`,
            color:      '#ffffff',
            stroke:     '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);

        const startY  = height * 0.44;
        const stepY   = height * 0.14;

        MENU_ITEMS.forEach((label, i) => {
            const txt = this.add.text(cx, startY + i * stepY, label, {
                fontFamily: 'Arial Black',
                fontSize:   `${Math.floor(GameConfig.CANVAS_WIDTH / 22)}px`,
                color:      '#ffffff',
            }).setOrigin(0.5).setInteractive({ useHandCursor: true });

            txt.on('pointerover', () => { this._cursor = i; this._refresh(); });
            txt.on('pointerdown', () => { this._cursor = i; this._activate(); });
            this._labels.push(txt);
        });

        this._controlsText = this.add.text(cx, height * 0.5, CONTROLS_TEXT, {
            fontFamily: 'Arial',
            fontSize:   `${Math.floor(GameConfig.CANVAS_WIDTH / 32)}px`,
            color:      '#aaffaa',
            align:      'center',
        }).setOrigin(0.5).setVisible(false);

        this._cursor = 0;
        this._refresh();

        // Keyboard navigation
        this.input.keyboard?.on('keydown-UP',    () => { this._move(-1); });
        this.input.keyboard?.on('keydown-W',     () => { this._move(-1); });
        this.input.keyboard?.on('keydown-DOWN',  () => { this._move(1); });
        this.input.keyboard?.on('keydown-S',     () => { this._move(1); });
        this.input.keyboard?.on('keydown-ENTER', () => { this._activate(); });
        this.input.keyboard?.on('keydown-ESC',   () => { this._resumeGame(); });
        this.input.keyboard?.on('keydown-P',     () => { this._resumeGame(); });

        // Gamepad D-pad navigation (polled once per frame via update)
    }

    update(): void {
        const pad = this.input.gamepad?.getPad(0);
        if (!pad) return;
        if (pad.up   && !this._padUpHeld)   { this._padUpHeld   = true; this._move(-1); }
        if (pad.down && !this._padDownHeld) { this._padDownHeld = true; this._move(1); }
        if (!pad.up)   this._padUpHeld   = false;
        if (!pad.down) this._padDownHeld = false;
        if (pad.A && !this._padAHeld) { this._padAHeld = true; this._activate(); }
        if (!pad.A) this._padAHeld = false;
    }

    private _padUpHeld   = false;
    private _padDownHeld = false;
    private _padAHeld    = false;

    private _move(dir: -1 | 1): void {
        this._cursor = (this._cursor + dir + MENU_ITEMS.length) % MENU_ITEMS.length;
        this._refresh();
    }

    private _refresh(): void {
        this._labels.forEach((lbl, i) => {
            lbl.setColor(i === this._cursor ? '#ffcc00' : '#ffffff');
        });
    }

    private _activate(): void {
        switch (this._cursor) {
            case 0: this._resumeGame();       break;
            case 1: this._toggleControls();   break;
            case 2: this._quitToMainMenu();   break;
        }
    }

    private _toggleControls(): void {
        this._showingControls = !this._showingControls;
        this._controlsText.setVisible(this._showingControls);
        this._labels.forEach((lbl, i) => lbl.setVisible(i !== 1 || !this._showingControls));
        if (this._showingControls) {
            this._labels[1].setText('HIDE CONTROLS').setVisible(true);
        } else {
            this._labels[1].setText('VIEW CONTROLS');
        }
        this._refresh();
    }

    private _resumeGame(): void {
        this.scene.stop();
        const gameScene = this.scene.get('GameScene');
        gameScene.sound.resumeAll();
        gameScene.events.emit(GameEvents.PAUSE_TOGGLED, { paused: false });
        this.scene.resume('GameScene');
    }

    private _quitToMainMenu(): void {
        this.scene.stop('GameScene');
        this.scene.stop('HudScene');
        this.scene.stop();
        this.scene.start('MainMenuScene');
    }
}
