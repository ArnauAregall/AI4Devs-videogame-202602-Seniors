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

  // ── Render depths ────────────────────────────────────────────
  /** Background parallax layers use depths 0–5. Props=6, items=7.
   *  Player and enemy sprites must render above all of these. */
  ENTITY_DEPTH: 8,

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

  // ── Stage ────────────────────────────────────────────────────
  /** Off-screen margin (px) used when placing enemy spawn X. @spec FR-SZ-02 */
  SPAWN_OFFSCREEN_MARGIN: 64,
  /** Fixed ticks before an uncollected item auto-despawns (15 s × 60 fps). Pass null to ItemPickup to disable. @spec FR-IP-02 */
  ITEM_DESPAWN_TICKS: 900,
  /** HP restored when a health pickup is collected. @spec FR-IP-01, FR-HI-30 */
  ITEM_HEALTH_RESTORE_AMOUNT: 25,
  /** Hit-points of a barrel prop. @spec FR-DP-01 */
  PROP_BARREL_HP: 3,
  /** Hit-points of a crate prop. @spec FR-DP-01 */
  PROP_CRATE_HP: 2,
  /** Tint applied to the barrel crushed sprite. @spec barrel-damage-states, FR-DP-05 */
  BARREL_CRUSHED_TINT: 0x888888,
  /** Default probability (0.0–1.0) that a barrel drops a health item on destruction. @spec health-item-drop */
  BARREL_DROP_CHANCE_DEFAULT: 0.5,
  /** Minimum number of sushi items dropped when a barrel is destroyed. @spec health-item-drop */
  ITEM_DROP_COUNT_MIN: 1,
  /** Maximum number of sushi items dropped when a barrel is destroyed. @spec health-item-drop */
  ITEM_DROP_COUNT_MAX: 3,
  /** Max scatter radius (px) for item drops around the barrel position. @spec health-item-drop */
  ITEM_DROP_SCATTER_RADIUS: 48,
  /** Minimum X spacing (px) between items dropped from the same barrel. @spec health-item-drop */
  ITEM_DROP_MIN_SPACING: 24,
  /** Duration (ms) of the fade-to-black transition between stages. @spec FR-SM-04 */
  STAGE_TRANSITION_FADE_MS: 500,
  /** Half-width (px) of the player body used for boundary clamping. @spec FR-SM-05 */
  PLAYER_BODY_HALF_WIDTH: 20,

  // ── Combat ───────────────────────────────────────────────────────────────
  /** When true, DebugRenderer draws hitbox/hurtbox outlines each frame. @spec FR-CS-17, NFR-CS-04 */
  DEBUG_HITBOXES: false,
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
