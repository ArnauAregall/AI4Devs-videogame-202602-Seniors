/**
 * Named constants for all enemy archetypes and shared combat parameters.
 * No magic numbers are permitted in any enemy source file.
 *
 * @spec enemy-config – Requirement: Enemy named constants
 */

// ── Shared ─────────────────────────────────────────────────────────────────

/** Accumulated knockback (px) required to trigger Knockdown state. @spec FR-EA-12 */
export const KNOCKDOWN_THRESHOLD       = 120;
/** Ticks idle before transitioning to Patrol. */
export const ENEMY_IDLE_TO_PATROL_FRAMES = 60;
/** Ticks patrolling in one direction before reversing. */
export const ENEMY_PATROL_FLIP_FRAMES    = 90;
/** Ticks the enemy body lingers after death before being destroyed. @spec FR-EA-13 */
export const DEATH_LINGER_FRAMES       = 60;
/** Minimum horizontal separation (px) between two enemies. @spec FR-EA-17 */
export const ENEMY_SEPARATION_MIN_PX   = 22;
/** Maximum simultaneous enemies allowed in Attack state. @spec FR-EA-16 */
export const MAX_SIMULTANEOUS_ATTACKERS = 2;

/** Enemy hurtbox dimensions (px). @spec FR-EA-11 */
export const ENEMY_HURTBOX_W = 24;
export const ENEMY_HURTBOX_H = 48;

/** Enemy body half-height (px) used to centre hurtbox on ground-plane y. */
export const ENEMY_BODY_HALF_H = 24;

// ── Archetype A — Brawler ──────────────────────────────────────────────────

/** @spec FR-EA-01, FR-EA-02 */
export const BRAWLER_MAX_HP             = 80;
export const BRAWLER_PATROL_SPEED       = 60;   // px/tick
export const BRAWLER_WALK_SPEED         = 80;
export const BRAWLER_AGGRO_RADIUS       = 160;  // px
export const BRAWLER_ATTACK_RANGE       = 44;   // px
export const BRAWLER_PUNCH_DAMAGE       = 14;
export const BRAWLER_PUNCH_KNOCKBACK_X  = 55;
export const BRAWLER_PUNCH_KNOCKBACK_Y  = -2;
export const BRAWLER_PUNCH_HIT_STUN     = 14;
export const BRAWLER_HITBOX_W           = 40;
export const BRAWLER_HITBOX_H           = 28;
export const BRAWLER_ATTACK_ACTIVE_TICKS  = 15;
export const BRAWLER_ATTACK_COOLDOWN_TICKS = 70;
export const BRAWLER_HURT_FRAMES        = 14;
export const BRAWLER_KNOCKDOWN_FRAMES   = 40;
/** Startup frames before the punch hitbox becomes active. */
export const BRAWLER_ATTACK_STARTUP_FRAMES = 6;
/** Horizontal offset from sprite centre to punch hitbox centre (px). */
export const BRAWLER_PUNCH_OFFSET_PX      = 12;
/** Vertical offset from sprite centre to punch hitbox centre (px). */
export const BRAWLER_PUNCH_Y_OFFSET       = 16;

// ── Archetype B — Rusher ───────────────────────────────────────────────────

/** @spec FR-EA-01, FR-EA-03 */
export const RUSHER_MAX_HP              = 50;
export const RUSHER_PATROL_SPEED        = 0;    // stays idle (no patrol)
export const RUSHER_WALK_SPEED          = 90;
export const RUSHER_CHARGE_SPEED        = 140;
export const RUSHER_AGGRO_RADIUS        = 200;
export const RUSHER_ATTACK_RANGE        = 32;
export const RUSHER_FLURRY_DAMAGE       = 5;
export const RUSHER_FLURRY_KNOCKBACK_X  = 30;
export const RUSHER_FLURRY_KNOCKBACK_Y  = 0;
export const RUSHER_FLURRY_HIT_STUN     = 8;
export const RUSHER_HITBOX_W            = 28;
export const RUSHER_HITBOX_H            = 20;
export const RUSHER_FLURRY_COUNT        = 3;
export const RUSHER_FLURRY_GAP_FRAMES   = 8;
export const RUSHER_ATTACK_COOLDOWN_TICKS = 90;
export const RUSHER_HURT_FRAMES         = 10;
export const RUSHER_KNOCKDOWN_FRAMES    = 35;
/** Flurry rhythm: one hit every N frames. */
export const RUSHER_FLURRY_CYCLE_FRAMES = 12;
/** Frame within the cycle when the hitbox activates. */
export const RUSHER_FLURRY_HIT_FRAME    = 6;
/** Horizontal offset from sprite centre to flurry hitbox centre (px). */
export const RUSHER_PUNCH_OFFSET_PX     = 8;
/** Vertical offset from sprite centre to flurry hitbox centre (px). */
export const RUSHER_PUNCH_Y_OFFSET      = 14;

// ── Archetype C — Knife Thrower ────────────────────────────────────────────

/** @spec FR-EA-01, FR-EA-04, FR-EA-19 */
export const KNIFE_THROWER_MAX_HP             = 40;
export const KNIFE_THROWER_WALK_SPEED         = 70;
export const KNIFE_THROWER_RETREAT_SPEED      = 100;
export const KNIFE_THROWER_AGGRO_RADIUS       = 300;
export const KNIFE_THROWER_MIN_DISTANCE       = 120;
export const KNIFE_THROWER_MAX_DISTANCE       = 200;
export const KNIFE_THROWER_LOS_RANGE          = 280;
export const KNIFE_THROW_COOLDOWN_FRAMES      = 90;
export const KNIFE_THROWER_ATTACK_RANGE       = KNIFE_THROWER_MIN_DISTANCE;
/** Patrol speed for knife thrower (stationary). */
export const KNIFE_THROWER_PATROL_SPEED       = 0;
export const KNIFE_THROWER_HURT_FRAMES        = 12;
export const KNIFE_THROWER_KNOCKDOWN_FRAMES   = 35;
/** Startup frames before the knife is thrown. */
export const KNIFE_THROWER_THROW_STARTUP_FRAMES = 12;
/** Vertical offset from sprite centre to throw origin (px). */
export const KNIFE_THROWER_THROW_Y_OFFSET     = 8;

// ── Knife Projectile ────────────────────────────────────────────────────────

/** @spec FR-EA-04 — knife-projectile */
export const KNIFE_SPEED      = 5;    // px/tick
export const KNIFE_DAMAGE     = 8;
export const KNIFE_KNOCKBACK_X = 35;
export const KNIFE_MAX_RANGE  = 350;
export const KNIFE_HITBOX_W   = 14;
export const KNIFE_HITBOX_H   = 8;
export const KNIFE_HIT_STUN   = 10;
/** Debug visualisation colour for knife projectile. */
export const KNIFE_PROJECTILE_DEBUG_COLOR = 0xffff00;

// ── Punk animation clips ────────────────────────────────────────────────────

/**
 * Phaser animation keys for the Punk sprite sheets.
 * Shared across all archetypes that use the punk art.
 * @spec enemy-animation, FR-EB-01 through FR-EB-09
 */
export const PUNK_ANIM_IDLE   = 'punk-anim-idle';
export const PUNK_ANIM_WALK   = 'punk-anim-walk';
export const PUNK_ANIM_ATTACK = 'punk-anim-attack';
export const PUNK_ANIM_HURT   = 'punk-anim-hurt';
export const PUNK_ANIM_DEATH  = 'punk-anim-death';

/** Frame counts per punk animation clip. */
export const PUNK_ANIM_IDLE_FRAMES   = 4;
export const PUNK_ANIM_WALK_FRAMES   = 4;
export const PUNK_ANIM_ATTACK_FRAMES = 3;
export const PUNK_ANIM_HURT_FRAMES   = 4;
export const PUNK_ANIM_DEATH_FRAMES  = 4;

/** Frame rates (fps) per punk animation clip. */
export const PUNK_ANIM_IDLE_FPS   = 8;
export const PUNK_ANIM_WALK_FPS   = 10;
export const PUNK_ANIM_ATTACK_FPS = 12;
export const PUNK_ANIM_HURT_FPS   = 12;
export const PUNK_ANIM_DEATH_FPS  = 8;

/** Active-frame window for the punch clip (inclusive tick indices). @spec FR-EB-12 */
export const PUNK_ATTACK_ACTIVE_FRAME_START = 1;
export const PUNK_ATTACK_ACTIVE_FRAME_END   = 2;

// ── Boss ─────────────────────────────────────────────────────────────────────

/** @spec FR-EA-20, FR-EA-24 */
export const BOSS_MAX_HP                  = 400;
export const BOSS_PATROL_SPEED            = 60;
export const BOSS_WALK_SPEED              = 90;
export const BOSS_AGGRO_RADIUS            = 250;
export const BOSS_ATTACK_RANGE            = 50;
export const BOSS_PUNCH_DAMAGE            = 16;
export const BOSS_PUNCH_KNOCKBACK_X       = 65;
export const BOSS_PUNCH_KNOCKBACK_Y       = -3;
export const BOSS_PUNCH_HIT_STUN          = 18;
export const BOSS_HITBOX_W                = 44;
export const BOSS_HITBOX_H                = 30;
/** Phase-2 spinning-kick hitbox. @spec FR-EA-22 */
export const BOSS_KICK_HITBOX_W           = 52;
export const BOSS_KICK_HITBOX_H           = 32;
export const BOSS_KICK_DAMAGE             = 18;
export const BOSS_KICK_KNOCKBACK_X        = 70;
export const BOSS_KICK_KNOCKBACK_Y        = -4;
export const BOSS_KICK_HIT_STUN           = 20;
/** @spec FR-EA-21 */
export const BOSS_PHASE2_THRESHOLD        = 0.5;
export const BOSS_PHASE3_THRESHOLD        = 0.25;
/** @spec FR-EA-23 */
export const BOSS_PHASE3_SPEED_MULTIPLIER = 1.4;
export const BOSS_TRANSITION_FRAMES       = 45;
export const BOSS_ATTACK_ACTIVE_TICKS     = 20;
export const BOSS_ATTACK_COOLDOWN_TICKS   = 50;
export const BOSS_HURT_FRAMES             = 16;
export const BOSS_KNOCKDOWN_FRAMES        = 50;
/** Startup frames before the boss hitbox becomes active. */
export const BOSS_ATTACK_STARTUP_FRAMES   = 7;
/** Horizontal offset from sprite centre to punch/kick hitbox centre (px). */
export const BOSS_PUNCH_OFFSET_PX         = 14;
/** Vertical offset from sprite centre to punch/kick hitbox centre (px). */
export const BOSS_PUNCH_Y_OFFSET          = 16;
/** Phase 2+ kick alternates every N frames. */
export const BOSS_KICK_ALTERNATE_FRAMES   = 2;

/** Phaser animation keys for the Boss (Brute Arms) sprite sheets. */
export const BOSS_ANIM_IDLE   = 'boss-anim-idle';
export const BOSS_ANIM_WALK   = 'boss-anim-walk';
export const BOSS_ANIM_ATTACK = 'boss-anim-attack';
export const BOSS_ANIM_HURT   = 'boss-anim-hurt';
export const BOSS_ANIM_DEATH  = 'boss-anim-death';

/** Frame counts per boss animation clip. */
export const BOSS_ANIM_IDLE_FRAMES   = 8;  // BruteArm_Idle.png   800÷100
export const BOSS_ANIM_WALK_FRAMES   = 6;  // BruteArm_Walk.png   600÷100
export const BOSS_ANIM_ATTACK_FRAMES = 7;  // BruteArm_attack01.png 1120÷160
export const BOSS_ANIM_HURT_FRAMES   = 8;  // BruteArm_Hurt.png  1280÷160
export const BOSS_ANIM_DEATH_FRAMES  = 8;  // reuses hurt sheet

/** Frame rates (fps) per boss animation clip. */
export const BOSS_ANIM_IDLE_FPS   = 8;
export const BOSS_ANIM_WALK_FPS   = 10;
export const BOSS_ANIM_ATTACK_FPS = 12;
export const BOSS_ANIM_HURT_FPS   = 12;
export const BOSS_ANIM_DEATH_FPS  = 8;
