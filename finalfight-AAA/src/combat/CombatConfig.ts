/**
 * Combat subsystem named constants.
 * All hitbox/hurtbox dimensions, damage values, knockback magnitudes,
 * hit-stun durations, and combo parameters live here.
 * No magic numbers are permitted in combat source files.
 *
 * @spec combat-config – Requirement: Combat named constants
 */

// ── Hitbox dimensions (pixels) ─────────────────────────────────────────────
/** @spec FR-CS-01, FR-CS-16 */
export const PLAYER_JAB_HITBOX_W    = 30;
export const PLAYER_JAB_HITBOX_H    = 20;
export const PLAYER_PUNCH_HITBOX_W  = 36;
export const PLAYER_PUNCH_HITBOX_H  = 28;
export const PLAYER_KICK_HITBOX_W   = 42;
export const PLAYER_KICK_HITBOX_H   = 30;
export const PLAYER_SPECIAL_HITBOX_W = 120;
export const PLAYER_SPECIAL_HITBOX_H = 60;

// ── Hurtbox dimensions (pixels) ────────────────────────────────────────────
/** @spec FR-CS-02, FR-CS-16 */
export const PLAYER_HURTBOX_W = 24;
export const PLAYER_HURTBOX_H = 48;
export const ENEMY_HURTBOX_W  = 24;
export const ENEMY_HURTBOX_H  = 48;

// ── Damage values ──────────────────────────────────────────────────────────
/** @spec FR-CS-04, FR-CS-16 */
export const PLAYER_JAB_DAMAGE   = 8;
export const PLAYER_PUNCH_DAMAGE = 10;
export const PLAYER_KICK_DAMAGE  = 12;
/** Multiplied by PLAYER_JAB_DAMAGE for special attack base damage. @spec FR-CS-05 */
export const PLAYER_SPECIAL_DAMAGE_MULTIPLIER = 2.5;
export const PLAYER_GRAB_DAMAGE  = 18;

// ── Knockback (px applied over knockback frames) ───────────────────────────
/** @spec FR-CS-06, FR-CS-16 */
export const PLAYER_LIGHT_KNOCKBACK_X = 40;
export const PLAYER_LIGHT_KNOCKBACK_Y = 0;
export const PLAYER_HEAVY_KNOCKBACK_X = 60;
export const PLAYER_HEAVY_KNOCKBACK_Y = -4;

// ── Hit-stun (frames) ──────────────────────────────────────────────────────
/** @spec FR-CS-12, FR-CS-13, FR-CS-16 */
export const LIGHT_HIT_STUN_FRAMES      = 10;
export const HEAVY_HIT_STUN_FRAMES      = 18;
export const HIT_STUN_COMBO_INCREMENT   = 2;
export const HIT_STUN_MAX_FRAMES        = 60;

// ── Combo window ────────────────────────────────────────────────────────────
/** 30 ticks ≈ 500 ms at 60 fps. @spec FR-CS-08, NFR-CS-03 */
export const COMBO_WINDOW_FRAMES = 30;

// ── Diminishing returns ────────────────────────────────────────────────────
/** @spec FR-CS-18 */
export const DIMINISHING_STEP       = 0.10;
export const DIMINISHING_MIN_FACTOR = 0.10;
export const DAMAGE_FLOOR           = 1;

// ── Grab ────────────────────────────────────────────────────────────────────
/** @spec FR-CS-15, FR-CS-20 */
export const GRAB_RANGE               = 28;
export const GRAB_HEIGHT_TOLERANCE    = 24;
export const GRAB_INVINCIBILITY_FRAMES = 40;
