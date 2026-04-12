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

  // ── Player stats ────────────────────────────────────────────
  /** @spec FR-PL-14 */
  PLAYER_MAX_HP: 100,
  /** @spec FR-PL-16 */
  PLAYER_LIVES: 3,
  /** Invincibility ticks granted on respawn (3 s × 60 fps). @spec FR-PL-18 */
  RESPAWN_IFRAMES: 180,
  /** Invincibility ticks granted on GetUp (1 s × 60 fps). @spec FR-PL-18 */
  GETUP_IFRAMES: 60,

  // ── Player movement ─────────────────────────────────────────
  /** Horizontal / depth walk speed in px/s. @spec FR-PL-20 */
  PLAYER_WALK_SPEED: 80,
  /** Max camera scroll speed in px/s. Walk speed must not exceed this. @spec FR-PL-20 */
  CAMERA_MAX_SCROLL_SPEED: 80,
  /** Initial upward velocity when entering Jump state, in px/s. @spec FR-PL-03 */
  JUMP_VELOCITY: 200,
  /** Top edge of the navigable ground plane in screen-y pixels. @spec FR-PL-19 */
  GROUND_TOP: 100,
  /** Bottom edge of the navigable ground plane in screen-y pixels. @spec FR-PL-19 */
  GROUND_BOTTOM: 190,

  // ── Special attack ──────────────────────────────────────────
  /** HP deducted when the special attack is used. @spec FR-PL-11 */
  SPECIAL_ATTACK_HP_COST: 20,
  /** Cooldown ticks after a special attack (10 s × 60 fps). @spec FR-PL-22 */
  SPECIAL_COOLDOWN_TICKS: 600,
  /** Radius (px) of the area-of-effect for the special attack. @spec FR-PL-11 */
  SPECIAL_ATTACK_RADIUS: 120,
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
