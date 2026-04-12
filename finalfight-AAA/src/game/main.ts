import { Game } from 'phaser';
import { PhaserGameConfig } from '../config/GameConfig';
import { Boot } from './scenes/Boot';
import { Preloader } from './scenes/Preloader';
import { MainMenu } from './scenes/MainMenu';
import { GameScene } from './scenes/GameScene';
import { PauseOverlay } from './scenes/PauseOverlay';
import { GameOver } from './scenes/GameOver';
import { StageClear } from './scenes/StageClear';
import { TimeUp } from './scenes/TimeUp';
import { HudScene } from '../hud/HudScene';

const StartGame = (parent: string) => {
    return new Game({
        ...PhaserGameConfig,
        parent,
        scene: [
            Boot,
            Preloader,
            MainMenu,
            GameScene,
            HudScene,
            PauseOverlay,
            GameOver,
            StageClear,
            TimeUp,
        ],
    });
};

export default StartGame;
