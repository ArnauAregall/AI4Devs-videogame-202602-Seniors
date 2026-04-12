import Phaser from 'phaser';

export const GameConfig = {
  CANVAS_WIDTH: 384,
  CANVAS_HEIGHT: 224,
  TARGET_FPS: 60,
  FIXED_DELTA_MS: 1000 / 60,
  MAX_STEPS_PER_FRAME: 3,
  STAGE_COUNT: 3,
  /** 'FIT' = scale to fill window while preserving aspect ratio; 'FIXED' = no scaling */
  SCALE_MODE: 'FIT' as 'FIT' | 'FIXED',
} as const;

export const PhaserGameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GameConfig.CANVAS_WIDTH,
  height: GameConfig.CANVAS_HEIGHT,
  backgroundColor: '#000000',
  pixelArt: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scale: {
    mode: GameConfig.SCALE_MODE === 'FIT' ? Phaser.Scale.FIT : Phaser.Scale.NONE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};
